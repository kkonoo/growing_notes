// 내보내기 변환 (CSV · JSON 백업). 순수 함수 — DOM·Firebase 없음 → Node에서 테스트 (tests/logic.test.mjs)
// 시각은 기기 현지 시각 기준 (한국이면 KST)
import { contractionRows } from './stats.js';

const pad = n => String(n).padStart(2, '0');
// '2026-10-09 03:12:05' (R의 as.POSIXct가 그대로 읽는 모양)
export const localDateTime = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
// '2026-10-09T03:12:05+09:00'
export function isoLocal(d) {
  const off = -d.getTimezoneOffset(), a = Math.abs(off);
  return `${localDateTime(d).replace(' ', 'T')}${off >= 0 ? '+' : '-'}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

// Firestore Timestamp(toDate가 있는 값)를 Date로: 기록의 at, data 안의 시각
const asDate = v => (v && typeof v.toDate === 'function' ? v.toDate() : v);
export function withDates(r) {
  const data = {};
  for (const [k, v] of Object.entries(r.data || {})) data[k] = asDate(v);
  return { ...r, at: asDate(r.at), data };
}

// ---------- CSV: 한 줄 = 기록 하나. UTF-8 (BOM 없음), 열 이름은 영어 → R: read.csv("파일.csv", fileEncoding = "UTF-8") ----------
export const CSV_COLUMNS = [
  'datetime', 'subject', 'subject_type', 'type',
  'method', 'side', 'ml', 'minutes',                 // 수유
  'end_time', 'duration_min', 'interval_min',        // 수면·진통 (간격은 진통만)
  'pee', 'poo',                                      // 기저귀
  'weight_kg', 'bp_sys', 'bp_dia',                   // 검진
  'text', 'answer', 'done',                          // 질문
  'memo', 'recorded_by',
  'title', 'kind', 'liked', 'activity', 'place',     // 교육: 책 제목·시험 이름, 종류(일기·읽은 방법·대화 상대·관심사), 좋아함, 활동, 기관
  'course', 'score',                                 // 사춘기: 과목, 점수·등급
];
// 빈 값 = 빈 칸 (R에서 숫자·논리 열은 NA), 참·거짓 = TRUE/FALSE, 쉼표·따옴표·줄바꿈이 있으면 따옴표로 감쌈
function cell(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const minutes = ms => Math.round(ms / 600) / 100; // 분, 소수 둘째 자리까지

// records: [{ id, subjectType, subjectId, type, at: Date, data(시각은 Date), createdBy }]
// subjectName(subjectId) → 아이 이름, memberName(uid) → 기록자 이름
export function toCSV(records, { subjectName, memberName }) {
  const sorted = records.slice().sort((a, b) => a.at - b.at);
  // 진통 간격: 임신마다 앞 진통 시작 → 이번 시작
  const interval = new Map(), bySubject = new Map();
  for (const r of sorted) if (r.type === 'contraction') bySubject.set(r.subjectId, [...(bySubject.get(r.subjectId) || []), r]);
  for (const list of bySubject.values()) {
    for (const x of contractionRows(list.map(r => ({ id: r.id, start: r.at, end: r.data.endAt || null })))) interval.set(x.id, x.interval);
  }
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of sorted) {
    const d = r.data || {}, end = d.endAt instanceof Date ? d.endAt : null;
    const row = {
      datetime: localDateTime(r.at), subject: subjectName(r.subjectId), subject_type: r.subjectType, type: r.type,
      method: d.method, side: d.side, ml: d.ml, minutes: d.minutes,
      end_time: end && localDateTime(end), duration_min: end ? minutes(end - r.at) : null,
      interval_min: interval.get(r.id) != null ? minutes(interval.get(r.id)) : null,
      pee: d.pee, poo: d.poo, weight_kg: d.weightKg, bp_sys: d.bpSys, bp_dia: d.bpDia,
      text: d.text, answer: d.answer, done: d.done, memo: d.memo, recorded_by: memberName(r.createdBy),
      title: d.title ?? d.exam, kind: r.type === 'book' ? d.with : r.type === 'talk' ? d.who : d.kind, liked: d.liked,
      activity: r.type === 'activity' ? d.name : null, place: d.school, course: d.course, score: d.score,
    };
    lines.push(CSV_COLUMNS.map(c => cell(row[c])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

// ---------- JSON 백업: 나중에 복원할 수 있게 문서 id·연결(pregnancyId·childId)·기록자 uid를 그대로 ----------
// 시각(Timestamp·Date)은 ISO 8601 글자로 바꾸고, 그 위치를 timeFields에 적어 둠 → 복원 때 그 위치만 Timestamp로 되돌리면 됨
// format이 바뀌면 숫자를 올리고 복원 코드가 예전 숫자도 읽게
export const BACKUP_FORMAT = 1;
function plain(value, path, times) {
  value = asDate(value);
  if (value instanceof Date) { times.add(path); return isoLocal(value); }
  if (Array.isArray(value)) return value.map(v => plain(v, path, times));
  if (value && typeof value === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(value)) o[k] = plain(v, path ? `${path}.${k}` : k, times);
    return o;
  }
  return value;
}
// scope = { kind: 'all' } | { kind: 'child', childId } | { kind: 'pregnancy', pregnancyId }
// pregnancies·children·records = [{ id, ...Firestore 문서 값 }], members = [{ uid, name, emoji }]
export function toBackup({ familyId, scope, settings, members, pregnancies, children, records, now = new Date() }) {
  const out = {
    app: 'growing_notes', format: BACKUP_FORMAT, exportedAt: isoLocal(now),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    familyId, scope, settings, members, timeFields: {},
  };
  const byAt = (a, b) => +asDate(a.at) - +asDate(b.at);
  for (const [name, list] of Object.entries({ pregnancies, children, records: records.slice().sort(byAt) })) {
    const times = new Set();
    out[name] = list.map(({ id, ...rest }) => ({ id, ...plain(rest, '', times) }));
    out.timeFields[name] = [...times].sort();
  }
  return out;
}
