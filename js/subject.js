// 아이 화면: 위에 이름·단계·핵심 한 줄, 아래에 탭 (지금 단계 탭 + 노트 + 타임라인). 처음엔 지금 단계 탭이 열림
import { state, go, stageOf, nameOf, emojiOf, today, teenStartAge } from './state.js';
import { eduMode } from './stage.js';
import { stageBadge, keyLine, editSubject } from './profiles.js';
import { h, button } from './ui.js';
import { pregnancyTab } from './tab-pregnancy.js';
import { babyTab } from './tab-baby.js';
import { eduTab } from './tab-edu.js';
import { timelineTab } from './timeline.js';
import { diaryTab } from './diary.js';

// 탭 목록: 여기에 항목을 더하면 아이 화면에 탭이 늘어나요. 단계 탭은 지금 단계 것만 (지난 단계 기록은 타임라인에)
// show(stage) = 이 단계에서 보일지, render(s, el) = el 안에 내용 그리기
export const TABS = [
  { id: 'pregnancy', label: '임신', emoji: '🤰', show: st => st === 'pregnancy' || st === 'ended', render: pregnancyTab },
  { id: 'baby', label: '육아', emoji: '🍼', show: st => st === 'baby', render: babyTab },
  { id: 'edu', label: '교육', emoji: '📚', show: st => st === 'edu', render: eduTab },
  { id: 'diary', label: '노트', emoji: '📝', show: () => true, render: diaryTab },
  { id: 'timeline', label: '타임라인', emoji: '🗓', show: () => true, render: timelineTab },
];

export function renderSubject(main, s) {
  const stage = stageOf(s);
  const tabs = TABS.filter(t => t.show(stage));
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
  wrap.append(head, bar, body);
  main.replaceChildren(wrap);
}
