// 화면 공통: DOM 만들기, 토스트, 입력 창(폼), 날짜 글자
export const $ = id => document.getElementById(id);
export function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
export function button(label, onClick, cls = 'btn') {
  const b = h('button', cls, label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

let toastTimer;
// actions = [{ label, onClick }] → 토스트 안의 버튼 (예: 고치기 · 되돌리기)
export function toast(text, ms = 2200, actions = []) {
  const t = $('toast');
  t.replaceChildren(h('span', null, text), ...actions.map(a => button(a.label, () => { t.classList.remove('show'); a.onClick(); }, 'toast-btn')));
  t.classList.toggle('has-actions', actions.length > 0);
  // 설정 같은 창(dialog)이 열려 있어도 그 위에 보이게: 맨 위 층(popover)에 다시 올림
  if (t.showPopover) { if (t.matches(':popover-open')) t.hidePopover(); t.showPopover(); }
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

// 글자를 파일로 받기 (CSV·JSON 내보내기)
export function download(name, text, type) {
  const a = h('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const fmtDate = s => `${+s.slice(0, 4)}년 ${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;
export const fmtMD = s => `${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;
const WD = ['일', '월', '화', '수', '목', '금', '토'];
// 'YYYY-MM-DD' → '10월 9일 (금)', 올해가 아니면 연도도
export function fmtDay(s) {
  const d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const year = d.getFullYear() === new Date().getFullYear() ? '' : `${d.getFullYear()}년 `;
  return `${year}${d.getMonth() + 1}월 ${d.getDate()}일 (${WD[d.getDay()]})`;
}
// 시각 글자 (24시간): 밤중에 오전·오후를 헷갈리지 않게
const pad = n => String(n).padStart(2, '0');
export const fmtTime = (d, sec = false) => `${pad(d.getHours())}:${pad(d.getMinutes())}${sec ? `:${pad(d.getSeconds())}` : ''}`;
// <input type="datetime-local" step="1"> 값 ↔ Date (기기 현지 시각)
export const toLocalInput = (d, sec = true) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${fmtTime(d, sec)}`;
export const fromLocalInput = s => (s ? new Date(s) : null);

// 하나 고르기 줄: options = [{ value, label }]. get() = 고른 값
export function picker(options, value, onPick, { row = 'choice-row', btn = 'choice-btn' } = {}) {
  const wrap = h('div', row);
  let cur = value ?? options[0].value;
  const mark = () => wrap.querySelectorAll('button').forEach(b => {
    b.classList.toggle('on', b.dataset.v === String(cur));
    b.setAttribute('aria-pressed', b.dataset.v === String(cur));
  });
  for (const o of options) {
    const b = button(o.label, () => { cur = o.value; mark(); if (onPick) onPick(o.value); }, btn);
    b.dataset.v = o.value;
    wrap.append(b);
  }
  mark();
  return { el: wrap, get: () => cur };
}
// 이모지 고르기 줄. 지금 값이 목록에 없으면 맨 앞에 붙임
export function emojiPicker(choices, value, onPick) {
  const cur = value || choices[0];
  return picker((choices.includes(cur) ? choices : [cur, ...choices]).map(e => ({ value: e, label: e })), cur, onPick, { row: 'emoji-row', btn: 'emoji-btn' });
}

// 입력 창: fields = [{ key, label, type: 'text'|'date'|'datetime-local'|'number'|'textarea'|'emoji'|'choice', value, required,
//   placeholder, max, min, step, inputMode, choices(이모지), options(choice: [{ value, label }]), suggest(자동 완성 목록), hint, half(두 칸을 한 줄에) }]
// 저장 → { key: 값 } / 취소·닫기 → null / extra 버튼 → 그 버튼의 value
export function openForm({ title, fields, submit = '저장', extra = [], note }) {
  const dlg = $('formDlg'), form = $('formEl');
  const get = {};
  const rows = fields.map(f => {
    if (f.type === 'emoji' || f.type === 'choice') {
      const p = f.type === 'emoji' ? emojiPicker(f.choices, f.value) : picker(f.options, f.value);
      get[f.key] = p.get;
      const row = h('div', 'field');
      row.append(h('span', 'field-label', f.label), p.el);
      return row;
    }
    const row = h('label', 'field');
    const i = h(f.type === 'textarea' ? 'textarea' : 'input');
    if (f.type === 'textarea') i.rows = 3; else i.type = f.type || 'text';
    i.name = f.key;
    i.value = f.value ?? '';
    for (const k of ['placeholder', 'max', 'min', 'step', 'maxLength', 'inputMode']) if (f[k] != null) i[k] = f[k];
    i.required = !!f.required;
    get[f.key] = () => i.value.trim();
    row.append(h('span', 'field-label', f.label), i);
    if (f.suggest?.length) { // 예전에 쓴 값 자동 완성 (예: 책 제목)
      const list = h('datalist');
      list.id = `suggest-${f.key}`;
      list.append(...f.suggest.map(v => Object.assign(h('option'), { value: v })));
      i.setAttribute('list', list.id);
      row.append(list);
    }
    if (f.hint) row.append(h('span', 'hint', f.hint));
    return row;
  });
  // half 두 개가 이어지면 한 줄로
  const laid = [];
  for (let k = 0; k < rows.length; k++) {
    if (fields[k].half && fields[k + 1]?.half) {
      const pair = h('div', 'field-pair');
      pair.append(rows[k], rows[++k]);
      laid.push(pair);
    } else laid.push(rows[k]);
  }
  const btns = h('div', 'form-btns');
  const cancel = button('취소', () => dlg.close());
  btns.append(cancel);
  for (const x of extra) btns.append(button(x.label, () => { dlg.close(); done(x.value); }, `btn ${x.cls || ''}`));
  const ok = h('button', 'btn primary', submit);
  ok.type = 'submit';
  btns.append(ok);
  form.replaceChildren(h('h2', null, title), ...(note ? [h('p', 'hint', note)] : []), ...laid, btns);

  let done;
  const result = new Promise(res => { done = v => { done = () => {}; res(v); }; });
  form.onsubmit = e => {
    e.preventDefault();
    const v = {};
    for (const k in get) v[k] = get[k]();
    dlg.close();
    done(v);
  };
  dlg.onclose = () => { if (!dlg.open) done(null); }; // close는 늦게 옴: 그새 다시 연 창은 그대로
  dlg.showModal();
  return result;
}
