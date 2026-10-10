// 🗂 지난 단계 보관함: 타임라인 맨 위 버튼으로 들어오는 단계별 정리 화면. 새로 기록하는 버튼은 없고, 줄을 누르면 고치기는 돼요 (오타 등)
//   🤰 임신: 예정일·출생일, 물어볼 것 전체, 검진 기록 전체
//   🍼 육아: 달별 수유·수면·기저귀 횟수 — 서버에서 개수만 셈 (몇 년 치 기록을 다 읽지 않게). 달을 누르면 그 달 기록만 읽어서 날짜별 표
//   📚 교육 (영유아): 다닌 기관 · 활동(다녀온 횟수) · 읽은 책(책별 횟수) · 상담 메모
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

// ---------- 🍼 육아 ----------
const BABY = ['feeding', 'sleep', 'diaper'];
const counts = new Map(); // `${아이 id}:${from}:${to}` → { feeding, sleep, diaper } | 'loading' | 'error'
const opened = new Map(); // 아이 id → 펼친 달 'YYYY-MM'
const countKey = (id, m) => `${id}:${m.from}:${m.to}`;

async function fetchCounts(id, months) {
  for (const m of months) counts.set(countKey(id, m), 'loading');
  for (let i = 0; i < months.length; i += 6) { // 한 번에 6달씩
    await Promise.all(months.slice(i, i + 6).map(async m => {
      try {
        const [feeding, sleep, diaper] = await Promise.all(BABY.map(t => countRecords(id, t, localDate(m.from), localDate(m.to))));
        counts.set(countKey(id, m), { feeding, sleep, diaper });
      } catch (e) {
        console.warn('기록 수를 못 셌어요', e);
        counts.set(countKey(id, m), 'error');
      }
    }));
    render();
  }
}

function babyArchive(child, el, p) {
  el.append(periodLine(p));
  const months = monthSpans(p.from, p.to);
  const missing = months.filter(m => !counts.has(countKey(child.id, m)));
  if (missing.length) fetchCounts(child.id, missing);

  const sec = section('📊 달별 기록 수'), table = h('div', 'ar-table');
  const head = h('div', 'ar-row ar-head');
  head.append(...['달', '수유', '수면', '기저귀'].map(t => h('span', null, t)));
  table.append(head);
  for (const m of months) {
    const c = counts.get(countKey(child.id, m)), on = opened.get(child.id) === m.ym;
    const val = (k, unit) => (typeof c === 'object' ? `${c[k]}${unit}` : c === 'error' ? '–' : '…');
    const row = button('', () => { opened.set(child.id, on ? null : m.ym); render(); }, `ar-row${on ? ' on' : ''}`);
    row.setAttribute('aria-expanded', on);
    const month = h('span', 'ar-month', `${m.ym.slice(0, 4)}.${m.ym.slice(5)}`);
    month.append(h('span', 'hint', ` ${childAge(child.birthDate, m.from).months}개월`));
    row.append(month, h('span', null, val('feeding', '회')), h('span', null, val('sleep', '번')), h('span', null, val('diaper', '회')));
    table.append(row);
    if (on) table.append(monthDetail(child, m));
  }
  sec.append(table);
  if (months.some(m => counts.get(countKey(child.id, m)) === 'error')) {
    sec.append(h('p', 'hint', '인터넷에 연결되면 기록 수를 셀 수 있어요.'), button('다시 세기', () => {
      for (const m of months) if (counts.get(countKey(child.id, m)) === 'error') counts.delete(countKey(child.id, m));
      render();
    }, 'btn small'));
  } else sec.append(h('p', 'hint', '달을 누르면 그날그날 수유·수면 시간·기저귀를 볼 수 있어요.'));
  el.append(sec);
}

// 그 달 기록만 읽어서 날짜별 표 (최근 7일 패턴의 표와 같은 계산)
function monthDetail(child, m) {
  const box = h('div', 'ar-detail');
  const w = watchRecords([child.id], { since: localDate(m.from), until: localDate(m.to), types: BABY });
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

// ---------- 📚 교육 (영유아) ----------
function eduArchive(child, el, p) {
  el.append(periodLine(p));
  const schools = (child.schools || []).filter(x => !x.from || x.from < p.to.slice(0, 7)).sort((a, b) => (a.from || '').localeCompare(b.from || ''));
  const sb = section('🏫 다닌 기관');
  if (!schools.length) sb.append(h('p', 'hint', '적어 둔 기관이 없어요.'));
  sb.append(...schools.map(x => schoolRow(child, x)));
  el.append(sb);

  const w = watchRecords([child.id], { since: localDate(p.from), until: localDate(p.to), types: ['book', 'activity', 'consult'] });
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  const of = t => w.list.filter(r => r.type === t); // 최근 것부터

  // 활동: 기록에 남은 이름으로 (목록에서 지운 활동도)
  const acts = new Map();
  for (const r of of('activity')) {
    const a = acts.get(r.data.activityId) || { name: r.data.name, emoji: r.data.emoji || '🎹', n: 0, last: r.at, first: r.at };
    a.n++; a.first = r.at;
    acts.set(r.data.activityId, a);
  }
  const ab = section('🎹 활동');
  if (!acts.size) ab.append(h('p', 'hint', '다녀온 활동 기록이 없어요.'));
  for (const a of acts.values()) {
    const row = h('div', 'ar-line');
    const ymOf = d => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
    row.append(h('span', null, `${a.emoji} ${a.name}`), h('span', 'hint', `${a.n}회 · ${ymOf(a.first)}~${ymOf(a.last)}`));
    ab.append(row);
  }
  el.append(ab);

  // 읽은 책: 책별 횟수, 많이 읽은 책부터
  const books = of('book'), byTitle = new Map();
  for (const r of books) {
    const b = byTitle.get(r.data.title) || { title: r.data.title, n: 0, liked: false };
    b.n++; b.liked ||= !!r.data.liked;
    byTitle.set(r.data.title, b);
  }
  const bb = section('📚 읽은 책');
  bb.append(h('p', 'block-line', books.length ? `모두 ${books.length}번 (${byTitle.size}권)` : '독서 기록이 없어요.'));
  for (const b of [...byTitle.values()].sort((x, y) => y.n - x.n || x.title.localeCompare(y.title))) {
    const row = h('div', 'ar-line');
    row.append(h('span', null, `📖 ${b.title}`), h('span', 'hint', `${b.n}번${b.liked ? ' · ❤️' : ''}`));
    bb.append(row);
  }
  el.append(bb);

  const consults = of('consult');
  el.append(section('💬 상담 메모'));
  if (consults.length) dayGroups(el, consults);
  else el.append(h('p', 'hint center', '상담 메모가 없어요.'));
}
