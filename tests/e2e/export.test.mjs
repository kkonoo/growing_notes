// 5단계 시나리오: 설정 › 내보내기 (전체·아이별 CSV, JSON 백업). 받은 CSV를 R read.csv로도 읽어 봄 (Rscript가 있을 때)
// A(엄마)·B(아빠). 가짜 계정·가짜 데이터만
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { startServer, launch, person, login, clearEmulators, fillForm, dayFromToday, makeInvite, UTF8 } from './helpers.mjs';
import { CSV_COLUMNS } from '../../js/export.js';

let server, browser, A, B;
before(async () => { await clearEmulators(); server = await startServer(); browser = await launch(); });
after(async () => { await browser?.close(); server?.close(); });

const wait = ms => new Promise(r => setTimeout(r, ms));
const quick = (page, name) => page.locator('.quickbar').getByRole('button', { name });
const home = page => page.getByRole('button', { name: '🏠 홈' }).click();

// 설정에서 대상 고르고 받기 → { name, text }
async function exportFile(page, scopeLabel, button) {
  await page.getByRole('button', { name: '설정' }).click();
  await page.locator('#exportScope').selectOption({ label: scopeLabel });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: button }).click()]);
  const file = await dl.path();
  await page.getByRole('button', { name: '닫기' }).click();
  return { name: dl.suggestedFilename(), file, text: await readFile(file, 'utf8') };
}
// 간단한 CSV 읽기 (따옴표 안의 쉼표·따옴표·줄바꿈 처리)
function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
  }
  return rows.map(r => Object.fromEntries(CSV_COLUMNS.map((c, k) => [c, r[k]])));
}

test('기록 만들기: 첫째 육아 기록, 둘째 임신 기록 → 출산, 배우자 기록', async () => {
  A = await person(browser);
  await login(A.page, 'mom', '테스트엄마');
  await A.page.getByRole('button', { name: '👶 아이 등록' }).click();
  await fillForm(A.page, { name: '첫째', birthDate: dayFromToday(-100) }, '등록');
  await quick(A.page, /분유/).click();
  await A.page.locator('#toast').getByRole('button', { name: '고치기' }).click();
  await fillForm(A.page, { ml: '120', memo: '밤중, "조금" 남김' }, '저장');
  await quick(A.page, /소변/).click();

  await home(A.page);
  await A.page.getByRole('button', { name: '🤰 임신 등록' }).click();
  await fillForm(A.page, { nickname: '둘째', dueDate: dayFromToday(10) }, '등록');
  await A.page.getByRole('button', { name: '＋ 추가' }).click();
  await A.page.locator('#formEl textarea[name="text"]').fill('철분제, 계속 먹어도 되나요?');
  await A.page.locator('#formEl').getByRole('button', { name: '추가' }).click();
  await A.page.getByRole('button', { name: '⏱ 진통 타이머 열기' }).click();
  await A.page.locator('.timer-btn', { hasText: '진통 시작' }).click();
  await wait(1100);
  await A.page.locator('.timer-btn', { hasText: '진통 끝' }).click();
  await A.page.getByRole('button', { name: '‹ 임신 탭' }).click();
  await A.page.getByRole('button', { name: '👶 출산했어요' }).click();
  await fillForm(A.page, {}, '출산 처리');
  await A.page.locator('.subject-line', { hasText: '생후 1일' }).waitFor();

  const code = await makeInvite(A.page);
  B = await person(browser);
  await login(B.page, 'dad', '테스트아빠', `#join=${code}`);
  await B.page.locator('.card', { hasText: '첫째' }).click();
  await quick(B.page, /오른쪽/).click();
  await A.page.getByRole('button', { name: /첫째/ }).click();
  await A.page.locator('.tl-row', { hasText: '모유 오른쪽' }).waitFor();
});

let all;
test('전체 CSV: UTF-8(BOM 없음), 한 줄 = 기록 하나, 임신 기록은 출산한 아이 이름으로, 기록자', async () => {
  all = await exportFile(A.page, '전체', '📄 CSV 받기');
  assert.match(all.name, /^growing-전체-\d{4}-\d{2}-\d{2}\.csv$/);
  assert.ok(!all.text.startsWith('﻿'), 'BOM 없음');
  const [head, ...rows] = parseCSV(all.text);
  assert.deepEqual(Object.values(head), CSV_COLUMNS);
  assert.equal(rows.length, 5);
  const by = t => rows.filter(r => r.type === t);
  assert.deepEqual(by('feeding').map(r => [r.subject, r.method, r.side, r.ml, r.recorded_by]).sort(),
    [['첫째', 'breast', 'R', '', '테스트아빠'], ['첫째', 'formula', '', '120', '테스트엄마']]);
  assert.equal(by('feeding').find(r => r.method === 'formula').memo, '밤중, "조금" 남김');
  assert.deepEqual([by('diaper')[0].pee, by('diaper')[0].poo], ['TRUE', 'FALSE']);
  assert.deepEqual([by('question')[0].subject, by('question')[0].subject_type, by('question')[0].text, by('question')[0].done],
    ['둘째', 'pregnancy', '철분제, 계속 먹어도 되나요?', 'FALSE']);
  assert.ok(+by('contraction')[0].duration_min > 0);
  for (const r of rows) assert.match(r.datetime, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
});

test('받은 CSV를 R read.csv로 그대로 읽기 (Rscript가 있을 때)', t => {
  if (spawnSync('Rscript', ['--version']).error) return t.skip('Rscript 없음');
  const r = spawnSync('Rscript', ['-e', `x <- read.csv("${all.file}", fileEncoding = "UTF-8");
    cat(nrow(x), ncol(x), class(x$ml), class(x$pee), paste(sort(unique(x$subject)), collapse = "+"), sep = "|")`], { encoding: 'utf8', env: UTF8 });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), `5|${CSV_COLUMNS.length}|integer|logical|둘째+첫째`);
});

test('아이별 CSV: 둘째 = 이어진 임신 기록만', async () => {
  const f = await exportFile(A.page, '👶 둘째', '📄 CSV 받기');
  assert.match(f.name, /^growing-둘째-/);
  const rows = parseCSV(f.text).slice(1);
  assert.deepEqual(rows.map(r => r.type).sort(), ['contraction', 'question']);
});

test('JSON 백업: 복원할 수 있는 형식 (id·연결·기록자·시각 위치)', async () => {
  const f = await exportFile(A.page, '👶 둘째', '💾 JSON 백업 받기');
  const b = JSON.parse(f.text);
  assert.equal(b.app, 'growing_notes');
  assert.equal(b.format, 1);
  assert.equal(b.scope.kind, 'child');
  assert.equal(b.children.length, 1);
  assert.equal(b.pregnancies.length, 1);
  assert.equal(b.children[0].pregnancyId, b.pregnancies[0].id);
  assert.equal(b.pregnancies[0].childId, b.children[0].id);
  assert.equal(b.pregnancies[0].status, 'born');
  assert.equal(b.records.length, 2);
  assert.ok(b.records.every(r => r.id && r.subjectId === b.pregnancies[0].id && r.createdBy));
  assert.ok(b.timeFields.records.includes('at') && b.timeFields.records.includes('data.endAt'));
  assert.match(b.records[0].at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
  assert.deepEqual(b.members.map(m => m.name).sort(), ['테스트아빠', '테스트엄마']);
  assert.equal(b.settings.eduStartAge, 3);

  const whole = JSON.parse((await exportFile(A.page, '전체', '💾 JSON 백업 받기')).text);
  assert.equal(whole.scope.kind, 'all');
  assert.equal(whole.records.length, 5);
  assert.equal(whole.children.length, 2);
});
