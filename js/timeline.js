// 타임라인 탭: 이 아이(또는 임신)의 기록을 날짜별로, 최근 것부터. 임신에서 이어진 아이면 임신 중 기록도 같이
import { render } from './state.js';
import { dateStr } from './stage.js';
import { watchRecords, loadNotice, TYPES } from './records.js';
import { memberLabel } from './family.js';
import { h, button, fmtDay, fmtTime } from './ui.js';

const PAGE = 50;
const limits = new Map(); // 아이별 "더 보기"로 늘린 개수

export function timelineTab(s, el) {
  const ids = [s.child?.id, s.preg?.id].filter(Boolean);
  const limit = limits.get(s.key) || PAGE, w = watchRecords(ids, { limit });
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  if (!w.list.length) return el.append(h('div', 'empty', '🗓'), h('p', 'empty-text', '아직 기록이 없어요.'));
  let day = null, box;
  for (const r of w.list) {
    if (dateStr(r.at) !== day) {
      day = dateStr(r.at);
      box = h('div', 'tl-day');
      el.append(h('h3', 'day-head', fmtDay(day)), box);
    }
    box.append(recordRow(r, { pregTag: !!s.child && r.subjectType === 'pregnancy' }));
  }
  if (w.more) el.append(button('더 보기', () => { limits.set(s.key, limit + PAGE); render(); }, 'btn wide'));
}

// 기록 한 줄: 시각 · 이모지 · 종류 · 내용 · 기록한 사람(⏳ = 아직 안 올라감). 누르면 고치기
export function recordRow(r, { pregTag = false } = {}) {
  const t = TYPES[r.type] || { emoji: '📝', label: r.type, text: () => '' };
  const row = button('', () => t.edit?.(r), 'tl-row');
  const label = h('span', 'tl-label', t.label);
  if (pregTag) label.append(h('span', 'tag', '🤰 임신 중'));
  const body = h('span', 'tl-body');
  body.append(label, h('span', 'tl-text', t.text(r)), h('span', 'tl-who', `${r.pending ? '⏳ ' : ''}${memberLabel(r.createdBy)}`));
  row.append(h('span', 'tl-time', t.dateOnly ? '' : fmtTime(r.at)), h('span', 'tl-emoji', typeof t.emoji === 'function' ? t.emoji(r) : t.emoji), body);
  return row;
}
