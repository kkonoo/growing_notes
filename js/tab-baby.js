// 육아 탭: 수유·수면·기저귀 빠른 기록, 오늘 요약, 최근 7일 패턴 (3단계에서 만들어요)
import { today } from './state.js';
import { childAge } from './stage.js';
import { h, fmtDate } from './ui.js';

export function babyTab(s, el) {
  const { dayCount, months } = childAge(s.child.birthDate, today());
  const hero = h('div', 'hero');
  hero.append(h('div', 'hero-big', `생후 ${dayCount}일`), h('div', 'hero-sub', `${months}개월 · ${fmtDate(s.child.birthDate)} 출생`));
  el.append(hero, h('p', 'hint center', '🍼 수유 · 😴 수면 · 🧷 기저귀 기록은 다음 단계에서 만들어요.'));
}
