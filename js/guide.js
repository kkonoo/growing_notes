// 📖 이 시기 아이: 만 개월에 맞는 발달과 육아 안내 (0~71개월: 육아 0~2세 + 유아 만 3~5세)
// 원칙: 판정 안 함("이 무렵 많은 아이가 하는 것"만, "늦다"는 말 없음), 의견이 갈리는 주제는 방법을 나란히 두고 권하지 않음,
// 모두 출처. 시기는 영유아 건강검진 차수와 맞물리게 나눔. 바뀌면 이 파일만 고치면 돼요
import { h, button } from './ui.js';

export const GUIDE_CHECKED = '2026년 10월'; // 내용·링크를 마지막으로 확인한 때

// ---------- 출처 ----------
const CDC = (slug, age) => ({ label: `CDC 발달 체크 (${age})`, url: `https://www.cdc.gov/act-early/milestones/${slug}.html` });
const AAP_HC = 'https://www.healthychildren.org/English/ages-stages';
const S = {
  newborn: { label: 'AAP: 생후 1개월 발달', url: `${AAP_HC}/baby/Pages/Developmental-Milestones-1-Month.aspx` },
  reflexes: { label: 'AAP: 신생아 반사', url: `${AAP_HC}/baby/Pages/newborn-reflexes.aspx` },
  kdst: { label: '국민건강보험: 발달선별검사(K-DST)', url: 'https://www.nhis.or.kr/nhis/healthin/wbhaca05000m01.do' },
  checkupItems: { label: '국민건강보험: 영유아 건강검진 항목', url: 'https://www.nhis.or.kr/nhis/policy/wbhada19900m01.do' },
  safeSleep: { label: '미국소아과학회 안전 수면 권고 (2022)', url: 'https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/Sleep-Related-Infant-Deaths-Updated-2022' },
  kdcaSids: { label: '질병관리청: 영아돌연사증후군', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5467' },
  kpsSids: { label: '대한소아청소년과학회: 영아 돌연사 예방법', url: 'https://www.pediatrics.or.kr/bbs/index.html?code=infantcare&mode=view&number=8810' },
  purple: { label: 'PURPLE 울음 (흔들린 아이 증후군 예방)', url: 'https://dontshake.org/purple-crying' },
  cdcAht: { label: 'CDC: 아기를 흔들면 생기는 머리 손상', url: 'https://www.cdc.gov/child-abuse-neglect/about/about-abusive-head-trauma.html' },
  colic: { label: 'AAP: 영아산통', url: `${AAP_HC}/baby/crying-colic/Pages/Colic.aspx` },
  tummy: { label: 'AAP: 등 대고 자고 엎드려 놀기', url: `${AAP_HC}/baby/sleep/Pages/back-to-sleep-tummy-to-play.aspx` },
  who5: { label: 'WHO 5세 미만 신체활동·수면 지침 (2019)', url: 'https://www.who.int/publications/i/item/9789241550536' },
  babySleep: { label: 'AAP: 아기 재우기', url: `${AAP_HC}/baby/sleep/Pages/getting-your-baby-to-sleep.aspx` },
  routine: { label: 'Mindell 2009 (잠들기 순서 연구)', url: 'https://doi.org/10.1093/sleep/32.5.599' },
  nightWaking: { label: 'Pennestri 2018 (밤에 깨는 아기)', url: 'https://doi.org/10.1542/peds.2017-4330' },
  mcri: { label: '머독아동연구소: 수면교육은 도움이 될까', url: 'https://www.mcri.edu.au/news/insights-and-opinions/is-sleep-training-likely-to-help-or-harm-your-baby' },
  responsive: { label: 'Raising Children: 반응형 재우기', url: 'https://raisingchildren.net.au/babies/sleep/settling-routines/responsive-settling-at-6-18-months-reducing-settling-help' },
  camping: { label: 'Raising Children: 의자법', url: 'https://raisingchildren.net.au/babies/sleep/solving-sleep-problems/camping-out' },
  price: { label: 'Price 2012 (5년 추적 연구)', url: 'https://doi.org/10.1542/peds.2011-3467' },
  gradisar: { label: 'Gradisar 2016', url: 'https://doi.org/10.1542/peds.2015-1486' },
  aasm: { label: '미국수면의학회 리뷰 (2006)', url: 'https://pubmed.ncbi.nlm.nih.gov/17068979/' },
  under6m: { label: 'Douglas·Hill 2013 (6개월 전 수면교육)', url: 'https://pubmed.ncbi.nlm.nih.gov/24042081/' },
  // 먹기
  cues: { label: 'CDC: 배고픔·배부름 신호', url: 'https://www.cdc.gov/infant-toddler-nutrition/mealtime/signs-your-child-is-hungry-or-full.html' },
  kdcaNutrition: { label: '질병관리청: 영유아 식이영양', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5212' },
  kdcaSolids: { label: '질병관리청: 이유식', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5470' },
  whoFeeding: { label: 'WHO: 영유아 먹이기', url: 'https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding' },
  aapSolids: { label: 'AAP: 이유식 시작', url: `${AAP_HC}/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx` },
  espghan: { label: '유럽소아소화기영양학회 (2017)', url: 'https://pubmed.ncbi.nlm.nih.gov/28027215/' },
  blw: { label: 'AAP: 아기주도 이유식', url: `${AAP_HC}/baby/feeding-nutrition/Pages/Baby-Led-Weaning-Is-It-Safe.aspx` },
  bliss: { label: 'BLISS 연구 (체중)', url: 'https://doi.org/10.1001/jamapediatrics.2017.1284' },
  choking: { label: 'BLISS 연구 (질식)', url: 'https://doi.org/10.1542/peds.2016-0772' },
  blwIron: { label: 'BLISS 연구 (철분)', url: 'https://doi.org/10.1136/bmjopen-2017-019036' },
  kpsAllergy: { label: '대한소아청소년과학회: 이유식과 알레르기', url: 'https://pediatrics.or.kr/bbs/index.html?category=A&code=infantcare&gubun=&key=&keyfield=&mode=view&number=8818&page=1' },
  aapAllergy: { label: '미국소아과학회 알레르기 예방 (2019)', url: 'https://doi.org/10.1542/peds.2019-0281' },
  niaid: { label: 'NIAID 땅콩 알레르기 예방 안내', url: 'https://www.niaid.nih.gov/sites/default/files/peanut-allergy-prevention-guidelines-parent-summary.pdf' },
  leap: { label: 'LEAP 연구 (땅콩)', url: 'https://pubmed.ncbi.nlm.nih.gov/25705822/' },
  honey: { label: 'CDC: 피하거나 줄일 음식 (꿀)', url: 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/foods-and-drinks-to-avoid-or-limit.html' },
  milk: { label: 'AAP: 돌 전에 생우유 대신 분유', url: 'https://healthychildren.org/English/ages-stages/baby/formula-feeding/Pages/Why-Formula-Instead-of-Cows-Milk.aspx' },
  juice: { label: '미국소아과학회 과일주스 권고 (2017)', url: 'https://doi.org/10.1542/peds.2017-0967' },
  // 마음·행동·안전
  stranger: { label: 'AAP: 8~12개월 정서 발달', url: `${AAP_HC}/baby/Pages/Emotional-and-Social-Development-8-12-Months.aspx` },
  separation: { label: 'AAP: 분리불안 달래기', url: `${AAP_HC}/toddler/Pages/Soothing-Your-Childs-Separation-Anxiety.aspx` },
  homeSafety: { label: 'AAP: 집 안 안전', url: 'https://www.healthychildren.org/English/safety-prevention/at-home/Pages/home-safety-heres-how.aspx' },
  kdcaHome: { label: '질병관리청: 가정 내 아동안전', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5481' },
  discipline: { label: 'AAP: 건강한 훈육', url: 'https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Disciplining-Your-Child.aspx' },
  aapDiscipline: { label: '미국소아과학회 훈육 권고 (2018)', url: 'https://doi.org/10.1542/peds.2018-3112' },
  noSpanking: { label: '법무부: 민법 징계권 조항 삭제 (2021)', url: 'https://www.moj.go.kr/bbs/moj/182/541303/artclView.do' },
  tantrums: { label: 'AAP: 떼쓰기', url: 'https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Temper-Tantrums.aspx' },
  timeOut: { label: 'AAP: 타임아웃 하는 법', url: 'https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Time-Outs-101.aspx' },
  cdcTimeOut: { label: 'CDC: 타임아웃', url: 'https://www.cdc.gov/parenting-toddlers/time-out/steps.html' },
  knight: { label: 'Knight 2020 (타임아웃 장기 추적)', url: 'https://pubmed.ncbi.nlm.nih.gov/31513092/' },
  dadds: { label: 'Dadds·Tully 2019 (타임아웃 재검토)', url: 'https://doi.org/10.1037/amp0000449' },
  emotionCoaching: { label: 'CDC: 감정코칭', url: 'https://www.cdc.gov/parenting-toddlers/noticing-and-naming/emotion-coaching.html' },
  tuningIn: { label: 'Tuning in to Toddlers 연구 (2022)', url: 'https://doi.org/10.1016/j.brat.2021.104016' },
  ignoring: { label: 'CDC: 관심 거두기', url: 'https://www.cdc.gov/parenting-toddlers/responding-to-behavior/ignoring.html' },
  leijten: { label: 'Leijten 2019 (부모 교육 154개 연구)', url: 'https://doi.org/10.1016/j.jaac.2018.07.900' },
  whoScreen: { label: 'WHO: 덜 앉고 더 놀기 (2019)', url: 'https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more' },
  aapMedia: { label: '미국소아과학회 영유아 미디어 권고 (2016)', url: 'https://doi.org/10.1542/peds.2016-2591' },
  potty: { label: 'AAP: 배변훈련 시기', url: `${AAP_HC}/toddler/toilet-training/Pages/the-right-age-to-toilet-train.aspx` },
  pottyTips: { label: 'AAP: 배변훈련 12가지 팁', url: `${AAP_HC}/toddler/toilet-training/Pages/Praise-and-Reward-Your-Childs-Success.aspx` },
  pottyReview: { label: '배변훈련 방법 리뷰 (2006)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4781561/' },
  blum: { label: 'Blum 2003 (시작 나이와 기간)', url: 'https://doi.org/10.1542/peds.111.4.810' },
  li: { label: 'Li 2020 (일찍 시작과 소변 문제)', url: 'https://doi.org/10.1016/j.jpurol.2020.02.016' },
  reading: { label: 'AAP: 태어날 때부터 함께 책 읽기 (2024)', url: 'https://www.healthychildren.org/English/news/Pages/beyond-literacy-shared-reading-starting-in-infancy-offers-lifelong-benefits.aspx' },
};

// ---------- 시기마다 같이 쓰는 주제 ----------
const DEV_NOTE = 'CDC 기준으로 이 나이까지 아이 4명 중 3명 이상이 하는 것들이에요. 아이마다 빠르기가 달라요. 하던 걸 안 하게 됐거나 마음에 걸리는 게 있으면 소아청소년과에 물어봐요. '
  + '영유아 건강검진 3차(생후 9~12개월)부터는 발달선별검사(K-DST)도 같이 받아요. 3주 넘게 일찍 태어났으면 교정 나이로 봐요.';
const dev = (list, ...src) => ({ id: 'dev', emoji: '👶', title: '이 무렵 발달', list, note: DEV_NOTE, src: [...src, S.kdst] });

const SAFE_SLEEP = {
  id: 'safe-sleep', emoji: '🛏', title: '안전하게 재우기',
  list: [
    '낮잠까지 잘 때마다 똑바로(등 대고) 눕혀 재워요. 옆으로 재우는 것도 위험해요.',
    '단단하고 평평한 잠자리에 재우고, 베개·이불·범퍼·쿠션·인형은 두지 않아요. 카시트·바운서·유모차에서 잠들면 되도록 빨리 평평한 곳으로 옮겨요.',
    '적어도 첫 6개월은(가능하면 돌까지) 부모 방에서, 잠자리(아기 침대나 요)는 따로 써요. 소파·흔들의자에서 아기를 안고 잠드는 건 특히 위험해요.',
    '덥지 않게 해요. 이불 대신 옷이나 수면조끼를 입히고, 실내에서는 모자를 씌우지 않아요.',
    '속싸개는 아기가 뒤집으려고 하면(보통 3~4개월) 그만해요.',
    '잘 때 노리개젖꼭지를 물려도 돼요 (모유 수유는 자리를 잡은 뒤에).',
    '아기 곁에서는 담배를 피우지 않아요.',
  ],
  src: [S.safeSleep, S.kdcaSids, S.kpsSids],
};
const CRYING = {
  id: 'crying', emoji: '😭', title: '달래도 우는 아기',
  list: [
    '건강한 아기도 생후 2주쯤부터 울음이 늘어 2개월 무렵 가장 많이 울고, 대개 4~5개월이면 줄어요. 저녁에 많이 울고, 아무리 달래도 안 그칠 때가 있어요.',
    '배고픔·기저귀·더위나 추위를 확인하고, 안아서 살살 흔들기, "쉬~" 소리, 산책처럼 여러 가지를 해 봐요.',
    '너무 힘들면 아기를 아기 침대에 등 대고 눕혀 두고 5~10분 자리를 떠서 마음을 가라앉혀요. 그동안 5~10분마다 들여다봐요. 가족이나 친구에게 도움을 청해도 돼요.',
    '어떤 경우에도 아기를 흔들지 않아요. 흔들면 뇌를 크게 다칠 수 있어요.',
    '열이 나거나 잘 안 먹는 등 평소와 다르면 소아청소년과에 연락해요.',
  ],
  src: [S.purple, S.cdcAht, S.colic],
};
const TUMMY = {
  id: 'tummy', emoji: '🤸', title: '엎드려 놀기',
  list: [
    '깨어 있고 어른이 지켜볼 때만 엎드려 놀아요. 졸려 하면 바로 등 대고 눕혀요.',
    '집에 온 날부터 하루 2~3번, 3~5분씩 시작해서 생후 7주 무렵 하루 모두 15~30분으로 늘려요 (미국소아과학회). WHO는 아직 기어 다니지 않는 아기에게 하루 30분 이상을 나눠서 권해요.',
    '탯줄이 떨어지기 전이나 싫어하면 엄마·아빠 가슴 위에 엎드리게 해도 돼요.',
  ],
  src: [S.tummy, S.who5],
};
const ROUTINE = {
  id: 'routine', emoji: '🛁', title: '잠들기 전 순서 만들기',
  list: [
    '아기는 생후 4개월쯤까지 잠 리듬이 자리 잡지 않아요. 낮에는 밝게 놀고, 밤에 먹이고 기저귀 갈 때는 조용하고 차분하게 해요.',
    '매일 비슷한 시간에 같은 순서(씻기 → 수유 → 책이나 노래 → 불 끄기)를 해요. 7~36개월 아기 400여 명 연구에서 3주 만에 잠드는 데 걸리는 시간과 밤에 깨는 횟수가 줄었어요.',
    '4개월 무렵부터는 졸려 할 때 눕혀서 스스로 잠드는 연습을 해 볼 수 있어요.',
    '6~12개월 아기의 30~60%쯤은 아직 밤에 6~8시간을 내리 자지 않아요. 이 연구에서는 발달이나 엄마 기분과 관계가 없었어요.',
  ],
  src: [S.babySleep, S.routine, S.nightWaking],
};
const SLEEP_TRAINING = {
  id: 'sleep-training', emoji: '🌙', title: '수면교육',
  body: '밤에 자주 깨는 게 우리 집에 힘들 때 고르는 방법들이에요. 밤에 여러 번 일어나는 게 괜찮다면 안 해도 돼요. 대부분 6개월 이후에 권하고, 6개월 전에는 효과가 뚜렷하지 않다는 리뷰가 있어요.',
  options: [
    {
      name: '반응형으로 재우기 (안아서·먹여서)', how: '아기 신호에 맞춰 먹이거나 안아서 흔들고 토닥여 재워요. 원하면 6~9개월부터 도와주는 걸 조금씩 줄여요.',
      fits: '밤에 깨는 게 크게 힘들지 않은 집, 아기를 울리는 게 마음 편하지 않은 집, 6개월 전 아기',
      known: '첫돌 전 아기가 잠들 때와 밤에 깼을 때 도움이 필요한 건 흔한 일이에요. 늘 안아서 재우면 밤에 깼을 때도 같은 도움이 필요할 수 있어요.',
    },
    {
      name: '의자법 (곁에 있다가 조금씩 멀어지기)', how: '아기 침대 옆에 앉아 토닥여 재우고, 며칠마다 손길을 줄이고 의자를 조금씩 멀리 옮겨 방 밖까지 나가요. 보통 1~4주 걸려요.',
      fits: '6개월 이후, 울음을 오래 듣기 힘든 부모, 불안이 큰 아기. 부모가 보이는데 안아 주지 않으면 더 화내는 아기에겐 안 맞을 수 있어요.',
      known: '호주 연구에서 의자법이나 점진적 소거를 배운 집은 12개월에 수면 문제가 적고(39% 대 55%) 엄마 우울도 적었고, 2살 때 아이에게 해가 없었어요. 다른 방법보다 느리고 울음이 아예 없지는 않아요.',
    },
    {
      name: '점진적 소거 (간격 두고 달래기, 퍼버법)', how: '졸릴 때 눕히고 나와요. 울면 2분, 4분, 6분처럼 간격을 늘려 들어가 잠깐 토닥여 진정만 시키고 나와요. 보통 3~7일 걸리고, 언제든 그만두고 안아 줘도 돼요.',
      fits: '6개월 이후 건강하고 잘 먹는 아기, 빨리 바뀌길 바라고 처음 며칠 울음을 견딜 수 있는 집',
      known: '무작위 연구에서 효과가 있었고, 5년 뒤 아이 정서·행동·스트레스와 부모와의 관계에 차이가 없었어요 (Price 2012). 6~16개월 43명 연구에서도 12개월 뒤 애착 차이가 없었어요 (Gradisar 2016, 작은 연구).',
    },
    {
      name: '재우는 시간 늦췄다가 당기기', how: '아기가 실제로 잠드는 시각으로 잠깐 재우는 시간을 늦췄다가, 며칠마다 10~15분씩 앞당겨요.',
      fits: '눕혀도 잠들기까지 오래 걸리는 아기, 울음을 줄이고 싶은 집',
      known: '작은 연구에서 잠드는 데 걸리는 시간이 크게 줄었어요 (Gradisar 2016). 다른 방법보다 연구가 적어요.',
    },
    {
      name: '소거 (울어도 들어가지 않기)', how: '잠들기 순서를 마치고 나와서, 정한 때(아침이나 정한 수유)까지 들어가지 않아요. 아프거나 위험해 보이면 확인해요.',
      fits: '정한 방식을 꾸준히 지킬 수 있는 집',
      known: '미국수면의학회 리뷰에서 효과 근거가 가장 많은 방법 중 하나예요. 부모가 지키기 가장 힘들다는 보고가 있고, 울게 두는 것 자체에 반대하는 전문가도 있어요. 울음을 그친 뒤에도 아기 스트레스 호르몬이 높게 남았다는 작은 연구는 대조군이 없다는 한계가 지적됐어요.',
    },
  ],
  note: '어느 방법이든 안전 수면 수칙(등 대고 재우기, 잠자리에 베개·이불·인형 두지 않기)은 돌까지 같아요.',
  src: [S.mcri, S.responsive, S.camping, S.price, S.gradisar, S.aasm, S.under6m],
};

const FEED_CUES = {
  id: 'feed-cues', emoji: '🍼', title: '배고플 때 먹이기',
  list: [
    '시계보다 아기 신호를 보고 먹여요. 손을 입으로 가져가기, 젖이나 젖병 쪽으로 고개 돌리기, 입술을 오므리거나 빨기, 주먹 쥐기가 배고픈 신호예요. 울음은 늦은 신호예요.',
    '입을 다물거나, 고개를 돌리거나, 손에 힘이 풀리면 배부른 신호예요. 젖병을 다 비우지 않아도 돼요.',
    '모유 수유는 하루 8~12번쯤, 또는 배고픈 신호를 보낼 때마다 먹여요.',
    '모유를 충분히 먹는지는 대소변과 몸무게가 느는 걸로 봐요. 대소변이 평소보다 줄고 자꾸 보채거나 처지면 소아청소년과에 연락해요.',
  ],
  src: [S.cues, S.kdcaNutrition],
};
const SOLIDS_START = {
  id: 'solids-start', emoji: '🥄', title: '이유식은 언제 시작할까',
  body: '기관마다 권하는 시기가 조금씩 달라요. 공통점은 4개월 전에는 시작하지 않고, 아기가 준비됐는지 보는 거예요.',
  options: [
    { name: 'WHO: 6개월부터', how: '첫 6개월은 모유만 먹이고, 6개월부터 이유식을 시작하면서 모유는 2살 넘어서까지 이어 가길 권해요.' },
    {
      name: '미국소아과학회: 6개월 무렵, 준비 신호를 보고', how: '첫 6개월쯤은 모유만 권하고, 시작은 아기 발달에 맞춰요.',
      known: '준비 신호: 머리를 잘 가누고 받쳐 주면 앉아요, 남이 먹는 걸 보고 손을 뻗거나 입을 벌려요, 숟가락 음식을 혀로 밀어내지 않고 삼켜요. 출생 체중의 2배(보통 4개월쯤)가 되면 준비됐을 수 있다고도 해요.',
    },
    { name: '유럽소아소화기영양학회: 4~6개월 사이', how: '4개월 전에는 시작하지 말고, 6개월보다 늦추지도 말라고 해요.' },
    {
      name: '질병관리청: 먹는 것에 따라', how: '모유 먹는 아기는 6개월 이후, 분유 먹는 아기는 4~6개월에 시작하라고 안내해요.',
      known: '4~6개월 무렵 혀로 밀어내는 반사가 사라져요. 너무 일찍 시작하면 모유 수유가 짧아지고 설사가 생기기 쉽고, 너무 늦으면 빈혈 같은 영양 부족이 생길 수 있다고 해요.',
    },
  ],
  note: '어느 기준이든 6개월 무렵부터는 철분이 많은 음식(쇠고기 같은 고기)이 필요해요. 모유와 우유에는 철분이 적어요. 고기 육수보다 고기를 직접 먹이는 게 나아요.',
  src: [S.whoFeeding, S.aapSolids, S.espghan, S.kdcaSolids],
};
const SOLIDS_HOW = {
  id: 'solids-how', emoji: '🥄', title: '이유식 먹이는 방법',
  options: [
    {
      name: '떠먹이기', how: '미음·죽처럼 부드러운 것부터 숟가락으로 먹이고, 점점 되직하게(죽 → 진밥 → 밥) 바꿔요. 질병관리청 안내가 이 방식이고, 9개월쯤부터는 숟가락을 쥐고 손으로 집어 먹게 도와요.',
      fits: '먹는 양을 눈으로 확인하고 싶은 집, 6개월보다 일찍 시작하는 아기',
      known: '10개월이 되도록 덩어리 음식을 시작하지 않으면 나중에 먹는 데 어려움이 생길 수 있어서, 먹이기 편하다고 계속 묽게 주지 말고 발달에 맞춰 단단하게 바꿔 가요 (질병관리청).',
    },
    {
      name: '아기주도 이유식 (BLW)', how: '6개월 무렵부터 아기가 손에 쥘 수 있는 부드러운 음식을 스스로 집어 먹어요. 가족과 같이 앉아 먹고, 먹는 양은 아기가 정해요.',
      fits: '혼자 앉아서 음식을 입으로 가져갈 수 있는 아기, 가족이 함께 식사하는 집',
      known: '뉴질랜드 무작위 연구(BLISS, 206명)에서 12·24개월 체중(BMI)은 떠먹인 아기와 차이가 없었고 음식을 덜 가렸어요. 목에 걸리는 일도 비슷했어요(두 쪽 모두 6~8개월에 35%가 한 번 이상). 끼니마다 철분이 많은 음식을 주라고 안내받은 집은 철분도 차이가 없었지만, 그런 안내 없이 한 작은 연구에서는 철분을 덜 먹었어요. 미국소아과학회는 장점에 대한 연구가 아직 적다고 해요.',
    },
    {
      name: '섞어서', how: '죽이나 퓌레는 떠먹이고, 손으로 집어 먹는 음식도 같이 줘요. 아기가 숟가락을 직접 쥐게 해도 돼요.',
      fits: '두 방식을 같이 해 보고 싶은 집, 집과 어린이집처럼 여러 사람이 먹이는 경우',
      known: '섞는 방식만 따로 비교한 연구는 찾지 못했어요. 연구마다 아기주도 이유식을 정하는 기준이 달라서, 실제로는 많은 집이 이 사이 어딘가예요.',
    },
  ],
  note: '어느 방식이든: 새 음식은 한 번에 하나씩 주고 3~7일 지켜봐요. 땅콩 알·포도알·익히지 않은 당근처럼 목에 걸리기 쉬운 건 피해요. 처음엔 싫어해도 8~10번은 다시 줘 봐요. 꿀은 돌 전에는 주지 않아요.',
  src: [S.kdcaSolids, S.blw, S.bliss, S.choking, S.blwIron],
};
const ALLERGENS = {
  id: 'allergens', emoji: '🥜', title: '알레르기 잘 일으키는 음식',
  list: [
    '달걀·유제품·콩·땅콩·생선 같은 음식을 4~6개월보다 늦게 먹인다고 알레르기가 예방된다는 근거는 없어요.',
    '땅콩은 오히려 일찍 먹인 쪽이 알레르기가 적었어요. 알레르기 위험이 높은 아기 640명 연구에서 5살 땅콩 알레르기가 크게 줄었어요 (LEAP).',
    '심한 아토피 피부염이 있거나, 이미 음식 알레르기 반응이 있었거나, 가족 알레르기가 심하면 새 음식을 주기 전에 소아청소년과와 먼저 상의해요.',
    '땅콩 알은 목에 걸릴 수 있어서 통째로 주지 않아요. 다른 이유식을 몇 가지 먹어 본 뒤에 줘요.',
    '먹고 나서 두드러기·구토·입술이 붓는 증상이 있으면 진료를 받고, 숨쉬기 힘들어하거나 축 처지면 바로 응급실에 가요.',
  ],
  note: '국내 안내 중에는 잣·호두 같은 견과류와 새우 같은 갑각류를 돌 무렵부터 주라고 적힌 곳도 있어요 (질병관리청 이유식 안내). 같은 안내에서 알레르기를 걱정해 미리 미루는 건 더는 권하지 않는다고도 해서, 헷갈리면 소아청소년과에 물어봐요.',
  src: [S.kpsAllergy, S.aapAllergy, S.niaid, S.leap, S.kdcaNutrition, S.kdcaSolids],
};
const MILK_12M = {
  id: 'milk-12m', emoji: '🥛', title: '돌 무렵 먹을 것 (꿀·우유·주스·젖병)',
  list: [
    '꿀은 돌 전에는 주지 않아요. 영아 보툴리누스 중독이 생길 수 있어요. 음식·물·분유에 넣거나 노리개젖꼭지에 바르는 것도 안 돼요.',
    '생우유는 돌 무렵부터 줘요. 돌 전에는 철분이 부족하고 콩팥에 부담이 될 수 있어요. 돌이 지나면 하루 2컵(약 470mL) 이하로, 하루 710mL보다 많이 마시면 철분이 부족해지기 쉬워요.',
    '주스는 돌 전에는 주지 않아요. 1~3살은 100% 주스를 하루 120mL 이하로 주고, 과일 그대로 주는 게 더 좋아요.',
    '컵은 6~9개월부터 연습하고, 젖병은 돌 직후, 늦어도 18개월 전에 끊어요. 우유나 주스가 든 젖병을 물고 자면 앞니에 충치가 생기기 쉬워요.',
  ],
  src: [S.honey, S.milk, S.juice, S.kdcaSolids, S.kdcaNutrition],
};
const SEPARATION = {
  id: 'separation', emoji: '🥺', title: '낯가림·분리불안',
  list: [
    '9개월 무렵 많은 아기가 낯선 사람 앞에서 낯을 가리고 매달려요. 친숙한 것과 낯선 것을 구별하게 됐다는 뜻이고, 버릇을 잘못 들여서 생기는 게 아니에요.',
    '엄마·아빠와 떨어지기 힘들어하는 분리불안은 대개 10~18개월에 가장 심하고, 두 돌이 가까워지면 줄어요. 15~18개월에 시작하는 아이도 있어요.',
    '헤어질 때는 짧게, 늘 같은 방식으로 인사하고 나가요. 배고프거나 졸리거나 아플 때는 더 힘들어해요.',
  ],
  src: [S.stranger, S.separation, CDC('9-months', '9개월')],
};
const HOME_SAFETY = {
  id: 'home-safety', emoji: '🏠', title: '집 안 안전 (기고 서고 걷기 시작하면)',
  list: [
    '아이 눈높이로 바닥을 살펴 동전·구슬·단추·약처럼 삼킬 수 있는 걸 치워요.',
    '리모컨·차 키 등에 든 단추형 전지는 손에 닿지 않게 해요. 삼키면 식도가 빠르게 다칠 수 있어서 바로 병원에 가요.',
    '서랍장·책장·TV장은 넘어지지 않게 벽에 고정해요. 아이가 기어오르거나 붙잡고 일어서다 넘어질 수 있어요.',
    '쓰지 않는 콘센트는 막고, 블라인드·커튼 줄은 손이 닿지 않게 정리해요.',
    '미끄럼 방지, 떨어지는 곳·뜨거운 것에 닿는 곳에 보호 장치를 해요.',
  ],
  src: [S.homeSafety, S.kdcaHome],
};
const NO_NO = {
  id: 'no-no', emoji: '🙅', title: '"안 돼" 대신 할 수 있는 것',
  list: [
    '"안 돼"는 안전처럼 정말 중요한 일에 아껴 써요. "서지 마" 대신 "앉자"처럼 해야 할 걸 말해요.',
    '위험하거나 만지고 싶어 할 물건은 손이 닿지 않는 곳으로 치우면 "안 돼"라고 할 일이 줄어요.',
    '만지면 안 되는 걸 쥐고 있으면 가지고 놀아도 되는 걸로 바꿔 주거나 관심을 다른 데로 돌려요.',
    '잘했을 때 바로, 구체적으로 칭찬해요. 엄마·아빠·어린이집이 기본 규칙을 같이 맞추면 아이가 덜 헷갈려요.',
    '때리기는 특히 18개월 전 아기에게 다칠 위험이 커요. 때리거나 소리 지르고 창피를 주는 벌은 효과가 없고 해로워요. 우리나라도 2021년 민법에서 부모의 징계권 조항을 지웠어요.',
  ],
  src: [S.discipline, S.aapDiscipline, S.noSpanking],
};
const TANTRUM = {
  id: 'tantrum', emoji: '😤', title: '떼쓰기',
  list: [
    '떼쓰기는 발달 과정의 하나로 1~3살에 가장 많고, 3살이 넘으면 대개 줄어요. 아이 기질에 따라 많이 하는 아이도, 적게 하는 아이도 있어요.',
    '배고프거나 졸릴 때 많아지면 간식을 챙기고 낮잠 시간을 지켜요.',
    '떼쓰는 중에는 "빨간 컵, 파란 컵?"처럼 작은 선택지를 주거나, 다른 방으로 옮기거나, 노래로 관심을 돌려요.',
    '차도로 뛰어드는 것처럼 위험하면 바로 붙잡고, 때리기·물기·던지기는 바로 멈추게 해요.',
    '부모도 지치면 다른 어른과 번갈아 맡아요. 아이를 안전한 곳에 두고 몇 분 숨을 고르고 와도 돼요.',
  ],
  src: [S.tantrums, S.discipline],
};
const DISCIPLINE = {
  id: 'discipline', emoji: '🧭', title: '훈육 방식',
  body: '방식이 달라도 공통으로 권하는 건 같아요: 때리거나 소리 지르거나 창피 주지 않기, 규칙은 짧고 늘 같게, 잘했을 때 바로 구체적으로 칭찬하기.',
  options: [
    {
      name: '타임아웃', how: '한 번 경고하고("안 멈추면 타임아웃이야"), 그래도 위험하거나 남을 다치게 하거나 규칙을 어기면 재미있는 게 없는 조용한 곳에 잠깐 있게 해요. 흔히 나이 1살당 1분이에요. 끝나면 좋은 행동을 칭찬해요.',
      fits: '위험한 행동·때리기처럼 분명한 규칙 어김에 늘 같은 결과를 주고 싶은 집',
      known: '3살 때 타임아웃을 썼다는 집과 아닌 집 1,400여 명을 5학년까지 봤을 때 아이 정서·행동에 차이가 없었어요 (부모 응답 연구). 따뜻한 관계 안에서 차분하게 쓰면 해롭지 않다는 분석도 있어요. 혼자 떨어지는 게 아이에게 거절처럼 느껴질 수 있다고 걱정하는 전문가도 있어요.',
    },
    {
      name: '타임인 (곁에서 같이 진정하기)', how: '감정이 북받쳤을 때 혼자 두지 않고 곁에 있어 주며 같이 진정한 뒤, 차분해지면 이야기해요.',
      fits: '떨어지면 더 격해지는 아이, 같이 진정하는 걸 중요하게 여기는 집',
      known: 'CDC도 아이가 몹시 속상해할 때는 안전을 먼저 챙기고 곁에서 진정할 시간을 주라고 해요. 타임인만 따로 시험한 연구는 찾지 못했어요.',
    },
    {
      name: '감정코칭', how: '감정 알아차리기 → 가까워질 기회로 보기 → 들어 주기 → 감정에 이름 붙이기 → 행동에는 한계를 정하고 같이 해결책 찾기. 존 가트맨이 정리한 방식으로 우리나라에도 많이 알려졌어요.',
      fits: '감정을 말로 표현하도록 이끌어 주고 싶은 집. 아이가 아직 대화할 수 있을 만큼 진정됐을 때 해요.',
      known: '18~36개월 아이 부모 300명 무작위 연구(호주)에서 1년 뒤 부모의 감정코칭이 늘고 아이 행동이 나아졌어요. 주로 부모가 답한 결과이고, 프로그램을 만든 연구진이 한 연구예요.',
    },
    {
      name: '관심 거두기 + 칭찬', how: '칭얼대기·끼어들기처럼 관심을 끌려는 가벼운 행동에는 잠깐 반응하지 않고, 멈추면 바로 관심과 칭찬을 줘요.',
      fits: '관심을 끌려는 가벼운 행동이 잦을 때. 위험한 행동, 아이가 정말 힘들어할 때, 배고프거나 아플 때는 쓰지 않아요.',
      known: '부모 교육 무작위 연구 154개를 분석했더니 칭찬 같은 긍정적인 강화가 효과와 가장 관련이 컸어요. 무시하기만 따로보다는 부모 교육 프로그램 전체로 연구됐어요.',
    },
  ],
  note: '때리기는 2018년 미국소아과학회 권고에서 효과가 없고 해롭다고 했고, 우리나라도 2021년 민법에서 부모의 징계권 조항을 지웠어요.',
  src: [S.discipline, S.timeOut, S.cdcTimeOut, S.knight, S.dadds, S.emotionCoaching, S.tuningIn, S.ignoring, S.leijten, S.aapDiscipline, S.noSpanking],
};
const SCREEN = {
  id: 'screen', emoji: '📱', title: '영상 보여 주기',
  body: '기관마다 기준이 조금 달라요.',
  options: [
    { name: 'WHO (2019)', how: '1살까지는 영상을 보여 주지 않고, 2살은 하루 1시간 이하(적을수록 좋음)를 권해요. 그 시간에 책 읽기·이야기·노래·퍼즐을 같이 하길 권해요.' },
    { name: '미국소아과학회 (2016)', how: '18개월 전에는 영상통화 말고는 피하고, 18~24개월은 좋은 프로그램을 골라 같이 보고, 2~5살은 좋은 프로그램을 하루 1시간 이하로 같이 보길 권해요.' },
  ],
  note: '두 곳 모두 아이 혼자 보게 두기보다 어른과 같이 보고 이야기하는 걸 중요하게 봐요. 영유아 건강검진 4차(18~24개월) 건강교육에도 전자미디어 노출이 들어 있어서 검진 때 물어봐도 돼요.',
  src: [S.whoScreen, S.who5, S.aapMedia, S.checkupItems],
};
const READING = {
  id: 'reading', emoji: '📚', title: '같이 책 읽기',
  list: [
    '미국소아과학회는 태어날 때부터 같이 책 읽기를 권해요. 잠들기 전 순서에 책을 넣어도 좋아요.',
    '화면보다 그림이 많은 종이책이 좋아요. 화면은 혼자 보게 되기 쉽고 주고받는 게 적어요.',
    '책 읽기·이야기·노래처럼 어른과 함께하는 앉아서 하는 시간은 아이 발달에 중요해요 (WHO).',
  ],
  src: [S.reading, S.whoScreen],
};
const POTTY_READY = {
  id: 'potty-ready', emoji: '🚽', title: '배변훈련 준비 신호',
  list: [
    '대소변을 조절하는 신호는 대개 18~24개월에 보여요. 미국에서는 평균 2~3살에 배변훈련을 시작하고, 대부분 4살까지 가려요.',
    '낮에 2시간쯤 기저귀가 말라 있거나 낮잠 뒤에 말라 있어요.',
    '끙끙거리거나, 멈칫하거나, 쪼그려 앉으며 쌀 것 같은 티를 내요.',
    '간단한 말을 따르고, 화장실까지 걸어가 바지 내리는 걸 도와요.',
    '젖은 기저귀를 싫어하거나, 변기를 쓰고 싶어 하거나, 팬티를 입고 싶어 해요.',
  ],
  note: '영유아 건강검진 4차(18~24개월) 건강교육에 대소변 가리기가 들어 있어서 검진 때 물어봐도 돼요.',
  src: [S.potty, S.checkupItems],
};
const POTTY = {
  id: 'potty', emoji: '🚽', title: '배변훈련 방법',
  body: '어느 방법이든 실수했다고 혼내거나 벌주지 않고, "더러워" 같은 말 대신 긍정적인 말을 써요.',
  options: [
    {
      name: '아이 주도 (준비되면 천천히)', how: '준비 신호가 보이면 유아 변기를 두고, 아침마다 앉아 보는 습관을 들이며, 아이가 스스로 하게 이끌고 칭찬해요.',
      fits: '서두를 일이 없는 집, 아이가 재촉받으면 거부하는 경우',
      known: '미국소아과학회가 소개하는 방식이에요. 빠른 집중 훈련과 함께 건강한 아이에게 효과가 있었지만, 두 방법을 직접 비교한 연구는 없어요 (2006 리뷰).',
    },
    {
      name: '짧은 집중 훈련 (며칠 몰아서)', how: '며칠 동안 부모가 집중해서 물을 자주 마시게 하고, 자주 변기에 앉히고, 성공하면 바로 칭찬하고 보상해요.',
      fits: '아이가 준비 신호를 보이고, 부모가 며칠을 온전히 낼 수 있을 때',
      known: '1970년대 연구에서 빨리 익혔다고 보고됐지만, 그 방식의 "실수하면 반복 연습시키기"는 지금 권고(혼내지 않기)와 맞지 않아요. 요즘 나오는 "3일 훈련" 책은 따로 검증한 연구를 찾지 못했어요.',
    },
    {
      name: '준비가 분명해질 때까지 기다리기', how: '준비 신호가 여러 개 보이고 아이가 하고 싶어 할 때 시작해요.',
      fits: '아이가 거부하거나, 시작했다가 잘 안 돼서 쉬고 싶을 때',
      known: '378명을 본 연구에서 27개월 전에 집중적으로 시작해도 더 일찍 끝나지 않고 훈련 기간만 길어졌어요. 반대로 24개월 전에 시작한 아이가 나중에 소변 문제가 적었다는 관찰 연구 분석도 있어요(무작위 연구가 아니라 아직 확실하지 않아요).',
    },
  ],
  src: [S.potty, S.pottyTips, S.pottyReview, S.blum, S.li],
};

// 주제: { id, emoji, title, body?, list?, options?: [{ name, how, fits?, known? }], note?, src: [{ label, url }] }
// options가 있으면 = 의견이 갈리는 주제 → 방법 카드를 나란히. 시기마다 맨 앞은 발달
export const PERIODS = [
  {
    id: 'm0', months: [0, 1], label: '생후 0~1개월',
    topics: [
      {
        ...dev([
          '팔다리를 움찔움찔 움직이고, 손은 대개 꼭 쥐고 있어요',
          '엎드리면 고개를 옆으로 돌려요',
          '손을 눈과 입 가까이 가져가요',
          '큰 소리에 깜짝 놀라 팔다리를 쭉 뻗었다 모으고(모로 반사), 손바닥에 손가락을 대면 꼭 쥐어요',
          '20~30cm 거리를 가장 잘 보고, 다른 무늬보다 사람 얼굴을 좋아해요',
          '큰 소리에 반응하고, 익숙한 목소리 쪽을 보기도 해요',
          '하루 16~17시간쯤 자지만 한 번에 1~2시간씩 자요',
        ], S.newborn, S.reflexes, S.babySleep),
        note: '생후 1개월 무렵 아기에게 흔히 보이는 모습이에요 (미국소아과학회). 반사가 나타나고 사라지는 때는 아기마다 달라요. 마음에 걸리는 게 있으면 소아청소년과나 영유아 건강검진 1차(생후 14~35일)에서 물어봐요.',
      },
      SAFE_SLEEP, CRYING, FEED_CUES, TUMMY,
    ],
  },
  {
    id: 'm2', months: [2, 3], label: '생후 2~3개월',
    topics: [
      dev([
        '엎드려 있을 때 고개를 들어요',
        '팔다리를 모두 움직이고, 손을 잠깐씩 펴요',
        '말을 걸거나 웃어 주면 따라 웃고, 얼굴을 바라봐요',
        '말을 걸거나 안아 주면 진정돼요',
        '울음 말고 다른 소리를 내고, 큰 소리에 반응해요',
        '움직이는 사람을 눈으로 따라가고, 장난감을 몇 초 동안 바라봐요',
      ], CDC('2-months', '2개월')),
      SAFE_SLEEP, CRYING, FEED_CUES, TUMMY,
    ],
  },
  {
    id: 'm4', months: [4, 5], label: '생후 4~5개월',
    topics: [
      dev([
        '안아 주면 받쳐 주지 않아도 고개를 가눠요',
        '엎드리면 팔꿈치로 상체를 받쳐요',
        '손에 쥐여 준 장난감을 잡고, 손을 입으로 가져가요',
        '관심을 끌려고 먼저 웃고, 웃기면 킥킥거려요',
        '"우~", "아~" 소리를 내고, 말을 걸면 소리로 대답해요',
        '엄마·아빠 목소리 쪽으로 고개를 돌려요',
      ], CDC('4-months', '4개월')),
      SAFE_SLEEP, ROUTINE, SOLIDS_START,
    ],
  },
  {
    id: 'm6', months: [6, 8], label: '생후 6~8개월',
    topics: [
      dev([
        '엎드린 자세에서 뒤집어 누워요',
        '엎드려서 팔을 쭉 펴고 몸을 밀어 올려요',
        '앉을 때 손으로 짚어 몸을 받쳐요',
        '아는 사람을 알아보고, 거울 속 자기 모습을 좋아하고, 소리 내어 웃어요',
        '주고받듯 번갈아 소리를 내고, 입술로 "푸르르" 소리를 내요',
        '원하는 장난감에 손을 뻗고, 물건을 입에 넣어 살펴봐요',
      ], CDC('6-months', '6개월')),
      SOLIDS_HOW, ALLERGENS, SLEEP_TRAINING, READING,
    ],
  },
  {
    id: 'm9', months: [9, 11], label: '생후 9~11개월',
    topics: [
      dev([
        '혼자 앉고, 스스로 앉는 자세로 바꿔요',
        '물건을 한 손에서 다른 손으로 옮겨요',
        '"마마마", "바바바" 같은 여러 소리를 내고, 안아 달라고 팔을 들어요',
        '이름을 부르면 쳐다보고, 까꿍 놀이에 웃어요',
        '낯선 사람 앞에서 낯을 가리고, 엄마·아빠가 자리를 뜨면 쳐다보거나 울어요',
        '떨어뜨린 물건이 안 보이면 찾고, 두 물건을 맞부딪쳐요',
      ], CDC('9-months', '9개월')),
      SEPARATION, HOME_SAFETY, SLEEP_TRAINING, MILK_12M,
    ],
  },
  {
    id: 'm12', months: [12, 17], label: '생후 12~17개월',
    topics: [
      dev([
        '붙잡고 일어서고, 가구를 잡고 걸어요',
        '엄지와 검지로 작은 음식을 집어요',
        '"빠이빠이" 손을 흔들고, 엄마·아빠를 부르는 말이 있어요',
        '"안 돼" 하면 잠깐 멈춰요',
        '혼자 몇 걸음 걸어요 (15개월쯤)',
        '엄마·아빠 말고 한두 단어를 말해 보려 해요 (15개월쯤)',
        '원하는 게 있거나 도움이 필요할 때 손가락으로 가리켜요 (15개월쯤)',
        '블록 같은 작은 물건을 두 개 이상 쌓아요 (15개월쯤)',
      ], CDC('1-year', '12개월'), CDC('15-months', '15개월')),
      MILK_12M, NO_NO, SEPARATION, HOME_SAFETY, SCREEN, READING,
    ],
  },
  {
    id: 'm18', months: [18, 23], label: '생후 18~23개월',
    topics: [
      dev([
        '아무것도 잡지 않고 걸어요',
        '소파나 의자에 혼자 오르내려요',
        '끄적끄적 낙서하고, 숟가락을 써 보려 해요',
        '엄마·아빠 말고 세 단어 이상 말해 보려 해요',
        '손짓 없이 "그거 줘" 같은 말만 듣고도 따라 해요',
        '재미있는 걸 가리켜 보여 주고, 조금 떨어져 놀다가도 엄마·아빠가 가까이 있는지 돌아봐요',
      ], CDC('18-months', '18개월')),
      TANTRUM, DISCIPLINE, POTTY_READY, SCREEN,
    ],
  },
  {
    id: 'm24', months: [24, 35], label: '생후 24~35개월',
    topics: [
      dev([
        '공을 차고 뛰어요',
        '숟가락으로 먹어요',
        '"우유 더"처럼 두 단어를 이어 말해요',
        '누가 다치거나 속상해하면 알아채요',
        '두 발로 깡충 뛰어요 (30개월쯤)',
        '단어를 50개쯤 말해요 (30개월쯤)',
        '블록을 음식처럼 인형에게 먹이는 흉내 놀이를 해요 (30개월쯤)',
        '다른 아이 옆에서 놀고, 가끔은 같이 놀아요 (30개월쯤)',
      ], CDC('2-years', '24개월'), CDC('30-months', '30개월')),
      DISCIPLINE, POTTY, SCREEN, TANTRUM,
    ],
  },
];

// 만 개월 → 시기 번호 (0~71개월 밖이면 -1)
export const periodIndex = months => PERIODS.findIndex(p => months >= p.months[0] && months <= p.months[1]);

// ---------- 그리기: 처음엔 접힌 한 줄 → 누르면 ‹ 시기 › + 주제 제목 → 제목을 누르면 내용 (방법 카드·출처도 접힌 채로) ----------
// 펼친 상태·넘겨 본 시기는 기억하지 않음 (앱을 열 때마다 접힌 채로, 지금 시기)
let blockOpen = false;
const shown = new Map(); // 아이 id → 넘겨 보고 있는 시기 번호 (없으면 지금 시기)
const opened = new Set(); // '시기 id/주제 id', 방법 카드는 '…/번호', 출처는 '…/src'

export function guideBlock(childId, months, rerender) {
  const now = periodIndex(months);
  if (now < 0) return null;
  const i = shown.get(childId) ?? now, p = PERIODS[i];
  const sec = h('section', `block tips guide${blockOpen ? ' open' : ''}`);
  const head = button(`📖 이 시기 아이 · ${PERIODS[now].label}`, () => { blockOpen = !blockOpen; rerender(); }, 'tips-head');
  head.setAttribute('aria-expanded', blockOpen);
  sec.append(head);
  if (!blockOpen) return sec;

  const move = to => { if (to === now) shown.delete(childId); else shown.set(childId, to); rerender(); };
  const nav = h('div', 'guide-nav');
  const prev = button('‹', () => move(i - 1), 'icon-btn'), next = button('›', () => move(i + 1), 'icon-btn');
  prev.setAttribute('aria-label', '이전 시기');
  next.setAttribute('aria-label', '다음 시기');
  prev.disabled = i === 0;
  next.disabled = i === PERIODS.length - 1;
  const label = i === now ? h('span', 'guide-period', `${p.label} (지금)`) : button(`${p.label} · 지금으로`, () => move(now), 'guide-period link-btn');
  nav.append(prev, label, next);
  sec.append(nav);

  for (const t of p.topics) {
    const key = `${p.id}/${t.id}`;
    sec.append(toggle(key, `${t.emoji} ${t.title}`, 'tip-title', rerender));
    if (opened.has(key)) sec.append(topicBody(t, key, rerender));
  }
  sec.append(h('p', 'hint', `${GUIDE_CHECKED} 확인. 의학적 조언이 아니에요. 아이가 걱정되면 소아청소년과나 영유아 건강검진에서 상담해요.`));
  return sec;
}

function toggle(key, label, cls, rerender) {
  const open = opened.has(key);
  const b = button(label, () => { if (open) opened.delete(key); else opened.add(key); rerender(); }, `${cls}${open ? ' open' : ''}`);
  b.setAttribute('aria-expanded', open);
  return b;
}

function topicBody(t, key, rerender) {
  const body = h('div', 'tip-body');
  if (t.body) body.append(h('p', null, t.body));
  if (t.list) {
    const ul = h('ul', 'guide-list');
    ul.append(...t.list.map(x => h('li', null, x)));
    body.append(ul);
  }
  if (t.options) {
    body.append(h('p', 'hint', '의견이 여러 가지인 주제라 방법을 나란히 보여 드려요. 어느 쪽이 정답이라고 하지 않아요.'));
    const opts = h('div', 'guide-opts');
    t.options.forEach((o, i) => {
      const c = h('div', 'guide-opt'), k = `${key}/${i}`;
      c.append(toggle(k, o.name, 'guide-opt-name', rerender));
      if (opened.has(k)) {
        c.append(h('p', null, o.how));
        if (o.fits) c.append(labeled('잘 맞는 경우', o.fits));
        if (o.known) c.append(labeled('알려진 것', o.known));
      }
      opts.append(c);
    });
    body.append(opts);
  }
  if (t.note) body.append(h('p', 'note', t.note));
  const sk = `${key}/src`;
  body.append(toggle(sk, `출처 ${t.src.length}곳`, 'guide-src', rerender));
  if (opened.has(sk)) {
    const links = h('div', 'tip-links');
    for (const l of t.src) links.append(Object.assign(h('a', 'btn small', `${l.label} ↗`), { href: l.url, target: '_blank', rel: 'noopener' }));
    body.append(links);
  }
  return body;
}
function labeled(label, text) {
  const p = h('p');
  p.append(h('span', 'guide-label', label), text);
  return p;
}
