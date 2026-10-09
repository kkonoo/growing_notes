// 교육 탭: 📚 독서 · 🎹 활동 · 🗣 메모 · 🏫 기관 + 💬 상담. 가짜 계정·가짜 데이터만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, until } from './helpers.mjs';

let server, browser, A;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const form = () => A.page.locator('#formEl');
const section = name => A.page.locator('.chip-row').getByRole('button', { name, exact: true }).click();
const rows = () => A.page.locator('.tab-body .tl-row');
const line = () => A.page.locator('.block-line').innerText();

test('교육 단계 아이는 교육 탭부터, 칸 4개', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '호호', birthDate: dayFromToday(-1500) }, '등록');
  await A.page.locator('.subject h1', { hasText: '호호' }).waitFor();
  assert.equal(await A.page.locator('.tab[aria-selected="true"]').innerText(), '📚 교육');
  await A.page.locator('.chip-row .chip').first().waitFor();
  assert.deepEqual(await A.page.locator('.tab-body > .chip-row .chip').allInnerTexts(), ['📚 독서', '🎹 활동', '🗣 메모', '🏫 기관']);
});

test('독서: 책 기록 → "또 읽었어요" 한 번에 → 이번 달 2번 (1권)', async () => {
  await A.page.getByRole('button', { name: '＋ 책 기록' }).click();
  await form().locator('input[name="title"]').fill('구름빵');
  await form().getByRole('button', { name: '❤️ 좋아함' }).click();
  await form().getByRole('button', { name: '저장' }).click();
  await until(async () => /이번 달 1번 \(1권\)/.test(await line()));
  assert.match(await rows().first().innerText(), /구름빵 · 같이 읽음 · ❤️/);

  await A.page.getByRole('button', { name: '📖 구름빵' }).click();
  await until(async () => /이번 달 2번 \(1권\) · 올해 2번 \(1권\)/.test(await line()));
  assert.equal(await rows().count(), 2);

  await A.page.getByRole('button', { name: '＋ 책 기록' }).click(); // 제목 자동 완성
  assert.deepEqual(await form().locator('datalist option').evaluateAll(o => o.map(x => x.value)), ['구름빵']);
  await form().getByRole('button', { name: '취소' }).click();
});

test('활동: 추가 → 다녀왔어요 → 진도 메모 → 그만둠', async () => {
  await section('🎹 활동');
  await A.page.getByRole('button', { name: '＋ 활동 추가' }).click();
  await fillForm(A.page, { name: '피아노' }, '저장');
  await A.page.locator('.act-row', { hasText: '이번 달 0회' }).waitFor();
  await A.page.getByRole('button', { name: '다녀왔어요' }).click();
  await A.page.locator('.act-row', { hasText: '이번 달 1회' }).waitFor();
  await A.page.locator('#toast').getByRole('button', { name: '고치기' }).click();
  await fillForm(A.page, { memo: '바이엘 2권' }, '저장');
  await rows().filter({ hasText: '피아노 · 바이엘 2권' }).waitFor();

  await A.page.locator('.act-name', { hasText: '피아노' }).click();
  await form().getByRole('button', { name: '그만둠' }).click();
  await form().getByRole('button', { name: '저장' }).click();
  await A.page.getByRole('button', { name: /그만둔 활동 1개/ }).waitFor();
  assert.equal(await A.page.getByRole('button', { name: '다녀왔어요' }).count(), 0);
  assert.equal(await rows().count(), 1, '그만둬도 기록은 그대로');
});

test('메모: 한 말 · 처음 해 본 것 (어제 날짜)', async () => {
  await section('🗣 메모');
  await A.page.getByRole('button', { name: '🗣 한 말' }).click();
  await form().locator('textarea[name="text"]').fill('엄마 구름이 솜사탕 같아');
  await form().getByRole('button', { name: '저장' }).click();
  await A.page.getByRole('button', { name: '⭐ 처음 해 본 것' }).click();
  await form().locator('textarea[name="text"]').fill('혼자 신발 신음');
  await form().locator('input[name="date"]').fill(dayFromToday(-1));
  await form().getByRole('button', { name: '저장' }).click();
  await until(async () => (await rows().count()) === 2);
  assert.equal(await A.page.locator('.tab-body .day-head').count(), 2, '날짜별로 묶임');
  assert.match(await rows().first().innerText(), /🗣[\s\S]*구름이 솜사탕/);
});

test('기관 + 상담 메모', async () => {
  await section('🏫 기관');
  await A.page.getByRole('button', { name: '＋ 기관 추가' }).click();
  await form().getByRole('button', { name: '🎒 유치원' }).click();
  await fillForm(A.page, { name: '햇살유치원', cls: '해바라기반', teacher: '김선생', from: '2026-03' }, '저장');
  const sc = A.page.locator('.rec-row', { hasText: '햇살유치원' });
  await sc.waitFor();
  assert.match(await sc.innerText(), /🎒 햇살유치원[\s\S]*해바라기반 · 담임 김선생 · 2026\.03~/);

  await A.page.getByRole('button', { name: '＋ 상담 메모' }).click();
  await form().locator('textarea[name="text"]').fill('친구와 잘 지냄, 편식 조금');
  await form().getByRole('button', { name: '저장' }).click();
  await rows().filter({ hasText: '햇살유치원 · 친구와 잘 지냄, 편식 조금' }).waitFor();
});

test('타임라인에도 교육 기록이 보여요', async () => {
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  await A.page.locator('.month-nav').waitFor();
  await until(async () => (await A.page.locator('.chip-row .chip').count()) > 1);
  const chips = await A.page.locator('.chip-row .chip').allInnerTexts();
  for (const want of ['독서 2', '활동 1', '상담 1']) assert.ok(chips.includes(want), `${want} in ${chips}`);
});
