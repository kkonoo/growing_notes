// 타임라인 탭: 이 아이(또는 임신)의 기록을 날짜별로, 최근 것부터. 임신에서 이어진 아이면 임신 중 기록도 같이
import { render } from './state.js';
import { dateStr } from './stage.js';
import { watchRecords, TYPES } from './records.js';
import { memberLabel } from './family.js';
import { h, button, fmtDay, fmtTime } from './ui.js';

const PAGE = 50;
const limits = new Map(); // 아이별 "더 보기"로 늘린 개수

export function timelineTab(s, el) {
  const ids = [s.child?.id, s.preg?.id].filter(Boolean);
  const limit = limits.get(s.key) || PAGE, w = watchRecords(ids, limit);
  if (!w.loaded) return el.append(h('p', 'hint center', '기록을 불러오는 중이에요…'));
  if (!w.list.length) return el.append(h('div', 'empty', '🗓'), h('p', 'empty-text', '아직 기록이 없어요.'));
  let day = null, box;
  for (const r of w.list) {
    if (dateStr(r.at) !== day) {
      day = dateStr(r.at);
      box = h('div', 'tl-day');
      el.append(h('h3', 'day-head', fmtDay(day)), box);
    }
    const t = TYPES[r.type] || { emoji: '📝', label: r.type, text: () => '' };
    const row = button('', () => t.edit?.(r), 'tl-row');
    const label = h('span', 'tl-label', t.label);
    if (s.child && r.subjectType === 'pregnancy') label.append(h('span', 'tag', '🤰 임신 중'));
    const body = h('span', 'tl-body');
    body.append(label, h('span', 'tl-text', t.text(r)), h('span', 'tl-who', `${r.pending ? '⏳ ' : ''}${memberLabel(r.createdBy)}`));
    row.append(h('span', 'tl-time', t.dateOnly ? '' : fmtTime(r.at)), h('span', 'tl-emoji', t.emoji), body);
    box.append(row);
  }
  if (w.more) el.append(button('더 보기', () => { limits.set(s.key, limit + PAGE); render(); }, 'btn wide'));
}
