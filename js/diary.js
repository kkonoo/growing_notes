// 노트 탭: 📝 일기 · 🗣 한 말 · ⭐ 처음 해 본 것. 임신 중(태교일기)부터 아이(육아일기)까지 한 곳에 이어서, 한 달씩
// 기록 종류 note { kind: note(일기)|word(한 말)|first(처음), text } — 날짜만 보여 줌. 엄마·아빠가 같은 날 각자 써도 돼요
import { state, today, teenStartAge } from './state.js';
import { dateStr, eduMode } from './stage.js';
import { addRecord, updateRecord, deleteRecord, watchRecords, loadNotice, defineType } from './records.js';
import { monthNav, dayGroups } from './timeline.js';
import { h, button, openForm } from './ui.js';

const KINDS = [{ value: 'note', label: '📝 일기' }, { value: 'word', label: '🗣 한 말' }, { value: 'first', label: '⭐ 처음 해 본 것' }];
const EMOJI = { note: '📝', word: '🗣', first: '⭐' };
// 임신 중엔 '한 말'이 없고 '처음'은 첫 태동 같은 것, 사춘기 모드(만 12세~)엔 '한 말' 없이
function kindsFor(subjectType, child) {
  if (subjectType === 'pregnancy') return [KINDS[0], { value: 'first', label: '⭐ 처음 (첫 태동 등)' }];
  if (child && eduMode(child.birthDate, today(), teenStartAge()) === 'teen') return [KINDS[0], KINDS[2]];
  return KINDS;
}
const rowLabel = r => (r.data.kind === 'word' ? '한 말' : r.data.kind === 'first' ? (r.subjectType === 'pregnancy' ? '처음' : '처음 해 본 것') : '일기');
const noon = s => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), 12);
// 날짜 칸 → 시각: 날짜가 그대로면 원래 시각, 오늘이면 지금, 다른 날이면 그날 12시
const atOf = (s, orig) => (orig && dateStr(orig) === s ? orig : s === today() ? new Date() : noon(s));

// subject = { subjectType, subjectId }: 새로 쓸 때 어디에 (임신 또는 아이)
async function noteForm(subject, kind, r) {
  const child = subject.subjectType === 'child' ? state.children.find(c => c.id === subject.subjectId) : null;
  let kinds = kindsFor(subject.subjectType, child);
  const old = r && KINDS.find(k => k.value === r.data.kind); // 예전에 쓴 종류(예: 사춘기 전의 한 말)는 고칠 때도 그대로
  if (old && !kinds.some(k => k.value === old.value)) kinds = [...kinds, old];
  const v = await openForm({
    title: r ? '고치기' : kinds.find(k => k.value === kind)?.label || '📝 일기',
    fields: [
      { key: 'kind', label: '종류', type: 'choice', options: kinds, value: r?.data.kind || kind },
      { key: 'text', label: '내용', type: 'textarea', value: r?.data.text ?? '', required: true },
      { key: 'date', label: '날짜', type: 'date', value: r ? dateStr(r.at) : today(), max: today(), required: true },
    ],
    extra: r ? [{ label: '지우기', value: 'delete', cls: 'danger' }] : [],
  });
  if (v === 'delete') { if (confirm('이 글을 지울까요?')) deleteRecord(r.id); return; }
  if (!v) return;
  const data = { kind: v.kind, text: v.text };
  if (r) updateRecord(r.id, { at: atOf(v.date, r.at), data });
  else addRecord(subject.subjectType, subject.subjectId, 'note', atOf(v.date), data);
}

defineType('note', {
  emoji: r => EMOJI[r.data.kind] || '📝', label: '노트', rowLabel, dateOnly: true, text: r => r.data.text,
  edit: r => noteForm({ subjectType: r.subjectType, subjectId: r.subjectId }, r.data.kind, r),
});

export function diaryTab(s, el) {
  const subject = s.child ? { subjectType: 'child', subjectId: s.child.id } : { subjectType: 'pregnancy', subjectId: s.preg.id };
  const btns = h('div', 'actions');
  for (const k of kindsFor(subject.subjectType, s.child)) btns.append(button(k.label, () => noteForm(subject, k.value), k.value === 'note' ? 'btn primary' : 'btn'));
  el.append(btns);

  const range = monthNav(`diary:${s.key}`, el);
  const w = watchRecords([s.child?.id, s.preg?.id].filter(Boolean), { ...range, types: ['note'] });
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  if (!w.list.length) return el.append(h('div', 'empty', '📝'), h('p', 'empty-text', '이 달에는 쓴 글이 없어요.'));
  dayGroups(el, w.list, r => !!s.child && r.subjectType === 'pregnancy');
}
