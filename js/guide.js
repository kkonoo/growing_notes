// 📖 이 시기 아이: 만 개월에 맞는 발달과 육아 안내 (육아 0~3세)
// 원칙: 판정 안 함("이 무렵 많은 아이가 하는 것"만, "늦다"는 말 없음), 의견이 갈리는 주제는 방법을 나란히 두고 권하지 않음,
// 모두 출처. 시기는 영유아 건강검진 차수와 맞물리게 나눔. 바뀌면 이 파일만 고치면 돼요
import { h, button } from './ui.js';

export const GUIDE_CHECKED = '2026년 10월'; // 내용·링크를 마지막으로 확인한 때

// 주제: { id, emoji, title, body?, list?, options?: [{ name, how, fits?, known? }], note?, src: [{ label, url }] }
// options가 있으면 = 의견이 갈리는 주제 → 방법 카드를 나란히
export const PERIODS = [];

// 만 개월 → 시기 번호 (0~35개월 밖이면 -1)
export const periodIndex = months => PERIODS.findIndex(p => months >= p.months[0] && months <= p.months[1]);

// ---------- 그리기: 처음엔 접힌 한 줄 → 누르면 ‹ 시기 › + 주제 제목 → 제목을 누르면 내용 ----------
// 펼친 상태·넘겨 본 시기는 기억하지 않음 (앱을 열 때마다 접힌 채로, 지금 시기)
let blockOpen = false;
const shown = new Map(); // 아이 id → 넘겨 보고 있는 시기 번호 (없으면 지금 시기)
const opened = new Set(); // '시기 id/주제 id'

export function guideBlock(childId, months, rerender) {
  const now = periodIndex(months);
  if (now < 0) return null;
  const i = shown.get(childId) ?? now, p = PERIODS[i];
  const sec = h('section', `block tips guide${blockOpen ? ' open' : ''}`);
  const head = button(`📖 이 시기 아이 · ${PERIODS[now].label}`, () => { blockOpen = !blockOpen; rerender(); }, 'tips-head');
  head.setAttribute('aria-expanded', blockOpen);
  sec.append(head);
  if (!blockOpen) return sec;

  const move = to => { if (to === now) shown.delete(childId); else shown.set(childId, to); rerender(); };
  const nav = h('div', 'guide-nav');
  const prev = button('‹', () => move(i - 1), 'icon-btn'), next = button('›', () => move(i + 1), 'icon-btn');
  prev.setAttribute('aria-label', '이전 시기');
  next.setAttribute('aria-label', '다음 시기');
  prev.disabled = i === 0;
  next.disabled = i === PERIODS.length - 1;
  const label = i === now ? h('span', 'guide-period', `${p.label} (지금)`) : button(`${p.label} · 지금으로`, () => move(now), 'guide-period link-btn');
  nav.append(prev, label, next);
  sec.append(nav);

  for (const t of p.topics) {
    const key = `${p.id}/${t.id}`, open = opened.has(key);
    const row = button(`${t.emoji} ${t.title}`, () => { if (open) opened.delete(key); else opened.add(key); rerender(); }, `tip-title${open ? ' open' : ''}`);
    row.setAttribute('aria-expanded', open);
    sec.append(row);
    if (open) sec.append(topicBody(t));
  }
  sec.append(h('p', 'hint', `${GUIDE_CHECKED} 확인. 의학적 조언이 아니에요. 아이가 걱정되면 소아청소년과나 영유아 건강검진에서 상담해요.`));
  return sec;
}

function topicBody(t) {
  const body = h('div', 'tip-body');
  if (t.body) body.append(h('p', null, t.body));
  if (t.list) {
    const ul = h('ul', 'guide-list');
    ul.append(...t.list.map(x => h('li', null, x)));
    body.append(ul);
  }
  if (t.options) {
    body.append(h('p', 'hint', '의견이 여러 가지인 주제라 방법을 나란히 보여 드려요. 어느 쪽이 정답이라고 하지 않아요.'));
    const opts = h('div', 'guide-opts');
    for (const o of t.options) {
      const c = h('div', 'guide-opt');
      c.append(h('strong', null, o.name), h('p', null, o.how));
      if (o.fits) c.append(labeled('잘 맞는 경우', o.fits));
      if (o.known) c.append(labeled('알려진 것', o.known));
      opts.append(c);
    }
    body.append(opts);
  }
  if (t.note) body.append(h('p', 'note', t.note));
  const links = h('div', 'tip-links');
  for (const l of t.src) links.append(Object.assign(h('a', 'btn small', `${l.label} ↗`), { href: l.url, target: '_blank', rel: 'noopener' }));
  body.append(links);
  return body;
}
function labeled(label, text) {
  const p = h('p');
  p.append(h('span', 'guide-label', label), text);
  return p;
}
