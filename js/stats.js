// 기록 계산 (순수 함수, DOM·Firebase 없음 → Node에서 테스트). 시각은 Date 또는 ms
// 판정은 하지 않고 계산한 값만 돌려줌

// 걸린 시간 글자: '48초', '5분 12초', '1시간 5분'
export function fmtDur(ms) {
  const s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return m ? `${h}시간 ${m}분` : `${h}시간`;
  if (m) return sec ? `${m}분 ${sec}초` : `${m}분`;
  return `${sec}초`;
}
// 타이머 글자: '0:07', '12:34', '1:02:03'
export function fmtClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

// 진통: [{ id, start, end(없으면 진행 중) }] → 오래된 순으로, 지속시간(끝-시작)과 간격(앞 진통 시작 → 이번 시작) 붙임
export function contractionRows(list) {
  const sorted = list.slice().sort((a, b) => a.start - b.start);
  return sorted.map((c, i) => ({
    ...c,
    duration: c.end ? c.end - c.start : null,
    interval: i ? c.start - sorted[i - 1].start : null,
  }));
}
// 최근 windowMs(기본 1시간) 안에 시작한 진통의 횟수·평균 간격·평균 지속시간 (없으면 null)
export function contractionSummary(rows, now, windowMs = 3600e3) {
  const recent = rows.filter(r => now - r.start <= windowMs);
  const avg = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
  return {
    count: recent.length,
    avgInterval: avg(recent.map(r => r.interval).filter(x => x != null)),
    avgDuration: avg(recent.map(r => r.duration).filter(x => x != null)),
  };
}

// 분 단위 글자: '0분', '40분', '2시간 10분'
export function fmtMins(ms) {
  const m = Math.max(0, Math.floor(ms / 60000)), h = Math.floor(m / 60);
  if (!h) return `${m}분`;
  return m % 60 ? `${h}시간 ${m % 60}분` : `${h}시간`;
}
// '방금' 또는 '2시간 10분 전'
export const fmtAgo = ms => (ms < 60000 ? '방금' : `${fmtMins(ms)} 전`);

// ---------- 육아: 하루(기기 현지 0시~24시) 정리 ----------
export const DAY = 86400000;
export const startOfDay = (d, plusDays = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + plusDays);

// records = 한 아이의 기록 [{ type, at: Date, data }]. 잠은 이 날에 걸친 만큼만 (자는 중이면 now까지)
export function babyDay(records, start, now = Date.now()) {
  const s = +start, e = +startOfDay(start, 1), inDay = r => +r.at >= s && +r.at < e;
  const feeds = records.filter(r => r.type === 'feeding' && inDay(r));
  const diapers = records.filter(r => r.type === 'diaper' && inDay(r));
  const sleeps = records.filter(r => r.type === 'sleep').map(r => {
    const end = r.data.endAt ? +r.data.endAt : Math.max(now, +r.at);
    return { rec: r, from: Math.max(+r.at, s), to: Math.min(end, e), ongoing: !r.data.endAt };
  }).filter(x => x.to > x.from);
  return {
    feeds, diapers, sleeps,
    ml: feeds.reduce((sum, r) => sum + (typeof r.data.ml === 'number' ? r.data.ml : 0), 0),
    sleepMs: sleeps.reduce((sum, x) => sum + (x.to - x.from), 0),
    pee: diapers.filter(r => r.data.pee).length,
    poo: diapers.filter(r => r.data.poo).length,
  };
}
