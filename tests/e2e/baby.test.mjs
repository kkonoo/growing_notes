// 3단계 시나리오: 육아 탭 빠른 기록, 오늘 요약, 되돌리기·시각 고치기, 기록자 구분, 오프라인, 7일 패턴
// A(엄마)·B(아빠). 가짜 계정·가짜 데이터만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, cardTexts, makeInvite, until } from './helpers.mjs';
import { childLine, pregnancyLine } from '../../js/stage.js';

let server, browser, A, B;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const today = dayFromToday(0), birth = dayFromToday(-100);
const wait = ms => new Promise(r => setTimeout(r, ms));
const quick = (page, name) => page.locator('.quickbar').getByRole('button', { name });
const tile = async (page, label) => (await page.locator('.tile', { hasText: label }).innerText()).replace(/\s+/g, ' ');
const todayRows = page => page.locator('.block', { hasText: '오늘 기록' }).locator('.tl-row');
const tileHas = (page, label, re) => until(async () => re.test(await tile(page, label)));

test('첫째 출생 후 기록 몇 개 → 둘째 임신 등록 → 홈에 두 카드가 각자 다른 단계로', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '첫째', birthDate: birth }, '등록');
  await A.page.locator('.quickbar').waitFor();
  assert.equal(await A.page.locator('.tab[aria-selected="true"]').innerText(), '🍼 육아');

  // 분유: 누르면 바로 저장 → 토스트의 고치기로 양 넣기
  await quick(A.page, /분유/).click();
  await A.page.locator('#toast').getByRole('button', { name: '고치기' }).click();
  await fillForm(A.page, { ml: '120' }, '저장');
  await tileHas(A.page, '수유', /1회 분유·유축 120ml/);

  await quick(A.page, /왼쪽/).click();
  await quick(A.page, /소변/).click();
  await quick(A.page, /둘 다/).click();
  await tileHas(A.page, '수유', /2회/);
  await tileHas(A.page, '기저귀', /2회 소변 2 · 대변 1/);
  assert.match(await A.page.locator('.now-card').innerText(), /마지막 수유 방금 · 모유 왼쪽/);

  await quick(A.page, /잠들었어요/).click();
  await quick(A.page, /깼어요/).click(); // 바로 또 누르면 무시 (잠들자마자 깬 걸로 되지 않게)
  await A.page.locator('.now-card', { hasText: '잠든 지' }).waitFor();
  await tileHas(A.page, '수면', /1번 · 자는 중/);
  await wait(900);
  await quick(A.page, /깼어요/).click();
  await A.page.locator('.now-card', { hasText: '깬 지' }).waitFor();

  await until(async () => (await todayRows(A.page).count()) === 5);
  for (const t of await todayRows(A.page).allInnerTexts()) assert.match(t, /테스트엄마/, '기록자 표시');

  await A.page.getByRole('button', { name: '🏠 홈' }).click();
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '둘째', dueDate: dayFromToday(109) }, '등록');
  await A.page.locator('.subject h1', { hasText: '둘째' }).waitFor();
  await A.page.getByRole('button', { name: '🏠 홈' }).click();
  assert.deepEqual(await cardTexts(A.page, 2), [`👶첫째🍼 육아${childLine(birth, today)}`, `🤰둘째🤰 임신${pregnancyLine(dayFromToday(109), today)}`]);
});

test('되돌리기 · 시각 고치기 (어제로 옮기면 오늘 기록에서 빠지고 7일 패턴에)', async () => {
  await A.page.locator('.card', { hasText: '첫째' }).click();
  await quick(A.page, /대변/).click();
  await until(async () => (await todayRows(A.page).count()) === 6);
  await A.page.locator('#toast').getByRole('button', { name: '되돌리기' }).click();
  await until(async () => (await todayRows(A.page).count()) === 5);

  await todayRows(A.page).filter({ hasText: '분유' }).click();
  await fillForm(A.page, { at: `${dayFromToday(-1)}T21:00` }, '저장');
  await until(async () => (await todayRows(A.page).count()) === 4);
  await tileHas(A.page, '수유', /1회/);
  const yesterday = A.page.locator('.pt-table tr').nth(2);
  await until(async () => /1회 \(120ml\)/.test(await yesterday.innerText()));
});

test('배우자가 빠른 기록 → 오늘 기록에서 기록자가 구분돼요', async () => {
  const code = await makeInvite(A.page);
  B = await person(browser);
  await login(B.page, 'dad', '테스트아빠', `#join=${code}`);
  await B.page.locator('.card', { hasText: '첫째' }).click();
  await quick(B.page, /오른쪽/).click();

  const row = todayRows(A.page).filter({ hasText: '모유 오른쪽' });
  await row.waitFor();
  assert.match(await row.innerText(), /테스트아빠/);
  assert.match(await todayRows(A.page).filter({ hasText: '모유 왼쪽' }).innerText(), /테스트엄마/);
});

test('비행기 모드에서 빠른 기록 → 다시 연결하면 배우자에게도', async () => {
  const before = await todayRows(B.page).count();
  await A.context.setOffline(true);
  await quick(A.page, /소변/).click();
  await until(async () => (await todayRows(A.page).count()) === before + 1);
  assert.match(await todayRows(A.page).first().innerText(), /⏳/, '아직 안 올라간 기록 표시');
  await wait(1500);
  assert.equal(await todayRows(B.page).count(), before);

  await A.context.setOffline(false);
  await until(async () => (await todayRows(B.page).count()) === before + 1, 30000);
  await until(async () => !/⏳/.test(await todayRows(A.page).first().innerText()), 30000);
});

test('최근 7일 패턴: 7일 줄 + 같은 값의 표 + 범례', async () => {
  assert.equal(await A.page.locator('.pt-row:not(.pt-axis)').count(), 7);
  assert.equal(await A.page.locator('.pt-table tr').count(), 8);
  assert.deepEqual(await A.page.locator('.legend-item').allInnerTexts(), ['수유', '수면', '기저귀']);
  // 오늘 줄: 수유 점 2개(왼쪽·오른쪽), 수면 막대 1개, 기저귀 점 3개
  const row = A.page.locator('.pt-row:not(.pt-axis)').first();
  assert.equal(await row.locator('.mk.feed').count(), 2);
  assert.equal(await row.locator('.mk.sleep').count(), 1);
  assert.equal(await row.locator('.mk.diaper').count(), 3);
  await row.locator('.mk.feed').first().dispatchEvent('click'); // 같은 시각의 점이 겹쳐 있어서 직접 이벤트로
  assert.match(await A.page.locator('.pt-tip').innerText(), /모유/);
});
