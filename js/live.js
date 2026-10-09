// 화면에 보이는 동안만 살아 있는 것들 (기록 구독, 1초 타이머, 화면 꺼짐 방지).
// 그릴 때마다 keep(key, start)로 "아직 필요해요"를 표시 → 다 그린 뒤 표시 안 된 것은 stop()으로 정리
import { fmtClock, fmtDur, fmtMins, fmtAgo } from './stats.js';

const live = new Map();
let touched = new Set();
export function keep(key, start) {
  touched.add(key);
  if (!live.has(key)) live.set(key, start());
  return live.get(key);
}
// 지금 것을 정리하고 잊음 → 다음 그리기에서 keep이 새로 시작
export function drop(key) {
  live.get(key)?.stop?.();
  live.delete(key);
}
export function beginRender() { touched = new Set(); }
export function endRender() {
  for (const [key, v] of live) if (!touched.has(key)) { v.stop?.(); live.delete(key); }
}

// 흐르는 시간: data-since(ms)가 있는 요소의 글자를 1초마다 바꿈.
// data-fmt = clock('1:23') | dur('5분 12초') | mins('40분') | ago('2시간 10분 전')
const FMT = { clock: fmtClock, dur: fmtDur, mins: fmtMins, ago: fmtAgo };
export function liveClock() {
  keep('clock', () => {
    const tick = () => document.querySelectorAll('[data-since]').forEach(el => {
      el.textContent = FMT[el.dataset.fmt](Date.now() - +el.dataset.since);
    });
    const t = setInterval(tick, 1000);
    return { stop: () => clearInterval(t) };
  });
}

// 화면 꺼짐 방지 (진통 타이머). 다른 앱에 다녀오면 풀리므로 다시 요청
export function keepAwake() {
  keep('wake', () => {
    let lock = null, stopped = false;
    const get = () => navigator.wakeLock?.request('screen').then(l => { if (stopped) l.release(); else lock = l; }).catch(() => {});
    const onVisible = () => { if (document.visibilityState === 'visible' && !stopped) get(); };
    get();
    document.addEventListener('visibilitychange', onVisible);
    return { stop() { stopped = true; lock?.release().catch(() => {}); document.removeEventListener('visibilitychange', onVisible); } };
  });
}

// 흐르는 시간을 보여 주는 글자 하나 (처음 글자도 바로 채움)
export function sinceEl(since, fmt = 'clock', cls) {
  liveClock();
  const el = document.createElement('span');
  if (cls) el.className = cls;
  el.dataset.since = +since;
  el.dataset.fmt = fmt;
  el.textContent = FMT[fmt](Date.now() - +since);
  return el;
}
