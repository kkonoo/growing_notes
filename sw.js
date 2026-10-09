// 오프라인에서도 열리게 하는 서비스 워커.
// 앱 파일: 온라인이면 항상 새 파일(업데이트 바로 반영), 오프라인이면 저장해 둔 파일.
// Firebase SDK(gstatic): 버전이 주소에 있어서 안 바뀜 → 저장해 둔 것 먼저. 이게 있어야 비행기 모드에서 앱을 새로 열어도 기록할 수 있음
// 같은 주소(kkonoo.github.io)의 다른 앱과 캐시 저장소를 같이 쓰므로 이름을 다르게, 남의 캐시는 지우지 않기
const CACHE = 'growing-v1';
const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/'; // js/db.js 의 SDK와 같은 버전
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/db.js', 'js/firebase-config.js', 'js/state.js', 'js/ui.js', 'js/stage.js', 'js/family.js',
  'js/profiles.js', 'js/home.js', 'js/subject.js', 'js/settings.js', 'js/tab-pregnancy.js', 'js/tab-baby.js', 'js/tab-edu.js',
  'js/live.js', 'js/stats.js', 'js/records.js', 'js/timeline.js', 'js/pattern.js', 'js/export.js', 'js/tips.js',
  'icons/app-192.png', 'icons/app-512.png', 'icons/app-maskable-192.png', 'icons/app-maskable-512.png',
];
const SDK_FILES = ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(f => SDK + f);

self.addEventListener('install', e => {
  self.skipWaiting(); // 새 서비스 워커를 앱을 껐다 켜지 않아도 바로 사용
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([
    c.addAll(SHELL),
    c.addAll(SDK_FILES).catch(() => {}), // 못 받으면 처음 쓸 때 저장 (아래 fetch)
  ])));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.startsWith(SDK)) {
    e.respondWith(caches.match(e.request, { cacheName: CACHE }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    })));
    return;
  }
  if (new URL(url).origin !== location.origin) return; // 로그인·Firestore 등 다른 요청은 건드리지 않음
  e.respondWith(
    // no-cache: 브라우저 캐시(GitHub Pages는 10분)를 쓰기 전에 서버에 바뀌었는지 확인
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { cacheName: CACHE, ignoreSearch: true }))
  );
});
