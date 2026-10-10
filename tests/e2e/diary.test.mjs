// 일기 탭: 임신 중(📝 일기 · ⭐ 처음) → 출산 → 아이(📝 일기 · 🗣 한 말 · ⭐ 처음)까지 한 곳에서, 한 달씩. 가짜 계정·가짜 데이터만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, until } from './helpers.mjs';

let server, browser, A;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const form = () => A.page.locator('#formEl');
const rows = () => A.page.locator('.tab-body .tl-row');
const actions = () => A.page.locator('.tab-body > .actions button').allInnerTexts();
const lastMonthEnd = dayFromToday(-+dayFromToday(0).slice(8, 10)); // 지난달 마지막 날
async function write(button, text, date) {
  await A.page.locator('.tab-body > .actions').getByRole('button', { name: button, exact: true }).click();
  await form().locator('textarea[name="text"]').fill(text);
  if (date) await form().locator('input[name="date"]').fill(date);
  await form().getByRole('button', { name: '저장' }).click();
}

test('임신 중 일기: 줄바꿈 그대로, 날짜를 지난달로 쓰면 지난달에', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '콩콩', dueDate: dayFromToday(10) }, '등록');
  await A.page.getByRole('tab', { name: '📝 일기' }).click();
  await A.page.locator('.month-nav').waitFor();
  assert.deepEqual(await actions(), ['📝 일기', '⭐ 처음 (첫 태동 등)'], '임신 중엔 한 말이 없어요');
  await A.page.getByText('이 달에는 쓴 글이 없어요.').waitFor();

  await write('📝 일기', '오늘 병원 다녀옴\n심장 소리 들음');
  await until(async () => (await rows().count()) === 1);
  assert.match(await rows().first().innerText(), /📝[\s\S]*일기[\s\S]*오늘 병원 다녀옴\n심장 소리 들음/);

  await write('⭐ 처음 (첫 태동 등)', '첫 태동', lastMonthEnd);
  await new Promise(r => setTimeout(r, 500));
  assert.equal(await rows().count(), 1, '이번 달 화면엔 안 보임');
  await A.page.getByRole('button', { name: '이전 달' }).click();
  await rows().filter({ hasText: '첫 태동' }).waitFor();
  assert.equal(await rows().count(), 1);
  assert.match(await rows().first().innerText(), /⭐/);
  await A.page.getByRole('button', { name: '이번 달' }).click();
  await rows().filter({ hasText: '오늘 병원' }).waitFor();
});

test('출산 후 아이 일기 탭: 임신 중 글이 "🤰 임신 중"으로 이어져 보이고, 한 말도', async () => {
  await A.page.getByRole('tab', { name: '🤰 임신' }).click();
  await A.page.getByRole('button', { name: '👶 출산했어요' }).click();
  await fillForm(A.page, { name: '콩이' }, '출산 처리');
  await A.page.locator('.subject h1', { hasText: '콩이' }).waitFor();
  await A.page.getByRole('tab', { name: '📝 일기' }).click();
  await rows().filter({ hasText: '오늘 병원' }).waitFor();
  assert.deepEqual(await actions(), ['📝 일기', '🗣 한 말', '⭐ 처음 해 본 것']);
  assert.match(await rows().filter({ hasText: '오늘 병원' }).innerText(), /🤰 임신 중/);

  await write('🗣 한 말', '맘마');
  await rows().filter({ hasText: '맘마' }).waitFor();
  const word = await rows().filter({ hasText: '맘마' }).innerText();
  assert.match(word, /🗣/);
  assert.doesNotMatch(word, /임신 중/, '아이 글엔 임신 중 표시 없음');
});

test('고치기 · 지우기', async () => {
  await rows().filter({ hasText: '오늘 병원' }).click();
  assert.equal(await form().locator('h2').innerText(), '고치기');
  assert.deepEqual(await form().locator('.choice-btn').allInnerTexts(), ['📝 일기', '⭐ 처음 (첫 태동 등)'], '임신 중 글은 임신 종류로');
  await form().locator('textarea[name="text"]').fill('오늘 병원 다녀옴 (고침)');
  await form().getByRole('button', { name: '저장' }).click();
  await rows().filter({ hasText: '(고침)' }).waitFor();

  await rows().filter({ hasText: '맘마' }).click();
  await form().getByRole('button', { name: '지우기' }).click();
  assert.match(A.dialogs.at(-1), /이 글을 지울까요/);
  await rows().filter({ hasText: '맘마' }).waitFor({ state: 'detached' });
  assert.equal(await rows().count(), 1);
});

test('타임라인에도 일기가, 달은 화면마다 따로 기억', async () => {
  await A.page.getByRole('button', { name: '이전 달' }).click(); // 일기 탭은 지난달
  await rows().filter({ hasText: '첫 태동' }).waitFor();
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  await until(async () => (await A.page.locator('.chip-row .chip').count()) > 1); // 타임라인이 다 그려질 때까지
  assert.ok((await A.page.locator('.chip-row .chip').allInnerTexts()).includes('일기 1'));
  assert.equal(await A.page.getByRole('button', { name: '이번 달' }).count(), 0, '타임라인은 이번 달 그대로');
});
