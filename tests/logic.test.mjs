// 날짜·기록 계산 테스트. 실행: npm run test:logic
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pregnancyAge, pregnancyLine, childAge, childStage, childLine } from '../js/stage.js';
import { fmtDur, fmtClock, fmtMins, fmtAgo, contractionRows, contractionSummary, babyDay, startOfDay } from '../js/stats.js';
import { toCSV, toBackup, withDates, localDateTime, isoLocal, CSV_COLUMNS } from '../js/export.js';
import { pickTips, TIPS } from '../js/tips.js';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('임신 주수: 예정일 280일 전 = 0주 0일', () => {
  assert.deepEqual(pregnancyAge('2027-07-16', '2026-10-09'), { weeks: 0, days: 0, dday: 280 });
  assert.equal(pregnancyLine('2027-01-26', '2026-10-09'), '24주 3일 · D-109');
  assert.equal(pregnancyLine('2026-10-09', '2026-10-09'), '40주 0일 · D-day');
  assert.equal(pregnancyLine('2026-10-06', '2026-10-09'), '40주 3일 · D+3');
});

test('임신 주수: 예정일이 280일보다 멀면 0주로', () => {
  assert.equal(pregnancyAge('2027-12-01', '2026-10-09').weeks, 0);
});

test('생후 일수: 태어난 날 = 1일, 백일 = 99일 뒤', () => {
  assert.equal(childAge('2026-10-09', '2026-10-09').dayCount, 1);
  assert.equal(childAge('2026-01-01', '2026-04-10').dayCount, 100);
  assert.equal(childLine('2026-05-31', '2026-10-09'), '생후 132일 (4개월)');
});

test('만 개월: 생일 날짜가 안 지났으면 한 달 덜', () => {
  assert.equal(childAge('2026-01-31', '2026-02-28').months, 0);
  assert.equal(childAge('2026-01-31', '2026-03-01').months, 1);
  assert.equal(childAge('2024-02-29', '2025-02-28').months, 11);
  assert.equal(childAge('2024-02-29', '2025-03-01').months, 12);
});

test('단계: 출생 전 임신, 만 3세 생일 전 육아, 그 뒤 교육', () => {
  assert.equal(childStage('2026-10-10', '2026-10-09'), 'pregnancy');
  assert.equal(childStage('2026-10-09', '2026-10-09'), 'baby');
  assert.equal(childStage('2023-10-09', '2026-10-08'), 'baby');
  assert.equal(childStage('2023-10-09', '2026-10-09'), 'edu');
  assert.equal(childLine('2021-07-01', '2026-10-09'), '만 5세 3개월');
});

test('단계: 경계 나이 설정을 따름', () => {
  assert.equal(childStage('2023-01-01', '2026-10-09', 4), 'baby');
  assert.equal(childStage('2023-01-01', '2026-10-09', 3), 'edu');
  assert.equal(childStage('2026-01-01', '2026-10-09', 0), 'edu');
});

test('시간 글자', () => {
  assert.equal(fmtDur(48e3), '48초');
  assert.equal(fmtDur(312e3), '5분 12초');
  assert.equal(fmtDur(300e3), '5분');
  assert.equal(fmtDur(3900e3), '1시간 5분');
  assert.equal(fmtClock(7e3), '0:07');
  assert.equal(fmtClock(754e3), '12:34');
  assert.equal(fmtClock(3723e3), '1:02:03');
});

test('진통: 지속시간 = 끝 - 시작, 간격 = 앞 진통 시작 → 이번 시작 (순서 섞여 와도)', () => {
  const t = m => new Date(Date.UTC(2026, 9, 9, 3, 0) + m * 60e3);
  const rows = contractionRows([
    { id: 'b', start: t(6), end: t(7) },
    { id: 'a', start: t(0), end: t(0.75) },
    { id: 'c', start: t(11), end: null },
  ]);
  assert.deepEqual(rows.map(r => r.id), ['a', 'b', 'c']);
  assert.deepEqual(rows.map(r => r.duration), [45e3, 60e3, null]);
  assert.deepEqual(rows.map(r => r.interval), [null, 6 * 60e3, 5 * 60e3]);
});

test('진통 요약: 최근 1시간 안에 시작한 것만, 진행 중은 지속 평균에서 빠짐', () => {
  const t = m => Date.UTC(2026, 9, 9, 3, 0) + m * 60e3;
  const rows = contractionRows([
    { start: t(0), end: t(1) },      // 1시간 넘게 전 → 횟수에서 빠짐
    { start: t(70), end: t(71) },    // 간격 70분
    { start: t(80), end: t(80.5) },  // 간격 10분
    { start: t(90), end: null },     // 간격 10분, 진행 중
  ]);
  const sum = contractionSummary(rows, t(95));
  assert.equal(sum.count, 3);
  assert.equal(sum.avgInterval, 30 * 60e3);
  assert.equal(sum.avgDuration, 45e3);
  assert.deepEqual(contractionSummary([], t(0)), { count: 0, avgInterval: null, avgDuration: null });
});

test('분 단위 글자', () => {
  assert.equal(fmtMins(59e3), '0분');
  assert.equal(fmtMins(40 * 60e3), '40분');
  assert.equal(fmtMins(130 * 60e3), '2시간 10분');
  assert.equal(fmtMins(120 * 60e3), '2시간');
  assert.equal(fmtAgo(30e3), '방금');
  assert.equal(fmtAgo(130 * 60e3), '2시간 10분 전');
});

test('육아 하루 정리: 그날 기록만, 밤새 잔 잠은 이 날에 걸친 만큼, 자는 중이면 지금까지', () => {
  const at = (d, h, m = 0) => new Date(2026, 9, d, h, m); // 기기 현지 시각
  const rec = (type, a, data = {}) => ({ type, at: a, data });
  const records = [
    rec('feeding', at(9, 3, 10), { method: 'formula', ml: 120 }),
    rec('feeding', at(9, 6), { method: 'breast', side: 'L' }),
    rec('feeding', at(8, 23), { method: 'formula', ml: 90 }),      // 전날
    rec('diaper', at(9, 4), { pee: true, poo: false }),
    rec('diaper', at(9, 7), { pee: true, poo: true }),
    rec('sleep', at(8, 22), { endAt: at(9, 2) }),                  // 전날 밤 → 이 날 2시간
    rec('sleep', at(9, 13), { endAt: at(9, 14, 30) }),             // 1시간 30분
    rec('sleep', at(9, 23), { endAt: null }),                      // 자는 중
  ];
  const day = babyDay(records, startOfDay(at(9, 12)), +at(9, 23, 40));
  assert.equal(day.feeds.length, 2);
  assert.equal(day.ml, 120);
  assert.equal(day.pee, 2);
  assert.equal(day.poo, 1);
  assert.equal(day.sleeps.length, 3);
  assert.equal(day.sleepMs, (120 + 90 + 40) * 60e3);
  assert.deepEqual(day.sleeps.map(x => x.ongoing), [false, false, true]);

  const prev = babyDay(records, startOfDay(at(9, 12), -1), +at(9, 23, 40));
  assert.equal(prev.ml, 90);
  assert.equal(prev.sleepMs, 120 * 60e3, '전날 22시~24시');
});

// ---------- 내보내기 ----------
const ts = d => ({ toDate: () => d }); // Firestore Timestamp 흉내
const at = (d, h, m = 0, sec = 0) => new Date(2026, 9, d, h, m, sec);
const sample = [
  { id: 'r3', subjectType: 'child', subjectId: 'c1', type: 'feeding', at: ts(at(9, 3, 12)), data: { method: 'formula', ml: 120, memo: '밤중, "조금" 남김' }, createdBy: 'u1' },
  { id: 'r1', subjectType: 'pregnancy', subjectId: 'p1', type: 'contraction', at: ts(at(1, 2, 0)), data: { endAt: ts(at(1, 2, 0, 45)) }, createdBy: 'u2' },
  { id: 'r2', subjectType: 'pregnancy', subjectId: 'p1', type: 'contraction', at: ts(at(1, 2, 6)), data: { endAt: null }, createdBy: 'u2' },
  { id: 'r4', subjectType: 'child', subjectId: 'c1', type: 'diaper', at: ts(at(9, 4)), data: { pee: true, poo: false }, createdBy: 'u2' },
  { id: 'r5', subjectType: 'pregnancy', subjectId: 'p1', type: 'question', at: ts(at(1, 1)), data: { text: '여러 줄\n질문', done: false, answer: '' }, createdBy: 'u1' },
  { id: 'r6', subjectType: 'child', subjectId: 'c1', type: 'sleep', at: ts(at(9, 1)), data: { endAt: ts(at(9, 2, 30)) }, createdBy: 'u1' },
];
const names = { subjectName: id => ({ c1: '첫째', p1: '첫째' })[id], memberName: uid => ({ u1: '엄마', u2: '아빠' })[uid] };

test('CSV: 머리줄, 시각 순, 값·빈칸·TRUE/FALSE, 쉼표·따옴표·줄바꿈 감싸기, BOM 없음', () => {
  const csv = toCSV(sample.map(withDates), names);
  assert.ok(!csv.startsWith('\uFEFF'));
  const lines = csv.trimEnd().split('\n');
  assert.equal(lines[0], CSV_COLUMNS.join(','));
  assert.match(lines[1], /^2026-10-01 01:00:00,첫째,pregnancy,question,/);
  assert.match(lines[1], /"여러 줄$/, '줄바꿈 있는 칸은 따옴표로');
  assert.equal(lines[3], '2026-10-01 02:00:00,첫째,pregnancy,contraction,,,,,2026-10-01 02:00:45,0.75,,,,,,,,,,,아빠');
  assert.equal(lines[4], '2026-10-01 02:06:00,첫째,pregnancy,contraction,,,,,,,6,,,,,,,,,,아빠', '진행 중 진통: 끝 없음, 간격 6분');
  assert.equal(lines[5], '2026-10-09 01:00:00,첫째,child,sleep,,,,,2026-10-09 02:30:00,90,,,,,,,,,,,엄마');
  assert.equal(lines[6], '2026-10-09 03:12:00,첫째,child,feeding,formula,,120,,,,,,,,,,,,,"밤중, ""조금"" 남김",엄마');
  assert.equal(lines[7], '2026-10-09 04:00:00,첫째,child,diaper,,,,,,,,TRUE,FALSE,,,,,,,,아빠');
});

test('CSV를 R read.csv로 그대로 읽기 (Rscript가 있을 때)', t => {
  if (spawnSync('Rscript', ['--version']).error) return t.skip('Rscript 없음');
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'growing-')), 'test.csv');
  writeFileSync(file, toCSV(sample.map(withDates), names), 'utf8');
  const r = spawnSync('Rscript', ['-e', `x <- read.csv("${file}", fileEncoding = "UTF-8");
    cat(nrow(x), ncol(x), class(x$ml), class(x$pee), class(x$duration_min), class(x$done), sep = "|"); cat("\n");
    cat(x$subject[1], x$memo[x$type == "feeding"], x$ml[x$type == "feeding"], is.na(x$ml[1]), x$text[1] == "여러 줄\\n질문", sep = "|"); cat("\n");
    cat(format(as.POSIXct(x$datetime[1])), sep = "")`], { encoding: 'utf8', env: { ...process.env, LANG: 'C.UTF-8' } });
  assert.equal(r.status, 0, r.stderr);
  const [shape, values, time] = r.stdout.trim().split('\n');
  assert.equal(shape, `6|${CSV_COLUMNS.length}|integer|logical|numeric|logical`);
  assert.equal(values, '첫째|밤중, "조금" 남김|120|TRUE|TRUE', '줄바꿈 있는 칸도 한 칸으로 읽힘');
  assert.equal(time, '2026-10-01 01:00:00');
});

test('JSON 백업: id·연결·기록자 그대로, 시각은 ISO 글자 + 위치(timeFields)', () => {
  const b = toBackup({
    familyId: 'f1', scope: { kind: 'all' }, settings: { eduStartAge: 3 }, members: [{ uid: 'u1', name: '엄마', emoji: '👩' }],
    pregnancies: [{ id: 'p1', dueDate: '2026-10-05', status: 'born', childId: 'c1', createdAt: ts(at(1, 0)) }],
    children: [{ id: 'c1', name: '첫째', birthDate: '2026-10-03', pregnancyId: 'p1' }],
    records: sample, now: at(10, 9),
  });
  assert.equal(b.app, 'growing_notes');
  assert.equal(b.format, 1);
  assert.equal(b.exportedAt, isoLocal(at(10, 9)));
  assert.deepEqual(b.records.map(r => r.id), ['r5', 'r1', 'r2', 'r6', 'r3', 'r4'], '시각 순');
  assert.deepEqual(b.timeFields, { pregnancies: ['createdAt'], children: [], records: ['at', 'data.endAt'] });
  assert.equal(b.records[1].at, isoLocal(at(1, 2)));
  assert.equal(b.records[2].data.endAt, null, '진행 중은 null 그대로');
  assert.equal(b.children[0].pregnancyId, 'p1');
  assert.equal(b.records[0].createdBy, 'u1');
  assert.deepEqual(JSON.parse(JSON.stringify(b)), b, 'JSON으로 그대로 저장 가능');
  assert.match(isoLocal(at(1, 2)), /^2026-10-01T02:00:00[+-]\d{2}:\d{2}$/);
  assert.equal(localDateTime(at(9, 3, 4, 5)), '2026-10-09 03:04:05');
});

// ---------- 지금 챙길 것 ----------
const ids = age => pickTips(age).map(t => t.id);
test('안내: 임신 주수·생후 일수·개월에 맞는 것만', () => {
  assert.deepEqual(ids({ weeks: 8 }), ['mom-onestop']);
  assert.deepEqual(ids({ weeks: 24 }), ['iron', 'gdm-test']);
  assert.deepEqual(ids({ weeks: 25 }), ['gdm-test']);
  assert.deepEqual(ids({ weeks: 36 }), ['before-birth']);
  assert.deepEqual(ids({ days: 1, months: 0 }), ['birth-report', 'parent-allowance', 'vaccine']);
  assert.deepEqual(ids({ days: 20, months: 0 }), ['birth-report', 'parent-allowance', 'infant-check-1', 'vaccine']);
  assert.deepEqual(ids({ days: 61, months: 2 }), ['vaccine']);
  assert.deepEqual(ids({ days: 150, months: 4 }), ['infant-check-2', 'vaccine']);
  assert.deepEqual(ids({ days: 2200, months: 71 }), ['infant-check-8', 'vaccine']);
  assert.deepEqual(ids({ days: 4800, months: 156 }), [], '만 13세부터는 없음');
});
test('안내 데이터: 모두 출처·링크 주소가 있고, 금액(원) 문구가 없어요', () => {
  for (const t of TIPS) {
    assert.ok(t.src && t.title && t.body, t.id);
    for (const l of t.links) assert.match(l.url, /^https:\/\//, t.id);
    assert.doesNotMatch(t.body, /\d+\s*(만\s*)?원/, `${t.id}: 금액은 넣지 않기`);
  }
});
