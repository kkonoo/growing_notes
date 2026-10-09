// 육아 탭: 수유·수면·기저귀 빠른 기록(누르면 바로 지금 시각으로 저장), 지금 상태, 오늘 요약, 오늘 기록, 최근 7일 패턴
// 기록 종류: feeding { method: breast|formula|pumped, side?: L|R|both, ml?, minutes?, memo? }
//           sleep { endAt(자는 중이면 null), memo? } — at = 잠든 시각 / diaper { pee, poo, memo? }
import { render, today as todayStr } from './state.js';
import { childAge } from './stage.js';
import { pickTips, tipsBlock } from './tips.js';
import { updateRecord, deleteRecord, watchRecords, loadNotice, defineType, tapOnce, quickAdd as addNow } from './records.js';
import { babyDay, startOfDay, fmtMins } from './stats.js';
import { sinceEl } from './live.js';
import { recordRow } from './timeline.js';
import { renderPattern } from './pattern.js';
import { h, button, toast, openForm, fmtTime, toLocalInput, fromLocalInput } from './ui.js';

const C = 'child';
const DEL = [{ label: '지우기', value: 'delete', cls: 'danger' }];

// ---------- 기록 종류 ----------
const FEEDS = [
  { value: 'breast:L', label: '모유 왼쪽' }, { value: 'breast:R', label: '모유 오른쪽' }, { value: 'breast:both', label: '모유 양쪽' },
  { value: 'formula', label: '분유' }, { value: 'pumped', label: '유축' },
];
const feedKey = d => (d.method === 'breast' ? `breast:${d.side || 'both'}` : d.method);
const feedLabel = d => FEEDS.find(f => f.value === feedKey(d))?.label || '수유';
function feedText(r) {
  const d = r.data, parts = [feedLabel(d)];
  if (d.ml != null) parts.push(`${d.ml}ml`);
  if (d.minutes != null) parts.push(`${d.minutes}분`);
  if (d.memo) parts.push(d.memo);
  return parts.join(' · ');
}
const DIAPERS = [{ value: 'pee', label: '소변' }, { value: 'poo', label: '대변' }, { value: 'both', label: '소변 + 대변' }];
const diaperKey = d => (d.pee && d.poo ? 'both' : d.poo ? 'poo' : 'pee');
const diaperText = r => [DIAPERS.find(x => x.value === diaperKey(r.data)).label, r.data.memo].filter(Boolean).join(' · ');
const sleepText = r => [r.data.endAt ? fmtMins(r.data.endAt - r.at) : '자는 중', r.data.memo].filter(Boolean).join(' · ');

defineType('feeding', { emoji: r => (r.data.method === 'breast' ? '🤱' : '🍼'), label: '수유', text: feedText, edit: editFeeding });
defineType('sleep', { emoji: '😴', label: '수면', text: sleepText, edit: editSleep });
defineType('diaper', { emoji: r => (r.data.poo ? '💩' : '💧'), label: '기저귀', text: diaperText, edit: editDiaper });

// ---------- 고치기 창 ----------
// 분 단위로 고침. 분이 그대로면 원래 시각(초까지) 유지
const atField = (key, label, d, required = true) => ({ key, label, type: 'datetime-local', value: d ? toLocalInput(d, false) : '', required });
const keepIfSameMinute = (input, orig) => {
  const t = fromLocalInput(input);
  return t && orig && toLocalInput(t, false) === toLocalInput(orig, false) ? orig : t;
};
const memoField = d => ({ key: 'memo', label: '메모', value: d.memo ?? '' });
const numOrNull = s => (s === '' ? null : +s);
const ask = (r, msg) => confirm(msg) && deleteRecord(r.id);

let recent = []; // 이 아이의 최근 기록 (분유 양 미리 채우기용)
async function editFeeding(r) {
  const d = r.data, key = feedKey(d);
  // 분유·유축 양이 비어 있으면 같은 방법의 지난번 양을 미리 채움
  const lastMl = d.ml ?? recent.find(x => x.id !== r.id && x.subjectId === r.subjectId && x.type === 'feeding' && feedKey(x.data) === key && x.data.ml != null)?.data.ml;
  const v = await openForm({
    title: '🍼 수유 고치기',
    fields: [
      atField('at', '시각', r.at),
      { key: 'kind', label: '방법', type: 'choice', options: FEEDS, value: key },
      { key: 'ml', label: '양 (ml)', type: 'number', min: '0', inputMode: 'numeric', value: d.method === 'breast' ? d.ml ?? '' : lastMl ?? '', half: true },
      { key: 'minutes', label: '시간 (분)', type: 'number', min: '0', inputMode: 'numeric', value: d.minutes ?? '', half: true },
      memoField(d),
    ],
    extra: DEL,
  });
  if (v === 'delete') return ask(r, '이 수유 기록을 지울까요?');
  if (!v) return;
  const [method, side] = v.kind.split(':'), data = { method };
  if (side) data.side = side;
  if (numOrNull(v.ml) != null) data.ml = +v.ml;
  if (numOrNull(v.minutes) != null) data.minutes = +v.minutes;
  if (v.memo) data.memo = v.memo;
  updateRecord(r.id, { at: keepIfSameMinute(v.at, r.at), data });
}
async function editSleep(r) {
  const v = await openForm({
    title: '😴 수면 고치기',
    fields: [atField('at', '잠든 시각', r.at), atField('end', '깬 시각 (자는 중이면 비워 두기)', r.data.endAt, false), memoField(r.data)],
    extra: DEL,
  });
  if (v === 'delete') return ask(r, '이 수면 기록을 지울까요?');
  if (!v) return;
  const at = keepIfSameMinute(v.at, r.at), end = keepIfSameMinute(v.end, r.data.endAt);
  if (end && end < at) return alert('깬 시각이 잠든 시각보다 빨라요.');
  updateRecord(r.id, { at, data: { endAt: end || null, ...(v.memo ? { memo: v.memo } : {}) } });
}
async function editDiaper(r) {
  const v = await openForm({
    title: '🧷 기저귀 고치기',
    fields: [atField('at', '시각', r.at), { key: 'kind', label: '종류', type: 'choice', options: DIAPERS, value: diaperKey(r.data) }, memoField(r.data)],
    extra: DEL,
  });
  if (v === 'delete') return ask(r, '이 기저귀 기록을 지울까요?');
  if (!v) return;
  updateRecord(r.id, { at: keepIfSameMinute(v.at, r.at), data: { pee: v.kind !== 'poo', poo: v.kind !== 'pee', ...(v.memo ? { memo: v.memo } : {}) } });
}

// ---------- 빠른 기록 (records.js) ----------
const quickAdd = (child, type, data, label) => addNow(C, child.id, type, data, label);
function wakeUp(sleep) {
  const end = new Date();
  updateRecord(sleep.id, { 'data.endAt': end });
  toast(`☀️ 깼어요 ${fmtTime(end)} · ${fmtMins(end - sleep.at)} 잤어요`, 5000, [
    { label: '고치기', onClick: () => editSleep({ ...sleep, data: { ...sleep.data, endAt: end } }) },
    { label: '되돌리기', onClick: () => { updateRecord(sleep.id, { 'data.endAt': null }); toast('되돌렸어요'); } },
  ]);
}

function quickBar(child, sleeping) {
  const bar = h('div', 'quickbar'), inner = h('div', 'qb-inner');
  const btn = (emoji, label, fn, cls = '', key = label) => {
    const b = button('', () => tapOnce(key, fn), `qb-btn ${cls}`);
    b.append(h('span', 'qb-e', emoji), h('span', 'qb-l', label));
    return b;
  };
  inner.append(
    btn('🤱', '왼쪽', () => quickAdd(child, 'feeding', { method: 'breast', side: 'L' }, '🤱 모유 왼쪽')),
    btn('🤱', '오른쪽', () => quickAdd(child, 'feeding', { method: 'breast', side: 'R' }, '🤱 모유 오른쪽')),
    btn('🍼', '분유', () => quickAdd(child, 'feeding', { method: 'formula' }, '🍼 분유')),
    btn('🍼', '유축', () => quickAdd(child, 'feeding', { method: 'pumped' }, '🍼 유축')),
    sleeping // 잠들었어요 ↔ 깼어요는 같은 버튼으로 취급 (잠들자마자 깬 걸로 되지 않게)
      ? btn('☀️', '깼어요', () => wakeUp(sleeping), 'qb-sleep on', 'sleep')
      : btn('😴', '잠들었어요', () => quickAdd(child, 'sleep', { endAt: null }, '😴 잠들었어요'), 'qb-sleep', 'sleep'),
    btn('💧', '소변', () => quickAdd(child, 'diaper', { pee: true, poo: false }, '💧 소변')),
    btn('💩', '대변', () => quickAdd(child, 'diaper', { pee: false, poo: true }, '💩 대변')),
    btn('💧💩', '둘 다', () => quickAdd(child, 'diaper', { pee: true, poo: true }, '💧💩 소변 + 대변')),
  );
  bar.append(inner);
  return bar;
}

// ---------- 그리기 ----------
function tile(emoji, label, value, sub) {
  const t = h('div', 'tile');
  t.append(h('span', 'tile-label', `${emoji} ${label}`), h('span', 'tile-value', value), h('span', 'tile-sub', sub));
  return t;
}

export function babyTab(s, el) {
  const child = s.child, today = startOfDay(new Date());
  // 최근 8일 (7일 패턴 + 전날 밤부터 이어진 잠)
  const w = watchRecords([child.id], { since: startOfDay(today, -7) });
  recent = w.list;
  const notice = loadNotice(w);
  if (notice) return el.append(notice); // 빠른 기록 버튼도 숨김 (자는 중인지 모르면 잠이 두 번 시작될 수 있어서)
  document.body.dataset.quickbar = ''; // 아래 버튼 줄만큼 화면 아래 여백 (app.js가 다른 화면에서 지움)

  const mine = w.list.filter(r => r.subjectType === C);
  const lastFeed = mine.find(r => r.type === 'feeding'), lastSleep = mine.find(r => r.type === 'sleep');
  const sleeping = lastSleep && !lastSleep.data.endAt ? lastSleep : null;

  // 지금 상태 (흐르는 시간)
  const now = h('div', 'hero now-card');
  const line = (...parts) => { const p = h('div', 'now-line'); p.append(...parts); return p; };
  if (lastFeed) now.append(line('🍼 마지막 수유 ', sinceEl(lastFeed.at, 'ago', 'now-strong'), ` · ${feedText(lastFeed)}`));
  if (sleeping) now.append(line('😴 잠든 지 ', sinceEl(sleeping.at, 'mins', 'now-strong')));
  else if (lastSleep) now.append(line('☀️ 깬 지 ', sinceEl(lastSleep.data.endAt, 'mins', 'now-strong')));
  if (!now.childElementCount) now.append(h('div', 'now-line', '아래 버튼을 누르면 지금 시각으로 바로 기록돼요.'));

  // 오늘 요약
  const day = babyDay(mine, today);
  const tiles = h('div', 'tiles');
  tiles.append(
    tile('🍼', '수유', `${day.feeds.length}회`, day.ml ? `분유·유축 ${day.ml}ml` : ' '),
    tile('😴', '수면', fmtMins(day.sleepMs), `${day.sleeps.length}번${day.sleeps.some(x => x.ongoing) ? ' · 자는 중' : ''}`),
    tile('🧷', '기저귀', `${day.diapers.length}회`, `소변 ${day.pee} · 대변 ${day.poo}`),
  );

  // 오늘 기록 (시작 시각이 오늘인 것)
  const list = h('section', 'block');
  list.append(h('div', 'block-head'));
  list.firstChild.append(h('h2', null, '📋 오늘 기록'));
  const todays = mine.filter(r => r.at >= today);
  if (todays.length) {
    const box = h('div', 'tl-day');
    box.append(...todays.map(r => recordRow(r)));
    list.append(box);
  } else list.append(h('p', 'hint', '오늘은 아직 기록이 없어요.'));

  const { dayCount, months } = childAge(child.birthDate, todayStr());
  const tips = tipsBlock(pickTips({ days: dayCount, months }), render);
  el.append(now, tiles, ...(tips ? [tips] : []), list, renderPattern(mine, today), quickBar(child, sleeping));
}
