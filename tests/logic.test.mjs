// 날짜 계산 테스트. 실행: npm run test:logic
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pregnancyAge, pregnancyLine, childAge, childStage, childLine } from '../js/stage.js';

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
