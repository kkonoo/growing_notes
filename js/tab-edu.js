// 교육 탭: 아직 준비 중
import { h } from './ui.js';

export function eduTab(s, el) {
  el.append(h('div', 'empty', '📚'), h('p', 'empty-text', '교육 기록은 준비 중이에요.'));
}
