// 🗂 지난 단계 보관함: 타임라인 맨 위 버튼으로 들어오는 단계별 정리 화면. 새로 기록하는 버튼은 없고, 줄을 누르면 고치기는 돼요 (오타 등)
//   🤰 임신: 예정일·출생일, 물어볼 것 전체, 검진 기록 전체
//   🍼 육아: 해별 → 달별 수유·수면·기저귀 횟수 — 서버에서 개수만 셈 (몇 년 치 기록을 다 읽지 않게). 달을 누르면 그 달 기록만 읽어서 날짜별 표
//   📚 교육 (영유아): 다닌 기관 + 해별 독서·활동·상담 횟수 → 해를 누르면 그해 기록만 읽어서 활동·읽은 책(책별 횟수)·상담 메모
import { state, go, render, today, eduStartAge, teenStartAge } from './state.js';
import { STAGES, pastStages, monthSpans, childAge, dateStr } from './stage.js';
import { watchRecords, loadNotice, countRecords } from './records.js';
import { questionBlock, checkupBlock } from './tab-pregnancy.js';
import { schoolRow } from './tab-edu.js';
import { dayGroups } from './timeline.js';
import { babyDay, startOfDay, fmtMins } from './stats.js';
import { h, button, fmtDate, fmtDay } from './ui.js';

const WD = ['일', '월', '화', '수', '목', '금', '토'];
const localDate = s => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const lastDay = to => dateStr(startOfDay(localDate(to), -1)); // 기간의 끝 날 (to 전날)
const periodLine = p => h('p', 'block-line', `${fmtDate(p.from)} ~ ${fmtDate(lastDay(p.to))}`);
function section(title) {
  const sec = h('section', 'block'), head = h('div', 'block-head');
  head.append(h('h2', null, title));
  sec.append(head);
  return sec;
}

export function archiveView(s, el, stage) {
  const p = s.child && pastStages(s.child.birthDate, today(), eduStartAge(), teenStartAge(), !!s.preg).find(x => x.stage === stage);
  const top = h('div', 'panel-head');
  top.append(button('‹ 타임라인', () => go({ ...state.view, panel: undefined, archive: undefined }), 'btn small'),
    h('h2', null, `🗂 ${STAGES[stage] ? `${STAGES[stage].emoji} ${STAGES[stage].label}` : '지난 단계'}`));
  el.append(top);
  if (!p) return el.append(h('p', 'hint center', '지금은 지난 단계가 아니에요 (설정에서 단계 나이를 바꿨다면). 타임라인으로 돌아가 주세요.'));
  if (stage === 'pregnancy') pregnancyArchive(s, el);
  if (stage === 'baby') babyArchive(s.child, el, p);
  if (stage === 'edu') eduArchive(s.child, el, p);
}

// ---------- 🤰 임신 ----------
function pregnancyArchive(s, el) {
  const preg = s.preg, w = watchRecords([preg.id]);
  el.append(h('p', 'block-line', `예정일 ${fmtDate(preg.dueDate)} · ${fmtDate(s.child.birthDate)} 출생`));
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  const of = t => w.list.filter(r => r.type === t);
  el.append(questionBlock(preg, of('question')), checkupBlock(preg, of('checkup')));
  const c = of('contraction');
  if (c.length) el.append(h('p', 'hint center', `⏱ 진통 기록 ${c.length}개는 타임라인 ${fmtDay(dateStr(c.at(-1).at))}에 있어요.`));
}

// ---------- 해 → 달 개수 표: 서버에서 개수만 셈 (몇 년 치 기록을 다 읽지 않게) ----------
const counts = new Map(); // `${아이 id}:${종류들}:${from}:${to}` → { 종류: 개수 } | 'loading' | 'error'
const opened = new Map(); // `${아이 id}:${단계}:year|month` → 펼친 해 'YYYY' · 달 'YYYY-MM'
const countKey = (id, types, x) => `${id}:${types}:${x.from}:${x.to}`;
const toggle = (k, v) => () => { opened.set(k, opened.get(k) === v ? null : v); render(); };

// spans = [{ from, to }] 기간마다 종류별 개수
async function fetchCounts(id, types, spans) {
  for (const x of spans) counts.set(countKey(id, types, x), 'loading');
  for (let i = 0; i < spans.length; i += 6) { // 한 번에 6개씩
    await Promise.all(spans.slice(i, i + 6).map(async x => {
      try {
        const ns = await Promise.all(types.map(t => countRecords(id, t, localDate(x.from), localDate(x.to))));
        counts.set(countKey(id, types, x), Object.fromEntries(types.map((t, k) => [t, ns[k]])));
      } catch (e) {
        console.warn('기록 수를 못 셌어요', e);
        counts.set(countKey(id, types, x), 'error');
      }
    }));
    render();
  }
}

// 기간 → 해별 [{ year, from, to, months: [{ ym, from, to, age }] }]. age = 그달에 맞는 개월 (태어난 달 0개월)
function yearsOf(birthDate, from, to) {
  const by = +birthDate.slice(0, 4), bm = +birthDate.slice(5, 7), years = [];
  for (const m of monthSpans(from, to)) {
    const x = { ...m, age: (+m.ym.slice(0, 4) - by) * 12 + (+m.ym.slice(5) - bm) }, y = years.at(-1);
    if (y?.year === m.ym.slice(0, 4)) { y.months.push(x); y.to = x.to; } else years.push({ year: m.ym.slice(0, 4), from: x.from, to: x.to, months: [x] });
  }
  return years;
}

// cols = [{ type, label, unit }], rows = [{ x: { from, to }, label, sub, cls, open, toggle, detail?() }] — 보이는 줄만 셈
function countSection(child, cols, rows, hint) {
  const types = cols.map(c => c.type), get = x => counts.get(countKey(child.id, types, x));
  const missing = rows.filter(r => get(r.x) === undefined).map(r => r.x);
  if (missing.length) fetchCounts(child.id, types, missing);
  const sec = section('📊 기록 수'), table = h('div', 'ar-table'), head = h('div', 'ar-row ar-head');
  head.append(h('span', null, '기간'), ...cols.map(c => h('span', null, c.label)));
  table.append(head);
  for (const r of rows) {
    const c = get(r.x), b = button('', r.toggle, `ar-row ${r.cls}${r.open ? ' on' : ''}`);
    b.setAttribute('aria-expanded', r.open);
    const name = h('span', 'ar-month', `${r.open ? '▾' : '▸'} ${r.label}`);
    name.append(h('span', 'hint', ` ${r.sub}`));
    b.append(name, ...cols.map(col => h('span', null, typeof c === 'object' ? `${c[col.type]}${col.unit}` : c === 'error' ? '–' : '…')));
    table.append(b);
    if (r.open && r.detail) table.append(r.detail());
  }
  sec.append(table);
  if (rows.some(r => get(r.x) === 'error')) {
    sec.append(h('p', 'hint', '인터넷에 연결되면 기록 수를 셀 수 있어요.'), button('다시 세기', () => {
      for (const r of rows) if (get(r.x) === 'error') counts.delete(countKey(child.id, types, r.x));
      render();
    }, 'btn small'));
  } else sec.append(h('p', 'hint', hint));
  return sec;
}

// ---------- 🍼 육아: 해별 (해마다 3번만 셈) → 해를 누르면 그해 달별 → 달을 누르면 날짜별 표 ----------
const BABY = [{ type: 'feeding', label: '수유', unit: '회' }, { type: 'sleep', label: '수면', unit: '번' }, { type: 'diaper', label: '기저귀', unit: '회' }];
function babyArchive(child, el, p) {
  el.append(periodLine(p));
  const yk = `${child.id}:baby:year`, mk = `${child.id}:baby:month`, rows = [];
  for (const y of yearsOf(child.birthDate, p.from, p.to)) {
    const open = opened.get(yk) === y.year;
    rows.push({ x: y, label: `${y.year}년`, sub: `${y.months[0].age}~${y.months.at(-1).age}개월`, cls: 'ar-year', open, toggle: toggle(yk, y.year) });
    if (open) {
      for (const m of y.months) {
        rows.push({ x: m, label: `${+m.ym.slice(5)}월`, sub: `${m.age}개월`, cls: 'ar-mon', open: opened.get(mk) === m.ym, toggle: toggle(mk, m.ym), detail: () => monthDetail(child, m) });
      }
    }
  }
  el.append(countSection(child, BABY, rows, '해를 누르면 달별로, 달을 누르면 그날그날 수유·수면 시간·기저귀를 볼 수 있어요.'));
}

// 그 달 기록만 읽어서 날짜별 표 (최근 7일 패턴의 표와 같은 계산)
function monthDetail(child, m) {
  const box = h('div', 'ar-detail');
  const w = watchRecords([child.id], { since: localDate(m.from), until: localDate(m.to), types: BABY.map(c => c.type) });
  const notice = loadNotice(w);
  if (notice) { box.append(notice); return box; }
  const days = [];
  for (let d = localDate(m.from); d < localDate(m.to); d = startOfDay(d, 1)) days.push({ start: d, ...babyDay(w.list, d) });
  const avg = f => days.reduce((sum, d) => sum + f(d), 0) / days.length;
  box.append(h('p', 'block-line', `하루 평균 수유 ${avg(d => d.feeds.length).toFixed(1)}회 · 수면 ${fmtMins(avg(d => d.sleepMs))} · 기저귀 ${avg(d => d.diapers.length).toFixed(1)}회`));
  const table = h('table', 'pt-table'), tr0 = h('tr');
  for (const t of ['날짜', '수유', '수면', '기저귀']) tr0.append(h('th', null, t));
  table.append(tr0);
  for (const d of days) {
    const tr = h('tr');
    for (const v of [`${d.start.getMonth() + 1}/${d.start.getDate()} (${WD[d.start.getDay()]})`, `${d.feeds.length}회${d.ml ? ` (${d.ml}ml)` : ''}`, fmtMins(d.sleepMs), `${d.diapers.length}회 (${d.poo})`]) tr.append(h('td', null, v));
    table.append(tr);
  }
  box.append(table, h('p', 'hint', '수유 괄호는 분유·유축 양, 기저귀 괄호는 대변 횟수예요.'));
  return box;
}

// ---------- 📚 교육 (영유아): 다닌 기관 + 해별 (해마다 3번만 셈) → 해를 누르면 그해 활동·읽은 책·상담 메모 ----------
const EDU = [{ type: 'book', label: '독서', unit: '번' }, { type: 'activity', label: '활동', unit: '회' }, { type: 'consult', label: '상담', unit: '개' }];
function eduArchive(child, el, p) {
  el.append(periodLine(p));
  const schools = (child.schools || []).filter(x => !x.from || x.from < p.to.slice(0, 7)).sort((a, b) => (a.from || '').localeCompare(b.from || ''));
  const sb = section('🏫 다닌 기관');
  if (!schools.length) sb.append(h('p', 'hint', '적어 둔 기관이 없어요.'));
  sb.append(...schools.map(x => schoolRow(child, x)));
  el.append(sb);

  const yk = `${child.id}:edu:year`;
  const rows = yearsOf(child.birthDate, p.from, p.to).map(y => {
    const a = childAge(child.birthDate, y.from).years, b = childAge(child.birthDate, lastDay(y.to)).years;
    return { x: y, label: `${y.year}년`, sub: a === b ? `만 ${a}세` : `만 ${a}~${b}세`, cls: 'ar-year', open: opened.get(yk) === y.year, toggle: toggle(yk, y.year), detail: () => eduYear(child, y) };
  });
  el.append(countSection(child, EDU, rows, '해를 누르면 그해 활동·읽은 책·상담 메모를 볼 수 있어요.'));
}

// 그해 기록만 읽어서: 활동(다녀온 횟수) · 읽은 책(책별 횟수, 많이 읽은 책부터) · 상담 메모
function eduYear(child, y) {
  const box = h('div', 'ar-detail');
  const w = watchRecords([child.id], { since: localDate(y.from), until: localDate(y.to), types: EDU.map(c => c.type) });
  const notice = loadNotice(w);
  if (notice) { box.append(notice); return box; }
  if (!w.list.length) { box.append(h('p', 'hint', '이해에는 기록이 없어요.')); return box; }
  const of = t => w.list.filter(r => r.type === t); // 최근 것부터
  const line = (left, right) => { const row = h('div', 'ar-line'); row.append(h('span', null, left), h('span', 'hint', right)); return row; };

  const acts = new Map(); // 기록에 남은 이름으로 (목록에서 지운 활동도)
  for (const r of of('activity')) {
    const a = acts.get(r.data.activityId) || { name: r.data.name, emoji: r.data.emoji || '🎹', n: 0 };
    a.n++;
    acts.set(r.data.activityId, a);
  }
  if (acts.size) box.append(h('h3', 'ar-sub', '🎹 활동'), ...[...acts.values()].map(a => line(`${a.emoji} ${a.name}`, `${a.n}회`)));

  const books = of('book'), byTitle = new Map();
  for (const r of books) {
    const b = byTitle.get(r.data.title) || { title: r.data.title, n: 0, liked: false };
    b.n++; b.liked ||= !!r.data.liked;
    byTitle.set(r.data.title, b);
  }
  if (books.length) {
    box.append(h('h3', 'ar-sub', `📚 읽은 책 · ${books.length}번 (${byTitle.size}권)`),
      ...[...byTitle.values()].sort((a, b) => b.n - a.n || a.title.localeCompare(b.title)).map(b => line(`📖 ${b.title}`, `${b.n}번${b.liked ? ' · ❤️' : ''}`)));
  }

  const consults = of('consult');
  if (consults.length) {
    box.append(h('h3', 'ar-sub', '💬 상담 메모'));
    dayGroups(box, consults);
  }
  return box;
}
