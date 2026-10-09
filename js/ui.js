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
export function toast(text, ms = 2200) {
  const t = $('toast');
  t.textContent = text;
  // 설정 같은 창(dialog)이 열려 있어도 그 위에 보이게: 맨 위 층(popover)에 다시 올림
  if (t.showPopover) { if (t.matches(':popover-open')) t.hidePopover(); t.showPopover(); }
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

export const fmtDate = s => `${+s.slice(0, 4)}년 ${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;
export const fmtMD = s => `${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;

// 이모지 고르기 줄. 지금 값이 목록에 없으면 맨 앞에 붙임. get() = 고른 값
export function emojiPicker(choices, value, onPick) {
  const wrap = h('div', 'emoji-row');
  let cur = value || choices[0];
  const mark = () => wrap.querySelectorAll('.emoji-btn').forEach(b => b.classList.toggle('on', b.dataset.e === cur));
  for (const e of choices.includes(cur) ? choices : [cur, ...choices]) {
    const b = button(e, () => { cur = e; mark(); if (onPick) onPick(e); }, 'emoji-btn');
    b.dataset.e = e;
    b.setAttribute('aria-label', e);
    wrap.append(b);
  }
  mark();
  return { el: wrap, get: () => cur };
}

// 입력 창: fields = [{ key, label, type: 'text'|'date'|'number'|'emoji', value, required, placeholder, max, min, choices, hint }]
// 저장 → { key: 값 } / 취소·닫기 → null / extra 버튼 → 그 버튼의 value
export function openForm({ title, fields, submit = '저장', extra = [], note }) {
  const dlg = $('formDlg'), form = $('formEl');
  const get = {};
  const rows = fields.map(f => {
    if (f.type === 'emoji') {
      const p = emojiPicker(f.choices, f.value);
      get[f.key] = p.get;
      const row = h('div', 'field');
      row.append(h('span', 'field-label', f.label), p.el);
      return row;
    }
    const row = h('label', 'field');
    const i = h('input');
    i.type = f.type || 'text';
    i.name = f.key;
    i.value = f.value ?? '';
    for (const k of ['placeholder', 'max', 'min', 'step', 'maxLength', 'inputMode']) if (f[k] != null) i[k] = f[k];
    i.required = !!f.required;
    get[f.key] = () => i.value.trim();
    row.append(h('span', 'field-label', f.label), i);
    if (f.hint) row.append(h('span', 'hint', f.hint));
    return row;
  });
  const btns = h('div', 'form-btns');
  const cancel = button('취소', () => dlg.close());
  btns.append(cancel);
  for (const x of extra) btns.append(button(x.label, () => { dlg.close(); done(x.value); }, `btn ${x.cls || ''}`));
  const ok = h('button', 'btn primary', submit);
  ok.type = 'submit';
  btns.append(ok);
  form.replaceChildren(h('h2', null, title), ...(note ? [h('p', 'hint', note)] : []), ...rows, btns);

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
