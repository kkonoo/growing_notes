// 교육 탭: 나이에 따라 두 모드 (경계 나이는 설정 › 단계, 기본 만 12세. 지금 모드는 아이 이름 옆에). 위에는 나이에 맞는 안내(지금 챙길 것)
//   영유아: 📚 독서 · 🎹 활동 · 🏫 기관(+ 💬 상담 메모)
//   사춘기: 🏫 학교(+ 📝 시험·성적) · 💬 대화 메모 · 🎯 진로·관심사
// 한 말·처음 해 본 것·일기는 📝 일기 탭(diary.js)
// 기록 종류 (records, subjectType 'child'): 날짜만 중요해서 시각은 안 보여 줌
//   book { title, with: together|alone, liked, memo? } · activity { activityId, name, emoji, memo? } · consult { schoolId?, school, text }
//   grade { exam, course, score, memo? } · talk { who: child|teacher|other, text } · interest { kind: like|dream|club, text }
// 아이 정보(children 문서): activities [{ id, name, emoji, active }] · schools [{ id, kind, name, cls, teacher, from, to }]
// 일정·교육비는 캘린더x플래너·살림노트에서. 사진은 아직 안 함
import { render, today, teenStartAge } from './state.js';
import { childAge, dateStr, eduMode } from './stage.js';
import { addRecord, updateRecord, deleteRecord, watchRecords, loadNotice, defineType, tapOnce, quickAdd } from './records.js';
import { saveChild } from './profiles.js';
import { pickTips, tipsBlock } from './tips.js';
import { dayGroups } from './timeline.js';
import { h, button, openForm, picker } from './ui.js';

const C = 'child';
const DEL = [{ label: '지우기', value: 'delete', cls: 'danger' }];
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const noon = s => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), 12);
// 날짜 칸 → 시각: 날짜가 그대로면 원래 시각, 오늘이면 지금, 다른 날이면 그날 12시
const atOf = (s, orig) => (orig && dateStr(orig) === s ? orig : s === today() ? new Date() : noon(s));
const dateField = r => ({ key: 'date', label: '날짜', type: 'date', value: r ? dateStr(r.at) : today(), max: today(), required: true });
const ask = (r, what) => confirm(`이 ${what}을 지울까요?`) && deleteRecord(r.id);

// ---------- 📚 독서 ----------
const WITH = [{ value: 'together', label: '같이 읽음' }, { value: 'alone', label: '혼자 읽음' }];
const LIKED = [{ value: '', label: '보통' }, { value: 'yes', label: '❤️ 좋아함' }];
const bookText = r => [r.data.title, WITH.find(x => x.value === r.data.with)?.label, r.data.liked ? '❤️' : '', r.data.memo].filter(Boolean).join(' · ');
let titles = []; // 최근 읽은 책 제목 (자동 완성)
function bookForm(r) {
  const d = r?.data || {};
  return openForm({
    title: r ? '📚 독서 기록 고치기' : '📚 책 기록',
    fields: [
      { key: 'title', label: '책 제목', value: d.title, required: true, maxLength: 80, suggest: titles },
      dateField(r),
      { key: 'with', label: '읽은 방법', type: 'choice', options: WITH, value: d.with || 'together' },
      { key: 'liked', label: '반응', type: 'choice', options: LIKED, value: d.liked ? 'yes' : '' },
      { key: 'memo', label: '한 줄 메모', value: d.memo ?? '', maxLength: 200 },
    ],
    extra: r ? DEL : [],
  });
}
const bookData = v => ({ title: v.title, with: v.with, liked: v.liked === 'yes', ...(v.memo ? { memo: v.memo } : {}) });
async function addBook(child) {
  const v = await bookForm();
  if (v) addRecord(C, child.id, 'book', atOf(v.date), bookData(v));
}
async function editBook(r) {
  const v = await bookForm(r);
  if (v === 'delete') return ask(r, '독서 기록');
  if (v) updateRecord(r.id, { at: atOf(v.date, r.at), data: bookData(v) });
}

// ---------- 🎹 활동 ----------
const ACT_EMOJI = ['🎹', '🥋', '🏊', '⚽', '🎨', '🩰', '🎻', '📖', '🧮', '🗣'];
const actText = r => [r.data.name, r.data.memo].filter(Boolean).join(' · ');
async function activityForm(child, a) {
  const v = await openForm({
    title: a ? '활동 고치기' : '🎹 활동 추가',
    note: a ? '그만두거나 지워도 지금까지의 기록은 그대로 남아요.' : '피아노, 태권도처럼 다니는 활동을 등록하면 "다녀왔어요"로 바로 기록할 수 있어요.',
    fields: [
      { key: 'name', label: '활동 이름', value: a?.name, required: true, placeholder: '예: 피아노', maxLength: 30 },
      { key: 'emoji', label: '이모지', type: 'emoji', choices: ACT_EMOJI, value: a?.emoji },
      ...(a ? [{ key: 'active', label: '상태', type: 'choice', options: [{ value: 'yes', label: '다니는 중' }, { value: '', label: '그만둠' }], value: a.active === false ? '' : 'yes' }] : []),
    ],
    extra: a ? DEL : [],
  });
  if (!v) return;
  const list = child.activities || [];
  if (v === 'delete') {
    if (confirm(`'${a.name}' 활동을 목록에서 지울까요? 지금까지의 기록은 그대로 남아요.`)) saveChild(child.id, { activities: list.filter(x => x.id !== a.id) });
    return;
  }
  const item = { id: a?.id || newId(), name: v.name, emoji: v.emoji, active: a ? v.active === 'yes' : true };
  saveChild(child.id, { activities: a ? list.map(x => (x.id === a.id ? item : x)) : [...list, item] });
}
async function editActivityRec(r) {
  const v = await openForm({
    title: `${r.data.emoji || '🎹'} ${r.data.name} 기록 고치기`,
    fields: [dateField(r), { key: 'memo', label: '진도 · 메모', value: r.data.memo ?? '', maxLength: 200 }],
    extra: DEL,
  });
  if (v === 'delete') return ask(r, '활동 기록');
  if (v) updateRecord(r.id, { at: atOf(v.date, r.at), 'data.memo': v.memo });
}

// ---------- 🏫 기관 + 💬 상담 ----------
const SCHOOL_KINDS = [
  { value: 'daycare', label: '🧸 어린이집' }, { value: 'kinder', label: '🎒 유치원' },
  { value: 'school', label: '🏫 학교' }, { value: 'etc', label: '📍 기타' },
];
const schoolEmoji = k => SCHOOL_KINDS.find(x => x.value === k)?.label.split(' ')[0] || '📍';
const ym = s => (s ? s.replace('-', '.') : '');
async function schoolForm(child, sc, kind = 'daycare') {
  const v = await openForm({
    title: sc ? '기관 고치기' : '🏫 기관 추가',
    fields: [
      { key: 'kind', label: '종류', type: 'choice', options: SCHOOL_KINDS, value: sc?.kind || kind },
      { key: 'name', label: '이름', value: sc?.name, required: true, maxLength: 40, placeholder: '예: 햇살유치원' },
      { key: 'cls', label: '반 · 학년', value: sc?.cls ?? '', maxLength: 30, half: true },
      { key: 'teacher', label: '담임', value: sc?.teacher ?? '', maxLength: 30, half: true },
      { key: 'from', label: '다닌 기간 (시작)', type: 'month', value: sc?.from ?? '', half: true },
      { key: 'to', label: '끝 (다니는 중이면 비워 두기)', type: 'month', value: sc?.to ?? '', half: true },
    ],
    extra: sc ? DEL : [],
  });
  if (!v) return;
  const list = child.schools || [];
  if (v === 'delete') {
    if (confirm(`'${sc.name}'을(를) 목록에서 지울까요? 상담 메모는 그대로 남아요.`)) saveChild(child.id, { schools: list.filter(x => x.id !== sc.id) });
    return;
  }
  const item = { id: sc?.id || newId(), kind: v.kind, name: v.name, cls: v.cls, teacher: v.teacher, from: v.from, to: v.to };
  saveChild(child.id, { schools: sc ? list.map(x => (x.id === sc.id ? item : x)) : [...list, item] });
}
async function consultForm(child, r) {
  const schools = child?.schools || [];
  const v = await openForm({
    title: r ? '💬 상담 메모 고치기' : '💬 상담 메모',
    fields: [
      dateField(r),
      ...(schools.length ? [{ key: 'schoolId', label: '기관', type: 'choice', options: [...schools.map(x => ({ value: x.id, label: x.name })), { value: '', label: '없음' }], value: r ? r.data.schoolId || '' : schools[0].id }] : []),
      { key: 'text', label: '내용', type: 'textarea', value: r?.data.text ?? '', required: true },
    ],
    extra: r ? DEL : [],
  });
  if (v === 'delete') return ask(r, '상담 메모');
  if (!v) return;
  const sc = schools.find(x => x.id === v.schoolId);
  const data = { text: v.text, ...(sc ? { schoolId: sc.id, school: sc.name } : r?.data.school && !schools.length ? { school: r.data.school } : {}) };
  if (r) updateRecord(r.id, { at: atOf(v.date, r.at), data });
  else addRecord(C, child.id, 'consult', atOf(v.date), data);
}

// ---------- 사춘기: 📝 시험·성적 ----------
let exams = [], courses = []; // 예전에 쓴 시험 이름·과목 (자동 완성)
const gradeText = r => [r.data.exam, [r.data.course, r.data.score].filter(Boolean).join(' '), r.data.memo].filter(Boolean).join(' · ');
async function gradeForm(child, r, keep) {
  const d = r?.data || keep || {};
  const v = await openForm({
    title: r ? '📝 성적 고치기' : '📝 시험·성적',
    note: r ? null : '과목마다 하나씩 기록해요. "저장하고 다음 과목"을 누르면 같은 시험으로 이어서 적어요.',
    fields: [
      { ...dateField(r), value: r ? dateStr(r.at) : keep?.date || today() },
      { key: 'exam', label: '시험', value: d.exam, required: true, maxLength: 40, placeholder: '예: 1학기 중간고사', suggest: exams },
      { key: 'course', label: '과목', value: r ? d.course : '', required: true, maxLength: 20, suggest: courses, half: true },
      { key: 'score', label: '점수 · 등급', value: r ? d.score : '', maxLength: 20, half: true },
      { key: 'memo', label: '메모', value: r ? d.memo ?? '' : '', maxLength: 200 },
    ],
    extra: r ? DEL : [{ label: '저장하고 다음 과목', value: 'next', submit: true }],
  });
  if (v === 'delete') return ask(r, '성적 기록');
  if (!v) return;
  const data = { exam: v.exam, course: v.course, score: v.score, ...(v.memo ? { memo: v.memo } : {}) };
  if (r) return updateRecord(r.id, { at: atOf(v.date, r.at), data });
  addRecord(C, child.id, 'grade', atOf(v.date), data);
  if (v.action === 'next') gradeForm(child, null, { exam: v.exam, date: v.date });
}

// ---------- 사춘기: 💬 대화 메모 ----------
const WHO = [{ value: 'child', label: '아이와' }, { value: 'teacher', label: '선생님과' }, { value: 'other', label: '기타' }];
const talkText = r => [WHO.find(x => x.value === r.data.who)?.label, r.data.text].filter(Boolean).join(' · ');
async function talkForm(child, r) {
  const v = await openForm({
    title: r ? '💬 대화 메모 고치기' : '💬 대화 메모',
    fields: [
      dateField(r),
      { key: 'who', label: '누구와', type: 'choice', options: WHO, value: r?.data.who || 'child' },
      { key: 'text', label: '내용', type: 'textarea', value: r?.data.text ?? '', required: true },
    ],
    extra: r ? DEL : [],
  });
  if (v === 'delete') return ask(r, '대화 메모');
  if (!v) return;
  const data = { who: v.who, text: v.text };
  if (r) updateRecord(r.id, { at: atOf(v.date, r.at), data });
  else addRecord(C, child.id, 'talk', atOf(v.date), data);
}

// ---------- 사춘기: 🎯 진로·관심사 ----------
const INTERESTS = [{ value: 'like', label: '💡 관심사' }, { value: 'dream', label: '🎯 꿈' }, { value: 'club', label: '🏅 활동' }]; // 꿈 = 꿈·진로, 활동 = 동아리·활동
const INTEREST_EMOJI = { like: '💡', dream: '🎯', club: '🏅' };
const interestName = r => INTERESTS.find(x => x.value === r.data.kind)?.label.split(' ')[1] || '진로·관심사';
async function interestForm(child, kind, r) {
  const v = await openForm({
    title: r ? '고치기' : INTERESTS.find(x => x.value === kind).label,
    fields: [
      { key: 'kind', label: '종류', type: 'choice', options: INTERESTS, value: r?.data.kind || kind },
      { key: 'text', label: '내용', type: 'textarea', value: r?.data.text ?? '', required: true },
      dateField(r),
    ],
    extra: r ? DEL : [],
  });
  if (v === 'delete') return ask(r, '기록');
  if (!v) return;
  const data = { kind: v.kind, text: v.text };
  if (r) updateRecord(r.id, { at: atOf(v.date, r.at), data });
  else addRecord(C, child.id, 'interest', atOf(v.date), data);
}

// 기록 종류 등록 (타임라인·고치기). 고치기 창에 아이 정보(기관 목록)가 필요한 건 그리는 동안의 아이로
let current = null;
defineType('book', { emoji: '📚', label: '독서', dateOnly: true, text: bookText, edit: editBook });
defineType('activity', { emoji: r => r.data.emoji || '🎹', label: '활동', dateOnly: true, text: actText, edit: editActivityRec });
defineType('consult', { emoji: '💬', label: '상담', dateOnly: true, text: r => [r.data.school, r.data.text].filter(Boolean).join(' · '), edit: r => consultForm(current, r) });
defineType('grade', { emoji: '📝', label: '성적', dateOnly: true, text: gradeText, edit: r => gradeForm(current, r) });
defineType('talk', { emoji: '💬', label: '대화', dateOnly: true, text: talkText, edit: r => talkForm(current, r) });
defineType('interest', { emoji: r => INTEREST_EMOJI[r.data.kind] || '💡', label: '진로·관심사', rowLabel: interestName, dateOnly: true, text: r => r.data.text, edit: r => interestForm(current, r.data.kind, r) });

// ---------- 그리기 ----------
// 모드별 칸과 그 칸에서 읽는 기록 종류
const MODES = {
  early: { types: ['book', 'activity', 'consult'],
    sections: [{ value: 'book', label: '📚 독서' }, { value: 'activity', label: '🎹 활동' }, { value: 'school', label: '🏫 기관' }] },
  teen: { types: ['grade', 'talk', 'interest'],
    sections: [{ value: 'school', label: '🏫 학교' }, { value: 'talk', label: '💬 대화' }, { value: 'interest', label: '🎯 진로·관심사' }] },
};
const sections = new Map(); // 아이·모드별로 보고 있는 칸
let showStopped = false;

function block(title, ...actions) {
  const sec = h('section', 'block'), head = h('div', 'block-head');
  head.append(h('h2', null, title));
  if (actions.length) { const a = h('span', 'head-btns'); a.append(...actions); head.append(a); }
  sec.append(head);
  return sec;
}

export function eduTab(s, el) {
  const child = s.child;
  current = child;
  const { dayCount, months } = childAge(child.birthDate, today());
  const tips = tipsBlock(pickTips({ days: dayCount, months }), render);
  if (tips) el.append(tips);

  const mode = eduMode(child.birthDate, today(), teenStartAge()), M = MODES[mode], key = `${s.key}:${mode}`;
  const sec = M.sections.some(x => x.value === sections.get(key)) ? sections.get(key) : M.sections[0].value;
  el.append(picker(M.sections, sec, v => { sections.set(key, v); render(); }, { row: 'chip-row', btn: 'chip small' }).el);

  // 이 모드의 교육 기록만, 작년 1월부터 (더 예전 기록은 타임라인에서 달별로)
  const now = new Date(), w = watchRecords([child.id], { types: M.types, since: new Date(now.getFullYear() - 1, 0, 1) });
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  const of = type => w.list.filter(r => r.type === type);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1), yearStart = new Date(now.getFullYear(), 0, 1);
  const thisMonth = list => list.filter(r => r.at >= monthStart);

  if (sec === 'book') {
    const books = of('book');
    titles = [...new Set(books.map(r => r.data.title))];
    const kinds = list => new Set(list.map(r => r.data.title)).size;
    const b = block('📚 독서', button('＋ 책 기록', () => addBook(child), 'btn small'));
    const m = thisMonth(books), y = books.filter(r => r.at >= yearStart);
    b.append(h('p', 'block-line', `이번 달 ${m.length}번 (${kinds(m)}권) · 올해 ${y.length}번 (${kinds(y)}권)`));
    if (titles.length) { // 또 읽었어요: 최근 책을 누르면 오늘 날짜로 바로 기록
      const again = h('div', 'again');
      again.append(h('span', 'hint', '또 읽었어요 (누르면 오늘로 기록)'));
      const row = h('div', 'chip-row wrap');
      for (const t of titles.slice(0, 8)) {
        const last = books.find(r => r.data.title === t);
        row.append(button(`📖 ${t}`, () => tapOnce(`book:${t}`, () => quickAdd(C, child.id, 'book', { title: t, with: last.data.with, liked: !!last.data.liked }, `📚 ${t}`)), 'chip small'));
      }
      again.append(row);
      b.append(again);
    }
    el.append(b);
    dayGroups(el, m);
    if (!books.length) el.append(h('p', 'hint center', '읽은 책을 기록하면 여기에 모여요.'));
  }

  if (sec === 'activity') {
    const acts = child.activities || [], recs = of('activity'), m = thisMonth(recs);
    const b = block('🎹 활동', button('＋ 활동 추가', () => activityForm(child), 'btn small'));
    const row = a => {
      const r = h('div', 'act-row');
      const name = button('', () => activityForm(child, a), 'act-name');
      name.append(h('span', null, `${a.emoji || '🎹'} ${a.name}`), h('span', 'hint', `이번 달 ${m.filter(x => x.data.activityId === a.id).length}회`));
      r.append(name);
      if (a.active !== false) r.append(button('다녀왔어요', () => tapOnce(`act:${a.id}`, () => quickAdd(C, child.id, 'activity', { activityId: a.id, name: a.name, emoji: a.emoji || '🎹' }, `${a.emoji || '🎹'} ${a.name}`)), 'btn primary small'));
      return r;
    };
    const active = acts.filter(a => a.active !== false), stopped = acts.filter(a => a.active === false);
    if (!acts.length) b.append(h('p', 'hint', '다니는 활동(피아노, 태권도 등)을 추가하면 다녀온 날을 한 번에 기록할 수 있어요.'));
    b.append(...active.map(row));
    if (stopped.length) {
      b.append(button(`그만둔 활동 ${stopped.length}개 ${showStopped ? '접기 ▴' : '보기 ▾'}`, () => { showStopped = !showStopped; render(); }, 'link-btn'));
      if (showStopped) b.append(...stopped.map(row));
    }
    el.append(b);
    dayGroups(el, m);
  }

  if (sec === 'school') el.append(schoolBlock(child, mode));

  if (sec === 'school' && mode === 'early') {
    const c = block('💬 상담 메모', button('＋ 상담 메모', () => consultForm(child), 'btn small'));
    const consults = of('consult');
    if (!consults.length) c.append(h('p', 'hint', '선생님과 상담한 내용을 날짜별로 남겨요.'));
    el.append(c);
    dayGroups(el, consults);
  }

  if (sec === 'school' && mode === 'teen') {
    const grades = of('grade');
    exams = [...new Set(grades.map(r => r.data.exam))];
    courses = [...new Set(grades.map(r => r.data.course))];
    const g = block('📝 시험·성적', button('＋ 성적 기록', () => gradeForm(child), 'btn small'));
    if (!grades.length) g.append(h('p', 'hint', '시험마다 과목별 점수나 등급을 기록해요.'));
    // 같은 날 같은 시험끼리 묶어서
    const groups = new Map();
    for (const r of grades) { const k = `${dateStr(r.at)}|${r.data.exam}`; groups.set(k, [...(groups.get(k) || []), r]); }
    for (const [k, list] of groups) {
      const [day, exam] = k.split('|');
      g.append(h('div', 'exam-head', `${exam} · ${+day.slice(5, 7)}월 ${+day.slice(8, 10)}일`));
      for (const r of list.slice().reverse()) { // 과목은 적은 순서대로
        const row = button('', () => gradeForm(child, r), 'rec-row');
        row.append(h('span', 'rec-date', [r.data.course, r.data.score].filter(Boolean).join(' ')), ...(r.data.memo ? [h('span', 'rec-text', r.data.memo)] : []));
        g.append(row);
      }
    }
    el.append(g);
  }

  if (sec === 'talk') {
    el.append(block('💬 대화 메모', button('＋ 대화 메모', () => talkForm(child), 'btn small')));
    const talks = of('talk');
    if (talks.length) dayGroups(el, talks);
    else el.append(h('p', 'hint center', '아이와 나눈 이야기, 선생님 상담을 날짜별로 남겨요.'));
  }

  if (sec === 'interest') { // 노트 탭처럼 쓰기 버튼 한 줄
    const btns = h('div', 'actions');
    for (const k of INTERESTS) btns.append(button(k.label, () => interestForm(child, k.value), 'btn'));
    el.append(btns);
    const list = of('interest');
    if (list.length) dayGroups(el, list);
    else el.append(h('p', 'hint center', '요즘 관심 있는 것, 꿈, 동아리를 시기별로 남겨요.'));
  }
}

// 기관(영유아) · 학교(사춘기) 목록: 이름, 반·학년, 담임, 다닌 기간. 최근에 시작한 곳부터
function schoolBlock(child, mode) {
  const schools = (child.schools || []).slice().sort((a, b) => (b.from || '').localeCompare(a.from || ''));
  const teen = mode === 'teen';
  const b = block(teen ? '🏫 학교' : '🏫 기관', button(teen ? '＋ 학교 추가' : '＋ 기관 추가', () => schoolForm(child, null, teen ? 'school' : 'daycare'), 'btn small'));
  if (!schools.length) b.append(h('p', 'hint', teen ? '학교와 학년·반, 담임, 다닌 기간을 적어 둘 수 있어요.' : '어린이집·유치원·학교와 반, 담임, 다닌 기간을 적어 둘 수 있어요.'));
  for (const sc of schools) {
    const row = button('', () => schoolForm(child, sc), 'rec-row');
    const period = sc.from ? `${ym(sc.from)}~${ym(sc.to)}` : '';
    row.append(h('span', 'rec-date', `${schoolEmoji(sc.kind)} ${sc.name}`), h('span', 'rec-text', [sc.cls, sc.teacher && `담임 ${sc.teacher}`, period].filter(Boolean).join(' · ')));
    b.append(row);
  }
  return b;
}
