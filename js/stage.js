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
  edu: { label: '교육 (영유아)', emoji: '📚' },
  teen: { label: '교육 (사춘기)', emoji: '📚' },
};
const ORDER = ['pregnancy', 'baby', 'edu', 'teen'];

// 지금 단계. 출생 전 = 임신, 만 eduStartAge세 생일 전 = 육아, 만 teenStartAge세 생일 전 = 교육(영유아), 그 뒤 = 교육(사춘기)
export function childStage(birthDate, today, eduStartAge = DEFAULT_EDU_AGE, teenStartAge = DEFAULT_TEEN_AGE) {
  if (dayNum(birthDate) > dayNum(today)) return 'pregnancy';
  const { years } = childAge(birthDate, today);
  return years < eduStartAge ? 'baby' : years < teenStartAge ? 'edu' : 'teen';
}

// 만 n세 생일 'YYYY-MM-DD' (2월 29일생은 평년엔 3월 1일: childAge와 같은 기준)
export function birthdayAt(birthDate, n) {
  const [y, m, d] = birthDate.split('-').map(Number);
  return new Date(Date.UTC(y + n, m - 1, d)).toISOString().slice(0, 10);
}

// 지나간 단계와 기간 [{ stage, from, to }] (from부터 to 전날까지, to = 다음 단계 첫날). 임신은 from 없이, 이어진 임신이 있을 때만
export function pastStages(birthDate, today, eduStartAge = DEFAULT_EDU_AGE, teenStartAge = DEFAULT_TEEN_AGE, hasPregnancy = false) {
  const now = ORDER.indexOf(childStage(birthDate, today, eduStartAge, teenStartAge));
  const eduFrom = birthdayAt(birthDate, eduStartAge), teenFrom = birthdayAt(birthDate, teenStartAge);
  return [
    ...(hasPregnancy && now >= 1 ? [{ stage: 'pregnancy', to: birthDate }] : []),
    ...(now >= 2 ? [{ stage: 'baby', from: birthDate, to: eduFrom }] : []),
    ...(now >= 3 ? [{ stage: 'edu', from: eduFrom, to: teenFrom }] : []),
  ];
}

// 기간을 달로 나눔 → [{ ym: 'YYYY-MM', from, to }] (from부터 to 전날까지. 첫 달·끝 달은 기간 안쪽만)
export function monthSpans(from, to) {
  const out = [];
  for (let start = from; start < to;) {
    const y = +start.slice(0, 4), m = +start.slice(5, 7), next = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`;
    out.push({ ym: start.slice(0, 7), from: start, to: next < to ? next : to });
    start = next;
  }
  return out;
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
