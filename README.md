# 🌱 성장노트

임신 · 육아 · 교육 기록을 가족이 함께 쓰는 웹 앱이에요. (PWA, 오프라인 기록 가능)
https://kkonoo.github.io/growing_notes/

- vanilla HTML/CSS/JS, 빌드 없음, GitHub Pages
- Google 로그인 + Firestore 동기화 (오프라인 캐시 켬)
- 데이터 단위는 **가족(family)**. 가족 구성원으로 들어온 사람만 읽고 쓸 수 있어요.

## 지금 되는 것

- 처음 로그인하면 내 가족 공간이 자동으로 생겨요. 혼자 써도 돼요.
- 아이 등록, 임신 등록 (태명·예정일·이모지)
- 홈: 아이·임신별 카드에 지금 단계와 핵심 한 줄 (예: `24주 3일 · D-109`, `생후 132일 (4개월)`, `만 4세 5개월`)
- 출산 처리: 임신 → 아이 프로필로 이어짐 (임신 중 기록은 그대로 아이 쪽에서 보임)
- 임신 종료 표시, 홈에서 숨기기 (설정 › 아이·임신에서 다시 보이기)
- 배우자 초대: 24시간 동안 한 번만 쓸 수 있는 링크·코드
- 단계는 저장하지 않고 날짜로 계산 (출생 전 임신 → 만 3세 생일 전 육아 → 교육. 설정에서 나이 변경)
- **임신 탭**: 예정일 기준 주수, 다음 진료 때 물어볼 것(여러 줄 한 번에 추가, 체크, 들은 답 메모),
  검진 기록(날짜·체중·혈압·메모), 진통 타이머(시작·끝 버튼 → 지속시간·간격 자동 계산, 최근 1시간 요약, 화면 꺼짐 방지)
- **육아 탭**: 화면 아래 버튼으로 수유(모유 왼쪽·오른쪽, 분유, 유축)·수면(잠들었어요 ↔ 깼어요)·기저귀(소변·대변·둘 다)를
  누르면 바로 지금 시각으로 저장 → 토스트의 **고치기**(시각·양·메모)·**되돌리기**. 지금 상태(마지막 수유 몇 분 전, 잠든 지·깬 지),
  오늘 요약, 오늘 기록(기록한 사람 표시), 최근 7일 패턴(24시간 띠 + 같은 값의 표)
- **타임라인 탭**: 날짜별 기록과 기록한 사람. 출산한 아이는 임신 중 기록도 `🤰 임신 중` 표시와 함께 보여요

다음 단계: 내보내기(CSV·JSON)

## Firebase 설정 (처음 한 번)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 추가**. (Google 애널리틱스는 꺼도 돼요. 요금제는 무료 Spark 그대로)
2. **Authentication** → 시작하기 → **로그인 방법** 탭 → **Google** → 사용 설정 → 프로젝트 지원 이메일 선택 → 저장.
   다른 로그인 방법은 켜지 않아요.
3. **Authentication** → **설정** 탭 → **승인된 도메인** → 도메인 추가 → `kkonoo.github.io`
   (`localhost`는 처음부터 들어 있어요. 내 PC에서 테스트할 때 필요)
4. **Firestore Database** → 데이터베이스 만들기 → 위치 `asia-northeast3 (서울)` → **프로덕션 모드**로 시작.
   (위치는 나중에 못 바꿔요. 프로덕션 모드 = 규칙을 배포하기 전엔 아무도 못 읽고 못 씀)
5. **프로젝트 설정(⚙️)** → 일반 → 내 앱 → **웹(`</>`)** → 앱 닉네임 `성장노트` (Firebase Hosting은 체크 안 함) → 나오는 `firebaseConfig` 값을
   [`js/firebase-config.js`](js/firebase-config.js)의 `null` 자리에 붙여 넣어요.
   ```js
   export const firebaseConfig = {
     apiKey: '...',
     authDomain: '프로젝트ID.firebaseapp.com',
     projectId: '프로젝트ID',
     storageBucket: '...',
     messagingSenderId: '...',
     appId: '...',
   };
   ```
   이 값은 공개돼도 괜찮아요. 데이터 보호는 아래 규칙이 담당해요.
6. **보안 규칙·인덱스 배포** (PC에서. 규칙을 바꿀 때마다 다시)
   ```
   npm install
   npx firebase login
   npx firebase deploy --only firestore --project 프로젝트ID
   ```
   [`firestore.rules`](firestore.rules)와 [`firestore.indexes.json`](firestore.indexes.json)이 올라가요. 인덱스는 만들어지는 데 몇 분 걸려요.
   - npm 없이 하려면: 콘솔 **Firestore → 규칙** 탭에 `firestore.rules` 내용을 붙여 넣고 **게시**,
     **색인 → 복합** 탭에서 컬렉션 `records`, 필드 `subjectId` 오름차순 + `at` 내림차순 색인 추가.
7. GitHub repo **Settings → Pages** → Branch `main`, 폴더 `/ (root)`.
8. https://kkonoo.github.io/growing_notes/ 를 열고 Google로 로그인 → 홈이 나오면 끝이에요.
   폰에서는 브라우저 메뉴의 **홈 화면에 추가**로 앱처럼 설치해요.

## 배우자 초대

설정 › 가족 › **🔗 배우자 초대하기** → 링크를 공유하거나 코드를 알려 줘요.
배우자가 링크를 열고 로그인하면(또는 설정 › **💌 초대 코드 입력**) 합류 확인 창이 떠요.
코드는 24시간 동안, 한 번만 쓸 수 있어요. 합류하면 배우자가 혼자 쓰던 공간의 기록은 옮겨지지 않아요(원래 공간에 남아요).

## 내 PC에서 실행

```
powershell -NoProfile -ExecutionPolicy Bypass -File tools/serve.ps1
```
→ http://localhost:8767/ (실제 Firebase 프로젝트에 연결)

실제 데이터 없이 가짜 계정으로 해 보려면 Emulator를 같이 띄우고 `?emulator`를 붙여요.
```
npx firebase emulators:start --only auth,firestore --project demo-growing
```
→ http://localhost:8767/?emulator (Google 로그인 창 대신 Emulator의 가짜 계정 창이 떠요)

## 테스트

Node.js 22 이상, Java 21 이상(Firestore Emulator용)이 필요해요.

```
npm install
npm test            # 날짜 계산 + 보안 규칙 (Emulator)
npm run test:e2e    # 브라우저 시나리오 (처음 한 번: npx playwright install chromium)
```

- **보안 규칙** ([tests/rules.test.mjs](tests/rules.test.mjs)): 다른 계정은 가족 문서·아이·임신·기록·구성원을 읽기/목록/쓰기 모두 못 함,
  남의 uid로 가족 만들기 불가, 구성원 추가는 초대로만, 초대 재사용·만료·다른 가족 코드·두 가족 동시 합류 거부 등
- **브라우저 시나리오** ([tests/e2e/](tests/e2e/)): 첫째(교육)+둘째 임신 → 홈 카드 두 단계, 출산 처리, 다른 계정에 안 보임,
  배우자 초대 → 같은 데이터, 쓴 코드 재사용 거부, 오프라인 등록 → 다시 연결하면 배우자 화면에 나타남,
  질문·검진·진통 타이머, 배우자 기록의 기록자 구분, 출산 후 임신 중 기록이 아이 타임라인에 그대로,
  첫째 출생 후 기록 → 둘째 임신 → 홈 카드 두 단계, 빠른 기록·되돌리기·시각 고치기, 비행기 모드 빠른 기록, 7일 패턴
- **계산** ([tests/logic.test.mjs](tests/logic.test.mjs)): 주수·생후 일수·단계, 진통 지속시간·간격·최근 1시간 요약,
  하루 육아 정리(밤새 잔 잠은 날짜별로 나눔, 자는 중이면 지금까지)

테스트는 전부 가짜 계정·가짜 데이터(Emulator)만 써요.

### 실제 기기에서 직접 확인할 것

자동 테스트는 Emulator라서, 배포한 뒤 실제 계정·폰으로 한 번 확인해 주세요.

1. 내 Google 계정으로 로그인 → 아이·임신 등록 → 홈에 카드가 단계별로 보이는지
2. 다른 Google 계정(시크릿 창)으로 로그인 → 아무것도 안 보이는지
3. 배우자 폰에서 초대 링크 열기 → 합류 → 같은 카드가 보이는지, 설정 › 가족에 둘 다 있는지
4. 홈 화면에 설치한 앱을 비행기 모드에서 열기 → 아이 등록 → 비행기 모드 끄기 → 배우자 폰에 나타나는지

## 데이터 구조 (Firestore)

```
users/{uid}               { familyId }             지금 쓰는 가족 공간 (본인만)
families/{familyId}       { members: [uid…], settings: { eduStartAge } }
  ├ members/{uid}         { name, emoji }          기록자 표시용
  ├ pregnancies/{id}      { dueDate, status: active|born|ended, childId?, nickname?, emoji?, hidden }
  ├ children/{id}         { name, birthDate, emoji, pregnancyId? }
  └ records/{id}          { subjectType: pregnancy|child, subjectId, type, at, data, createdBy, updatedBy }
invites/{code}            { familyId, inviterName, expiresAt, usedBy }
```

- 처음 생기는 가족 공간의 id = 내 uid (두 기기에서 동시에 첫 로그인해도 하나만 생김)
- 출산 처리는 기록을 옮기지 않아요. 아이 화면이 `subjectId in [아이 id, 이어진 임신 id]`로 같이 읽어요.
- 단계(임신·육아·교육)는 저장하지 않고 날짜로 계산 ([js/stage.js](js/stage.js))

## 파일

```
index.html, css/style.css, manifest.webmanifest, sw.js(오프라인: 앱 파일 + Firebase SDK 캐시), icons/
js/app.js        시작, 화면 전환, 뒤로 가기, 동기화 표시
js/db.js         Firebase 시작 (오프라인 캐시, Emulator 연결)
js/family.js     가족 공간 찾기·만들기, 구독, 구성원, 초대
js/profiles.js   아이·임신 등록·고치기·출산·종료
js/home.js       홈 카드
js/subject.js    아이 화면 + 탭 목록 (TABS에 더하면 탭이 늘어남)
js/tab-*.js      임신 · 육아 · 교육 탭
js/timeline.js   타임라인 탭
js/records.js    기록 추가·고치기·지우기, 화면에 보이는 동안만 구독, 기록 종류(TYPES)
js/live.js       화면이 바뀌면 구독·1초 타이머·화면 꺼짐 방지를 정리
js/stats.js      진통 간격·지속시간, 하루 육아 정리 같은 계산 (판정 없음)
js/pattern.js    육아 탭의 최근 7일 패턴 (그래프 + 표)
js/settings.js   설정 창
js/state.js      앱 상태, 다시 그리기
js/stage.js      주수·나이·단계 계산
js/ui.js         화면 공통 (입력 창, 토스트)
firestore.rules, firestore.indexes.json, firebase.json
tests/           규칙·날짜·브라우저 테스트 (package.json은 테스트 전용)
tools/           serve.ps1(로컬 서버), make-icons.py(아이콘)
```

## 공개 repo 주의

- 실제 기록, 개인정보가 들어간 테스트 데이터, 스크린샷은 커밋하지 않아요.
- 앱에서 내보낸 파일(`growing-*.csv`, `growing-*.json`)은 `.gitignore`에 들어 있어요.
