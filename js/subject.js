// 아이 화면: 위에 이름·단계·핵심 한 줄, 아래에 탭 두 줄 (윗줄 = 단계, 아랫줄 = 모아 보기). 처음엔 지금 단계 탭이 열림
import { state, go, stageOf, nameOf, emojiOf, today, teenStartAge } from './state.js';
import { eduMode } from './stage.js';
import { stageBadge, keyLine, editSubject } from './profiles.js';
import { h, button } from './ui.js';
import { pregnancyTab } from './tab-pregnancy.js';
import { babyTab } from './tab-baby.js';
import { eduTab } from './tab-edu.js';
import { timelineTab } from './timeline.js';
import { diaryTab } from './diary.js';

// 탭 목록: 여기에 항목을 더하면 아이 화면에 탭이 늘어나요. row 1 = 단계(윗줄), 2 = 모아 보기(아랫줄)
// show(s) = 이 아이(또는 임신)에게 보일지, render(s, el) = el 안에 내용 그리기
export const TABS = [
  { id: 'pregnancy', row: 1, label: '임신', emoji: '🤰', show: s => !!s.preg, render: pregnancyTab },
  { id: 'baby', row: 1, label: '육아', emoji: '🍼', show: s => !!s.child, render: babyTab },
  { id: 'edu', row: 1, label: '교육', emoji: '📚', show: s => !!s.child, render: eduTab },
  { id: 'diary', row: 2, label: '일기', emoji: '📝', show: () => true, render: diaryTab },
  { id: 'timeline', row: 2, label: '타임라인', emoji: '🗓', show: () => true, render: timelineTab },
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
  const name = h('h1', null, nameOf(s));
  if (stage === 'edu') name.append(h('span', 'mode-tag', eduMode(s.child.birthDate, today(), teenStartAge()) === 'teen' ? '사춘기' : '영유아')); // 교육 탭 모드
  info.append(name, line);
  const edit = button('✏️', () => editSubject(s), 'icon-btn');
  edit.setAttribute('aria-label', '정보 고치기');
  head.append(h('span', 'big-emoji', emojiOf(s)), info, edit);

  const bars = h('div', 'tab-bars');
  bars.setAttribute('role', 'tablist');
  for (const row of [1, 2]) {
    const bar = h('div', `tabs${row === 2 ? ' sub' : ''}`);
    for (const t of tabs.filter(x => x.row === row)) {
      const b = button(`${t.emoji} ${t.label}`, () => go({ name: 'subject', key: s.key, tab: t.id }), 'tab');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', t === tab);
      if (t.id === stage) b.classList.add('now'); // 지금 단계 표시
      bar.append(b);
    }
    bars.append(bar);
  }
  const body = h('div', 'tab-body');
  tab.render(s, body);

  const wrap = h('section', 'subject');
  wrap.dataset.stage = stage;
  wrap.append(head, bars, body);
  main.replaceChildren(wrap);
}
