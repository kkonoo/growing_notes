// Firebase 시작: 로그인(Auth) + Firestore(오프라인 캐시 켬). 다른 파일은 여기의 A(Auth 함수), F(Firestore 함수), auth, fs를 씀.
// SDK는 빌드 없이 gstatic에서 바로 import (sw.js가 캐시해서 오프라인에서도 열림). 버전을 바꾸면 sw.js의 SDK도 같이
import { firebaseConfig } from './firebase-config.js';
import { toast } from './ui.js';

export const SDK = 'https://www.gstatic.com/firebasejs/12.19.0';
// 테스트용: localhost?emulator 로 열면 내 컴퓨터의 Firebase Emulator에 연결 (가짜 계정·가짜 데이터)
export const EMULATOR = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('emulator');
const EMULATOR_CONFIG = { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-growing', appId: 'demo-app' };

export let A, F, auth, fs;

// 설정이 없으면 false
export async function initFirebase() {
  const config = EMULATOR ? EMULATOR_CONFIG : firebaseConfig;
  if (!config) return false;
  const [{ initializeApp }, a, f] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`),
  ]);
  A = a; F = f;
  const app = initializeApp(config);
  auth = A.getAuth(app);
  // 기기에 저장해 두고(IndexedDB) 네트워크 없이도 읽고 쓰기 → 연결되면 자동으로 올라감. 여러 탭에서 같이 씀
  fs = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  if (EMULATOR) {
    A.connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    F.connectFirestoreEmulator(fs, 'localhost', 8080);
    // 자동 테스트(tests/e2e)용 가짜 Google 로그인. Emulator에서만 동작
    window.__emuLogin = (sub, email, name) => A.signInWithCredential(auth,
      A.GoogleAuthProvider.credential(JSON.stringify({ sub, email, name, email_verified: true })));
  }
  return true;
}

export function login() {
  return A.signInWithPopup(auth, new A.GoogleAuthProvider()).catch(e => {
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') alert(`로그인하지 못했어요: ${e.code}`);
  });
}

// 쓰기는 기다리지 않음: 오프라인이면 서버 응답이 연결될 때까지 안 오므로, 화면은 기기 캐시로 바로 바뀜. 실패만 알림
export function write(promise) {
  promise.catch(e => {
    console.error('저장 실패', e);
    toast(`저장하지 못했어요 (${e.code || e.message})`, 4000);
  });
}
