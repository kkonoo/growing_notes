// 아이·임신 프로필: 등록, 고치기, 지우기, 출산 처리, 종료·숨기기. 홈 카드의 단계 표시·핵심 한 줄도 여기
import { F, fs, write } from './db.js';
import { state, go, today, eduStartAge, stageOf, nameOf } from './state.js';
import { famCol, myUid } from './family.js';
import { STAGES, pregnancyLine, childLine } from './stage.js';
import { h, toast, openForm, fmtMD } from './ui.js';

export const PREG_EMOJI = ['🤰', '🫘', '🌱', '🐣', '⭐', '🍀', '🌙', '🫧'];
export const CHILD_EMOJI = ['👶', '👧', '👦', '🐻', '🐰', '🦊', '🐥', '🐳', '🌷', '⭐'];

// ---------- 단계 표시 ----------
const BADGES = { ...STAGES, ended: { label: '종료', emoji: '🗂' } };
export function stageBadge(stage) {
  const b = h('span', 'badge', `${BADGES[stage].emoji} ${BADGES[stage].label}`);
  b.dataset.stage = stage;
  return b;
}
export function keyLine(s) {
  if (s.child) return childLine(s.child.birthDate, today(), eduStartAge());
  return s.preg.status === 'ended' ? `예정일 ${fmtMD(s.preg.dueDate)}` : pregnancyLine(s.preg.dueDate, today());
}

// ---------- 등록 · 고치기 ----------
const pregRef = id => F.doc(famCol('pregnancies'), id);
const childRef = id => F.doc(famCol('children'), id);
const created = () => ({ createdAt: F.serverTimestamp(), createdBy: myUid() });

function pregnancyFields(p) {
  return [
    { key: 'nickname', label: '태명 (선택)', value: p?.nickname, placeholder: '예: 콩콩이', maxLength: 20 },
    { key: 'dueDate', label: '출산 예정일', type: 'date', value: p?.dueDate, required: true },
    { key: 'emoji', label: '대표 이모지', type: 'emoji', choices: PREG_EMOJI, value: p?.emoji },
  ];
}
function childFields(c) {
  return [
    { key: 'name', label: '이름 또는 태명', value: c?.name, required: true, maxLength: 20 },
    { key: 'birthDate', label: '태어난 날', type: 'date', value: c?.birthDate || today(), max: today(), required: true },
    { key: 'emoji', label: '대표 이모지', type: 'emoji', choices: CHILD_EMOJI, value: c?.emoji },
  ];
}

export async function addPregnancy() {
  const v = await openForm({ title: '🤰 임신 등록', fields: pregnancyFields(), submit: '등록' });
  if (!v) return;
  const ref = F.doc(famCol('pregnancies'));
  write(F.setDoc(ref, { ...v, status: 'active', hidden: false, ...created() }));
  go({ name: 'subject', key: `p:${ref.id}` });
}
export async function addChild() {
  const v = await openForm({ title: '👶 아이 등록', fields: childFields(), submit: '등록' });
  if (!v) return;
  const ref = F.doc(famCol('children'));
  write(F.setDoc(ref, { ...v, ...created() }));
  go({ name: 'subject', key: `c:${ref.id}` });
}

export async function editSubject(s) {
  const del = [{ label: '지우기', value: 'delete', cls: 'danger' }];
  if (s.child) {
    const v = await openForm({ title: `${nameOf(s)} 정보 고치기`, fields: childFields(s.child), extra: del });
    if (v === 'delete') return removeChild(s);
    if (v) write(F.updateDoc(childRef(s.child.id), v));
  } else {
    const v = await openForm({ title: '임신 정보 고치기', fields: pregnancyFields(s.preg), extra: del });
    if (v === 'delete') return removePregnancy(s.preg);
    if (v) write(F.updateDoc(pregRef(s.preg.id), v));
  }
}

// 기록이 하나라도 있으면 지우지 않음 (실수로 기록을 잃지 않게). 확인을 못 하면 있는 걸로
async function hasRecords(id) {
  try { return !(await F.getDocs(F.query(famCol('records'), F.where('subjectId', '==', id), F.limit(1)))).empty; } catch { return true; }
}
async function removeChild(s) {
  if (await hasRecords(s.child.id)) return alert('이 아이의 기록이 있어서 지울 수 없어요.');
  const back = s.preg ? '\n출산 처리도 되돌려서 임신 진행 중으로 돌아가요. 임신 기록은 그대로예요.' : '';
  if (!confirm(`'${s.child.name}' 정보를 지울까요?${back}`)) return;
  const b = F.writeBatch(fs);
  b.delete(childRef(s.child.id));
  if (s.preg) b.update(pregRef(s.preg.id), { status: 'active', childId: F.deleteField() });
  write(b.commit());
  go(s.preg ? { name: 'subject', key: `p:${s.preg.id}` } : { name: 'home' });
}
async function removePregnancy(p) {
  if (await hasRecords(p.id)) return alert('기록이 있어서 지울 수 없어요. 대신 종료로 표시하거나 홈에서 숨길 수 있어요.');
  if (!confirm('이 임신 정보를 지울까요?')) return;
  write(F.deleteDoc(pregRef(p.id)));
  go({ name: 'home' });
}

// ---------- 출산 처리: 아이 프로필을 만들고 임신과 서로 연결. 기록은 옮기지 않음 (아이 화면이 임신 기록도 같이 읽음) ----------
export async function birth(p) {
  const fields = childFields({ name: p.nickname });
  const v = await openForm({ title: '👶 출산 처리', fields, submit: '출산 처리', note: '임신 중 기록은 그대로 이 아이의 기록으로 이어져요.' });
  if (!v) return;
  const ref = F.doc(famCol('children')), b = F.writeBatch(fs);
  b.set(ref, { ...v, pregnancyId: p.id, ...created() });
  b.update(pregRef(p.id), { status: 'born', childId: ref.id });
  write(b.commit());
  go({ name: 'subject', key: `c:${ref.id}` });
  toast('👶 출산을 축하해요!');
}

// ---------- 종료 · 숨기기 (기록은 그대로 남음) ----------
export function endPregnancy(p) {
  if (!confirm('이 임신 기록을 종료로 표시할까요?\n지금까지의 기록은 그대로 남고, 언제든 되돌릴 수 있어요.')) return;
  write(F.updateDoc(pregRef(p.id), { status: 'ended' }));
}
export const reopenPregnancy = p => write(F.updateDoc(pregRef(p.id), { status: 'active', hidden: false }));
export function setHidden(p, hidden) {
  write(F.updateDoc(pregRef(p.id), { hidden }));
  if (hidden) {
    go({ name: 'home' });
    toast('홈에서 숨겼어요. 설정 › 아이·임신에서 다시 볼 수 있어요.', 3500);
  }
}
