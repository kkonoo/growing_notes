// 기록(records): 임신·아이 기록을 한 컬렉션에 두고 type으로 구분
//   { subjectType: 'pregnancy'|'child', subjectId, type, at(시각), data: {…}, createdBy, updatedBy, createdAt, updatedAt }
// 쓰기는 기다리지 않음(오프라인이면 기기에 먼저 저장 → 연결되면 올라감). 읽기는 화면에 보이는 동안만 구독
import { F, write } from './db.js';
import { state, render } from './state.js';
import { famCol, myUid } from './family.js';
import { keep } from './live.js';

const recRef = id => F.doc(famCol('records'), id);

// 새 기록 → 만든 문서 id (바로 고치기·되돌리기용)
export function addRecord(subjectType, subjectId, type, at, data) {
  const ref = F.doc(famCol('records'));
  write(F.setDoc(ref, {
    subjectType, subjectId, type, at: F.Timestamp.fromDate(at), data,
    createdBy: myUid(), updatedBy: myUid(), createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(),
  }));
  return ref.id;
}
// fields 예: { at: Date, 'data.done': true } — 고친 사람(updatedBy)은 나, 처음 기록한 사람(createdBy)은 그대로
export function updateRecord(id, fields) {
  const up = { ...fields, updatedBy: myUid(), updatedAt: F.serverTimestamp() };
  if (up.at instanceof Date) up.at = F.Timestamp.fromDate(up.at);
  write(F.updateDoc(recRef(id), up));
}
export const deleteRecord = id => write(F.deleteDoc(recRef(id)));

// Firestore 문서 → { id, at: Date, data(안의 시각도 Date), pending(아직 안 올라감) … }
function toRecord(d) {
  const x = d.data({ serverTimestamps: 'estimate' }), data = {};
  for (const [k, v] of Object.entries(x.data || {})) data[k] = v instanceof F.Timestamp ? v.toDate() : v;
  return { ...x, id: d.id, at: x.at.toDate(), data, pending: d.metadata.hasPendingWrites };
}

// subjectId가 ids 중 하나인 기록, 최근 것부터. limit 없으면 전부.
// 그리는 동안 부르면 화면에 보이는 동안 구독 유지 → { list, loaded, more(더 있을 수 있음) }
export function watchRecords(ids, limit) {
  const key = `rec:${state.familyId}:${ids.join(',')}:${limit || ''}`;
  return keep(key, () => {
    const w = { list: [], loaded: false, more: false };
    const q = F.query(famCol('records'), F.where('subjectId', 'in', ids), F.orderBy('at', 'desc'), ...(limit ? [F.limit(limit)] : []));
    const unsub = F.onSnapshot(q, { includeMetadataChanges: true }, snap => {
      w.list = snap.docs.map(toRecord);
      w.loaded = true;
      w.more = !!limit && snap.size >= limit;
      state.pending[key] = snap.metadata.hasPendingWrites;
      render();
    }, e => {
      console.error('기록을 불러오지 못했어요', e);
      w.loaded = true;
      w.error = e;
      render();
    });
    w.stop = () => { unsub(); delete state.pending[key]; };
    return w;
  });
}

// 기록 종류: 이모지·이름·한 줄 요약. edit(기록)은 각 탭 파일이 채움 (타임라인에서 눌러 고치기)
export const TYPES = {};
export function defineType(type, def) { TYPES[type] = def; }
