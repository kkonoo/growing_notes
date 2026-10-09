// 보안 규칙 테스트 (Firestore Emulator). 실행: npm run test:rules
// 가짜 uid(A=나, B=배우자, C=다른 사람)와 가짜 데이터만 써요.
import { test, describe, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where,
  writeBatch, arrayUnion, Timestamp, serverTimestamp,
  setLogLevel,
} from 'firebase/firestore';

setLogLevel('silent'); // 거부될 때마다 찍히는 SDK 경고 숨김

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-growing',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(async () => { await env.clearFirestore(); await seed(); });

const db = uid => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const asAdmin = fn => env.withSecurityRulesDisabled(ctx => fn(ctx.firestore()));
const rec = (uid, extra = {}) => ({
  subjectType: 'child', subjectId: 'c1', type: 'diaper', at: Timestamp.now(),
  data: { pee: true }, createdBy: uid, updatedBy: uid, ...extra,
});
const CODE = 'ABCDEFGH23';
const hours = h => Timestamp.fromMillis(Date.now() + h * 3600e3);

// A의 family: 임신 1, 아이 1, 기록 1
function seed() {
  return asAdmin(async f => {
    await setDoc(doc(f, 'families/A'), { members: ['A'], createdBy: 'A', settings: { eduStartAge: 3 } });
    await setDoc(doc(f, 'users/A'), { familyId: 'A' });
    await setDoc(doc(f, 'families/A/members/A'), { name: '엄마', emoji: '👩' });
    await setDoc(doc(f, 'families/A/pregnancies/p1'), { dueDate: '2027-03-02', status: 'active' });
    await setDoc(doc(f, 'families/A/children/c1'), { name: '테스트아기', birthDate: '2025-01-01', emoji: '👶' });
    await setDoc(doc(f, 'families/A/records/r1'), rec('A'));
  });
}
const seedInvite = (over = {}) => asAdmin(f => setDoc(doc(f, 'invites', CODE), {
  familyId: 'A', createdBy: 'A', inviterName: '엄마', expiresAt: hours(1), usedBy: null, usedAt: null, ...over,
}));
// 앱의 초대 수락과 같은 쓰기 묶음
function join(f, uid, { code = CODE, fid = 'A', useInvite = true, addMember = true } = {}) {
  const b = writeBatch(f);
  if (useInvite) b.update(doc(f, 'invites', code), { usedBy: uid, usedAt: serverTimestamp() });
  if (addMember) b.update(doc(f, 'families', fid), { members: arrayUnion(uid), joinedVia: code });
  b.set(doc(f, 'users', uid), { familyId: fid });
  return b.commit();
}

describe('다른 계정은 내 데이터를 못 읽어요', () => {
  test('family 문서', () => assertFails(getDoc(doc(db('C'), 'families/A'))));
  for (const col of ['members', 'pregnancies', 'children', 'records']) {
    test(`${col} 목록`, () => assertFails(getDocs(collection(db('C'), `families/A/${col}`))));
  }
  test('기록 하나', () => assertFails(getDoc(doc(db('C'), 'families/A/records/r1'))));
  test('기록 검색 (subjectId로)', () =>
    assertFails(getDocs(query(collection(db('C'), 'families/A/records'), where('subjectId', '==', 'c1')))));
  test('남의 users 문서 (familyId 알아내기)', () => assertFails(getDoc(doc(db('C'), 'users/A'))));
  test('로그인 안 한 사람', async () => {
    await assertFails(getDoc(doc(anon(), 'families/A')));
    await assertFails(getDocs(collection(anon(), 'families/A/records')));
  });
  test('구성원(A)은 읽을 수 있어요', async () => {
    await assertSucceeds(getDoc(doc(db('A'), 'families/A')));
    await assertSucceeds(getDocs(collection(db('A'), 'families/A/records')));
    await assertSucceeds(getDocs(collection(db('A'), 'families/A/children')));
  });
});

describe('다른 계정은 내 데이터를 못 써요', () => {
  test('아이 추가', () => assertFails(setDoc(doc(db('C'), 'families/A/children/x'), { name: '가짜', birthDate: '2025-01-01' })));
  test('기록 추가', () => assertFails(setDoc(doc(db('C'), 'families/A/records/x'), rec('C'))));
  test('기록 고치기', () => assertFails(updateDoc(doc(db('C'), 'families/A/records/r1'), { updatedBy: 'C' })));
  test('기록 지우기', () => assertFails(deleteDoc(doc(db('C'), 'families/A/records/r1'))));
  test('family 설정 바꾸기', () => assertFails(updateDoc(doc(db('C'), 'families/A'), { 'settings.eduStartAge': 5 })));
  test('구성원 프로필 쓰기', () => assertFails(setDoc(doc(db('C'), 'families/A/members/C'), { name: '가짜' })));
  test('남의 users 문서 바꾸기', () => assertFails(setDoc(doc(db('C'), 'users/A'), { familyId: 'C' })));
});

describe('family 만들기', () => {
  test('첫 로그인: 내 uid로, 나 혼자인 family', () => {
    const f = db('B'), b = writeBatch(f);
    b.set(doc(f, 'families/B'), { members: ['B'], createdBy: 'B', settings: { eduStartAge: 3 } });
    b.set(doc(f, 'users/B'), { familyId: 'B' });
    b.set(doc(f, 'families/B/members/B'), { name: '아빠', emoji: '👨' });
    return assertSucceeds(b.commit());
  });
  test('남의 uid로 만들기는 안 돼요', () => assertFails(setDoc(doc(db('B'), 'families/C'), { members: ['B'] })));
  test('다른 사람을 끼워 넣어 만들기는 안 돼요', () =>
    assertFails(setDoc(doc(db('B'), 'families/B'), { members: ['B', 'A'] })));
  test('남의 family 위치로 users를 바꿔도 읽을 수는 없어요', async () => {
    await assertSucceeds(setDoc(doc(db('C'), 'users/C'), { familyId: 'A' }));
    await assertFails(getDoc(doc(db('C'), 'families/A')));
  });
});

describe('구성원 목록은 기존 구성원만, 추가는 초대로만', () => {
  test('비구성원이 초대 없이 자기를 추가 → 거부', () =>
    assertFails(updateDoc(doc(db('C'), 'families/A'), { members: arrayUnion('C') })));
  test('없는 초대 코드를 붙여서 추가 → 거부', () => assertFails(join(db('C'), 'C', { useInvite: false })));
  test('구성원이 다른 사람을 바로 추가 → 거부', () =>
    assertFails(updateDoc(doc(db('A'), 'families/A'), { members: ['A', 'C'] })));
  test('구성원은 설정을 바꿀 수 있어요', () =>
    assertSucceeds(updateDoc(doc(db('A'), 'families/A'), { 'settings.eduStartAge': 4 })));
  test('구성원은 다른 구성원을 뺄 수 있어요 (최소 1명)', async () => {
    await asAdmin(f => updateDoc(doc(f, 'families/A'), { members: ['A', 'B'] }));
    await assertSucceeds(updateDoc(doc(db('B'), 'families/A'), { members: ['B'] }));
    await assertFails(updateDoc(doc(db('B'), 'families/A'), { members: [] }));
  });
  test('구성원도 createdBy 같은 다른 칸은 못 바꿔요', () =>
    assertFails(updateDoc(doc(db('A'), 'families/A'), { createdBy: 'C' })));
});

describe('초대', () => {
  const invite = (over = {}) => ({
    familyId: 'A', createdBy: 'A', inviterName: '엄마', createdAt: serverTimestamp(),
    expiresAt: hours(24), usedBy: null, usedAt: null, ...over,
  });
  test('구성원은 초대를 만들 수 있어요', () => assertSucceeds(setDoc(doc(db('A'), 'invites', CODE), invite())));
  test('비구성원은 남의 family 초대를 못 만들어요', () =>
    assertFails(setDoc(doc(db('C'), 'invites', CODE), invite({ createdBy: 'C' }))));
  test('만료가 24시간보다 한참 길면 거부', () =>
    assertFails(setDoc(doc(db('A'), 'invites', CODE), invite({ expiresAt: hours(48) }))));
  test('이미 만료된 초대는 못 만들어요', () =>
    assertFails(setDoc(doc(db('A'), 'invites', CODE), invite({ expiresAt: hours(-1) }))));
  test('짧거나 이상한 코드는 거부', () => assertFails(setDoc(doc(db('A'), 'invites', 'abc'), invite())));
  test('초대 목록은 아무도 못 봐요', async () => {
    await seedInvite();
    await assertFails(getDocs(collection(db('C'), 'invites')));
    await assertFails(getDocs(collection(db('A'), 'invites')));
  });
  test('코드를 알면 초대 내용은 볼 수 있어요', async () => {
    await seedInvite();
    await assertSucceeds(getDoc(doc(db('B'), 'invites', CODE)));
  });

  test('정상 수락 → 합류 후 데이터가 보여요', async () => {
    await seedInvite();
    await assertSucceeds(join(db('B'), 'B'));
    await assertSucceeds(setDoc(doc(db('B'), 'families/A/members/B'), { name: '아빠', emoji: '👨' }));
    await assertSucceeds(getDocs(collection(db('B'), 'families/A/children')));
    await assertSucceeds(setDoc(doc(db('B'), 'families/A/records/r2'), rec('B')));
  });
  test('수락하면서 내 프로필도 한 번에 쓸 수 있어요', async () => {
    await seedInvite();
    const f = db('B'), b = writeBatch(f);
    b.update(doc(f, 'invites', CODE), { usedBy: 'B', usedAt: serverTimestamp() });
    b.update(doc(f, 'families/A'), { members: arrayUnion('B'), joinedVia: CODE });
    b.set(doc(f, 'families/A/members/B'), { name: '아빠', emoji: '👨' });
    await assertSucceeds(b.commit());
  });
  test('한 번 쓴 코드는 다시 못 써요', async () => {
    await seedInvite();
    await assertSucceeds(join(db('B'), 'B'));
    await assertFails(join(db('C'), 'C'));
    await assertFails(getDoc(doc(db('C'), 'families/A')));
  });
  test('만료된 코드는 거부', async () => {
    await seedInvite({ expiresAt: hours(-1) });
    await assertFails(join(db('B'), 'B'));
  });
  test('다른 family의 초대로 이 family에 합류 → 거부', async () => {
    await asAdmin(f => setDoc(doc(f, 'families/X'), { members: ['X'] }));
    await seedInvite({ familyId: 'X', createdBy: 'X' });
    await assertFails(join(db('C'), 'C', { fid: 'A' }));
  });
  test('초대 하나로 두 family에 같이 합류 → 거부', async () => {
    await asAdmin(f => setDoc(doc(f, 'families/X'), { members: ['X'] }));
    await seedInvite({ familyId: 'X', createdBy: 'X' });
    const f = db('C'), b = writeBatch(f);
    b.update(doc(f, 'invites', CODE), { usedBy: 'C', usedAt: serverTimestamp() });
    b.update(doc(f, 'families/X'), { members: arrayUnion('C'), joinedVia: CODE });
    b.update(doc(f, 'families/A'), { members: arrayUnion('C'), joinedVia: CODE });
    await assertFails(b.commit());
  });
  test('초대만 사용 처리하고 합류는 안 함 → 거부', async () => {
    await seedInvite();
    await assertFails(join(db('B'), 'B', { addMember: false }));
  });
  test('초대를 사용 처리하지 않고 합류만 → 거부', async () => {
    await seedInvite();
    await assertFails(join(db('B'), 'B', { useInvite: false }));
  });
  test('초대를 다른 사람 이름으로 사용 처리 → 거부', async () => {
    await seedInvite();
    const f = db('B'), b = writeBatch(f);
    b.update(doc(f, 'invites', CODE), { usedBy: 'C' });
    b.update(doc(f, 'families/A'), { members: arrayUnion('B'), joinedVia: CODE });
    await assertFails(b.commit());
  });
  test('합류하면서 다른 사람까지 같이 넣기 → 거부', async () => {
    await seedInvite();
    const f = db('B'), b = writeBatch(f);
    b.update(doc(f, 'invites', CODE), { usedBy: 'B' });
    b.update(doc(f, 'families/A'), { members: ['A', 'B', 'C'], joinedVia: CODE });
    await assertFails(b.commit());
  });
  test('구성원은 초대를 취소(삭제)할 수 있고, 남은 못 해요', async () => {
    await seedInvite();
    await assertFails(deleteDoc(doc(db('C'), 'invites', CODE)));
    await assertSucceeds(deleteDoc(doc(db('A'), 'invites', CODE)));
  });
});

describe('기록 내용 확인', () => {
  test('내 이름으로 기록 추가', () => assertSucceeds(setDoc(doc(db('A'), 'families/A/records/r2'), rec('A'))));
  test('남의 이름(createdBy)으로 기록 추가 → 거부', () =>
    assertFails(setDoc(doc(db('A'), 'families/A/records/r2'), rec('B', { updatedBy: 'A' }))));
  test('배우자가 시각을 고쳐도 createdBy는 그대로', async () => {
    await asAdmin(f => updateDoc(doc(f, 'families/A'), { members: ['A', 'B'] }));
    await assertSucceeds(updateDoc(doc(db('B'), 'families/A/records/r1'), { at: Timestamp.now(), updatedBy: 'B' }));
    await assertFails(updateDoc(doc(db('B'), 'families/A/records/r1'), { createdBy: 'B', updatedBy: 'B' }));
  });
  test('subjectType이 이상하면 거부', () =>
    assertFails(setDoc(doc(db('A'), 'families/A/records/r2'), rec('A', { subjectType: 'pet' }))));
  test('시각(at)이 Timestamp가 아니면 거부', () =>
    assertFails(setDoc(doc(db('A'), 'families/A/records/r2'), rec('A', { at: '2026-10-09' }))));
  test('이름 없는 아이 → 거부', () =>
    assertFails(setDoc(doc(db('A'), 'families/A/children/c2'), { name: '', birthDate: '2025-01-01' })));
  test('임신 상태 값이 이상하면 거부', () =>
    assertFails(setDoc(doc(db('A'), 'families/A/pregnancies/p2'), { dueDate: '2027-01-01', status: 'unknown' })));
});
