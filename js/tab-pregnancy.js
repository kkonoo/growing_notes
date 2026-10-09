// 임신 탭: 주수, 진통 타이머, 다음 진료 때 물어볼 것, 검진 기록, 출산 처리·종료
// 기록 종류: checkup(검진) · question(질문) · contraction(진통). 판정 문구 없이 기록하고 보여 주기만
import { state, go, render, today } from './state.js';
import { pregnancyAge, ddayText, dateStr } from './stage.js';
import { birth, endPregnancy, reopenPregnancy, setHidden } from './profiles.js';
import { memberLabel } from './family.js';
import { addRecord, updateRecord, deleteRecord, watchRecords, loadNotice, defineType } from './records.js';
import { contractionRows, contractionSummary, fmtDur } from './stats.js';
import { sinceEl, keepAwake } from './live.js';
import { pickTips, tipsBlock } from './tips.js';
import { h, button, toast, openForm, fmtDate, fmtDay, fmtTime, toLocalInput, fromLocalInput } from './ui.js';

const P = 'pregnancy';
const DEL = [{ label: '지우기', value: 'delete', cls: 'danger' }];
const noon = s => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), 12); // 날짜만 있는 기록은 그날 낮 12시로

// ---------- 검진 ----------
function checkupText(r) {
  const d = r.data, parts = [];
  if (d.weightKg != null) parts.push(`${d.weightKg}kg`);
  if (d.bpSys != null || d.bpDia != null) parts.push(`혈압 ${d.bpSys ?? '–'}/${d.bpDia ?? '–'}`);
  if (d.memo) parts.push(d.memo);
  return parts.join(' · ') || '메모 없음';
}
function checkupForm(r) {
  const d = r?.data || {};
  return openForm({
    title: r ? '🩺 검진 기록 고치기' : '🩺 검진 기록',
    fields: [
      { key: 'date', label: '날짜', type: 'date', value: r ? dateStr(r.at) : today(), required: true },
      { key: 'weightKg', label: '체중 (kg)', type: 'number', step: '0.1', min: '0', inputMode: 'decimal', value: d.weightKg ?? '' },
      { key: 'bpSys', label: '혈압 수축기', type: 'number', min: '0', inputMode: 'numeric', value: d.bpSys ?? '', half: true },
      { key: 'bpDia', label: '혈압 이완기', type: 'number', min: '0', inputMode: 'numeric', value: d.bpDia ?? '', half: true },
      { key: 'memo', label: '메모', type: 'textarea', value: d.memo ?? '' },
    ],
    extra: r ? DEL : [],
  });
}
function checkupData(v) {
  const data = {};
  for (const k of ['weightKg', 'bpSys', 'bpDia']) if (v[k] !== '') data[k] = +v[k];
  if (v.memo) data.memo = v.memo;
  return data;
}
async function addCheckup(p) {
  const v = await checkupForm();
  if (!v) return;
  addRecord(P, p.id, 'checkup', noon(v.date), checkupData(v));
  toast('🩺 검진 기록을 저장했어요');
}
async function editCheckup(r) {
  const v = await checkupForm(r);
  if (v === 'delete') { if (confirm('이 검진 기록을 지울까요?')) deleteRecord(r.id); return; }
  if (v) updateRecord(r.id, { at: noon(v.date), data: checkupData(v) });
}

// ---------- 다음 진료 때 물어볼 것 ----------
async function addQuestions(p) {
  const v = await openForm({
    title: '❓ 다음 진료 때 물어볼 것',
    fields: [{ key: 'text', label: '질문', type: 'textarea', required: true, hint: '한 줄에 하나씩 적으면 여러 개가 한 번에 추가돼요.' }],
    submit: '추가',
  });
  if (!v) return;
  const now = Date.now();
  v.text.split('\n').map(s => s.trim()).filter(Boolean)
    .forEach((text, i) => addRecord(P, p.id, 'question', new Date(now + i), { text, done: false })); // +i ms: 적은 순서 유지
}
async function editQuestion(r) {
  const v = await openForm({
    title: '❓ 질문',
    fields: [
      { key: 'text', label: '질문', type: 'textarea', value: r.data.text, required: true },
      { key: 'answer', label: '들은 답 · 메모', type: 'textarea', value: r.data.answer ?? '' },
    ],
    extra: DEL,
  });
  if (v === 'delete') { if (confirm('이 질문을 지울까요?')) deleteRecord(r.id); return; }
  if (v) updateRecord(r.id, { 'data.text': v.text, 'data.answer': v.answer });
}

// ---------- 진통 ----------
function startContraction(p) {
  addRecord(P, p.id, 'contraction', new Date(), { endAt: null });
  navigator.vibrate?.(30);
}
function endContraction(r) {
  updateRecord(r.id, { 'data.endAt': new Date() });
  navigator.vibrate?.(30);
}
async function editContraction(r) {
  const v = await openForm({
    title: '⏱ 진통 고치기',
    fields: [
      { key: 'start', label: '시작', type: 'datetime-local', step: '1', value: toLocalInput(r.at), required: true },
      { key: 'end', label: '끝 (진행 중이면 비워 두기)', type: 'datetime-local', step: '1', value: r.data.endAt ? toLocalInput(r.data.endAt) : '' },
    ],
    extra: DEL,
  });
  if (v === 'delete') { if (confirm('이 진통 기록을 지울까요?')) deleteRecord(r.id); return; }
  if (!v) return;
  const start = fromLocalInput(v.start), end = fromLocalInput(v.end);
  if (end && end < start) return alert('끝 시각이 시작보다 빨라요.');
  updateRecord(r.id, { at: start, 'data.endAt': end });
}
const contractions = list => contractionRows(list.filter(r => r.type === 'contraction').map(r => ({ rec: r, start: r.at, end: r.data.endAt || null })));

defineType('checkup', { emoji: '🩺', label: '검진', dateOnly: true, text: checkupText, edit: editCheckup });
defineType('question', { emoji: '❓', label: '질문', text: r => `${r.data.text}${r.data.done ? ' (물어봄)' : ''}`, edit: editQuestion });
defineType('contraction', { emoji: '⏱', label: '진통', text: r => (r.data.endAt ? `지속 ${fmtDur(r.data.endAt - r.at)}` : '진행 중'), edit: editContraction });

// ---------- 그리기 ----------
let showDone = false; // 물어본 질문 펼치기
let lastTap = 0;      // 진통 타이머 버튼을 마지막으로 누른 때

export function pregnancyTab(s, el) {
  const p = s.preg, w = watchRecords([p.id]);
  if (state.view.panel === 'timer' && p.status === 'active') return timerPanel(p, el, w);
  el.append(hero(s));
  if (p.status === 'active') {
    const tips = tipsBlock(pickTips({ weeks: pregnancyAge(p.dueDate, today()).weeks }), render);
    if (tips) el.append(tips);
  }
  const notice = loadNotice(w);
  if (notice) return el.append(notice);
  if (p.status === 'active') el.append(timerCard(w.list));
  el.append(questionBlock(p, w.list.filter(r => r.type === 'question')), checkupBlock(p, w.list.filter(r => r.type === 'checkup')));
  const acts = h('div', 'actions');
  if (p.status === 'active') acts.append(button('👶 출산했어요', () => birth(p), 'btn primary'), button('종료로 표시', () => endPregnancy(p)));
  if (p.status === 'ended') {
    acts.append(button('진행 중으로 되돌리기', () => reopenPregnancy(p)),
      button(p.hidden ? '홈에 다시 보이기' : '홈에서 숨기기', () => setHidden(p, !p.hidden)));
  }
  if (acts.childElementCount) el.append(acts);
}

function hero(s) {
  const p = s.preg, box = h('div', 'hero');
  if (p.status === 'born') {
    box.append(h('div', 'hero-big', `👶 ${s.child.name}`), h('div', 'hero-sub', `${fmtDate(s.child.birthDate)} 출생 · 예정일 ${fmtDate(p.dueDate)}`));
    return box;
  }
  const { weeks, days, dday } = pregnancyAge(p.dueDate, today());
  if (p.status === 'ended') box.append(h('div', 'hero-sub', '종료로 표시된 임신 기록이에요.'));
  else box.append(h('div', 'hero-big', `${weeks}주 ${days}일`));
  box.append(h('div', 'hero-sub', `예정일 ${fmtDate(p.dueDate)}${p.status === 'ended' ? '' : ` · ${ddayText(dday)}`}`));
  return box;
}

function block(title, action) {
  const sec = h('section', 'block'), head = h('div', 'block-head');
  head.append(h('h2', null, title));
  if (action) head.append(action);
  sec.append(head);
  return sec;
}

function timerCard(list) {
  const rows = contractions(list), running = rows.findLast(r => !r.end);
  const sec = block('⏱ 진통 타이머'), line = h('p', 'block-line');
  if (running) line.append('진통 중 · ', sinceEl(running.start));
  else if (rows.length) {
    const sum = contractionSummary(rows, Date.now());
    line.textContent = `마지막 진통 ${fmtTime(rows.at(-1).start)}${sum.count ? ` · 최근 1시간 ${sum.count}회` : ''}`;
  } else line.textContent = '진통이 오면 시작·끝을 눌러 간격과 지속시간을 기록해요.';
  sec.append(line, button(running ? '⏱ 타이머 열기 (진통 중)' : '⏱ 진통 타이머 열기', () => go({ ...state.view, panel: 'timer' }), 'btn big wide'));
  return sec;
}

function questionBlock(p, list) {
  const open = list.filter(r => !r.data.done).sort((a, b) => a.at - b.at), done = list.filter(r => r.data.done);
  const sec = block('❓ 다음 진료 때 물어볼 것', p.status === 'active' ? button('＋ 추가', () => addQuestions(p), 'btn small') : null);
  if (!list.length) sec.append(h('p', 'hint', '진료 때 물어볼 것을 적어 두면 여기에 모여요.'));
  sec.append(...open.map(questionRow));
  if (done.length) {
    sec.append(button(`물어본 질문 ${done.length}개 ${showDone ? '접기 ▴' : '보기 ▾'}`, () => { showDone = !showDone; render(); }, 'link-btn'));
    if (showDone) sec.append(...done.map(questionRow));
  }
  return sec;
}
function questionRow(r) {
  const row = h('div', `q-row${r.data.done ? ' done' : ''}`);
  const check = button(r.data.done ? '✓' : '', () => updateRecord(r.id, { 'data.done': !r.data.done }), 'check');
  check.setAttribute('aria-label', r.data.done ? '물어봤어요 (누르면 취소)' : '물어봤어요');
  check.setAttribute('aria-pressed', !!r.data.done);
  const body = button('', () => editQuestion(r), 'q-text');
  body.append(h('span', null, r.data.text));
  if (r.data.answer) body.append(h('span', 'hint', r.data.answer));
  row.append(check, body);
  return row;
}

function checkupBlock(p, list) {
  const sec = block('🩺 검진 기록', p.status === 'active' ? button('＋ 기록', () => addCheckup(p), 'btn small') : null);
  if (!list.length) sec.append(h('p', 'hint', '검진 날짜 · 체중 · 혈압 · 메모를 기록해요.'));
  for (const r of list) {
    const row = button('', () => editCheckup(r), 'rec-row');
    row.append(h('span', 'rec-date', fmtDay(dateStr(r.at))), h('span', 'rec-text', checkupText(r)), h('span', 'rec-who', memberLabel(r.createdBy)));
    sec.append(row);
  }
  return sec;
}

// 진통 타이머 화면: 큰 버튼 하나(시작 ↔ 끝), 최근 1시간 요약, 목록. 화면 꺼짐 방지
function timerPanel(p, el, w) {
  keepAwake();
  const top = h('div', 'panel-head');
  top.append(button('‹ 임신 탭', () => go({ ...state.view, panel: undefined }), 'btn small'), h('h2', null, '⏱ 진통 타이머'));
  // 진통 중인지 모르는 채로 버튼을 보여 주면 누를 때마다 새 진통이 생김 → 불러온 뒤에만 버튼
  const notice = loadNotice(w);
  if (notice) return el.append(top, notice);
  const rows = contractions(w.list), running = rows.findLast(r => !r.end);
  const ongoing = rows.filter(r => !r.end);

  const big = button('', () => {
    if (Date.now() - lastTap < 800) return; // 실수로 두 번 빨리 누르면 시작하자마자 끝나지 않게
    lastTap = Date.now();
    if (running) endContraction(running.rec); else startContraction(p);
  }, `timer-btn${running ? ' on' : ''}`);
  if (running) big.append(h('span', 'timer-label', '진통 끝'), sinceEl(running.start, 'clock', 'timer-clock'));
  else {
    big.append(h('span', 'timer-label', '진통 시작'));
    if (rows.length) big.append(h('span', 'timer-sub', '지난 진통 시작 후'), sinceEl(rows.at(-1).start, 'clock', 'timer-sub'));
  }

  const sum = contractionSummary(rows, Date.now()), stats = h('div', 'timer-stats');
  for (const [label, value] of [['최근 1시간', `${sum.count}회`], ['평균 간격', sum.avgInterval ? fmtDur(sum.avgInterval) : '–'], ['평균 지속', sum.avgDuration ? fmtDur(sum.avgDuration) : '–']]) {
    const s = h('div', 'stat');
    s.append(h('span', 'stat-label', label), h('span', 'stat-value', value));
    stats.append(s);
  }

  const list = h('div', 'c-list');
  const head = h('div', 'c-row c-head');
  head.append(h('span', null, '시작'), h('span', null, '지속'), h('span', null, '간격'));
  list.append(head);
  for (const r of rows.slice(-50).reverse()) {
    const row = button('', () => editContraction(r.rec), 'c-row');
    row.append(h('span', null, fmtTime(r.start, true)), h('span', null, r.end ? fmtDur(r.duration) : '진행 중'), h('span', null, r.interval != null ? fmtDur(r.interval) : '–'));
    list.append(row);
  }
  // 진행 중이 여러 개 = 버튼을 여러 번 눌러 생긴 것 → 한 번에 정리
  const extra = [];
  if (ongoing.length > 1) {
    const box = h('div', 'notice');
    box.append(h('p', null, `진행 중으로 남은 진통이 ${ongoing.length}개예요. 실수로 여러 번 눌러 생긴 거라면 한 번에 지울 수 있어요.`),
      button(`진행 중 ${ongoing.length}개 지우기`, () => {
        if (confirm(`진행 중인 진통 기록 ${ongoing.length}개를 지울까요? 끝난 진통 기록은 그대로예요.`)) ongoing.forEach(r => deleteRecord(r.rec.id));
      }, 'btn small danger'));
    extra.push(box);
  }
  el.append(top, ...extra, big, stats, ...(rows.length ? [list] : []),
    h('p', 'hint', '진통이 시작되면 "진통 시작", 멎으면 "진통 끝"을 눌러요. 간격은 앞 진통이 시작된 때부터 이번 진통이 시작된 때까지예요. 이 화면은 꺼지지 않게 유지돼요.'));
}
