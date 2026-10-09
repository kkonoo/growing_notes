// 날짜·기록 계산 테스트. 실행: npm run test:logic
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pregnancyAge, pregnancyLine, childAge, childStage, childLine } from '../js/stage.js';
import { fmtDur, fmtClock, fmtMins, fmtAgo, contractionRows, contractionSummary, babyDay, startOfDay } from '../js/stats.js';

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
