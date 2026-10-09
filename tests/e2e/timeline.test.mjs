// 타임라인: 한 달씩 보기, ‹ › 넘기기, 연·월 고르기, 종류 필터, 달 경계. 가짜 계정·가짜 기록만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, until } from './helpers.mjs';

let server, browser, A;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const rows = () => A.page.locator('.tl-row');
const title = () => A.page.locator('.month-title').innerText();
const ym = n => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + n); return { y: d.getFullYear(), m: d.getMonth() + 1 }; };
const label = n => `${ym(n).y}년 ${ym(n).m}월 ▾`;

test('준비: 아이 + 이번 달 3개, 지난달 2개(말일 23:59:59 포함), 3달 전 1개', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '첫째', birthDate: dayFromToday(-400) }, '등록');
  await A.page.locator('.quickbar').waitFor();
  await A.page.evaluate(async () => {
    const { addRecord } = await import('/js/records.js'), { state } = await import('/js/state.js');
    const id = state.children[0].id, now = new Date();
    const monthStart = n => new Date(now.getFullYear(), now.getMonth() + n, 1);
    addRecord('child', id, 'feeding', new Date(Date.now() - 1000), { method: 'formula', ml: 100 });
    addRecord('child', id, 'feeding', new Date(Date.now() - 2000), { method: 'breast', side: 'L' });
    addRecord('child', id, 'diaper', new Date(Date.now() - 3000), { pee: true, poo: false });
    addRecord('child', id, 'sleep', new Date(+monthStart(-1) + 86400e3), { endAt: new Date(+monthStart(-1) + 90000e3) });
    addRecord('child', id, 'diaper', new Date(+monthStart(0) - 1000), { pee: false, poo: true }); // 지난달 말일 23:59:59
    addRecord('child', id, 'feeding', new Date(+monthStart(-3) + 5 * 86400e3), { method: 'formula', ml: 77 });
  });
});

test('이번 달만 보여요 + 종류 필터', async () => {
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  await A.page.locator('.month-nav').waitFor(); // 육아 탭의 '오늘 기록' 줄을 세지 않게
  await until(async () => (await rows().count()) === 3);
  assert.equal(await title(), label(0));
  assert.equal(await A.page.getByRole('button', { name: '다음 달' }).isDisabled(), true, '이번 달 뒤로는 못 감');
  assert.deepEqual(await A.page.locator('.chip-row .chip').allInnerTexts(), ['전체 3', '수유 2', '기저귀 1']);
  await A.page.locator('.chip-row').getByRole('button', { name: '수유 2' }).click();
  await until(async () => (await rows().count()) === 2);
  await A.page.locator('.chip-row').getByRole('button', { name: '전체 3' }).click();
  await until(async () => (await rows().count()) === 3);
});

test('‹ 지난달: 말일 23:59:59 기록은 지난달에', async () => {
  await A.page.getByRole('button', { name: '이전 달' }).click();
  await until(async () => (await title()) === label(-1));
  await until(async () => (await rows().count()) === 2);
  assert.ok((await rows().allInnerTexts()).some(t => /23:59[\s\S]*대변/.test(t)));
  await A.page.getByRole('button', { name: '이번 달' }).waitFor();
});

test('연·월 고르기 → 3달 전, 이번 달 버튼으로 돌아오기', async () => {
  await A.page.getByRole('button', { name: '연·월 고르기' }).click();
  if (ym(-3).y !== ym(0).y) await A.page.getByRole('button', { name: '이전 해' }).click();
  await A.page.locator('.mp-grid').getByRole('button', { name: `${ym(-3).m}월`, exact: true }).click();
  await until(async () => (await title()) === label(-3));
  await until(async () => (await rows().count()) === 1);
  assert.match(await rows().first().innerText(), /77ml/);
  await A.page.getByRole('button', { name: '이번 달' }).click();
  await until(async () => (await rows().count()) === 3);
  assert.equal(await A.page.getByRole('button', { name: '이번 달' }).count(), 0);
});

test('기록이 없는 달', async () => {
  await A.page.getByRole('button', { name: '연·월 고르기' }).click();
  await A.page.getByRole('button', { name: '이전 해' }).click();
  await A.page.locator('.mp-grid').getByRole('button', { name: `${ym(0).m}월`, exact: true }).click();
  await A.page.getByText('이 달에는 기록이 없어요.').waitFor();
});
