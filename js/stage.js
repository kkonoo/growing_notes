// 단계·주수·나이 계산 (저장하지 않고 날짜로 계산). DOM·Firebase 없음 → Node에서 테스트 (tests/logic.test.mjs)
// 날짜는 'YYYY-MM-DD' 문자열. 오늘도 문자열로 받음 (기기 현지 날짜)

const DAY_MS = 86400000;
const pad = n => String(n).padStart(2, '0');
export const dayNum = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / DAY_MS;
export const dateStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 임신 주수: 예정일 280일 전을 0주 0일로
export function pregnancyAge(dueDate, today) {
  const days = Math.max(0, dayNum(today) - (dayNum(dueDate) - 280));
  return { weeks: Math.floor(days / 7), days: days % 7, dday: dayNum(dueDate) - dayNum(today) };
}
export const ddayText = n => (n > 0 ? `D-${n}` : n === 0 ? 'D-day' : `D+${-n}`);

// 출생 후: 생후 일수(태어난 날 = 1일, 백일 계산과 같음), 만 개월·만 나이
export function childAge(birthDate, today) {
  const [by, bm, bd] = birthDate.split('-').map(Number), [ty, tm, td] = today.split('-').map(Number);
  const months = (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0);
  return { dayCount: dayNum(today) - dayNum(birthDate) + 1, months, years: Math.floor(months / 12) };
}

export const DEFAULT_EDU_AGE = 3;
export const DEFAULT_TEEN_AGE = 12;
export const STAGES = {
  pregnancy: { label: '임신', emoji: '🤰' },
  baby: { label: '육아', emoji: '🍼' },
  edu: { label: '교육', emoji: '📚' },
};

// 지금 단계. 출생 전 = 임신, 만 eduStartAge세 생일 전 = 육아, 그 뒤 = 교육
export function childStage(birthDate, today, eduStartAge = DEFAULT_EDU_AGE) {
  if (dayNum(birthDate) > dayNum(today)) return 'pregnancy';
  return childAge(birthDate, today).years < eduStartAge ? 'baby' : 'edu';
}

// 교육 단계 안의 모드: 만 teenStartAge세 생일 전 = 영유아('early'), 그 뒤 = 사춘기('teen')
export function eduMode(birthDate, today, teenStartAge = DEFAULT_TEEN_AGE) {
  return childAge(birthDate, today).years < teenStartAge ? 'early' : 'teen';
}

// 홈 카드의 핵심 한 줄
export function pregnancyLine(dueDate, today) {
  const { weeks, days, dday } = pregnancyAge(dueDate, today);
  return `${weeks}주 ${days}일 · ${ddayText(dday)}`;
}
export function childLine(birthDate, today, eduStartAge = DEFAULT_EDU_AGE) {
  const stage = childStage(birthDate, today, eduStartAge);
  if (stage === 'pregnancy') return `태어날 날 ${ddayText(dayNum(birthDate) - dayNum(today))}`;
  const { dayCount, months, years } = childAge(birthDate, today);
  if (stage === 'baby') return `생후 ${dayCount}일 (${months}개월)`;
  return `만 ${years}세 ${months % 12}개월`;
}
