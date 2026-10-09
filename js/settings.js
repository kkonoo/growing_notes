// 설정 창: 계정, 나(기록자 표시), 가족(구성원·초대), 아이·임신 목록, 내보내기, 단계 경계 나이, 화면
import { state, prefs, savePrefs, render, go, eduStartAge, nameOf, emojiOf, findSubject } from './state.js';
import {
  logout, me, myUid, saveMe, saveSettings, createInvite, cancelInvite, checkInvite, joinFamily,
  formatCode, cleanCode, inviteLink, famCol,
} from './family.js';
import { setHidden, editSubject } from './profiles.js';
import { F } from './db.js';
import { dateStr } from './stage.js';
import { toCSV, toBackup, withDates } from './export.js';
import { $, h, button, toast, openForm, emojiPicker, fmtDate, download } from './ui.js';

const MY_EMOJI = ['🙂', '👩', '👨', '👵', '👴', '🧑', '🐻', '🐰'];

export function openSettings() {
  $('myName').value = me().name;
  $('eduAge').value = eduStartAge();
  $('themeSelect').value = prefs.theme || '';
  $('inviteBox').hidden = true;
  renderSettings();
  $('settings').showModal();
}

// 동기화로 바뀌는 부분만 다시 그림 (입력 중인 칸은 그대로)
export function renderSettings() {
  $('accountInfo').textContent = `${state.user.email}(으)로 로그인했어요.`;
  $('myEmoji').replaceChildren(emojiPicker(MY_EMOJI, me().emoji, emoji => saveMe({ emoji })).el);

  const members = (state.family?.members || []).map(uid => {
    const m = state.members[uid] || { name: '…', emoji: '🙂' };
    return h('div', 'list-row', `${m.emoji} ${m.name}${uid === myUid() ? ' (나)' : ''}`);
  });
  $('memberList').replaceChildren(...members);

  const rows = [];
  const kids = state.children.slice().sort((a, b) => (a.birthDate < b.birthDate ? -1 : 1));
  for (const c of kids) rows.push(subjectRow(findSubject(`c:${c.id}`), `${fmtDate(c.birthDate)} 출생`));
  for (const p of state.pregnancies.filter(x => x.status !== 'born')) {
    const s = findSubject(`p:${p.id}`);
    const status = p.status === 'ended' ? '종료' : '진행 중';
    const row = subjectRow(s, `${status}${p.hidden ? ' · 홈에서 숨김' : ''}`);
    if (p.hidden) row.append(button('다시 보이기', () => setHidden(p, false), 'btn small'));
    rows.push(row);
  }
  $('subjectList').replaceChildren(...(rows.length ? rows : [h('p', 'hint', '아직 없어요. 홈에서 등록할 수 있어요.')]));

  // 내보내기 대상: 전체 + 아이별(이어진 임신 기록 포함) + 출산 전 임신
  const sel = $('exportScope'), cur = sel.value;
  const options = [['all', '전체'], ...kids.map(c => [`c:${c.id}`, `${c.emoji || '👶'} ${c.name}`]),
    ...state.pregnancies.filter(p => p.status !== 'born').map(p => [`p:${p.id}`, `${p.emoji || '🤰'} ${p.nickname || '뱃속 아기'} (임신)`])];
  sel.replaceChildren(...options.map(([value, label]) => Object.assign(h('option', null, label), { value })));
  if (options.some(([v]) => v === cur)) sel.value = cur;
}
function subjectRow(s, sub) {
  const row = h('div', 'list-row');
  const open = button('', () => { $('settings').close(); go({ name: 'subject', key: s.key }); }, 'list-main');
  open.append(h('span', null, `${emojiOf(s)} ${nameOf(s)}`), h('span', 'hint', sub));
  row.append(open, button('고치기', () => editSubject(s), 'btn small'));
  return row;
}

$('closeSettings').addEventListener('click', () => $('settings').close());
$('logoutBtn').addEventListener('click', logout);
$('myName').addEventListener('change', e => {
  const name = e.target.value.trim().slice(0, 10);
  if (name) saveMe({ name }); else e.target.value = me().name;
});
$('eduAge').addEventListener('change', e => {
  const n = Math.round(+e.target.value);
  if (n >= 1 && n <= 10) saveSettings({ eduStartAge: n });
  else { e.target.value = eduStartAge(); toast('1부터 10 사이로 적어 주세요.'); }
});

// ---------- 내보내기 ----------
// 대상 → 읽을 기록의 subjectId(전체면 null), 담을 아이·임신, 파일 이름, JSON의 scope
function exportScope(key) {
  const [kind, id] = key.split(':');
  if (kind === 'c') {
    const c = state.children.find(x => x.id === id), p = state.pregnancies.find(x => x.id === c.pregnancyId);
    return { ids: [c.id, ...(p ? [p.id] : [])], children: [c], pregnancies: p ? [p] : [], label: c.name, scope: { kind: 'child', childId: c.id } };
  }
  if (kind === 'p') {
    const p = state.pregnancies.find(x => x.id === id);
    return { ids: [p.id], children: [], pregnancies: [p], label: p.nickname || '임신', scope: { kind: 'pregnancy', pregnancyId: p.id } };
  }
  return { ids: null, children: state.children, pregnancies: state.pregnancies, label: '전체', scope: { kind: 'all' } };
}
// 기록의 아이 이름: 아이 기록은 아이 이름, 임신 기록은 출산했으면 그 아이 이름 아니면 태명
function subjectName(id) {
  const c = state.children.find(x => x.id === id);
  if (c) return c.name;
  const p = state.pregnancies.find(x => x.id === id);
  if (!p) return '';
  return state.children.find(x => x.id === p.childId)?.name || p.nickname || '뱃속 아기';
}
async function exportData(kind) {
  const btns = [$('csvBtn'), $('jsonBtn')];
  btns.forEach(b => { b.disabled = true; });
  try {
    const sc = exportScope($('exportScope').value);
    const col = famCol('records');
    const snap = await F.getDocs(sc.ids ? F.query(col, F.where('subjectId', 'in', sc.ids)) : col);
    if (snap.metadata.fromCache) toast('인터넷에 연결되지 않아 이 기기에 저장된 기록만 담았어요.', 4000);
    const records = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
    const name = `growing-${sc.label.replace(/[\\/:*?"<>|\s]+/g, '_')}-${dateStr()}`;
    if (kind === 'csv') {
      const memberName = uid => state.members[uid]?.name || '';
      download(`${name}.csv`, toCSV(records.map(withDates), { subjectName, memberName }), 'text/csv;charset=utf-8');
    } else {
      const members = Object.entries(state.members).map(([uid, m]) => ({ uid, name: m.name, emoji: m.emoji }));
      const backup = toBackup({ familyId: state.familyId, scope: sc.scope, settings: state.family?.settings || {}, members, pregnancies: sc.pregnancies, children: sc.children, records });
      download(`${name}.json`, JSON.stringify(backup, null, 2), 'application/json');
    }
    toast(`${records.length}개 기록을 내보냈어요.`);
  } catch (e) {
    console.error(e);
    toast(`내보내지 못했어요 (${e.code || e.message})`, 4000);
  } finally {
    btns.forEach(b => { b.disabled = false; });
  }
}
$('csvBtn').addEventListener('click', () => exportData('csv'));
$('jsonBtn').addEventListener('click', () => exportData('json'));

// ---------- 초대 ----------
$('inviteBtn').addEventListener('click', async () => {
  const btn = $('inviteBtn');
  btn.disabled = true;
  try {
    const { code, expiresAt } = await createInvite();
    showInvite(code, expiresAt);
  } catch (e) {
    console.error(e);
    toast(e.message === 'offline' || e.message === 'timeout' ? '초대를 만들려면 인터넷 연결이 필요해요.' : `초대를 만들지 못했어요 (${e.code || e.message})`, 3500);
  } finally { btn.disabled = false; }
});
function showInvite(code, expiresAt) {
  const box = $('inviteBox'), link = inviteLink(code);
  const until = expiresAt.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const btns = h('div', 'row');
  if (navigator.share) btns.append(button('📤 공유하기', () => navigator.share({ title: '성장노트 초대', text: `성장노트 가족 공간 초대 코드: ${formatCode(code)}`, url: link }).catch(() => {}), 'btn primary'));
  btns.append(button('🔗 링크 복사', () => copy(link)), button('코드 복사', () => copy(formatCode(code))),
    button('초대 취소', () => { cancelInvite(code); box.hidden = true; toast('초대를 취소했어요.'); }, 'btn danger'));
  box.replaceChildren(
    h('div', 'invite-code', formatCode(code)),
    h('p', 'hint', `${until}까지, 한 번만 쓸 수 있어요. 배우자가 링크를 열거나 설정 › 초대 코드 입력에 코드를 넣으면 돼요.`),
    btns,
  );
  box.hidden = false;
}
function copy(text) {
  navigator.clipboard.writeText(text).then(() => toast('복사했어요.'), () => prompt('복사해서 보내 주세요.', text));
}

$('joinBtn').addEventListener('click', async () => {
  const v = await openForm({ title: '💌 초대 코드 입력', fields: [{ key: 'code', label: '초대 코드', placeholder: 'XXXXX-XXXXX', required: true, maxLength: 20 }], submit: '확인' });
  if (v) startJoin(v.code);
});

// 초대 링크(#join=코드)로 들어왔을 때도 여기로
export async function startJoin(raw) {
  const code = cleanCode(raw);
  if (!/^[A-HJKMNP-Z2-9]{10}$/.test(code)) return alert('초대 코드는 10자리예요. 다시 확인해 주세요.');
  const r = await checkInvite(code);
  if (r.error) return alert(r.error);
  const mine = state.children.length + state.pregnancies.length;
  let msg = `초대한 사람: ${r.invite.inviterName}\n이 가족 공간에 합류할까요? 같은 아이·임신 기록을 함께 보고 쓸 수 있어요.`;
  if (mine) msg += `\n\n지금 내 공간에 등록된 아이·임신 ${mine}개는 옮겨지지 않아요. (원래 공간에 그대로 남아요)`;
  if (!confirm(msg)) return;
  try {
    await joinFamily(code, r.invite);
    if ($('settings').open) $('settings').close();
    go({ name: 'home' });
    toast('🎉 가족 공간에 합류했어요!', 3000);
  } catch (e) {
    console.error(e);
    alert(e.message === 'invite-invalid' ? '이미 사용됐거나 만료된 초대예요. 새 초대를 받아 주세요.' : `합류하지 못했어요 (${e.code || e.message})`);
  }
}

// ---------- 화면 ----------
export function applyTheme() {
  if (prefs.theme) document.documentElement.dataset.theme = prefs.theme;
  else delete document.documentElement.dataset.theme;
  $('themeColor').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
$('themeSelect').addEventListener('change', e => {
  if (e.target.value) prefs.theme = e.target.value; else delete prefs.theme;
  savePrefs();
  applyTheme();
});
const FONT_DEFAULT = 16;
export function applyFont() {
  const f = prefs.font || FONT_DEFAULT;
  document.documentElement.style.setProperty('--font', `${f}px`);
  $('fontRange').value = f;
  $('fontVal').textContent = `${f}px`;
}
$('fontRange').addEventListener('input', e => { prefs.font = +e.target.value; savePrefs(); applyFont(); render(); });
