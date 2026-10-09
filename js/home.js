// 홈: 아이(또는 진행 중인 임신)별 카드를 나란히. 누르면 그 아이 화면의 지금 단계 탭으로
import { go, subjects, stageOf, nameOf, emojiOf } from './state.js';
import { stageBadge, keyLine, addChild, addPregnancy } from './profiles.js';
import { h, button } from './ui.js';

export function renderHome(main) {
  const list = subjects();
  const wrap = h('section', 'home');
  if (list.length) {
    const cards = h('div', 'cards');
    for (const s of list) {
      const c = button('', () => go({ name: 'subject', key: s.key }), 'card');
      c.dataset.stage = stageOf(s);
      c.append(h('span', 'card-emoji', emojiOf(s)), h('span', 'card-name', nameOf(s)), stageBadge(stageOf(s)), h('span', 'card-line', keyLine(s)));
      cards.append(c);
    }
    wrap.append(cards);
  } else {
    wrap.append(h('div', 'empty', '🌱'), h('p', 'empty-text', '아직 등록된 아이가 없어요.\n아이나 임신을 등록해 보세요.'));
  }
  const add = h('div', 'home-add');
  add.append(button('👶 아이 등록', addChild, 'btn big'), button('🤰 임신 등록', addPregnancy, 'btn big'));
  wrap.append(add);
  main.replaceChildren(wrap);
}
