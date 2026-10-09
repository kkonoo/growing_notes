// 성장노트 시작점: Firebase 시작 → 로그인 → 내 가족 공간 → 화면 그리기. 폰 뒤로 가기, 동기화 상태 표시
import { initFirebase, login, A, auth, EMULATOR } from './db.js';
import { state, prefs, setRenderer, render, go, subjects, findSubject, familyReady, hasPending, nameOf, emojiOf } from './state.js';
import { startUser } from './family.js';
import { renderHome } from './home.js';
import { renderSubject } from './subject.js';
import { openSettings, renderSettings, startJoin, applyTheme, applyFont } from './settings.js';
import { $, h, button, toast } from './ui.js';
import { beginRender, endRender } from './live.js';

// ---------- 초대 링크(#join=코드): 로그인·가족 공간을 불러온 뒤 합류 확인 ----------
const JKEY = 'growing.join';
const session = {
  get: () => { try { return sessionStorage.getItem(JKEY); } catch { return null; } },
  set: v => { try { if (v) sessionStorage.setItem(JKEY, v); else sessionStorage.removeItem(JKEY); } catch { /* 없어도 동작 */ } },
};
function captureJoin() {
  const m = location.hash.match(/join=([A-Za-z0-9-]+)/);
  if (!m) return;
  session.set(m[1]);
  history.replaceState(history.state, '', location.pathname + location.search);
  render();
}
captureJoin();
addEventListener('hashchange', captureJoin); // 앱이 열려 있는 상태에서 링크를 연 경우
let joining = false;
function maybeJoin() {
  const code = session.get();
  if (!code || joining) return;
  session.set(null);
  joining = true;
  setTimeout(() => startJoin(code).finally(() => { joining = false; })); // 그리기가 끝난 뒤 확인 창
}

// ---------- 그리기 ----------
function msgView(emoji, text, ...extra) {
  const s = h('section', 'message');
  s.append(h('div', 'empty', emoji), h('p', 'empty-text', text), ...extra);
  return s;
}
function loginView() {
  const s = h('section', 'login');
  s.append(h('div', 'login-emoji', '🌱'), h('h1', null, '성장노트'), h('p', null, '임신부터 육아·교육까지\n가족이 함께 쓰는 기록장이에요.'));
  if (session.get()) s.append(h('p', 'note', '💌 초대를 받으셨네요! 로그인하면 가족 공간에 합류할 수 있어요.'));
  s.append(button('Google로 로그인', login, 'btn primary big'), h('p', 'hint', '기록은 가족으로 초대한 사람만 볼 수 있어요.'));
  return s;
}

function renderSync() {
  const el = $('syncState');
  el.hidden = !state.user;
  const pending = hasPending();
  el.textContent = !navigator.onLine ? `📴 오프라인${pending ? ' · 올릴 기록 있음' : ''}` : pending ? '⏳ 올리는 중' : '☁️ 동기화됨';
  el.dataset.state = !navigator.onLine ? 'offline' : pending ? 'pending' : 'ok';
}

// 위 줄: 🏠 + 아이·임신 칩. 누르면 그 아이 화면 (지금 단계 탭)
function renderChips(show) {
  const nav = $('chips'), list = show ? subjects() : [];
  nav.hidden = !list.length;
  if (!list.length) return nav.replaceChildren();
  const cur = state.view.name === 'subject' ? findSubject(state.view.key)?.key : null;
  const chip = (label, on, onClick) => { const b = button(label, onClick, `chip${on ? ' on' : ''}`); b.setAttribute('aria-pressed', on); return b; };
  nav.replaceChildren(chip('🏠 홈', !cur, () => go({ name: 'home' })),
    ...list.map(s => chip(`${emojiOf(s)} ${nameOf(s)}`, s.key === cur, () => go({ name: 'subject', key: s.key }))));
  nav.querySelector('.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

// 그리기 + 이번 화면에서 안 쓰게 된 구독·타이머 정리 (live.js)
function renderApp() {
  beginRender();
  try { draw(); } finally { endRender(); }
}
function draw() {
  const main = $('main'), ready = !!state.user && !state.error && familyReady();
  delete document.body.dataset.quickbar; // 육아 탭이 다시 켬
  $('settingsBtn').hidden = !ready;
  renderSync();
  renderChips(ready);
  if (!state.configured) {
    return main.replaceChildren(msgView('🔧', 'Firebase 설정이 필요해요.\nREADME의 「Firebase 설정」 순서대로 js/firebase-config.js를 채워 주세요.'));
  }
  if (state.user === undefined) return main.replaceChildren(msgView('🌱', state.error || '불러오는 중이에요…'));
  if (!state.user) return main.replaceChildren(loginView());
  if (state.error) return main.replaceChildren(msgView('⚠️', state.error));
  if (!familyReady()) {
    return main.replaceChildren(msgView('🌱', navigator.onLine ? '가족 공간을 불러오는 중이에요…' : '처음 한 번은 인터넷 연결이 필요해요.\n연결되면 자동으로 이어져요.'));
  }
  maybeJoin();
  const s = state.view.name === 'subject' && findSubject(state.view.key);
  if (s) renderSubject(main, s);
  else renderHome(main);
  if ($('settings').open) renderSettings();
}

// ---------- 시작 ----------
applyTheme();
applyFont();
if (prefs.last) state.view = prefs.last; // 마지막에 보던 화면 (밤중에 열면 바로 그 아이)
setRenderer(renderApp);
$('homeBtn').addEventListener('click', () => go({ name: 'home' }));
$('settingsBtn').addEventListener('click', openSettings);
addEventListener('online', render);
addEventListener('offline', render);
// 앱으로 돌아오면 다시 그림 (밤새 켜 둔 화면의 '오늘'이 어제로 남지 않게)
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
render();

try {
  state.configured = await initFirebase();
  if (state.configured) A.onAuthStateChanged(auth, user => { if (user) startUser(user); else { state.user = null; render(); } });
} catch (e) {
  console.error(e);
  state.error = '앱을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 열어 주세요.';
}
render();

// ---------- 폰: 뒤로 가기 ----------
// 기록을 한 칸 더 쌓아 두고, 뒤로 가기로 그 칸이 빠지면 앱 안에서 처리한 뒤 다시 쌓음 (살림노트와 같은 방식)
// 닫을 게 없으면 안내만 띄우고 2초 동안 안 쌓음 → 그사이 또 뒤로 가면 앱이 닫힘
if (matchMedia('(max-width: 900px)').matches) {
  const guard = () => history.pushState({ guard: true }, '');
  if (!history.state?.guard) guard();
  let exitTimer = null;
  const rearm = () => { clearTimeout(exitTimer); exitTimer = null; $('toast').classList.remove('show'); guard(); };
  addEventListener('pointerdown', () => { if (exitTimer) rearm(); });
  addEventListener('popstate', () => {
    const dlg = document.querySelector('dialog[open]');
    if (dlg) dlg.close();
    else if (state.view.panel) go({ ...state.view, panel: undefined }); // 진통 타이머 → 임신 탭
    else if (state.view.name !== 'home') go({ name: 'home' });
    else {
      toast('한 번 더 뒤로 가면 종료돼요', 2000);
      exitTimer = setTimeout(rearm, 2000);
      return;
    }
    guard();
  });
}

// 앱 설치(PWA)·오프라인용. 자동 테스트(Emulator)에서는 안 씀
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !EMULATOR) navigator.serviceWorker.register('sw.js');
