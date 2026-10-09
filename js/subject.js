// 아이 화면: 위에 이름·단계·핵심 한 줄, 아래에 단계 탭. 처음엔 지금 단계 탭이 열림
import { state, go, stageOf, nameOf, emojiOf } from './state.js';
import { stageBadge, keyLine, editSubject } from './profiles.js';
import { h, button } from './ui.js';
import { pregnancyTab } from './tab-pregnancy.js';
import { babyTab } from './tab-baby.js';
import { eduTab } from './tab-edu.js';
import { timelineTab } from './timeline.js';

// 탭 목록: 여기에 항목을 더하면 아이 화면에 탭이 늘어나요.
// show(s) = 이 아이(또는 임신)에게 보일지, render(s, el) = el 안에 내용 그리기
export const TABS = [
  { id: 'pregnancy', label: '임신', emoji: '🤰', show: s => !!s.preg, render: pregnancyTab },
  { id: 'baby', label: '육아', emoji: '🍼', show: s => !!s.child, render: babyTab },
  { id: 'edu', label: '교육', emoji: '📚', show: s => !!s.child, render: eduTab },
  { id: 'timeline', label: '타임라인', emoji: '🗓', show: () => true, render: timelineTab },
];

export function renderSubject(main, s) {
  const stage = stageOf(s);
  const tabs = TABS.filter(t => t.show(s));
  const want = state.view.tab || (stage === 'ended' ? 'pregnancy' : stage);
  const tab = tabs.find(t => t.id === want) || tabs[0];

  const head = h('div', 'subject-head');
  const info = h('div', 'subject-info');
  const line = h('div', 'subject-line');
  line.append(stageBadge(stage), h('span', null, keyLine(s)));
  info.append(h('h1', null, nameOf(s)), line);
  const edit = button('✏️', () => editSubject(s), 'icon-btn');
  edit.setAttribute('aria-label', '정보 고치기');
  head.append(h('span', 'big-emoji', emojiOf(s)), info, edit);

  const bar = h('div', 'tabs');
  bar.setAttribute('role', 'tablist');
  for (const t of tabs) {
    const b = button(`${t.emoji} ${t.label}`, () => go({ name: 'subject', key: s.key, tab: t.id }), 'tab');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', t === tab);
    if (t.id === stage) b.classList.add('now'); // 지금 단계 표시
    bar.append(b);
  }
  const body = h('div', 'tab-body');
  tab.render(s, body);

  const wrap = h('section', 'subject');
  wrap.dataset.stage = stage;
  wrap.append(head, ...(tabs.length > 1 ? [bar] : []), body);
  main.replaceChildren(wrap);
}
