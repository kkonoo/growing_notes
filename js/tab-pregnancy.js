// 임신 탭: 주수, 출산 처리·종료. 검진 기록·질문 목록·진통 타이머는 2단계에서
import { today } from './state.js';
import { pregnancyAge, ddayText } from './stage.js';
import { birth, endPregnancy, reopenPregnancy, setHidden } from './profiles.js';
import { h, button, fmtDate } from './ui.js';

export function pregnancyTab(s, el) {
  const p = s.preg;
  const hero = h('div', 'hero');
  if (p.status === 'born') {
    hero.append(h('div', 'hero-big', `👶 ${s.child.name}`), h('div', 'hero-sub', `${fmtDate(s.child.birthDate)} 출생 · 예정일 ${fmtDate(p.dueDate)}`));
    el.append(hero);
  } else {
    const { weeks, days, dday } = pregnancyAge(p.dueDate, today());
    if (p.status === 'ended') hero.append(h('div', 'hero-sub', '종료로 표시된 임신 기록이에요.'));
    else hero.append(h('div', 'hero-big', `${weeks}주 ${days}일`));
    hero.append(h('div', 'hero-sub', `예정일 ${fmtDate(p.dueDate)}${p.status === 'ended' ? '' : ` · ${ddayText(dday)}`}`));
    const acts = h('div', 'actions');
    if (p.status === 'active') {
      acts.append(button('👶 출산했어요', () => birth(p), 'btn primary'), button('종료로 표시', () => endPregnancy(p)));
    } else {
      acts.append(button('진행 중으로 되돌리기', () => reopenPregnancy(p)),
        button(p.hidden ? '홈에 다시 보이기' : '홈에서 숨기기', () => setHidden(p, !p.hidden)));
    }
    el.append(hero, acts);
  }
  el.append(h('p', 'hint center', '🩺 검진 기록 · ❓ 질문 목록 · ⏱ 진통 타이머는 다음 단계에서 만들어요.'));
}
