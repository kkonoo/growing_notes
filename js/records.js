// 기록(records): 임신·아이 기록을 한 컬렉션에 두고 type으로 구분
//   { subjectType: 'pregnancy'|'child', subjectId, type, at(시각), data: {…}, createdBy, updatedBy, createdAt, updatedAt }
// 쓰기는 기다리지 않음(오프라인이면 기기에 먼저 저장 → 연결되면 올라감). 읽기는 화면에 보이는 동안만 구독
import { F, write } from './db.js';
import { state, render } from './state.js';
import { famCol, myUid } from './family.js';
import { keep, drop } from './live.js';
import { h, toast, fmtTime } from './ui.js';

const recRef = id => F.doc(famCol('records'), id);

// 새 기록 → 만든 문서 id (바로 고치기·되돌리기용)
export function addRecord(subjectType, subjectId, type, at, data) {
  const ref = F.doc(famCol('records'));
  write(F.setDoc(ref, {
    subjectType, subjectId, type, at: F.Timestamp.fromDate(at), data,
    createdBy: myUid(), updatedBy: myUid(), createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(),
  }));
  return ref.id;
}
// fields 예: { at: Date, 'data.done': true } — 고친 사람(updatedBy)은 나, 처음 기록한 사람(createdBy)은 그대로
export function updateRecord(id, fields) {
  const up = { ...fields, updatedBy: myUid(), updatedAt: F.serverTimestamp() };
  if (up.at instanceof Date) up.at = F.Timestamp.fromDate(up.at);
  write(F.updateDoc(recRef(id), up));
}
export const deleteRecord = id => write(F.deleteDoc(recRef(id)));

// Firestore 문서 → { id, at: Date, data(안의 시각도 Date), pending(아직 안 올라감) … }
function toRecord(d) {
  const x = d.data({ serverTimestamps: 'estimate' }), data = {};
  for (const [k, v] of Object.entries(x.data || {})) data[k] = v instanceof F.Timestamp ? v.toDate() : v;
  return { ...x, id: d.id, at: x.at.toDate(), data, pending: d.metadata.hasPendingWrites };
}

// subjectId가 ids 중 하나인 기록, 최근 것부터. since ≤ at < until (없으면 처음부터 · 끝까지), types = 이 종류만
// 그리는 동안 부르면 화면에 보이는 동안 구독 유지 → { list, loaded, error }
// 구독이 실패하면(색인을 만드는 중, 권한 등) Firestore는 다시 시도하지 않으므로 5초 뒤 새로 구독
// 색인: subjectId + at(내림차순), 종류를 고르면 subjectId + type + at(내림차순) (firestore.indexes.json)
export function watchRecords(ids, { since, until, types } = {}) {
  const key = `rec:${state.familyId}:${ids.join(',')}:${since ? +since : ''}:${until ? +until : ''}:${types ? types.join('|') : ''}`;
  return keep(key, () => {
    const w = { list: [], loaded: false };
    const q = F.query(famCol('records'),
      ids.length === 1 ? F.where('subjectId', '==', ids[0]) : F.where('subjectId', 'in', ids),
      ...(types ? [types.length === 1 ? F.where('type', '==', types[0]) : F.where('type', 'in', types)] : []),
      ...(since ? [F.where('at', '>=', F.Timestamp.fromDate(since))] : []),
      ...(until ? [F.where('at', '<', F.Timestamp.fromDate(until))] : []),
      F.orderBy('at', 'desc'));
    const unsub = F.onSnapshot(q, { includeMetadataChanges: true }, snap => {
      w.list = snap.docs.map(toRecord);
      w.loaded = true;
      state.pending[key] = snap.metadata.hasPendingWrites;
      render();
    }, e => {
      console.error('기록을 불러오지 못했어요', e);
      w.loaded = true;
      w.error = e;
      retry = setTimeout(() => { drop(key); render(); }, 5000);
      render();
    });
    let retry;
    w.stop = () => { unsub(); clearTimeout(retry); delete state.pending[key]; };
    return w;
  });
}

// 아직 못 불러왔거나 실패했을 때 보여 줄 안내 (문제 없으면 null).
// 이때는 기록 버튼을 숨김: 지금 상태(진통 중·자는 중)를 모르는 채 누르면 같은 기록이 여러 개 생기므로
export function loadNotice(w) {
  if (!w.loaded) return h('p', 'hint center', '기록을 불러오는 중이에요…');
  if (!w.error) return null;
  const box = h('div', 'notice'), msg = w.error.message || '';
  if (w.error.code !== 'failed-precondition') {
    box.append(h('p', null, `기록을 불러오지 못했어요 (${w.error.code || msg}). 잠시 뒤 자동으로 다시 시도해요.`));
    return box;
  }
  // 색인이 없거나(설정이 다르거나) 만드는 중. Firestore 오류 문구에 그 색인을 만드는·상태를 보는 콘솔 주소가 들어 있음
  const url = indexLink(msg), building = /currently building/i.test(msg);
  box.append(h('p', null, building
    ? '기록 색인을 만드는 중이에요. 다 되면 자동으로 다시 불러와요.'
    : '기록 색인이 아직 없거나 설정이 달라요. 아래 버튼을 누르면 Firebase 콘솔에 필요한 색인이 채워진 화면이 열려요. 거기서 만들기를 누르고 몇 분 기다리면 자동으로 다시 불러와요.'));
  if (url) box.append(Object.assign(h('a', 'btn small', building ? '색인 상태 보기 ↗' : '색인 만들기 열기 ↗'), { href: url, target: '_blank', rel: 'noopener' }));
  return box;
}
export const indexLink = msg => msg.match(/https:\/\/console\.firebase\.google\.com\/\S+/)?.[0] || null;

// ---------- 빠른 기록: 누르면 확인 없이 바로 저장 → 토스트에서 고치기·되돌리기 ----------
// 같은 버튼을 0.8초 안에 또 누르면 무시 (밤중 실수 방지)
const lastTap = {};
export function tapOnce(key, fn) {
  if (Date.now() - (lastTap[key] || 0) < 800) return;
  lastTap[key] = Date.now();
  navigator.vibrate?.(20);
  fn();
}
export function quickAdd(subjectType, subjectId, type, data, label) {
  const at = new Date(), id = addRecord(subjectType, subjectId, type, at, data);
  const r = { id, type, subjectType, subjectId, at, data, createdBy: myUid() };
  toast(`${label} ${fmtTime(at)} 기록했어요`, 5000, [
    { label: '고치기', onClick: () => TYPES[type].edit(r) },
    { label: '되돌리기', onClick: () => { deleteRecord(id); toast('되돌렸어요'); } },
  ]);
}

// 기록 종류: emoji(글자 또는 기록 → 글자)·label·rowLabel?(기록 → 줄에 보일 종류 이름)·text(기록 → 한 줄 요약)·edit(기록 → 고치기 창)·dateOnly?(시각 안 보임). 각 탭 파일이 등록
export const TYPES = {};
export function defineType(type, def) { TYPES[type] = def; }
