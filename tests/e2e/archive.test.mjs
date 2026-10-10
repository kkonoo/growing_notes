// 🗂 지난 단계 보관함: 타임라인 맨 위 버튼 → 임신 · 육아 · 교육 (영유아) 정리 화면 (새로 기록하는 버튼 없이). 가짜 계정·가짜 데이터만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, until } from './helpers.mjs';
import { monthSpans, birthdayAt, childAge } from '../../js/stage.js';

let server, browser, A;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const form = () => A.page.locator('#formEl');
const home = () => A.page.getByRole('button', { name: '🏠 홈' }).click();
const pastChips = () => A.page.locator('.past-row .chip').allInnerTexts();
const openTimeline = async () => {
  await A.page.getByRole('tab', { name: '🗓 타임라인' }).click();
  await A.page.locator('.month-nav').waitFor();
};
const yearsAgo = (y, days = 0) => { // 한국 시간 기준 y년 + days일 전
  const [Y, M, D] = dayFromToday(0).split('-').map(Number);
  return new Date(Date.UTC(Y - y, M - 1, D - days)).toISOString().slice(0, 10);
};
async function addChild(name, birthDate) {
  await home();
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name, birthDate }, '등록');
  await A.page.locator('.subject h1', { hasText: name }).waitFor();
}
// 화면 대신 앱 함수로 지난 기록 넣기 (몇 년 전 날짜: days = 태어난 날부터 며칠 뒤, 또는 date = 'YYYY-MM-DD'). 아이 id 돌려줌
const seed = (name, list) => A.page.evaluate(async ([name, list]) => {
  const { state } = await import('/js/state.js');
  const { addRecord } = await import('/js/records.js');
  const c = state.children.find(x => x.name === name);
  const [y, m, d] = c.birthDate.split('-').map(Number);
  const at = (r, hour) => (r.date ? new Date(+r.date.slice(0, 4), +r.date.slice(5, 7) - 1, +r.date.slice(8, 10), hour) : new Date(y, m - 1, d + r.days, hour));
  for (const r of list) {
    const data = { ...r.data };
    if (r.endHour != null) data.endAt = at(r, r.endHour);
    addRecord('child', c.id, r.type, at(r, r.hour), data);
  }
  const { F, fs } = await import('/js/db.js');
  await F.waitForPendingWrites(fs); // 서버에 올라갈 때까지 (달별 개수는 서버에서 셈)
  return c.id;
}, [name, list]);

test('임신 → 출산: 타임라인에 🗂 지난 단계 · 🤰 임신 → 질문·검진 그대로, 추가 버튼 없이', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '콩콩', dueDate: dayFromToday(5) }, '등록');
  await A.page.getByRole('button', { name: '＋ 추가' }).click();
  await form().locator('textarea[name="text"]').fill('출산 가방 뭐 챙기나요?');
  await form().getByRole('button', { name: '추가', exact: true }).click();
  await A.page.getByRole('button', { name: '＋ 기록' }).click();
  await fillForm(A.page, { date: dayFromToday(-3), weightKg: '63.1' }, '저장');
  await A.page.locator('.rec-row', { hasText: '63.1kg' }).waitFor();
  await openTimeline();
  assert.equal(await A.page.locator('.past-row').count(), 0, '임신 중엔 지난 단계 없음');

  await A.page.getByRole('tab', { name: '🤰 임신' }).click();
  await A.page.getByRole('button', { name: '👶 출산했어요' }).click();
  await fillForm(A.page, { name: '콩이' }, '출산 처리');
  await A.page.locator('.subject h1', { hasText: '콩이' }).waitFor();
  await openTimeline();
  assert.deepEqual(await pastChips(), ['🤰 임신']);

  await A.page.locator('.past-row').getByRole('button', { name: '🤰 임신' }).click();
  await A.page.locator('.panel-head', { hasText: '🗂 🤰 임신' }).waitFor();
  await A.page.locator('.q-text', { hasText: '출산 가방 뭐 챙기나요?' }).waitFor();
  assert.match(await A.page.locator('.tab-body > .block-line').innerText(), /^예정일 .+ · .+ 출생$/);
  assert.match(await A.page.locator('.rec-row').first().innerText(), /63\.1kg/);
  for (const name of ['＋ 추가', '＋ 기록', '👶 출산했어요']) assert.equal(await A.page.getByRole('button', { name }).count(), 0, `${name} 없음`);

  await A.page.goBack(); // 폰 뒤로 가기 → 타임라인
  await A.page.locator('.past-row').waitFor();
  assert.equal(await A.page.locator('.panel-head').count(), 0);
});

test('교육 (영유아) 아이: 🍼 육아 보관함 = 해별 기록 수 → 해를 누르면 달별 → 달을 누르면 날짜별 표', async () => {
  const birth = yearsAgo(4, 20);
  await addChild('호호', birth);
  await seed('호호', [
    { type: 'feeding', days: 40, hour: 9, data: { method: 'formula', ml: 120 } },
    { type: 'feeding', days: 40, hour: 13, data: { method: 'pumped', ml: 100 } },
    { type: 'diaper', days: 40, hour: 10, data: { pee: true, poo: true } },
    { type: 'sleep', days: 40, hour: 14, endHour: 16, data: {} },
    { type: 'feeding', days: 200, hour: 8, data: { method: 'breast', side: 'L' } },
    { type: 'feeding', days: 900, hour: 8, data: { method: 'breast', side: 'R' } },
    { type: 'feeding', days: 365 * 3 + 30, hour: 8, data: { method: 'formula', ml: 50 } }, // 만 3세 뒤 = 육아 단계 밖
  ]);
  await openTimeline();
  assert.deepEqual(await pastChips(), ['🍼 육아'], '이어진 임신이 없으면 육아만');
  await A.page.locator('.past-row').getByRole('button', { name: '🍼 육아' }).click();
  await A.page.locator('.panel-head', { hasText: '🗂 🍼 육아' }).waitFor();

  // 해별: 그해에 들어간 육아 단계 기록 수
  const [y, m, d] = birth.split('-').map(Number), at = days => new Date(Date.UTC(y, m - 1, d + days));
  const spans = monthSpans(birth, birthdayAt(birth, 3)), years = [...new Set(spans.map(x => x.ym.slice(0, 4)))];
  const inYear = (list, yr) => list.filter(n => at(n).getUTCFullYear() === +yr).length;
  const yearRows = A.page.locator('.ar-year');
  await until(async () => (await yearRows.count()) === years.length);
  await until(async () => !(await A.page.locator('.ar-table').innerText()).includes('…'), 30000); // 서버에서 다 셀 때까지
  for (const yr of years) {
    const text = await yearRows.filter({ hasText: `${yr}년` }).innerText();
    assert.match(text, new RegExp(`${inYear([40, 40, 200, 900], yr)}회\\s+${inYear([40], yr)}번\\s+${inYear([40], yr)}회$`), `${yr}년: ${text}`);
  }
  assert.match(await yearRows.first().innerText(), /^▸ \d{4}년 0~\d+개월/);
  assert.equal(await A.page.locator('.ar-mon').count(), 0, '처음엔 해만');

  // 해를 누르면 그해 달별, 달을 누르면 날짜별 표
  const t40 = at(40), y40 = String(t40.getUTCFullYear()), mon40 = t40.getUTCMonth() + 1;
  await yearRows.filter({ hasText: `${y40}년` }).click();
  const monRows = A.page.locator('.ar-mon');
  await until(async () => (await monRows.count()) === spans.filter(x => x.ym.startsWith(y40)).length);
  const row40 = monRows.filter({ hasText: new RegExp(`^▸ ${mon40}월 `) });
  await until(async () => /2회\s+1번\s+1회$/.test(await row40.innerText()));
  const age40 = (t40.getUTCFullYear() - y) * 12 + (mon40 - m);
  assert.match(await row40.innerText(), new RegExp(`^▸ ${mon40}월 ${age40}개월`), '태어난 달 0개월부터 한 달에 1씩');

  await row40.click();
  await A.page.locator('.ar-detail .pt-table').waitFor();
  assert.match(await A.page.locator('.ar-detail .block-line').innerText(), /^하루 평균 수유 [\d.]+회 · 수면 .+ · 기저귀 [\d.]+회$/);
  const day = A.page.locator('.ar-detail tr', { hasText: '220ml' });
  assert.match(await day.innerText(), /2회 \(220ml\)\s+2시간\s+1회 \(1\)/);
  await monRows.filter({ hasText: new RegExp(`^▾ ${mon40}월 `) }).click(); // 다시 누르면 접힘
  await A.page.locator('.ar-detail').waitFor({ state: 'detached' });
  await yearRows.filter({ hasText: `${y40}년` }).click();
  await A.page.locator('.ar-mon').first().waitFor({ state: 'detached' });
});

test('교육 (사춘기) 아이: 영유아 보관함 = 다닌 기관 + 해별 독서·활동·상담 → 해를 누르면 그해 활동·책·상담', async () => {
  const birth = yearsAgo(13, 40);
  await addChild('지호', birth);
  const [by] = birth.split('-').map(Number), Y = by + 5; // 그해 전체가 영유아 단계 (만 4~5세)
  await A.page.getByRole('button', { name: '＋ 학교 추가' }).click();
  await form().getByRole('button', { name: '🎒 유치원' }).click();
  await fillForm(A.page, { name: '햇살유치원', from: `${by + 4}-03`, to: `${by + 6}-02` }, '저장');
  await A.page.getByRole('button', { name: '＋ 학교 추가' }).click();
  await fillForm(A.page, { name: '한빛중학교', from: `${by + 13}-03` }, '저장'); // 사춘기 단계에 시작 → 보관함엔 안 나옴
  await A.page.locator('.rec-row', { hasText: '한빛중학교' }).waitFor();
  const book = (title, liked = false) => ({ title, with: 'together', liked });
  await seed('지호', [
    { type: 'book', date: `${Y}-03-10`, hour: 20, data: book('구름빵', true) },
    { type: 'book', date: `${Y}-05-10`, hour: 20, data: book('구름빵') },
    { type: 'book', date: `${Y}-09-10`, hour: 20, data: book('달님 안녕') },
    { type: 'activity', date: `${Y}-04-02`, hour: 16, data: { activityId: 'a1', name: '피아노', emoji: '🎹' } },
    { type: 'activity', date: `${Y}-04-09`, hour: 16, data: { activityId: 'a1', name: '피아노', emoji: '🎹' } },
    { type: 'consult', date: `${Y}-06-15`, hour: 12, data: { school: '햇살유치원', text: '친구와 잘 지내요' } },
    { type: 'book', date: `${Y + 1}-02-01`, hour: 20, data: book('별님') },
    { type: 'book', days: 365 * 12 + 100, hour: 20, data: book('사춘기 책') }, // 사춘기 단계 → 안 셈
  ]);
  await openTimeline();
  assert.deepEqual(await pastChips(), ['🍼 육아', '📚 교육 (영유아)']);
  await A.page.locator('.past-row').getByRole('button', { name: '📚 교육 (영유아)' }).click();
  await A.page.locator('.panel-head', { hasText: '🗂 📚 교육 (영유아)' }).waitFor();

  const block = name => A.page.locator('.block', { has: A.page.locator('h2', { hasText: name }) });
  assert.match(await block('🏫 다닌 기관').innerText(), /햇살유치원/);
  assert.doesNotMatch(await block('🏫 다닌 기관').innerText(), /한빛중학교/);

  // 해별 개수 (독서 · 활동 · 상담)
  const years = [...new Set(monthSpans(birthdayAt(birth, 3), birthdayAt(birth, 12)).map(x => x.ym.slice(0, 4)))];
  const yearRows = A.page.locator('.ar-year');
  await until(async () => (await yearRows.count()) === years.length);
  await until(async () => !(await A.page.locator('.ar-table').innerText()).includes('…'), 30000); // 서버에서 다 셀 때까지
  const want = { [Y]: '3번\\s+2회\\s+1개', [Y + 1]: '1번\\s+0회\\s+0개' };
  for (const yr of years) {
    const text = await yearRows.filter({ hasText: `${yr}년` }).innerText();
    assert.match(text, new RegExp(`${want[yr] || '0번\\s+0회\\s+0개'}$`), `${yr}년: ${text}`);
  }
  const a = childAge(birth, `${Y}-01-01`).years, b = childAge(birth, `${Y}-12-31`).years;
  assert.match(await yearRows.filter({ hasText: `${Y}년` }).innerText(), new RegExp(`^▸ ${Y}년 만 ${a === b ? a : `${a}~${b}`}세`));
  assert.equal(await A.page.locator('.ar-detail').count(), 0, '처음엔 해만');

  // 해를 누르면 그해 활동 · 읽은 책 · 상담 메모
  const norm = list => list.map(t => t.replace(/\s+/g, ' ').trim());
  const detail = A.page.locator('.ar-detail');
  await yearRows.filter({ hasText: `${Y}년` }).click();
  await detail.locator('.ar-line').first().waitFor();
  assert.deepEqual(norm(await detail.locator('.ar-sub').allInnerTexts()), ['🎹 활동', '📚 읽은 책 · 3번 (2권)', '💬 상담 메모']);
  assert.deepEqual(norm(await detail.locator('.ar-line').allInnerTexts()), ['🎹 피아노 2회', '📖 구름빵 2번 · ❤️', '📖 달님 안녕 1번'], '많이 읽은 책부터');
  await detail.locator('.tl-row', { hasText: '햇살유치원 · 친구와 잘 지내요' }).waitFor();

  await yearRows.filter({ hasText: `${Y + 1}년` }).click(); // 다른 해를 누르면 그해만
  await until(async () => norm(await detail.locator('.ar-sub').allInnerTexts()).join() === '📚 읽은 책 · 1번 (1권)');
  assert.deepEqual(norm(await detail.locator('.ar-line').allInnerTexts()), ['📖 별님 1번']);
  assert.equal(await A.page.getByRole('button', { name: /^＋/ }).count(), 0, '새로 기록하는 버튼 없음');

  await A.page.getByRole('button', { name: '‹ 타임라인' }).click();
  await A.page.locator('.past-row').waitFor();
});
