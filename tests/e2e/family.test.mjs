// 1단계 시나리오: 가족·아이·임신 등록, 출산 처리, 다른 계정 차단, 배우자 초대, 오프라인 동기화
// 사람 셋 = 브라우저 셋: A(엄마), B(아빠, 초대받음), C(다른 사람)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { APP, startServer, launch, person, login, uidOf, clearEmulators, fillForm, dayFromToday, cardTexts } from './helpers.mjs';
import { pregnancyLine, childLine } from '../../js/stage.js';

let server, browser, A, B, C;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const today = dayFromToday(0);
const home = page => page.getByRole('button', { name: '🏠 홈' }).click();
const selectedTab = page => page.locator('.tab[aria-selected="true"]').innerText();
async function until(fn, ms = 15000) {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise(r => setTimeout(r, 200))) if (await fn()) return;
  throw new Error('시간 안에 조건이 안 맞음');
}

test('첫째(교육) + 둘째 임신 → 홈에 두 카드가 각자 다른 단계로', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByText('아직 등록된 아이가 없어요').waitFor();

  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '첫째', birthDate: '2022-05-01' }, '등록');
  await A.page.locator('.subject h1', { hasText: '첫째' }).waitFor();
  assert.equal(await selectedTab(A.page), '📚 교육', '아이 화면은 지금 단계 탭부터');
  assert.match(await A.page.locator('.tab-body').innerText(), /준비 중/);

  await home(A.page);
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '둘째', dueDate: dayFromToday(109) }, '등록');
  await A.page.locator('.subject h1', { hasText: '둘째' }).waitFor();
  assert.deepEqual(await A.page.locator('.tab').allInnerTexts(), ['🤰 임신', '🗓 타임라인'], '임신 중엔 임신·타임라인 탭');
  assert.match(await A.page.locator('.hero-big').innerText(), /24주 3일/);

  await home(A.page);
  const cards = await cardTexts(A.page, 2);
  assert.equal(cards.length, 2);
  assert.equal(cards[0], `👶첫째📚 교육${childLine('2022-05-01', today)}`);
  assert.equal(cards[1], `🤰둘째🤰 임신${pregnancyLine(dayFromToday(109), today)}`);
  assert.match(cards[1], /24주 3일 · D-109/);
});

test('둘째 출산 처리 → 아이 프로필로 이어지고 홈 카드가 육아로', async () => {
  await A.page.locator('.card', { hasText: '둘째' }).click();
  await A.page.getByRole('button', { name: '👶 출산했어요' }).click();
  assert.equal(await A.page.locator('#formEl input[name="name"]').inputValue(), '둘째', '태명이 이름 칸에 미리');
  await fillForm(A.page, {}, '출산 처리');
  await A.page.locator('.subject-line', { hasText: '생후 1일' }).waitFor();
  assert.equal(await selectedTab(A.page), '🍼 육아');
  const tabs = await A.page.locator('.tab').allInnerTexts();
  assert.deepEqual(tabs, ['🤰 임신', '🍼 육아', '📚 교육', '🗓 타임라인'], '임신에서 이어진 아이는 임신 탭도');

  await A.page.getByRole('tab', { name: '🤰 임신' }).click();
  await A.page.locator('.hero', { hasText: '👶 둘째' }).waitFor();
  assert.match(await A.page.locator('.hero').innerText(), /출생 · 예정일/);

  await home(A.page);
  await A.page.locator('.card', { hasText: '🍼 육아' }).waitFor();
  const cards = await cardTexts(A.page, 2);
  assert.equal(cards.length, 2, '임신 카드는 아이 카드로 바뀜');
  assert.equal(cards[1], '👶둘째🍼 육아생후 1일 (0개월)');
});

test('다른 Google 계정은 내 데이터가 전혀 안 보여요', async () => {
  C = await person(browser);
  await login(C.page, 'stranger', '다른사람');
  await C.page.getByText('아직 등록된 아이가 없어요').waitFor();
  assert.equal((await cardTexts(C.page)).length, 0);

  // 화면 말고 직접 읽기를 시도해도 서버가 거부
  const fid = await uidOf(A.page); // A의 family id = A의 uid
  const result = await C.page.evaluate(async fid => {
    const { F, fs } = await import('/js/db.js');
    const out = {};
    try { await F.getDocFromServer(F.doc(fs, 'families', fid)); out.family = '읽힘!'; } catch (e) { out.family = e.code; }
    for (const c of ['children', 'pregnancies', 'records', 'members']) {
      try { await F.getDocsFromServer(F.collection(fs, 'families', fid, c)); out[c] = '읽힘!'; } catch (e) { out[c] = e.code; }
    }
    return out;
  }, fid);
  for (const [k, v] of Object.entries(result)) assert.equal(v, 'permission-denied', k);
});

let code;
test('배우자 초대 → 같은 데이터가 보이고 구성원이 둘', async () => {
  await A.page.getByRole('button', { name: '설정' }).click();
  await A.page.getByRole('button', { name: '🔗 배우자 초대하기' }).click();
  code = (await A.page.locator('.invite-code').innerText()).trim();
  assert.match(code, /^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
  await A.page.getByRole('button', { name: '닫기' }).click();

  B = await person(browser);
  await login(B.page, 'dad', '테스트아빠', `#join=${code}`);
  await B.page.locator('.card', { hasText: '첫째' }).waitFor();
  assert.match(B.dialogs[0], /초대한 사람: 테스트엄마/);
  assert.deepEqual(await cardTexts(B.page, 2), await cardTexts(A.page, 2));

  await B.page.getByRole('button', { name: '설정' }).click();
  const members = await B.page.locator('#memberList').innerText();
  assert.match(members, /테스트엄마/);
  assert.match(members, /테스트아빠 \(나\)/);
  await B.page.getByRole('button', { name: '닫기' }).click();
});

test('한 번 쓴 초대 코드는 다른 사람이 못 써요', async () => {
  await C.page.goto(`${APP}#join=${code}`);
  await until(() => C.dialogs.some(m => m.includes('이미 사용된 초대')));
  await C.page.locator('.home').waitFor();
  assert.equal((await cardTexts(C.page)).length, 0);
});

test('오프라인에서 등록 → 다시 연결하면 배우자 화면에도', async () => {
  await A.context.setOffline(true);
  await home(A.page);
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '셋째', birthDate: today }, '등록');
  await A.page.locator('.subject h1', { hasText: '셋째' }).waitFor();
  assert.match(await A.page.locator('#syncState').innerText(), /오프라인 · 올릴 기록 있음/);

  await new Promise(r => setTimeout(r, 1500));
  assert.ok(!(await cardTexts(B.page)).some(t => t.includes('셋째')), '연결 전엔 배우자에게 아직 안 보임');

  await A.context.setOffline(false);
  await B.page.locator('.card', { hasText: '셋째' }).waitFor({ timeout: 30000 });
  await until(async () => (await A.page.locator('#syncState').innerText()).includes('동기화됨'), 30000);
});

test('아이 정보 고치기 · 지우기 (기록이 없을 때)', async () => {
  await home(A.page);
  await A.page.locator('.card', { hasText: '셋째' }).click();
  await A.page.getByRole('button', { name: '정보 고치기' }).click();
  await fillForm(A.page, { name: '막내' }, '저장');
  await A.page.locator('.subject h1', { hasText: '막내' }).waitFor();
  await A.page.getByRole('button', { name: '정보 고치기' }).click();
  await A.page.locator('#formEl').getByRole('button', { name: '지우기' }).click();
  await A.page.locator('.home').waitFor();
  await until(async () => (await cardTexts(A.page)).length === 2);
  await B.page.locator('.card', { hasText: '막내' }).waitFor({ state: 'detached' });
});

test('임신 종료 표시 → 홈에서 숨기기 → 설정에서 다시 보이기', async () => {
  await home(A.page);
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '별이', dueDate: dayFromToday(200) }, '등록');
  await A.page.getByRole('button', { name: '종료로 표시' }).click();
  assert.match(A.dialogs.at(-1), /기록은 그대로 남고/);
  await A.page.getByText('종료로 표시된 임신 기록이에요.').waitFor();
  await home(A.page);
  await A.page.locator('.card', { hasText: '별이' }).filter({ hasText: '🗂 종료' }).waitFor();

  await A.page.locator('.card', { hasText: '별이' }).click();
  await A.page.getByRole('button', { name: '홈에서 숨기기' }).click();
  await A.page.locator('.home').waitFor();
  await A.page.locator('.card', { hasText: '별이' }).waitFor({ state: 'detached' });

  await A.page.getByRole('button', { name: '설정' }).click();
  const row = A.page.locator('#subjectList .list-row', { hasText: '별이' });
  assert.match(await row.innerText(), /종료 · 홈에서 숨김/);
  await row.getByRole('button', { name: '다시 보이기' }).click();
  await A.page.getByRole('button', { name: '닫기' }).click();
  await A.page.locator('.card', { hasText: '별이' }).waitFor();
});

test('로그아웃하면 이 기기에 저장된 가족 데이터도 지워져요', async () => {
  const fid = await uidOf(A.page);
  await A.page.getByRole('button', { name: '설정' }).click();
  await Promise.all([A.page.waitForEvent('load'), A.page.getByRole('button', { name: '로그아웃' }).click()]); // 지운 뒤 새로고침
  await A.page.getByRole('button', { name: 'Google로 로그인' }).waitFor();
  // 같은 브라우저에서 다른 계정으로 로그인
  await A.page.evaluate(() => window.__emuLogin('stranger2', 'stranger2@example.com', '다른사람2'));
  await A.page.getByText('아직 등록된 아이가 없어요').waitFor();
  const cached = await A.page.evaluate(async fid => {
    const { F, fs } = await import('/js/db.js');
    return (await F.getDocsFromCache(F.collection(fs, 'families', fid, 'children'))).size;
  }, fid);
  assert.equal(cached, 0, '이전 계정의 아이 정보가 기기 캐시에 남아 있으면 안 됨');
});
