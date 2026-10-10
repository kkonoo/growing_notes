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
- 아이 화면의 탭은 두 줄: 윗줄 **임신 · 육아 · 교육**(단계), 아랫줄 **📝 일기 · 🗓 타임라인**(모아 보기)
- **임신 탭**: 예정일 기준 주수, 다음 진료 때 물어볼 것(여러 줄 한 번에 추가, 체크, 들은 답 메모),
  검진 기록(날짜·체중·혈압·메모), 진통 타이머(시작·끝 버튼 → 지속시간·간격 자동 계산, 최근 1시간 요약, 화면 꺼짐 방지)
- **육아 탭**: 화면 아래 버튼으로 수유(모유 왼쪽·오른쪽, 분유, 유축)·수면(잠들었어요 ↔ 깼어요)·기저귀(소변·대변·둘 다)를
  누르면 바로 지금 시각으로 저장 → 토스트의 **고치기**(시각·양·메모)·**되돌리기**. 지금 상태(마지막 수유 몇 분 전, 잠든 지·깬 지),
  오늘 요약, 오늘 기록(기록한 사람 표시), 최근 7일 패턴(24시간 띠 + 같은 값의 표)
- **타임라인 탭**: 한 달씩(‹ › 로 넘기기, 제목을 누르면 연·월 고르기), 종류 필터, 날짜별 기록과 기록한 사람.
  출산한 아이는 임신 중 기록도 `🤰 임신 중` 표시와 함께 보여요. 한 번에 한 달치만 읽어서 몇 년 쌓여도 느려지지 않아요
- **교육 탭**: 나이에 따라 두 모드 (경계는 설정 › 단계, 기본 만 12세). 지금 모드는 아이 이름 옆에 `영유아`·`사춘기`로
  - 영유아 모드: 📚 독서(책 기록, 최근 책을 누르면 "또 읽었어요"로 바로 기록, 이번 달·올해 권수),
    🎹 활동(피아노·태권도 등 등록 → "다녀왔어요", 진도 메모, 이번 달 횟수),
    🏫 기관(어린이집·유치원·학교, 반, 담임, 기간) + 💬 상담 메모
  - 사춘기 모드: 🏫 학교(학년·반, 담임, 기간) + 📝 시험·성적(과목마다 하나씩, "저장하고 다음 과목"으로 같은 시험 이어서),
    💬 대화 메모(아이와 · 선생님과), 🎯 진로·관심사(💡 관심사 · 🎯 꿈·진로 · 🏅 동아리·활동)
  - 일정·교육비는 캘린더x플래너·살림노트에서
- **일기 탭**: 📝 일기 · 🗣 한 말 · ⭐ 처음 해 본 것을 날짜별로, 한 달씩. 임신 중(태교일기)에 쓴 글도 출산 뒤 아이 일기 탭에서
  `🤰 임신 중` 표시와 함께 이어져 보여요
- **내보내기** (설정 › 내보내기): 전체 또는 아이별로 CSV·JSON 받기 (아래 「내보내기 형식」)
- **📌 지금 챙길 것** (임신·육아·교육 탭, 처음엔 접힘): 임신 주수·생후 일수/개월에 맞는 신청·검진 시기와 공식 링크
  (맘편한 임신 원스톱, 보건소 철분제, 출생신고·행복출산 원스톱, 부모급여 60일, 영유아 건강검진 1~8차, 예방접종도우미).
  금액은 넣지 않았어요(해마다 바뀜). 내용·출처·확인한 달은 [`js/tips.js`](js/tips.js) 한 곳에 있어요 — 바뀌면 그 파일만 고치면 돼요

아직 없는 것: 사진, 예방접종 일정표(지금은 예방접종도우미 링크만), 성장곡선, 초등·청소년 단계, JSON 백업 복원(형식은 복원할 수 있게 만들어 둠)

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
     **색인 → 복합** 탭에서 컬렉션 `records`(범위: 컬렉션)에 두 개 추가 (필드 이름은 대소문자까지 똑같이):
     ① `subjectId` 오름차순 + `at` 내림차순 ② `subjectId` 오름차순 + `type` 오름차순 + `at` 내림차순
   - 더 쉬운 방법: 앱에서 색인이 없으면 안내 칸에 **"색인 만들기 열기 ↗"** 버튼이 떠요. 누르면 필요한 색인이 채워진 콘솔 화면이 열려요.
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

## 내보내기 형식

설정 › 내보내기에서 **대상**(전체 / 아이별 / 출산 전 임신)을 고르고 받아요.
아이별은 그 아이의 기록 + 이어진 임신 기록이에요. 파일 이름은 `growing-대상-날짜.csv|json`이에요.

### CSV (분석용)

- 한 줄 = 기록 하나, 시각 순. **UTF-8, BOM 없음**. 열 이름은 영어(R에서 이름이 안 바뀌게)
- R: `x <- read.csv("growing-전체-2026-10-10.csv", fileEncoding = "UTF-8")`
  - 시각: `as.POSIXct(x$datetime)` (이 기기의 현지 시각, 한국이면 KST)
  - 빈 칸은 숫자·참거짓 열에서 `NA`, 참거짓은 `TRUE`/`FALSE`
- Excel에서 바로 열면 한글이 깨질 수 있어요 (BOM이 없어서). Excel은 데이터 › 텍스트/CSV 가져오기에서 UTF-8을 고르면 돼요.

| 열 | 뜻 |
|---|---|
| `datetime` | 기록 시각 `YYYY-MM-DD HH:MM:SS` (검진은 날짜만 있어서 12:00:00) |
| `subject`, `subject_type` | 아이 이름(출산한 아이의 임신 기록도 그 아이 이름, 출산 전이면 태명), `pregnancy`/`child` |
| `type` | `checkup`(검진) `question`(질문) `contraction`(진통) `feeding`(수유) `sleep`(수면) `diaper`(기저귀) `note`(일기)<br>교육: `book`(독서) `activity`(활동) `consult`(상담) `grade`(성적) `talk`(대화) `interest`(진로·관심사) |
| `method`, `side`, `ml`, `minutes` | 수유: `breast`/`formula`/`pumped`, `L`/`R`/`both`, 양, 시간(분) |
| `end_time`, `duration_min` | 수면·진통의 끝 시각과 걸린 시간(분, 소수 둘째 자리). 진행 중이면 빈 칸 |
| `interval_min` | 진통 간격(분): 앞 진통 시작 → 이번 시작 |
| `pee`, `poo` | 기저귀 소변·대변 |
| `weight_kg`, `bp_sys`, `bp_dia` | 검진 체중·혈압 |
| `text`, `answer`, `done` | 질문, 들은 답, 물어봤는지 |
| `memo`, `recorded_by` | 메모, 기록한 사람(설정 › 나의 이름) |
| `title`, `kind`, `liked` | 책 제목·시험 이름, 종류(책 `together`/`alone` · 일기 `note`/`word`/`first` · 대화 `child`/`teacher`/`other` · 진로·관심사 `like`/`dream`/`club`), 좋아함 |
| `activity`, `place` | 교육: 활동 이름, 상담한 기관 |
| `course`, `score` | 성적: 과목, 점수·등급 (글자 그대로, 예: `92`, `A`) |

### JSON (백업용, 나중에 복원)

```json
{
  "app": "growing_notes", "format": 1, "exportedAt": "2026-10-10T09:00:00+09:00", "timezone": "Asia/Seoul",
  "familyId": "…", "scope": { "kind": "all" },
  "settings": { "eduStartAge": 3 },
  "members": [{ "uid": "…", "name": "엄마", "emoji": "👩" }],
  "pregnancies": [{ "id": "…", "dueDate": "2026-10-05", "status": "born", "childId": "…", … }],
  "children": [{ "id": "…", "name": "…", "birthDate": "…", "pregnancyId": "…", … }],
  "records": [{ "id": "…", "subjectType": "child", "subjectId": "…", "type": "feeding", "at": "2026-10-09T03:12:00+09:00",
                "data": { "method": "formula", "ml": 120 }, "createdBy": "uid", "updatedBy": "uid", … }],
  "timeFields": { "pregnancies": ["createdAt"], "children": ["createdAt"], "records": ["at", "createdAt", "data.endAt", "updatedAt"] }
}
```

- Firestore 문서를 그대로 담아요: **문서 id**, 아이↔임신 연결(`pregnancyId`·`childId`), 기록자 uid
- 시각은 ISO 8601 글자로 바꾸고 그 위치를 `timeFields`에 적어 둬요 → 복원할 때 그 위치만 Timestamp로 되돌리면 돼요
- 복원은 같은 id로 덮어쓰기(중복 없음)로 만들 예정이에요. 형식이 바뀌면 `format` 숫자를 올려요
- `scope`: `{ "kind": "all" }` / `{ "kind": "child", "childId" }` / `{ "kind": "pregnancy", "pregnancyId" }`

받은 파일에는 실제 기록이 들어 있어요. 이 repo처럼 공개된 곳에 올리지 마세요.

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
  첫째 출생 후 기록 → 둘째 임신 → 홈 카드 두 단계, 빠른 기록·되돌리기·시각 고치기, 비행기 모드 빠른 기록, 7일 패턴,
  전체·아이별 CSV와 JSON 받기 (받은 CSV를 R `read.csv`로 읽기 포함), 타임라인 달 넘기기·연월 고르기·필터,
  기록을 못 불러올 때(색인 준비 중 등) 기록 버튼 숨김과 자동 다시 불러오기,
  교육 영유아·사춘기 모드(독서·활동·기관·상담 / 학교·성적·대화·진로, 설정에서 경계 나이 바꾸기),
  일기(임신 중 → 출산 → 아이 일기 탭에 이어짐, 달 넘기기, 고치기·지우기)
- **계산** ([tests/logic.test.mjs](tests/logic.test.mjs)): 주수·생후 일수·단계, 진통 지속시간·간격·최근 1시간 요약,
  하루 육아 정리(밤새 잔 잠은 날짜별로 나눔, 자는 중이면 지금까지), CSV(따옴표·줄바꿈·TRUE/FALSE)·JSON 백업 변환
- R(`Rscript`)이 설치돼 있으면 CSV를 실제 `read.csv`로 읽어 보는 테스트도 돌아가요 (없으면 건너뜀)

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
families/{familyId}       { members: [uid…], settings: { eduStartAge, teenStartAge } }
  ├ members/{uid}         { name, emoji }          기록자 표시용
  ├ pregnancies/{id}      { dueDate, status: active|born|ended, childId?, nickname?, emoji?, hidden }
  ├ children/{id}         { name, birthDate, emoji, pregnancyId?, activities: […], schools: […] }
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
js/diary.js      일기 탭
js/timeline.js   타임라인 탭 (달 넘기기는 일기 탭도 같이 씀)
js/records.js    기록 추가·고치기·지우기, 화면에 보이는 동안만 구독, 기록 종류(TYPES)
js/live.js       화면이 바뀌면 구독·1초 타이머·화면 꺼짐 방지를 정리
js/stats.js      진통 간격·지속시간, 하루 육아 정리 같은 계산 (판정 없음)
js/pattern.js    육아 탭의 최근 7일 패턴 (그래프 + 표)
js/export.js     CSV · JSON 백업 만들기 (순수 함수)
js/tips.js       지금 챙길 것: 안내 내용·출처·링크 (나이에 맞는 것 고르기)
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
