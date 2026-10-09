// 최근 7일 패턴: 하루 한 줄 × 24시간 띠 (위: 수유 점, 가운데: 수면 막대, 아래: 기저귀 점) + 날짜별 표
// 색은 dataviz 기준 팔레트 1~3칸 (style.css의 --c-sleep/--c-feed/--c-diaper, 라이트·다크 따로 검증)
// 값은 표에도 있음 (점·막대를 눌러 보는 설명은 보조)
import { babyDay, startOfDay, DAY, fmtMins } from './stats.js';
import { h, fmtTime } from './ui.js';

const WD = ['일', '월', '화', '수', '목', '금', '토'];
const dayLabel = (d, i) => (i === 0 ? '오늘' : `${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]})`);
const pct = (t, start) => `${((t - start) / DAY) * 100}%`;
const FEED = { breast: '모유', formula: '분유', pumped: '유축' };

function mark(cls, tip, style) {
  const m = h('span', `mk ${cls}`);
  m.dataset.tip = tip;
  Object.assign(m.style, style);
  return m;
}

export function renderPattern(records, today) {
  const days = Array.from({ length: 7 }, (_, i) => startOfDay(today, -i)).map(start => ({ start, ...babyDay(records, start) }));

  const sec = h('section', 'block pattern');
  const head = h('div', 'block-head');
  head.append(h('h2', null, '📊 최근 7일 패턴'));
  const legend = h('div', 'legend');
  for (const [cls, label] of [['feed', '수유'], ['sleep', '수면'], ['diaper', '기저귀']]) {
    const k = h('span', 'legend-item');
    k.append(h('span', `key ${cls}`), label);
    legend.append(k);
  }
  sec.append(head, legend);

  const chart = h('div', 'pt-chart');
  const axis = h('div', 'pt-row pt-axis');
  const ticks = h('div', 'pt-ticks');
  for (const hr of [0, 6, 12, 18, 24]) {
    const t = h('span', null, `${hr}시`);
    t.style.left = `${(hr / 24) * 100}%`;
    ticks.append(t);
  }
  axis.append(h('span', 'pt-day'), ticks);
  chart.append(axis);

  for (const [i, d] of days.entries()) {
    const row = h('div', 'pt-row'), track = h('div', 'pt-track'), s = +d.start;
    for (const x of d.sleeps) {
      const end = x.ongoing ? '자는 중' : fmtTime(new Date(x.to));
      track.append(mark('sleep', `😴 수면 ${fmtTime(new Date(x.from))}–${end} (${fmtMins(x.to - x.from)})`, { left: pct(x.from, s), width: `${((x.to - x.from) / DAY) * 100}%` }));
    }
    for (const r of d.feeds) {
      const what = [FEED[r.data.method] || '수유', r.data.ml != null ? `${r.data.ml}ml` : ''].filter(Boolean).join(' ');
      track.append(mark('feed', `🍼 ${what} ${fmtTime(r.at)}`, { left: pct(+r.at, s) }));
    }
    for (const r of d.diapers) {
      const what = r.data.pee && r.data.poo ? '소변 + 대변' : r.data.poo ? '대변' : '소변';
      track.append(mark('diaper', `🧷 ${what} ${fmtTime(r.at)}`, { left: pct(+r.at, s) }));
    }
    row.append(h('span', 'pt-day', dayLabel(d.start, i)), track);
    chart.append(row);
  }

  // 점·막대를 누르거나 가리키면 설명 (값은 아래 표에도 있음)
  const tip = h('div', 'pt-tip');
  tip.hidden = true;
  const show = e => {
    const m = e.target.closest?.('.mk');
    if (!m) return;
    tip.textContent = m.dataset.tip;
    tip.hidden = false;
    const r = m.getBoundingClientRect(), c = chart.getBoundingClientRect();
    tip.style.left = `${Math.min(Math.max(r.left + r.width / 2 - c.left, 70), c.width - 70)}px`;
    tip.style.top = `${r.top - c.top}px`;
  };
  chart.addEventListener('pointerover', show);
  chart.addEventListener('click', show);
  chart.addEventListener('pointerleave', () => { tip.hidden = true; });
  chart.append(tip);
  sec.append(chart);

  // 같은 값의 표 (색 없이도 읽히게)
  const table = h('table', 'pt-table');
  const thead = h('tr');
  for (const t of ['날짜', '수유', '수면', '기저귀']) thead.append(h('th', null, t));
  table.append(thead);
  for (const [i, d] of days.entries()) {
    const tr = h('tr');
    for (const v of [dayLabel(d.start, i), `${d.feeds.length}회${d.ml ? ` (${d.ml}ml)` : ''}`, fmtMins(d.sleepMs), `${d.diapers.length}회 (${d.poo})`]) tr.append(h('td', null, v));
    table.append(tr);
  }
  sec.append(table, h('p', 'hint', '수유 괄호는 분유·유축 양, 기저귀 괄호는 대변 횟수예요. 수면은 그날 0시~24시에 걸친 만큼이에요.'));
  return sec;
}
