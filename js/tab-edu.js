// 교육 탭: 기록은 아직 준비 중. 나이에 맞는 안내(건강검진·예방접종)만
import { render, today } from './state.js';
import { childAge } from './stage.js';
import { pickTips, tipsBlock } from './tips.js';
import { h } from './ui.js';

export function eduTab(s, el) {
  const { dayCount, months } = childAge(s.child.birthDate, today());
  const tips = tipsBlock(pickTips({ days: dayCount, months }), render);
  if (tips) el.append(tips);
  el.append(h('div', 'empty', '📚'), h('p', 'empty-text', '교육 기록은 준비 중이에요.'));
}
