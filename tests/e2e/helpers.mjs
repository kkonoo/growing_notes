// E2E 테스트 도구: 앱 파일 서버 + 브라우저(Playwright) + Firebase Emulator 연결
// 실행: npm run test:e2e  (Emulator를 띄운 뒤 tests/e2e/*.test.mjs 실행). 가짜 계정·가짜 데이터만 씀
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SDK_DIR = path.join(ROOT, 'node_modules/firebase');
const PROJECT = 'demo-growing';
export const PORT = 8767;
export const APP = `http://localhost:${PORT}/?emulator`;
export const TZ = 'Asia/Seoul';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
export function startServer() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || rel.startsWith('node_modules') || rel.startsWith('tests')) { res.writeHead(404).end(); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': `${TYPES[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(ok => server.listen(PORT, () => ok(server)));
}

export const launch = () => chromium.launch();

// 한 사람 = 브라우저 컨텍스트 하나 (기기 하나와 같음: 저장소가 따로)
export async function person(browser) {
  const context = await browser.newContext({ serviceWorkers: 'block', timezoneId: TZ, locale: 'ko-KR', viewport: { width: 390, height: 844 } });
  // gstatic의 Firebase SDK → 같은 버전의 npm 파일 (이 테스트 환경에서는 gstatic에 못 감)
  await context.route('https://www.gstatic.com/firebasejs/12.19.0/*', route => route.fulfill({
    path: path.join(SDK_DIR, path.basename(new URL(route.request().url()).pathname)),
    contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' },
  }));
  await context.route('https://cdn.jsdelivr.net/**', route => route.abort()); // 글꼴은 없어도 됨
  const page = await context.newPage();
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); }); // confirm·alert는 모두 "확인"
  page.on('pageerror', e => console.error('[page error]', e.message));
  return { context, page, dialogs };
}

// 가짜 Google 계정으로 로그인 (Emulator 전용 함수, js/db.js)
export async function login(page, sub, name, hash = '') {
  await page.goto(APP + hash);
  await page.getByRole('button', { name: 'Google로 로그인' }).waitFor();
  await page.evaluate(([s, n]) => window.__emuLogin(s, `${s}@example.com`, n), [sub, name]);
  await page.locator('.home').waitFor();
}
export const uidOf = page => page.evaluate(async () => (await import('/js/db.js')).auth.currentUser.uid);

export async function clearEmulators() {
  await fetch(`http://localhost:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://localhost:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

// 입력 창 채우고 저장
export async function fillForm(page, values, submit) {
  const form = page.locator('#formEl');
  await form.waitFor();
  for (const [k, v] of Object.entries(values)) await form.locator(`input[name="${k}"]`).fill(v);
  await form.getByRole('button', { name: submit }).click();
}

// 'YYYY-MM-DD' (한국 시간 기준 오늘 ± n일)
export function dayFromToday(n = 0) {
  const d = new Date(Date.now() + n * 86400000);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(d);
}
// 홈 카드 글자 (n개가 그려질 때까지 기다림). 줄바꿈 없이 이어 붙인 글자
export async function cardTexts(page, n) {
  await page.locator('.home').waitFor();
  if (n) await page.locator('.card').nth(n - 1).waitFor();
  return page.locator('.card').allTextContents();
}
