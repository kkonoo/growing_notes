// 지금 챙길 것: 임신 주수·생후 일수/개월에 맞는 안내 + 공식 페이지 링크
// 원칙: 판정 문구 없음, 금액 없음(해마다 바뀜) → "언제 무엇을 신청·확인할지"와 출처만. 바뀌면 이 파일만 고치면 돼요
// when: { weeks: [a, b] } 임신 주수 · { days: [a, b] } 생후 일수(태어난 날 = 1일) · { months: [a, b] } 만 개월 (모두 a 이상 b 이하)
import { h, button } from './ui.js';

export const CHECKED = '2026년 10월'; // 내용·링크를 마지막으로 확인한 때

const L = {
  gov: { label: '정부24', url: 'https://www.gov.kr' },
  bokjiro: { label: '복지로', url: 'https://www.bokjiro.go.kr' },
  momOneStop: { label: '복지로 안내: 맘편한 임신 원스톱', url: 'https://www.bokjiro.go.kr/ssis-tbu/cms/pc/news/promotion/1307166_1118.html' },
  nhis: { label: '국민건강보험공단', url: 'https://www.nhis.or.kr' },
  infantCheck: { label: '복지로 안내: 영유아 건강검진', url: 'https://www.bokjiro.go.kr/ssis-tbu/cms/pc/news/promotion/1210326_1118.html' },
  nip: { label: '예방접종도우미', url: 'https://nip.kdca.go.kr' },
  birthLaw: { label: '가족관계등록법 제44조', url: 'https://www.law.go.kr/법령/가족관계의등록등에관한법률/제44조' },
};

const CHECKUPS = [
  [1, '생후 14~35일', { days: [14, 35] }], [2, '생후 4~6개월', { months: [4, 6] }], [3, '생후 9~12개월', { months: [9, 12] }],
  [4, '생후 18~24개월', { months: [18, 24] }], [5, '생후 30~36개월', { months: [30, 36] }], [6, '생후 42~48개월', { months: [42, 48] }],
  [7, '생후 54~60개월', { months: [54, 60] }], [8, '생후 66~71개월', { months: [66, 71] }],
];

export const TIPS = [
  // ---------- 임신 ----------
  {
    id: 'mom-onestop', when: { weeks: [0, 16] }, emoji: '🏥', title: '맘편한 임신 원스톱 서비스 · 보건소 임산부 등록',
    body: '정부24의 "맘편한 임신 원스톱 서비스"로 임신·출산 진료비 지원(국민행복카드), 엽산제·철분제, 모자보건수첩 같은 임신 지원을 한 번에 신청할 수 있어요. 임산부 주민등록 주소지에서 신청하고, 지역 서비스(축하용품, 주차증 등)는 보건소마다 달라요. 진료비 지원 금액·사용 기간은 국민건강보험공단 안내에서 확인해요.',
    links: [L.gov, L.momOneStop, L.nhis], src: '복지로 "맘 편한 임신 원스톱 서비스" 안내',
  },
  {
    id: 'iron', when: { weeks: [14, 24] }, emoji: '💊', title: '보건소 철분제 지원',
    body: '임신 중기부터 철분제를 지원하는 보건소가 많아요. 임신 주수에 맞춰 지원해서 지난 기간은 소급되지 않는 곳도 있으니, 주소지 보건소에 지원 시기를 확인해요.',
    links: [L.momOneStop], src: '하남시 보건소 임산부 등록 안내, 복지로 안내',
  },
  {
    id: 'before-birth', when: { weeks: [32, 42] }, emoji: '📝', title: '출산 후 바로 할 일 미리 보기',
    body: '출생신고는 출생 후 1개월 안에 해요. 출생신고 때 "행복출산 원스톱 서비스"로 첫만남이용권·부모급여·아동수당 같은 출산 지원을 함께 신청할 수 있어요. 부모급여는 출생일을 포함해 60일 안에 신청해야 태어난 달부터 받아요. 산모·신생아 건강관리 지원은 출산 전부터 신청할 수 있으니 기간을 보건소·복지로에서 확인해요.',
    links: [L.gov, L.bokjiro], src: '가족관계등록법 제44조, 복지로 안내, 보건복지부 부모급여 안내 보도',
  },
  // ---------- 출생 후 ----------
  {
    id: 'birth-report', when: { days: [1, 31] }, emoji: '📝', title: '출생신고 + 행복출산 원스톱 서비스',
    body: '출생신고는 출생 후 1개월 안에 해요(넘기면 과태료가 있어요). 주민센터나 정부24에서 출생신고를 하면서 "행복출산 원스톱 서비스"로 첫만남이용권·부모급여·아동수당 등을 한 번에 신청할 수 있어요.',
    links: [L.gov, L.birthLaw], src: '가족관계등록법 제44조·제122조, 복지로 안내',
  },
  {
    id: 'parent-allowance', when: { days: [1, 60] }, emoji: '👛', title: '부모급여는 생후 60일 안에 신청',
    body: '부모급여는 출생일을 포함해 60일 안에 신청하면 태어난 달부터 받아요. 60일이 지나면 신청한 달부터 받아요. 행복출산 원스톱 서비스로 이미 신청했다면 따로 안 해도 돼요.',
    links: [L.bokjiro, L.gov], src: '보건복지부 부모급여 안내(2024년 1월 보도), 정부24 안내',
  },
  ...CHECKUPS.map(([n, range, when]) => ({
    id: `infant-check-${n}`, when, emoji: '🩺', title: `영유아 건강검진 ${n}차 (${range})`,
    body: `${range} 사이에 받는 검진이에요. 건강보험 가입자는 본인 부담이 없어요. 대상 확인과 검진기관 예약은 국민건강보험공단 누리집(건강iN)이나 "The건강보험" 앱에서 해요.${n === 4 ? ' 구강검진은 생후 18~29개월에 받아요.' : ''}`,
    links: [L.nhis, L.infantCheck], src: '복지로 "영유아 초기 건강검진" 안내, 구청 보건소 영유아 건강검진 안내',
  })),
  {
    id: 'vaccine', when: { months: [0, 155] }, emoji: '💉', title: '예방접종 일정·내역 확인',
    body: '만 12세 이하 어린이 국가예방접종은 지정의료기관에서 무료로 맞아요. 우리 아이 접종 일정과 맞은 내역은 질병관리청 "예방접종도우미" 누리집이나 앱에서 확인해요.',
    links: [L.nip], src: '질병관리청 예방접종도우미, 구청 보건소 국가예방접종 안내',
  },
];

// 지금 나이에 맞는 안내. age = { weeks } (임신) 또는 { days, months } (출생 후)
export function pickTips(age) {
  return TIPS.filter(t => Object.entries(t.when).some(([unit, [a, b]]) => age[unit] != null && age[unit] >= a && age[unit] <= b));
}

// ---------- 그리기: 처음엔 접힌 한 줄 → 누르면 제목 목록 → 제목을 누르면 내용 ----------
// 펼친 상태는 기억하지 않음 (앱을 열 때마다 접힌 채로)
let blockOpen = false;
const opened = new Set();
export function tipsBlock(list, rerender) {
  if (!list.length) return null;
  const sec = h('section', `block tips${blockOpen ? ' open' : ''}`);
  const head = button(`📌 지금 챙길 것 · ${list.length}개`, () => { blockOpen = !blockOpen; rerender(); }, 'tips-head');
  head.setAttribute('aria-expanded', blockOpen);
  sec.append(head);
  if (!blockOpen) return sec;
  for (const t of list) {
    const open = opened.has(t.id);
    const row = button(`${t.emoji} ${t.title}`, () => { if (open) opened.delete(t.id); else opened.add(t.id); rerender(); }, `tip-title${open ? ' open' : ''}`);
    row.setAttribute('aria-expanded', open);
    sec.append(row);
    if (!open) continue;
    const body = h('div', 'tip-body');
    body.append(h('p', null, t.body));
    if (t.links.length) {
      const links = h('div', 'tip-links');
      for (const l of t.links) links.append(Object.assign(h('a', 'btn small', `${l.label} ↗`), { href: l.url, target: '_blank', rel: 'noopener' }));
      body.append(links);
    }
    body.append(h('p', 'hint', `출처: ${t.src} · ${CHECKED} 확인. 금액·기한은 바뀔 수 있으니 신청 전에 공식 페이지에서 확인해요.`));
    sec.append(body);
  }
  return sec;
}
