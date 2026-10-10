// 앱 상태 하나 + 다시 그리기 예약 + 화면 이동. DOM을 직접 만들지는 않음
import { dateStr, childStage, DEFAULT_EDU_AGE, DEFAULT_TEEN_AGE } from './stage.js';

export const state = {
  configured: true,
  user: undefined,      // undefined = 아직 모름, null = 로그아웃 상태
  familyId: null,
  family: null,         // families/{familyId} 문서
  members: {},          // uid → { name, emoji }
  pregnancies: [],      // [{ id, dueDate, status, childId, nickname, emoji, hidden }]
  children: [],         // [{ id, name, birthDate, emoji, pregnancyId }]
  loaded: new Set(),    // 첫 값을 받은 구독 이름
  pending: {},          // 구독 이름 → 아직 서버에 안 올라간 쓰기가 있는지
  error: null,
  view: { name: 'home' }, // 또는 { name: 'subject', key: 'c:아이id' | 'p:임신id', tab }
};

// ---------- 기기별 설정 (동기화 안 함). 같은 주소(kkonoo.github.io)의 다른 앱과 키 이름이 겹치지 않게 ----------
const PKEY = 'growing.prefs';
export const prefs = (() => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch { return {}; } })();
export const savePrefs = () => { try { localStorage.setItem(PKEY, JSON.stringify(prefs)); } catch { /* 저장 못 해도 앱은 동작 */ } };

// ---------- 다시 그리기: 구독 값이 여러 개 한꺼번에 와도 한 번만 ----------
let renderer = () => {}, queued = false;
export const setRenderer = fn => { renderer = fn; };
export function render() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; renderer(); });
}

// ---------- 화면 이동 (마지막 화면은 기억해 뒀다가 다음에 앱을 열면 바로 그 화면) ----------
export function go(view) {
  state.view = view;
  prefs.last = view;
  savePrefs();
  render();
  scrollTo(0, 0);
}

// ---------- 아이·임신 = 화면의 "대상(subject)" ----------
// 아이: { key: 'c:id', child, preg(이어진 임신) } / 진행 중·종료된 임신: { key: 'p:id', preg }
export const today = () => dateStr();
export const eduStartAge = () => state.family?.settings?.eduStartAge ?? DEFAULT_EDU_AGE;
export const teenStartAge = () => state.family?.settings?.teenStartAge ?? DEFAULT_TEEN_AGE;
const byDate = k => (a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0);
const childSubject = c => ({ key: `c:${c.id}`, child: c, preg: state.pregnancies.find(p => p.id === c.pregnancyId) });
const pregSubject = p => ({ key: `p:${p.id}`, preg: p });

// 홈·위 줄에 보이는 것: 아이 (생일 순) → 임신 (예정일 순, 출산한 것·숨긴 것 빼고)
export function subjects() {
  return [
    ...state.children.slice().sort(byDate('birthDate')).map(childSubject),
    ...state.pregnancies.filter(p => p.status !== 'born' && !p.hidden).sort(byDate('dueDate')).map(pregSubject),
  ];
}
export function findSubject(key) {
  const [kind, id] = (key || '').split(':');
  if (kind === 'c') { const c = state.children.find(x => x.id === id); return c && childSubject(c); }
  const p = state.pregnancies.find(x => x.id === id);
  if (!p) return null;
  if (p.status === 'born') { const c = state.children.find(x => x.id === p.childId); return c ? childSubject(c) : pregSubject(p); }
  return pregSubject(p);
}
// 지금 단계: 'pregnancy' | 'baby' | 'edu'(교육 영유아) | 'teen'(교육 사춘기) | 'ended'(종료된 임신)
export function stageOf(s) {
  if (s.child) return childStage(s.child.birthDate, today(), eduStartAge(), teenStartAge());
  return s.preg.status === 'ended' ? 'ended' : 'pregnancy';
}
export const nameOf = s => (s.child ? s.child.name : s.preg.nickname || '뱃속 아기');
export const emojiOf = s => (s.child ? s.child.emoji || '👶' : s.preg.emoji || '🤰');

export const familyReady = () => ['family', 'pregnancies', 'children'].every(k => state.loaded.has(k));
export const hasPending = () => Object.values(state.pending).some(Boolean);
