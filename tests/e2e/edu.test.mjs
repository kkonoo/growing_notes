// 교육 탭: 영유아 모드(📚 독서 · 🎹 활동 · 🏫 기관 + 💬 상담), 사춘기 모드(🏫 학교 + 📝 성적 · 💬 대화 · 🎯 진로·관심사). 가짜 계정·가짜 데이터만
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

test('교육 단계 아이는 교육 탭부터, 영유아 모드 칸 3개', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '호호', birthDate: dayFromToday(-1500) }, '등록');
  await A.page.locator('.subject h1', { hasText: '호호' }).waitFor();
  assert.equal(await A.page.locator('.tab[aria-selected="true"]').innerText(), '📚 교육');
  await A.page.locator('.chip-row .chip').first().waitFor();
  assert.deepEqual(await A.page.locator('.tab-body > .chip-row .chip').allInnerTexts(), ['📚 독서', '🎹 활동', '🏫 기관']);
  assert.equal(await A.page.locator('.subject h1 .mode-tag').innerText(), '영유아', '이름 옆에 지금 모드');
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

// ---------- 사춘기 모드 (만 12세부터) ----------
const yearsAgo = (y, extraDays) => { // 한국 시간 기준 y년 + extraDays일 전 'YYYY-MM-DD'
  const [Y, M, D] = dayFromToday(0).split('-').map(Number);
  const d = new Date(Date.UTC(Y - y, M - 1, D - extraDays));
  return d.toISOString().slice(0, 10);
};
const chips = () => A.page.locator('.tab-body > .chip-row .chip').allInnerTexts();
const modeTag = () => A.page.locator('.subject h1 .mode-tag').innerText();

test('만 12세 아이는 사춘기 모드: 학교 · 대화 · 진로·관심사', async () => {
  await A.page.getByRole('button', { name: '🏠 홈' }).click();
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '지호', birthDate: yearsAgo(12, 30) }, '등록');
  await A.page.locator('.subject h1', { hasText: '지호' }).waitFor();
  await A.page.locator('.tab-body > .chip-row').waitFor();
  assert.equal(await modeTag(), '사춘기');
  assert.deepEqual(await chips(), ['🏫 학교', '💬 대화', '🎯 진로·관심사']);
});

test('학교 추가 (기본 종류 = 학교)', async () => {
  await A.page.getByRole('button', { name: '＋ 학교 추가' }).click();
  assert.equal(await form().getByRole('button', { name: '🏫 학교' }).getAttribute('aria-pressed'), 'true');
  await fillForm(A.page, { name: '한빛중학교', cls: '1학년 3반', teacher: '박선생' }, '저장');
  assert.match(await A.page.locator('.rec-row', { hasText: '한빛중학교' }).innerText(), /🏫 한빛중학교[\s\S]*1학년 3반 · 담임 박선생/);
});

test('시험·성적: "저장하고 다음 과목"으로 같은 시험 이어서 → 시험별로 묶임', async () => {
  await A.page.getByRole('button', { name: '＋ 성적 기록' }).click();
  await fillForm(A.page, { exam: '1학기 중간고사', course: '국어', score: '92' }, '저장하고 다음 과목');
  await form().locator('input[name="course"]').waitFor();
  assert.equal(await form().locator('input[name="exam"]').inputValue(), '1학기 중간고사', '시험 이름은 그대로');
  assert.equal(await form().locator('input[name="course"]').inputValue(), '', '과목은 비워서');
  await fillForm(A.page, { course: '수학', score: 'A' }, '저장');
  await A.page.locator('.rec-row', { hasText: '수학 A' }).waitFor();
  assert.equal(await A.page.locator('.exam-head').count(), 1);
  assert.match(await A.page.locator('.exam-head').innerText(), /^1학기 중간고사 · \d+월 \d+일$/);
  assert.deepEqual(await A.page.locator('.exam-head ~ .rec-row').allInnerTexts(), ['국어 92', '수학 A'], '과목은 적은 순서대로');

  await A.page.locator('.rec-row', { hasText: '국어 92' }).click(); // 고치기
  await fillForm(A.page, { score: '95' }, '저장');
  await A.page.locator('.rec-row', { hasText: '국어 95' }).waitFor();
});

test('대화 메모 · 진로·관심사', async () => {
  await section('💬 대화');
  await A.page.getByRole('button', { name: '＋ 대화 메모' }).click();
  await form().getByRole('button', { name: '선생님과' }).click();
  await form().locator('textarea[name="text"]').fill('수업 태도 좋음, 발표 늘어남');
  await form().getByRole('button', { name: '저장' }).click();
  await rows().filter({ hasText: '선생님과 · 수업 태도 좋음, 발표 늘어남' }).waitFor();

  await section('🎯 진로·관심사');
  await A.page.getByRole('button', { name: '🎯 꿈·진로', exact: true }).click();
  await form().locator('textarea[name="text"]').fill('수의사');
  await form().getByRole('button', { name: '저장' }).click();
  await rows().filter({ hasText: '수의사' }).waitFor();
  assert.match(await rows().first().innerText(), /🎯[\s\S]*진로·관심사[\s\S]*수의사/);
});

test('설정에서 사춘기 모드 나이를 바꾸면 모드가 바뀌어요', async () => {
  const setTeenAge = async n => {
    await A.page.getByRole('button', { name: '설정' }).click();
    await A.page.locator('#teenAge').fill(String(n));
    await A.page.locator('#teenAge').dispatchEvent('change');
    await A.page.getByRole('button', { name: '닫기' }).click();
  };
  await setTeenAge(13);
  await until(async () => (await modeTag()) === '영유아');
  assert.deepEqual(await chips(), ['📚 독서', '🎹 활동', '🏫 기관']);
  await setTeenAge(12);
  await until(async () => (await modeTag()) === '사춘기');
  assert.equal(await A.page.locator('.chip-row .chip.on').innerText(), '🎯 진로·관심사', '보던 칸 그대로');
});

test('사춘기 기록도 타임라인에', async () => {
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  await A.page.locator('.month-nav').waitFor();
  await until(async () => (await A.page.locator('.chip-row .chip').count()) > 1);
  const chips = await A.page.locator('.chip-row .chip').allInnerTexts();
  for (const want of ['전체 4', '성적 2', '대화 1', '진로·관심사 1']) assert.ok(chips.includes(want), `${want} in ${chips}`);
});
