// 타임라인 탭: 이 아이(또는 임신)의 기록을 한 달씩, 날짜별로 최근 것부터. 임신에서 이어진 아이면 임신 중 기록도 같이
// ‹ 2026년 10월 › 로 넘기고, 제목을 누르면 연·월 고르기. 종류 필터. 한 번에 한 달치만 읽음 (몇 년 쌓여도 같은 양)
// 맨 위 🗂 지난 단계: 끝난 단계의 정리 화면(보관함, archive.js)으로
import { state, render, go, today, eduStartAge, teenStartAge } from './state.js';
import { dateStr, pastStages, STAGES } from './stage.js';
import { watchRecords, loadNotice, TYPES } from './records.js';
import { memberLabel } from './family.js';
import { h, button, fmtDay, fmtTime } from './ui.js';

const pad = n => String(n).padStart(2, '0');
const ymOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const months = new Map();  // 화면별(key) 보고 있는 달 'YYYY-MM' (기본: 이번 달)
const filters = new Map(); // 아이별 종류 필터 (기본: 전체)
let picking = null;        // 연·월 고르기를 펼친 화면 { key, year }

const typeOf = r => TYPES[r.type] || { emoji: '📝', label: r.type, text: () => '' };
const emojiOf = (t, r) => (typeof t.emoji === 'function' ? t.emoji(r) : t.emoji);

// 달 넘기기: ‹ 2026년 10월 › + 연·월 고르기 + 이번 달. key = 화면마다 따로 기억 (타임라인·일기)
// → { since, until } 보고 있는 달의 처음과 다음 달 처음
export function monthNav(key, el) {
  const thisMonth = ymOf(new Date()), ym = months.get(key) || thisMonth;
  const [y, m] = ym.split('-').map(Number);
  const show = v => { months.set(key, v); picking = null; render(); };
  const shift = d => show(ymOf(new Date(y, m - 1 + d, 1)));

  const nav = h('div', 'month-nav');
  const prev = button('‹', () => shift(-1), 'icon-btn'), next = button('›', () => shift(1), 'icon-btn');
  prev.setAttribute('aria-label', '이전 달');
  next.setAttribute('aria-label', '다음 달');
  next.disabled = ym >= thisMonth;
  const title = button(`${y}년 ${m}월 ▾`, () => { picking = picking?.key === key ? null : { key, year: y }; render(); }, 'month-title');
  title.setAttribute('aria-label', '연·월 고르기');
  nav.append(prev, title, next);
  if (ym !== thisMonth) nav.append(button('이번 달', () => show(thisMonth), 'btn small'));
  el.append(nav);
  if (picking?.key === key) el.append(monthPicker(ym, thisMonth, show));
  return { since: new Date(y, m - 1, 1), until: new Date(y, m, 1) };
}

export function timelineTab(s, el) {
  const past = s.child ? pastStages(s.child.birthDate, today(), eduStartAge(), teenStartAge(), !!s.preg) : [];
  if (past.length) {
    const row = h('div', 'past-row');
    row.append(h('span', 'past-label', '🗂 지난 단계'), ...past.map(p => button(`${STAGES[p.stage].emoji} ${STAGES[p.stage].label}`,
      () => go({ ...state.view, tab: 'timeline', panel: 'archive', archive: p.stage }), 'chip small')));
    el.append(row);
  }
  const range = monthNav(s.key, el);
  const ids = [s.child?.id, s.preg?.id].filter(Boolean);
  const w = watchRecords(ids, range);
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  if (!w.list.length) return el.append(h('div', 'empty', '🗓'), h('p', 'empty-text', '이 달에는 기록이 없어요.'));

  // 종류 필터: 이 달에 있는 종류만, 개수와 함께
  const counts = new Map();
  for (const r of w.list) counts.set(r.type, (counts.get(r.type) || 0) + 1);
  const type = counts.has(filters.get(s.key)) ? filters.get(s.key) : 'all';
  const chips = h('div', 'chip-row');
  const chip = (value, label) => {
    const b = button(label, () => { filters.set(s.key, value); render(); }, `chip small${type === value ? ' on' : ''}`);
    b.setAttribute('aria-pressed', type === value);
    return b;
  };
  chips.append(chip('all', `전체 ${w.list.length}`));
  for (const [t, n] of counts) chips.append(chip(t, `${typeOf({ type: t }).label} ${n}`));
  el.append(chips);

  dayGroups(el, type === 'all' ? w.list : w.list.filter(x => x.type === type), r => !!s.child && r.subjectType === 'pregnancy');
}

// 기록을 날짜 제목 아래로 묶어서 el에 (list는 최근 것부터). pregTag(기록) → '임신 중' 표시 여부
// 그날 기록이 모두 날짜만 있는 종류(일기·독서 등)면 시각 칸 없이
export function dayGroups(el, list, pregTag = () => false) {
  const days = new Map();
  for (const r of list) days.set(dateStr(r.at), [...(days.get(dateStr(r.at)) || []), r]);
  for (const [day, rs] of days) {
    const box = h('div', 'tl-day'), noTime = rs.every(r => typeOf(r).dateOnly);
    box.append(...rs.map(r => recordRow(r, { pregTag: pregTag(r), noTime })));
    el.append(h('h3', 'day-head', fmtDay(day)), box);
  }
}

// 연·월 고르기: ‹ 2026년 › + 1~12월 (이번 달 뒤는 못 고름)
function monthPicker(ym, thisMonth, show) {
  const box = h('div', 'mp'), head = h('div', 'mp-head'), grid = h('div', 'mp-grid');
  const year = picking.year;
  const prev = button('‹', () => { picking.year--; render(); }, 'icon-btn'), next = button('›', () => { picking.year++; render(); }, 'icon-btn');
  prev.setAttribute('aria-label', '이전 해');
  next.setAttribute('aria-label', '다음 해');
  next.disabled = year >= +thisMonth.slice(0, 4);
  head.append(prev, h('strong', null, `${year}년`), next);
  for (let i = 1; i <= 12; i++) {
    const v = `${year}-${pad(i)}`, b = button(`${i}월`, () => show(v), `mp-month${v === ym ? ' on' : ''}${v === thisMonth ? ' now' : ''}`);
    b.disabled = v > thisMonth;
    grid.append(b);
  }
  box.append(head, grid);
  return box;
}

// 기록 한 줄: 시각 · 이모지 · 종류 · 내용 · 기록한 사람(⏳ = 아직 안 올라감). 누르면 고치기
// noTime = 시각 칸 빼기. 종류 이름은 rowLabel(기록)이 있으면 그것 (예: 노트 → 일기·한 말)
export function recordRow(r, { pregTag = false, noTime = false } = {}) {
  const t = typeOf(r);
  const row = button('', () => t.edit?.(r), noTime ? 'tl-row no-time' : 'tl-row');
  const label = h('span', 'tl-label', t.rowLabel ? t.rowLabel(r) : t.label);
  if (pregTag) label.append(h('span', 'tag', '🤰 임신 중'));
  const body = h('span', 'tl-body');
  body.append(label, h('span', 'tl-text', t.text(r)), h('span', 'tl-who', `${r.pending ? '⏳ ' : ''}${memberLabel(r.createdBy)}`));
  if (!noTime) row.append(h('span', 'tl-time', t.dateOnly ? '' : fmtTime(r.at)));
  row.append(h('span', 'tl-emoji', emojiOf(t, r)), body);
  return row;
}
