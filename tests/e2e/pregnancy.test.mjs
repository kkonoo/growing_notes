// 2단계 시나리오: 임신 탭(질문·검진·진통 타이머), 배우자 기록과 기록자 구분, 오프라인 기록, 출산 후 타임라인
// A(엄마)가 임신 등록, B(아빠)는 초대로 합류. 가짜 계정·가짜 데이터만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, makeInvite, until, setRules } from './helpers.mjs';

let server, browser, A, B;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const qTexts = page => page.locator('.q-row:not(.done) .q-text > span:first-child').allInnerTexts();
const wait = ms => new Promise(r => setTimeout(r, ms));

test('임신 등록 → 예정일 기준 주수', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '콩콩이', dueDate: dayFromToday(30) }, '등록');
  await A.page.locator('.hero-big', { hasText: '35주 5일' }).waitFor();
  assert.match(await A.page.locator('.hero').innerText(), /D-30/);
});

test('다음 진료 때 물어볼 것: 여러 줄 한 번에 추가, 체크, 답 메모', async () => {
  await A.page.getByRole('button', { name: '＋ 추가' }).click();
  await A.page.locator('#formEl textarea[name="text"]').fill('철분제 계속 먹어도 되나요?\n\n태동 기록은 어떻게 하나요?');
  await A.page.locator('#formEl').getByRole('button', { name: '추가' }).click();
  await A.page.locator('.q-row').nth(1).waitFor();
  assert.deepEqual(await qTexts(A.page), ['철분제 계속 먹어도 되나요?', '태동 기록은 어떻게 하나요?'], '적은 순서대로, 빈 줄은 빼고');

  await A.page.locator('.q-row').first().getByRole('button', { name: '물어봤어요' }).click();
  await A.page.getByRole('button', { name: /물어본 질문 1개/ }).waitFor();
  assert.deepEqual(await qTexts(A.page), ['태동 기록은 어떻게 하나요?']);

  await A.page.getByRole('button', { name: '태동 기록은 어떻게 하나요?' }).click();
  await A.page.locator('#formEl textarea[name="answer"]').fill('하루 한 번 시간 정해서');
  await A.page.locator('#formEl').getByRole('button', { name: '저장' }).click();
  await A.page.locator('.q-text', { hasText: '하루 한 번 시간 정해서' }).waitFor();
});

test('검진 기록: 날짜·체중·혈압·메모 + 기록자', async () => {
  await A.page.getByRole('button', { name: '＋ 기록' }).click();
  await fillForm(A.page, { date: dayFromToday(-7), weightKg: '62.3', bpSys: '118', bpDia: '76' }, '저장');
  const row = A.page.locator('.rec-row').first();
  await row.waitFor();
  assert.match(await row.innerText(), /62\.3kg · 혈압 118\/76/);
  assert.match(await row.innerText(), /테스트엄마/);
});

test('진통 타이머: 시작·끝 → 지속시간·간격 자동 계산', async () => {
  await A.page.getByRole('button', { name: '⏱ 진통 타이머 열기' }).click();
  const big = A.page.locator('.timer-btn');
  for (let i = 0; i < 2; i++) {
    await big.filter({ hasText: '진통 시작' }).click();
    await big.filter({ hasText: '진통 끝' }).waitFor();
    await wait(1100);
    await big.filter({ hasText: '진통 끝' }).click();
    await big.filter({ hasText: '진통 시작' }).waitFor();
    if (!i) await wait(1000);
  }
  const rows = A.page.locator('.c-row:not(.c-head)');
  await until(async () => (await rows.count()) === 2);
  const [latest, first] = await rows.allInnerTexts();
  assert.match(first, /\d+초\s+–$/, '첫 진통은 간격 없음');
  assert.match(latest, /\d+초\s+\d+초$/, '두 번째 진통은 지속시간과 간격');
  assert.match(await A.page.locator('.timer-stats').innerText(), /2회/);

  await A.page.getByRole('button', { name: '‹ 임신 탭' }).click();
  assert.match(await A.page.locator('.block', { hasText: '진통 타이머' }).innerText(), /최근 1시간 2회/);
});

test('배우자가 합류해서 기록 → 타임라인에서 기록자가 구분돼요', async () => {
  const code = await makeInvite(A.page);
  B = await person(browser);
  await login(B.page, 'dad', '테스트아빠', `#join=${code}`);
  await B.page.locator('.card', { hasText: '콩콩이' }).click();
  await B.page.getByRole('button', { name: '＋ 추가' }).click();
  await B.page.locator('#formEl textarea[name="text"]').fill('출산 가방 준비물');
  await B.page.locator('#formEl').getByRole('button', { name: '추가' }).click();

  await A.page.locator('.q-text', { hasText: '출산 가방 준비물' }).waitFor();
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  const row = A.page.locator('.tl-row', { hasText: '출산 가방 준비물' });
  await row.waitFor();
  assert.match(await row.locator('.tl-who').innerText(), /테스트아빠/);
  assert.match(await A.page.locator('.tl-row', { hasText: '철분제' }).locator('.tl-who').innerText(), /테스트엄마/);
});

test('오프라인에서 기록 → 다시 연결하면 배우자에게도', async () => {
  await A.page.getByRole('tab', { name: '🤰 임신' }).click();
  await A.context.setOffline(true);
  await A.page.getByRole('button', { name: '＋ 추가' }).click();
  await A.page.locator('#formEl textarea[name="text"]').fill('비행기 모드 질문');
  await A.page.locator('#formEl').getByRole('button', { name: '추가' }).click();
  await A.page.locator('.q-text', { hasText: '비행기 모드 질문' }).waitFor();
  assert.match(await A.page.locator('#syncState').innerText(), /오프라인 · 올릴 기록 있음/);
  await wait(1500);
  assert.equal(await B.page.locator('.q-text', { hasText: '비행기 모드 질문' }).count(), 0);

  await A.context.setOffline(false);
  await B.page.locator('.q-text', { hasText: '비행기 모드 질문' }).waitFor({ timeout: 30000 });
});

test('기록을 못 불러오면(색인 준비 중 등) 진통 버튼을 숨기고, 다시 되면 자동으로 이어져요', async () => {
  // 실제로 겪은 일: 색인이 준비되기 전에 타이머를 열면 목록 구독이 실패한 채 "진통 시작"만 보여서 누를 때마다 진통이 쌓임
  const rules = await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8');
  const noList = rules.replace(/(match \/records\/\{id\} \{\s*)allow read, delete/, '$1allow get, delete');
  assert.notEqual(noList, rules);
  await A.page.getByRole('button', { name: /진통 타이머 열기/ }).click();
  await A.page.locator('.timer-btn').waitFor();
  await setRules(noList);
  try {
    await A.page.reload();
    await A.page.locator('.notice', { hasText: '불러오지 못했어요' }).waitFor();
    assert.equal(await A.page.locator('.timer-btn').count(), 0, '상태를 모를 땐 버튼 없음');
  } finally {
    await setRules(rules);
  }
  await A.page.locator('.timer-btn', { hasText: '진통 시작' }).waitFor({ timeout: 20000 }); // 5초 뒤 다시 구독
});

test('진행 중으로 남은 진통이 여러 개면 한 번에 지울 수 있어요', async () => {
  await A.page.evaluate(async () => { // 예전 버그로 쌓인 상태 만들기 (가짜 기록)
    const { addRecord } = await import('/js/records.js'), { state } = await import('/js/state.js');
    const p = state.pregnancies.find(x => x.status === 'active');
    for (let i = 3; i > 0; i--) addRecord('pregnancy', p.id, 'contraction', new Date(Date.now() - i * 1000), { endAt: null });
  });
  const clear = A.page.getByRole('button', { name: '진행 중 3개 지우기' });
  await clear.click();
  await A.page.locator('.timer-btn', { hasText: '진통 시작' }).waitFor();
  assert.equal(await clear.count(), 0);
  assert.equal(await A.page.locator('.c-row', { hasText: '진행 중' }).count(), 0);
  assert.equal(await A.page.locator('.c-row:not(.c-head)').count(), 2, '끝난 진통 2개는 그대로');
  await A.page.getByRole('button', { name: '‹ 임신 탭' }).click();
});

test('출산 처리 → 임신 중 기록이 아이 타임라인에 그대로', async () => {
  await A.page.getByRole('button', { name: '👶 출산했어요' }).click();
  await fillForm(A.page, {}, '출산 처리');
  await A.page.locator('.subject-line', { hasText: '생후 1일' }).waitFor();
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  const rows = A.page.locator('.tl-row');
  await until(async () => (await rows.count()) === 7);
  const texts = await rows.allInnerTexts();
  assert.ok(texts.every(t => t.includes('🤰 임신 중')), '모두 임신 중 기록 표시');
  for (const want of ['검진', '진통', '철분제', '출산 가방 준비물', '비행기 모드 질문']) assert.ok(texts.some(t => t.includes(want)), want);

  // 배우자 화면의 아이 타임라인에도
  await B.page.getByRole('button', { name: '🏠 홈' }).click();
  await B.page.locator('.card', { hasText: '🍼 육아' }).click();
  await B.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  await until(async () => (await B.page.locator('.tl-row').count()) === 7);
});
