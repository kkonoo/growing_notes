// 가족 공간: 로그인 후 내 family 찾기(없으면 만들기), 구독, 구성원 프로필, 초대 만들기·수락
// 저장 위치는 firestore.rules 맨 위 설명 참고. users/{uid}.familyId = 지금 쓰는 family
import { A, F, auth, fs, write } from './db.js';
import { state, render, hasPending } from './state.js';
import { DEFAULT_EDU_AGE } from './stage.js';

let unsubUser = null, unsubFamily = [], creating = false;

export const famRef = () => F.doc(fs, 'families', state.familyId);
export const famCol = name => F.collection(fs, 'families', state.familyId, name);
export const myUid = () => state.user.uid;

function defaultProfile(user) {
  return { name: (user.displayName || user.email || '나').slice(0, 10), emoji: '🙂' };
}

// ---------- 로그인 / 로그아웃 ----------
export function startUser(user) {
  stopAll();
  state.user = user;
  state.error = null;
  // 내 family 위치를 계속 지켜봄 (다른 기기에서 초대를 수락하면 여기도 바뀜)
  unsubUser = F.onSnapshot(F.doc(fs, 'users', user.uid), { includeMetadataChanges: true }, snap => {
    // 처음 만들기가 서버에 닿은 뒤에 구독 (규칙이 서버의 family 문서를 보고 판단하므로)
    if (snap.metadata.hasPendingWrites) return;
    if (snap.exists()) {
      if (snap.data().familyId !== state.familyId) openFamily(snap.data().familyId);
    } else if (!snap.metadata.fromCache) {
      createFamily(user); // 서버에도 없음 = 처음 로그인
    }
    render();
  }, fail);
  render();
}

export async function logout() {
  if (hasPending() && !confirm('아직 올라가지 않은 기록이 있어요. 지금 로그아웃하면 이 기기에서 사라져요. 로그아웃할까요?')) return;
  stopAll();
  await A.signOut(auth);
  // 이 기기에 저장된 가족 데이터도 지움 (같은 브라우저에서 다른 계정으로 로그인해도 안 보이게)
  await F.terminate(fs);
  await F.clearIndexedDbPersistence(fs).catch(() => {}); // 다른 탭이 열려 있으면 못 지움 → 새로고침 뒤 계정이 바뀌면 안 보임
  location.reload();
}

function stopAll() {
  if (unsubUser) unsubUser();
  unsubUser = null;
  stopFamily();
  state.familyId = null;
}
function stopFamily() {
  unsubFamily.forEach(u => u());
  unsubFamily = [];
  Object.assign(state, { family: null, members: {}, pregnancies: [], children: [], loaded: new Set(), pending: {} });
}

function fail(e) {
  console.error(e);
  state.error = e.code === 'permission-denied' ? '이 가족 공간에 접근할 수 없어요.' : `불러오지 못했어요 (${e.code || e.message})`;
  render();
}

// 처음 로그인: 내 uid 이름의 family (두 기기에서 동시에 해도 하나만 생김)
async function createFamily(user) {
  if (creating) return;
  creating = true;
  const uid = user.uid, ref = F.doc(fs, 'families', uid), b = F.writeBatch(fs);
  b.set(ref, { members: [uid], createdBy: uid, createdAt: F.serverTimestamp(), settings: { eduStartAge: DEFAULT_EDU_AGE } });
  b.set(F.doc(ref, 'members', uid), { ...defaultProfile(user), joinedAt: F.serverTimestamp() });
  b.set(F.doc(fs, 'users', uid), { familyId: uid });
  try { await b.commit(); } catch (e) {
    // 다른 기기가 먼저 만들었으면 여기선 거부됨 → 곧 위의 users 구독으로 그 공간이 열림
    if (!state.familyId) fail(e);
  } finally { creating = false; }
}

function openFamily(fid) {
  stopFamily();
  state.familyId = fid;
  state.error = null;
  const ref = famRef();
  listen('family', ref, s => { state.family = s.data() || null; });
  listen('members', F.collection(ref, 'members'), s => {
    state.members = Object.fromEntries(s.docs.map(d => [d.id, d.data()]));
  });
  listen('pregnancies', F.collection(ref, 'pregnancies'), s => { state.pregnancies = s.docs.map(d => ({ id: d.id, ...d.data() })); });
  listen('children', F.collection(ref, 'children'), s => { state.children = s.docs.map(d => ({ id: d.id, ...d.data() })); });
}
function listen(name, ref, apply) {
  unsubFamily.push(F.onSnapshot(ref, { includeMetadataChanges: true }, snap => {
    apply(snap);
    state.loaded.add(name);
    state.pending[name] = snap.metadata.hasPendingWrites;
    render();
  }, fail));
}

// ---------- 구성원 프로필 (기록자 표시) ----------
export const me = () => state.members[myUid()] || defaultProfile(state.user);
export const memberLabel = uid => {
  const m = state.members[uid];
  return m ? `${m.emoji || ''} ${m.name}`.trim() : '알 수 없음';
};
export function saveMe(fields) {
  write(F.setDoc(F.doc(famRef(), 'members', myUid()), fields, { merge: true }));
}
export function saveSettings(fields) {
  const up = {};
  for (const [k, v] of Object.entries(fields)) up[`settings.${k}`] = v;
  write(F.updateDoc(famRef(), up));
}

// ---------- 초대 ----------
// 코드: 10자리, 헷갈리는 0·O·1·I·L 뺌 (firestore.rules와 같은 문자). 고르게 뽑으려고 248 이상은 버림 (31 × 8 = 248)
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  let s = '';
  while (s.length < 10) for (const x of crypto.getRandomValues(new Uint8Array(16))) if (x < 248 && s.length < 10) s += ALPHA[x % 31];
  return s;
}
export const INVITE_HOURS = 24;
export const formatCode = c => `${c.slice(0, 5)}-${c.slice(5)}`;
export const cleanCode = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const inviteLink = code => `${location.origin}${location.pathname}#join=${formatCode(code)}`;

// 서버에 저장된 걸 확인한 뒤 코드를 보여 줌 (오프라인에서 만든 코드를 상대가 못 찾는 일이 없게)
export async function createInvite() {
  if (!navigator.onLine) throw new Error('offline');
  const code = newCode(), expiresAt = new Date(Date.now() + INVITE_HOURS * 3600e3);
  await withTimeout(F.setDoc(F.doc(fs, 'invites', code), {
    familyId: state.familyId, createdBy: myUid(), inviterName: me().name,
    createdAt: F.serverTimestamp(), expiresAt: F.Timestamp.fromDate(expiresAt), usedBy: null, usedAt: null,
  }));
  return { code, expiresAt };
}
export const cancelInvite = code => write(F.deleteDoc(F.doc(fs, 'invites', code)));

// 초대 확인: { ok, invite } 또는 { error: '안내 문구' }
export async function checkInvite(code) {
  let snap;
  try { snap = await withTimeout(F.getDocFromServer(F.doc(fs, 'invites', code))); } catch (e) {
    console.error(e);
    return { error: '초대를 확인하지 못했어요. 인터넷 연결을 확인해 주세요.' };
  }
  const inv = snap.data();
  if (!inv) return { error: '초대 코드를 찾을 수 없어요. 코드를 다시 확인해 주세요.' };
  if (inv.familyId === state.familyId) return { error: '이미 같은 가족 공간에 있어요.' };
  if (inv.usedBy) return { error: '이미 사용된 초대예요. 새 초대를 받아 주세요.' };
  if (inv.expiresAt.toMillis() <= Date.now()) return { error: '초대가 만료됐어요. 새 초대를 받아 주세요.' };
  return { ok: true, invite: inv };
}

// 합류: 초대 사용 처리 + 구성원에 나 추가 + 내 프로필 + 내 family 위치를 한 번에 (규칙이 서로 확인)
export async function joinFamily(code, inv) {
  const uid = myUid(), fref = F.doc(fs, 'families', inv.familyId), iref = F.doc(fs, 'invites', code);
  const profile = { name: me().name, emoji: me().emoji };
  await withTimeout(F.runTransaction(fs, async tx => {
    const cur = (await tx.get(iref)).data();
    if (!cur || cur.usedBy || cur.expiresAt.toMillis() <= Date.now()) throw new Error('invite-invalid');
    tx.update(iref, { usedBy: uid, usedAt: F.serverTimestamp() });
    tx.update(fref, { members: F.arrayUnion(uid), joinedVia: code });
    tx.set(F.doc(fref, 'members', uid), { ...profile, joinedAt: F.serverTimestamp() });
    tx.set(F.doc(fs, 'users', uid), { familyId: inv.familyId });
  }));
}

function withTimeout(p, ms = 15000) {
  return Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);
}
