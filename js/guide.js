// 📖 이 시기 아이: 만 개월에 맞는 발달과 육아 안내 (0~143개월: 육아 0~2세 + 유아 만 3~5세 + 초등 만 6~11세)
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
  // 유아 (만 3~5세)
  sleepHours: { label: '미국소아과학회: 나이별 수면 시간 (2016)', url: 'https://publications.aap.org/aapnews/news/6630/AAP-endorses-new-recommendations-on-sleep-times' },
  naps: { label: 'Staton 2020 (낮잠 그만두는 나이 메타분석)', url: 'https://doi.org/10.1016/j.smrv.2019.101247' },
  napTips: { label: 'KidsHealth: 낮잠', url: 'https://kidshealth.org/en/parents/naps.html' },
  bedwetting: { label: 'AAP: 밤에 이불 적시기', url: `${AAP_HC}/toddler/toilet-training/Pages/Bedwetting.aspx` },
  kdcaEnuresis: { label: '질병관리청: 야뇨증(소아)', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5719' },
  niddk: { label: '미국국립보건원(NIDDK): 아이 소변 가리기', url: 'https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-control-problems-bedwetting-children/symptoms-causes' },
  mayoEnuresis: { label: '메이오 클리닉: 야뇨', url: 'https://www.mayoclinic.org/diseases-conditions/bed-wetting/symptoms-causes/syc-20366685' },
  picky: { label: 'AAP: 편식하는 아이 10가지 팁', url: `${AAP_HC}/toddler/nutrition/Pages/Picky-Eaters.aspx` },
  kpsPicky: { label: '대한소아청소년과학회: 편식하는 아이들을 위한 조언', url: 'https://www.pediatrics.or.kr/bbs/index.html?category=B&code=infantcare&gubun=&key=&keyfield=&mode=view&number=8678&page=1' },
  satter: { label: '엘린 새터: 먹기 책임 나누기', url: 'https://www.ellynsatterinstitute.org/how-to-feed/the-division-of-responsibility-in-feeding/' },
  pressure: { label: 'Galloway 2006 ("다 먹어" 실험)', url: 'https://doi.org/10.1016/j.appet.2006.01.019' },
  tasteReward: { label: 'Remington 2012 (맛보기 + 스티커)', url: 'https://doi.org/10.3945/ajcn.111.024596' },
  kapd: { label: '대한소아치과학회: 불소치약 사용', url: 'https://kapd.org/board/bbs/board.php?bo_table=consulting&page=1&sod=desc&sop=and&sst=wr_datetime&wr_id=160' },
  kdcaFluoride: { label: '질병관리청: 불소도포', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6572' },
  kdcaCavity: { label: '질병관리청: 충치', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6891' },
  aapTeeth: { label: 'AAP: 아이 충치 예방', url: 'https://www.healthychildren.org/English/healthy-living/oral-health/Pages/Teething-and-Dental-Hygiene.aspx' },
  checkupSchedule: { label: '국민건강보험: 영유아 건강검진 안내', url: 'https://www.nhis.or.kr/nhis/healthin/wbhaca04800m01.do' },
  roadLaw: { label: '도로교통법 제50조', url: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1032815189' },
  easylawCar: { label: '찾기쉬운 생활법령: 어린이 탑승안전', url: 'https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?ccfNo=1&cciNo=2&cnpClsNo=1&csmSeq=690&popMenu=ov' },
  carSeats: { label: 'AAP: 카시트', url: 'https://www.healthychildren.org/English/safety-prevention/on-the-go/Pages/Car-Safety-Seats-Information-for-Families.aspx' },
  drowning: { label: 'AAP: 익사 예방 권고 (2026)', url: 'https://www.healthychildren.org/English/news/Pages/AAP-releases-updated-drowning-prevention-recommendations.aspx' },
  pool: { label: 'AAP: 수영장 안전', url: 'https://www.healthychildren.org/English/safety-prevention/at-play/Pages/Swimming-Pool-Safety.aspx' },
  kdcaDrowning: { label: '질병관리청: 물에 빠짐', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=1747' },
  kidsAdjust: { label: 'KidsHealth: 유치원 적응 돕기', url: 'https://kidshealth.org/en/parents/adjust-to-preschool.html' },
  goeKinder: { label: '경기도교육청: 신입생 학부모 유치원 안내서 (2025)', url: 'https://www.goe.go.kr/resource/goe/na/bbs_2638/2025/05/07dd971d-6aec-45a5-bbf3-d746eff71a0d.pdf' },
  play: { label: 'AAP: 아이들은 놀면서 배워요', url: 'https://healthychildren.org/English/family-life/power-of-play/Pages/young-children-learn-a-lot-when-they-play.aspx' },
  siblings: { label: 'AAP: 형제 다툼', url: 'https://healthychildren.org/English/family-life/family-dynamics/pages/Sibling-Rivalry.aspx' },
  mediation: { label: 'Smith·Ross 2007 (형제 다툼 중재 연구)', url: 'https://doi.org/10.1111/j.1467-8624.2007.01033.x' },
  sharing: { label: 'Chernyak 2013 (스스로 고른 나누기)', url: 'https://doi.org/10.1177/0956797613482335' },
  directions: { label: 'CDC: 지시하는 법', url: 'https://www.cdc.gov/parenting-toddlers/communication/giving-directions.html' },
  rewards: { label: 'CDC: 칭찬과 보상', url: 'https://www.cdc.gov/parenting-toddlers/responding-to-behavior/using-rewards.html' },
  responding: { label: 'CDC: 행동에 반응하기', url: 'https://www.cdc.gov/parenting-toddlers/responding-to-behavior/index.html' },
  deci: { label: 'Deci 1999 (보상과 흥미, 128개 실험)', url: 'https://doi.org/10.1037/0033-2909.125.6.627' },
  bodyTalk: { label: 'AAP: 아이와 몸·성 이야기하기', url: `${AAP_HC}/preschool/Pages/Talking-to-Your-Young-Child-About-Sex.aspx` },
  bodyBehavior: { label: 'AAP: 유아의 몸에 대한 호기심', url: `${AAP_HC}/preschool/Pages/Sexual-Behaviors-Young-Children.aspx` },
  abusePrevention: { label: 'AAP: 아동 성폭력 예방', url: 'https://www.healthychildren.org/English/safety-prevention/at-home/Pages/Sexual-Abuse.aspx' },
  childWelfare: { label: '아동복지법 시행령 별표 6 (안전교육 기준)', url: 'https://www.law.go.kr/LSW/flDownload.do?bylClsCd=110201&flSeq=153219923&gubun=' },
  aapMedia2026: { label: '미국소아과학회 디지털 미디어 새 권고 요약 (2026)', url: 'https://publications.aap.org/aapnews/news/pdfDownload/34088' },
  nuri: { label: '교육부: 2019 개정 누리과정 (유아·놀이 중심)', url: 'https://moe.go.kr/boardCnts/view.do?boardID=294&boardSeq=78061&lev=0&m=020402&opType=N&page=1&s=moe&searchType=null&statusYN=W' },
  hangeul: { label: '교육부: 초등 한글 책임교육 (2019)', url: 'https://if-blog.tistory.com/9389' },
  privateEdu: { label: '교육부: 영유아 사교육 대응 방안 (2026)', url: 'https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=105780&lev=0&m=020402&opType=N&page=1&s=moe&searchType=null&statusYN=W' },
  powerOfPlay: { label: '미국소아과학회: 놀이의 힘 (2018)', url: 'https://publications.aap.org/pediatrics/article/142/3/e20182058/38649/The-Power-of-Play-A-Pediatric-Role-in-Enhancing' },
  highscope: { label: 'HighScope 비교 연구 (23살까지 추적)', url: 'https://doi.org/10.1016/S0885-2006(97)90009-0' },
  marcon: { label: 'Marcon 2002 (유치원 방식과 이후 성적)', url: 'https://ecrp.illinois.edu/v4n1/marcon.html' },
  lonigan: { label: 'Lonigan의 Marcon 연구 반론', url: 'https://ecrp.illinois.edu/v5n1/lonigan.html' },
  nelp: { label: '미국 조기 문해 위원회 보고서 (NELP 2008)', url: 'https://eric.ed.gov/?id=ED504224' },
  suggate: { label: 'Suggate 2013 (5살 대 7살 읽기 시작)', url: 'https://eric.ed.gov/?id=EJ1007877' },
  guidedPlay: { label: 'Skene 2022 (이끄는 놀이 메타분석)', url: 'https://doi.org/10.1111/cdev.13730' },
  goeFirst: { label: '경기도교육청: 행복한 학부모 꿈꾸는 1학년 (2024)', url: 'https://www.goe.go.kr/resource/goe/na/bbs_2638/2025/05/fcac4b96-e1ce-4ca6-adb2-fc12d83c16c1.pdf' },
  moeEnglish: { label: '교육부: 유치원 방과후 놀이 중심 영어 (2018)', url: 'https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=75408&lev=0&m=020402&opType=N&s=moe&statusYN=C' },
  baf: { label: '바르셀로나 시작 나이 연구 (BAF)', url: 'https://ripl.uk/the-barcelona-age-factor-project/' },
  munoz: { label: 'Muñoz 2011 (시작 나이와 노출량)', url: 'https://doi.org/10.1515/iral.2011.006' },
  flege: { label: 'Flege 1995 (배우기 시작한 나이와 억양)', url: 'https://doi.org/10.1121/1.413041' },
  hartshorne: { label: 'Hartshorne 2018 (언어 학습 결정적 시기)', url: 'https://doi.org/10.1016/j.cognition.2018.04.007' },
  schoolAge: { label: '초·중등교육법 제13조 (취학 의무)', url: 'https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1032860055' },
  schoolNotice: { label: '초·중등교육법 시행령 제17조 (취학 통지)', url: 'https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000947464' },
  enrollment: { label: '교육부: 취학통지·예비소집 (2026학년도)', url: 'https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=104634&lev=0&m=020402&opType=N&page=3&s=moe&searchType=null&statusYN=W' },
  // 초등 (만 6~11세)
  phoneAge: { label: '미국소아과학회: 휴대폰은 몇 살부터', url: 'https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/appropriate-age-to-introduce-a-mobile-device/' },
  firstPhone: { label: 'AAP: 첫 휴대폰, 준비됐을까', url: 'https://www.healthychildren.org/English/family-life/Media/Pages/Cell-Phones-Whats-the-Right-Age-to-Start.aspx' },
  wait8th: { label: 'Wait Until 8th (미국 부모 서약)', url: 'https://www.waituntil8th.org/' },
  anxiousGen: { label: '하이트 「불안 세대」 운동', url: 'https://www.anxiousgeneration.com/' },
  odgers: { label: 'Odgers 2024 (불안 세대 반론, Nature)', url: 'https://www.nature.com/articles/d41586-024-00902-2' },
  phone12: { label: 'Barzilay 2026 (12살 스마트폰과 건강)', url: 'https://pubmed.ncbi.nlm.nih.gov/41324306/' },
  phoneAgeStudy: { label: 'Sun 2023 (첫 폰 나이 5년 추적)', url: 'https://pubmed.ncbi.nlm.nih.gov/36056573/' },
  schoolPhone: { label: '초·중등교육법 제20조의5 (교내 스마트기기)', url: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032275567' },
  schoolPhoneNews: { label: '법제처: 3월부터 교내 스마트기기 사용 제한 (2026)', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148960442' },
  overuse: { label: '과학기술정보통신부: 스마트폰 과의존 실태조사 (2025)', url: 'https://eiec.kdi.re.kr/policy/callDownload.do?dtime=20260326234731&filenum=1&num=278528' },
  gameRating: { label: '게임콘텐츠등급분류위원회: 등급분류', url: 'https://www.gcrb.or.kr/Institution/EtcForm01.aspx' },
  gameTime: { label: '정책브리핑: 셧다운제 폐지, 게임시간 선택제 (2021)', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148897555' },
  youtubeKids: { label: 'YouTube: 가족 계정 고르기', url: 'https://support.google.com/youtube/answer/10315420' },
  googleAge: { label: 'Google: 나라별 계정 나이', url: 'https://support.google.com/accounts/answer/1350409?hl=en' },
  mediaPlan: { label: 'AAP: 가족 미디어 계획', url: 'https://www.healthychildren.org/English/fmp/Pages/MediaPlan.aspx' },
  tiktokAge: { label: 'TikTok: 가입 나이', url: 'https://support.tiktok.com/en/safety-hc/account-and-user-safety/underage-appeals-on-tiktok' },
  esafety: { label: '호주 eSafety: 16세 미만 SNS 제한', url: 'https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions' },
  cyberSurvey: { label: '연합뉴스: 2025 사이버폭력 실태조사', url: 'https://www.yna.co.kr/view/AKR20260330069500017' },
  report117: { label: '찾기쉬운 생활법령: 학교폭력 신고 (117)', url: 'https://easylaw.go.kr/CSP/CnpClsMainBtr.laf?ccfNo=3&cciNo=1&cnpClsNo=1&csmSeq=1408&popMenu=ov' },
  grooming: { label: '찾기쉬운 생활법령: 온라인 성착취 대화 대처', url: 'https://easylaw.go.kr/CSP/CnpClsMainBtr.laf?ccfNo=6&cciNo=1&cnpClsNo=2&csmSeq=659&popMenu=ov' },
  d4u: { label: '중앙디지털성범죄피해자지원센터', url: 'https://d4u.stop.or.kr/ko/main' },
  bullySigns: { label: 'StopBullying.gov: 괴롭힘 신호', url: 'https://www.stopbullying.gov/bullying/warning-signs' },
  bullySupport: { label: 'StopBullying.gov: 아이 돕기', url: 'https://www.stopbullying.gov/prevention/support-the-children-involved' },
  aapBullying: { label: 'AAP: 괴롭힘과 부모가 할 일', url: 'https://www.healthychildren.org/English/safety-prevention/at-play/Pages/Bullying-Its-Not-Ok.aspx' },
  bullySurvey: { label: '교육부: 2026년 1차 학교폭력 실태조사', url: 'https://eiec.kdi.re.kr/policy/callDownload.do?dtime=20260909162349&filenum=1&num=286577' },
  familyTalk: { label: 'AAP: 가족 대화 늘리기', url: 'https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/pages/Improving-Family-Communications.aspx' },
  cdcTalk: { label: 'CDC: 아이와 이어지는 대화', url: 'https://www.cdc.gov/healthy-youth/connecting-conversations/index.html' },
  praiseEffort: { label: 'Mueller·Dweck 1998 (노력 칭찬)', url: 'https://pubmed.ncbi.nlm.nih.gov/9686450/' },
  mindsetMeta: { label: 'Sisk 2018 (마인드셋 메타분석)', url: 'https://pubmed.ncbi.nlm.nih.gov/29505339/' },
  mindsetMeta2: { label: 'Burnette 2023 (마인드셋 교육 메타분석)', url: 'https://doi.org/10.1037/bul0000368' },
  pubertyGirls: { label: 'AAP: 여자아이 사춘기 몸 변화', url: 'https://www.healthychildren.org/english/ages-stages/gradeschool/puberty/pages/physical-development-girls-what-to-expect.aspx' },
  pubertyBoys: { label: 'AAP: 남자아이 사춘기 몸 변화', url: 'https://www.healthychildren.org/English/ages-stages/gradeschool/puberty/Pages/Physical-Development-Boys-What-to-Expect.aspx' },
  padVoucher: { label: '성평등가족부: 여성청소년 생리용품 바우처', url: 'https://www.mogef.go.kr/sp/yth/sp_yth_f017.do' },
  cdcAnxiety: { label: 'CDC: 아이의 불안과 우울', url: 'https://www.cdc.gov/children-mental-health/about/about-anxiety-and-depression-in-children.html' },
  helpLines: { label: '보건복지상담센터: 109·1388·1577-0199', url: 'https://www.129.go.kr/109' },
  emotionCheck: { label: '학생정서·행동특성검사 운영 매뉴얼 (부산교육청)', url: 'https://home.pen.go.kr/upload/happylogin/na/bbs_3162/ntt_744827/doc_be76vccfc-5bv93-40v71-90vd4-a0e6v77f4v8c2a_v247.pdf' },
  cdcMid: { label: 'CDC 육아 팁: 6~11세 (2008)', url: 'https://www2c.cdc.gov/podcasts/media/pdf/PosParenting_MidChildhood.pdf' },
  cdc68: { label: 'CDC 6~8세 페이지 (2024 보관본, restoredcdc.org)', url: 'https://restoredcdc.org/www.cdc.gov/child-development/positive-parenting-tips/middle-childhood-6-8-years.html' },
  cdc911: { label: 'CDC 9~11세 페이지 (2024 보관본, restoredcdc.org)', url: 'https://dev2.restoredcdc.org/www.cdc.gov/child-development/positive-parenting-tips/middle-childhood-9-11-years-old.html' },
  pubertyKids: { label: 'AAP: 사춘기 몸 변화', url: `${AAP_HC}/gradeschool/puberty/Pages/Physical-Development-of-School-Age-Children.aspx` },
  kdcaPrecocious: { label: '질병관리청: 성조숙증', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=1807' },
  necaPrecocious: { label: '병원신문: 한국보건의료연구원 성조숙증 치료 분석 (2026)', url: 'https://www.khanews.com/news/articleView.html?idxno=248275' },
  precociousTrend: { label: '심사평가원 연구: 소아 내분비 질환 추이 (2026)', url: 'https://www.e-epih.org/journal/view.php?number=1684' },
  schoolSleep: { label: 'AAP: 나이별 수면 시간', url: 'https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx' },
  whoActivity: { label: 'WHO: 신체활동 (5~17세)', url: 'https://iris.who.int/server/api/core/bitstreams/a137d0b6-64ec-4e86-a69a-ae38ca7cef59/content' },
  kdcaObesityRules: { label: '질병관리청: 소아청소년 비만 예방관리수칙 (2026)', url: 'https://www.kdca.go.kr/bbs/kdca/42/310302/artclView.do?layout=unknown' },
  kdcaObesity: { label: '질병관리청: 우리 아이 비만과 성장', url: 'https://health.kdca.go.kr/healthinfo/biz/health/ntcnInfo/healthSourc/thtimtCntnts/thtimtCntntsView.do?thtimt_cntnts_sn=58' },
  outdoorTrial: { label: 'He 2015 (바깥 활동과 근시, JAMA)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2441261' },
  outdoorLight: { label: 'Wu 2018 (그늘에서도 효과, 대만)', url: 'https://pure.lib.cgu.edu.tw/en/publications/myopia-prevention-and-outdoor-light-intensity-in-a-school-based-c-3/' },
  cochraneMyopia: { label: '코크란: 바깥 활동과 근시 (2024)', url: 'https://www.cochrane.org/ko/evidence/CD013549_what-are-benefits-and-risks-interventions-increase-time-spent-outdoors-preventing-incidence-and' },
  aapos: { label: '미국소아안과사시학회: 근시가 늘 때', url: 'https://engage.aapos.org/glossary/treatment-for-progressive-myopia' },
  kdcaMyopia: { label: '질병관리청: 굴절이상(근시)', url: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5217' },
  aaoMyopia: { label: '미국안과학회: 어린이 근시 조절', url: 'https://www.aao.org/education/clinical-statement/myopia-control-in-children' },
  schoolCheckup: { label: '교육부 학생건강정보센터: 학생건강검사', url: 'https://schoolhealth.kr/web/srs/selectSchoolOverview.do' },
  bikeSafety: { label: 'AAP: 자전거 안전', url: 'https://www.healthychildren.org/English/safety-prevention/at-play/Pages/Bicycle-Safety-Myths-and-Facts.aspx' },
  helmets: { label: 'AAP: 헬멧 써야 할 때', url: 'https://www.healthychildren.org/English/safety-prevention/at-play/Pages/bicycling-and-beyond-when-your-kids-should-wear-helmets.aspx' },
  walkSafety: { label: '행정안전부: 어린이 교통안전 수칙 (2025)', url: 'https://mois.go.kr/video/bbs/type019/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000255&nttId=121637&searchCode1=' },
  homeAlone: { label: 'AAP: 혼자 집에 있을 준비', url: 'https://www.healthychildren.org/English/safety-prevention/at-home/Pages/Is-Your-Child-Ready-To-Stay-Home-Alone.aspx' },
  firstGrade: { label: '교육부 고시 제2022-33호 (입학 초기 적응 활동)', url: 'https://www.sen.go.kr/component/file/ND_fileDownload.do?q_fileId=e6090e47-9453-40f3-90b9-cdea9a8e9da5&q_fileSn=2095930' },
  homework: { label: 'AAP: 숙제 습관', url: `${AAP_HC}/gradeschool/school/Pages/Developing-Good-Homework-Habits.aspx` },
  homeworkMeta: { label: 'Cooper 2006 (숙제와 성적)', url: 'https://eric.ed.gov/?id=EJ751143' },
  homeworkParents: { label: 'Patall 2008 (부모의 숙제 도움)', url: 'https://eric.ed.gov/?id=EJ896560' },
  homeworkQuality: { label: 'Moroni 2015 (도움의 횟수보다 방식)', url: 'https://phrepo.phbern.ch/1018/' },
  privateEduStats: { label: '국가데이터처·교육부: 2025 초중고 사교육비조사', url: 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=156748552' },
  advanceLaw: { label: '공교육정상화법 제8조 (선행교육 금지)', url: 'https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0008&lsiSeq=268711&urlMode=lsScJoRltInfoR' },
  bray: { label: 'Bray 2014 (사교육 효과 연구가 엇갈리는 이유)', url: 'https://hub.hku.hk/handle/10722/203477' },
  kdiTutoring: { label: 'KDI: 대학규제와 사교육 (2018)', url: 'https://www.kdi.re.kr/research/reportView?&pub_no=16368' },
  kimTutoring: { label: '김희삼 2010 (사교육의 효과 분석)', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2787544' },
  readAloud: { label: 'AAP: 소리 내어 읽어 주기', url: `${AAP_HC}/gradeschool/school/Pages/Help-Your-Child-Enjoy-Reading-Aloud-Tips-for-Parents.aspx` },
  readingSurvey: { label: '문화체육관광부: 2025 국민 독서실태 조사', url: 'https://www.mcst.go.kr/site/s_notice/press/pressView.jsp?pSeq=22278' },
  bookLink: { label: '국립중앙도서관: 책이음', url: 'https://books.nl.go.kr/one' },
  cfpb: { label: '미국 소비자금융보호국: 6~12세와 돈 벌기', url: 'https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/school-age-children-preteens/explore-earning/' },
  bokAllowance: { label: '한국은행 추천: 용돈은 정기적으로 (2003)', url: 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=148745212' },
  bucciol: { label: 'Bucciol 2014 (저축 가르치는 방법)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0167487014000580' },
  reading: { label: 'AAP: 태어날 때부터 함께 책 읽기 (2024)', url: 'https://www.healthychildren.org/English/news/Pages/beyond-literacy-shared-reading-starting-in-infancy-offers-lifelong-benefits.aspx' },
};

// ---------- 시기마다 같이 쓰는 주제 ----------
const DEV_NOTE = 'CDC 기준으로 이 나이까지 아이 4명 중 3명 이상이 하는 것들이에요. 아이마다 빠르기가 달라요. 하던 걸 안 하게 됐거나 마음에 걸리는 게 있으면 소아청소년과에 물어봐요. '
  + '영유아 건강검진 3차(생후 9~12개월)부터는 발달선별검사(K-DST)도 같이 받아요. 3주 넘게 일찍 태어났으면 교정 나이로 봐요.';
const dev = (list, ...src) => ({ id: 'dev', emoji: '👶', title: '이 무렵 발달', list, note: DEV_NOTE, src: [...src, S.kdst] });
// 만 6세부터는 CDC 체크리스트(4명 중 3명)가 없어서, 이 무렵 아이들의 모습을 설명으로
const KID_NOTE = '이 나이 아이들에게 흔히 보이는 모습이에요. 체크리스트가 아니라서, 아이마다 빠르기와 모습이 달라요. 마음에 걸리는 게 있으면 소아청소년과나 학교 상담 선생님과 이야기해 봐요.';
const kid = (list, ...src) => ({ id: 'dev', emoji: '🧒', title: '이 무렵 아이 모습', list, note: KID_NOTE, src });

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
      name: '타임아웃', how: '한 번 경고하고("안 멈추면 타임아웃이야"), 그래도 위험하거나 남을 다치게 하거나 규칙을 어기면 재미있는 게 없는 조용한 곳에 잠깐 있게 해요. 흔히 나이 1살당 1분이고, 3살부터는 "마음이 가라앉으면 돌아와"처럼 아이가 스스로 끝내게 해도 돼요. 끝나면 좋은 행동을 칭찬해요.',
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
    { name: 'WHO (2019)', how: '1살까지는 영상을 보여 주지 않고, 2~4살은 앉아서 보는 화면 시간을 하루 1시간 이하로(적을수록 좋음) 권해요. 그 시간에 어른과 책 읽기·이야기·노래·퍼즐을 하길 권해요.' },
    {
      name: '미국소아과학회 새 권고 (2026)', how: '시간 숫자만 보지 말고 아이·내용·가족 관계를 함께 보라고 해요. 영아는 디지털 미디어로 배우지 않지만 가끔 짧고 좋은 영상은 해롭지 않고, 걸음마·유아기는 하루 1시간 미만을 예로 들어요.',
      known: '내용의 질과 어른과 같이 보기를 강조하고, 잠들기 1시간 전에는 화면을 쉬고 기기는 침실 밖에 두길 권해요. 부모가 자책하기보다 오래 보게 만드는 앱 설계 같은 문제를 짚어 보라고도 해요.',
    },
    { name: '미국소아과학회 이전 권고 (2016)', how: '18개월 전에는 영상통화 말고는 피하고, 18~24개월은 좋은 프로그램을 골라 같이 보고, 2~5살은 좋은 프로그램을 하루 1시간 이하로 같이 보길 권했어요. 2026년에 새 권고로 바뀌었어요.' },
  ],
  note: '모두 아이 혼자 보게 두기보다 어른과 같이 보고 이야기하는 걸 중요하게 봐요. 영유아 건강검진 4차(18~24개월)와 7차(54~60개월) 건강교육에도 전자미디어 노출이 들어 있어서 검진 때 물어봐도 돼요.',
  src: [S.whoScreen, S.who5, S.aapMedia2026, S.aapMedia, S.checkupItems],
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

// ---------- 유아 (만 3~5세) ----------
const SLEEP_KID = {
  id: 'sleep-kid', emoji: '🌙', title: '잠·낮잠',
  list: [
    '만 3~5세는 낮잠을 포함해 하루 10~13시간 자는 게 권장돼요 (미국수면의학회·미국소아과학회, WHO). 매일 비슷한 시간에 자고 일어나요.',
    '낮잠을 그만두는 때는 아이마다 크게 달라요. 연구를 모아 보면 만 3세 무렵 3명 중 1명, 만 4세까지 절반 남짓, 만 5세까지 80%쯤이 낮잠을 안 자요 (연구마다 차이가 커요).',
    '낮잠을 안 자려 하면 억지로 재우기보다 책 보기처럼 조용히 쉬는 시간을 가져요. 낮잠을 그만두면 밤잠을 조금 일찍 재워 봐요.',
    '잠자기 1~2시간 전에는 화면을 보지 않아요 (CDC).',
  ],
  src: [S.sleepHours, S.whoScreen, S.naps, S.napTips, CDC('4-years', '4세')],
};
const BEDWETTING = {
  id: 'bedwetting', emoji: '🌛', title: '밤 소변 가리기',
  list: [
    '낮에는 대개 만 4세쯤, 밤에는 만 5~6세쯤 소변을 가려요 (미국국립보건원).',
    '만 5세 전에는 밤에 이불을 적시는 게 정상 발달 과정일 수 있어요. 만 5세 아이 15%쯤, 6세 10%쯤이 밤에 실수해요 (질병관리청).',
    '아이 잘못이나 게으름 때문이 아니에요. 혼내거나 놀리지 말고, 가족끼리 놀리지 않기로 정해요. 마른 밤에는 칭찬해요.',
    '6개월 넘게 잘 가리다 갑자기 다시 실수하거나, 소변 볼 때 아파하거나, 낮에도 자주 실수하거나, 소변이 뿌옇거나 분홍빛이면 소아청소년과에 물어봐요 (미국소아과학회).',
  ],
  options: [
    {
      name: '질병관리청: 만 5세가 기준이지만 절대적이지 않아요', how: '다섯 번째 생일이 지나고 주 2번 넘게 3개월 이상 이어지면 야뇨증으로 봐요. 아이가 어리면 좀 더 기다려 보길 권하지만, 아이가 힘들어하면 병원에 가 보라고 해요. 밤에 깨우거나 기저귀를 채우는 방법은 먼저 권하지 않아요.',
    },
    {
      name: '미국소아과학회: 실수한 밤엔 벌 대신 응원', how: '5살과 7살 아이 15%가 밤에 이불을 적시고, 15살이면 1% 아래로 줄어요. 약은 6살 이상에서 써요.',
    },
    { name: '메이오 클리닉: 7살 전에는 대개 걱정하지 않아요', how: '7살이 지나도 밤에 실수하거나, 몇 달 잘 가리다가 다시 시작하면 진료를 권해요.' },
  ],
  src: [S.kdcaEnuresis, S.bedwetting, S.niddk, S.mayoEnuresis],
};
const PICKY = {
  id: 'picky', emoji: '🥦', title: '편식',
  list: [
    '이 무렵 새 음식을 낯설어하고 좋아하는 몇 가지만 먹으려는 건 흔한 일이에요. 편식은 대개 지나가는 발달 과정이에요.',
    '한 음식을 받아들이기까지 10번 넘게 맛봐야 할 수도 있어요. 한 번 싫다고 해도 계속 상에 올려요.',
    '온 가족이 같은 음식을 먹고, 싫다고 따로 차려 주지 않아요. 아이가 좋아하는 음식도 하나는 같이 놓아요. 식사 때 TV·휴대폰은 꺼요.',
    '억지로 먹이거나 안 먹었다고 벌주면 좋아할 수 있던 음식도 싫어하게 될 수 있어요. 간식을 보상으로 걸지 않아요.',
  ],
  options: [
    {
      name: '차려만 주고 권하지 않기 (먹기 책임 나누기)', how: '무엇을·언제·어디서 먹을지는 어른이 정하고, 먹을지와 얼마나 먹을지는 아이가 정해요 (엘린 새터). 싫어하는 음식도 계속 상에 올리되 먹으라고 하지 않아요.',
      fits: '식사 때마다 실랑이가 잦은 집',
      known: '유아들에게 "다 먹어"라고 한 날보다 안 한 날 더 많이 먹고 싫다는 말도 훨씬 적었다는 실험이 있어요 (Galloway 2006).',
    },
    {
      name: '매일 한 입 맛보기 + 작은 스티커', how: '싫어하는 채소를 매일 아주 조금 맛보게 하고, 맛보면 스티커를 줘요. 간식 같은 음식 보상은 쓰지 않아요.',
      fits: '정해진 방식이 편한 집, 맛보기 자체를 놀이처럼 하고 싶은 집',
      known: '3~4살 173명 무작위 연구에서 12일 동안 맛보기 + 스티커를 한 쪽은 먹는 양과 좋아하는 정도가 늘었고 3개월 뒤에도 이어졌어요. 칭찬만 한 쪽은 차이가 크지 않았어요 (Remington 2012). 보상 쓰기에는 반대하는 의견도 있어요.',
    },
  ],
  src: [S.picky, S.kpsPicky, S.satter, S.pressure, S.tasteReward],
};
const TEETH = {
  id: 'teeth', emoji: '🦷', title: '양치·치과',
  list: [
    '불소가 1,000ppm 이상 든 치약을 만 3세 전에는 쌀알만큼, 만 3세부터는 작은 콩알만큼 써요. 저불소 치약은 권하지 않아요 (대한소아치과학회).',
    '아직 잘 뱉지 못하니 양은 어른이 짜 줘요. 미국소아과학회는 양치는 8살쯤까지, 치실은 10살쯤까지 도와주라고 해요.',
    '영유아 구강검진은 30~41개월, 42~53개월, 54~65개월에 한 번씩 받을 수 있고 본인 부담이 없어요. 정기 치과 검진은 보통 6개월마다 권해요.',
    '치과에서 하는 불소도포는 3세 이상에서 1년에 2번 넘게 권하고, 보건소에서 하는 곳도 있어요 (질병관리청).',
  ],
  src: [S.kapd, S.aapTeeth, S.checkupSchedule, S.kdcaCavity, S.kdcaFluoride],
};
const SAFETY_KID = {
  id: 'safety-kid', emoji: '🚗', title: '카시트·물놀이 안전',
  list: [
    '차에서는 모든 좌석에서 안전띠를 매야 하고, 6세 미만은 카시트(유아보호용 장구)를 단 뒤 안전띠를 매야 해요 (도로교통법 제50조). 아이를 안고 타지 않아요.',
    '하네스 달린 앞보기 카시트를 제품이 허용하는 키·몸무게까지 되도록 오래(적어도 4살까지) 쓰고, 그다음엔 안전띠가 몸에 맞을 때까지(보통 키 145cm쯤, 8~12살) 부스터를 써요. 13살 아래는 뒷좌석에 타요 (미국소아과학회).',
    '물놀이 때는 수영할 줄 아는 어른이 팔 닿는 거리에서 지켜봐요. 잠깐이라도 아이만, 또는 아이끼리만 두지 않아요.',
    '수영을 배우면 위험이 줄지만 물에 안 빠지게 해 주지는 않아요. 깊은 물이나 배에서는 구명조끼를 입혀요.',
    '물에 빠지는 사고는 5세 이하에서 가장 많고, 욕조나 양동이에서도 생겨요. 간이 수영장은 쓰고 나면 바로 물을 비워요.',
  ],
  src: [S.roadLaw, S.easylawCar, S.carSeats, S.drowning, S.pool, S.kdcaDrowning],
};

const ADJUST = {
  id: 'adjust', emoji: '🏫', title: '어린이집·유치원 적응',
  list: [
    '만 3세 무렵 많은 아이가 등원 때 엄마·아빠와 헤어진 뒤 10분 안에 진정해요 (CDC).',
    '다니기 전에 몇 번 미리 가 보고, 집에서 헤어지는 인사를 연습해 봐요.',
    '인사는 짧고 매일 같은 방식으로 해요. 몰래 나가면 아이가 더 불안해하고, 길게 끄는 작별은 "가기 싫은 곳"이라는 느낌을 키울 수 있어요. 울며 붙잡아도 다시 들어가지 않고 일관되게 해요.',
    '"낮잠 자고 간식 먹으면 데리러 올게"처럼 아이가 아는 일로 약속하고 꼭 지켜요.',
    '처음엔 짧게 떨어져 있다가 차츰 늘려요. 적응 기간과 방식은 기관마다 달라서 입학 상담 때 물어봐요.',
  ],
  src: [CDC('3-years', '3세'), S.separation, S.kidsAdjust, S.goeKinder],
};
const FRIENDS = {
  id: 'friends', emoji: '🤝', title: '친구·형제 다툼',
  list: [
    '만 3세엔 다른 아이에게 다가가 같이 놀기 시작하고, 만 4세엔 속상한 친구를 위로하고, 만 5세쯤엔 놀이 규칙과 차례를 지켜요 (CDC). 장난감을 뺏거나 밀치는 건 이 나이에 흔하고, 대개 미워서 그러는 게 아니에요.',
    '뺏는 대신 "나도 해도 돼?", "내 차례 언제야?"라고 말하는 법을 같이 연습해요. 차례는 타이머로 정해도 좋아요.',
    '아끼는 물건 몇 개는 나누지 않아도 돼요. 친구가 오기 전에 미리 치워 두게 해요.',
    '때리거나 다칠 것 같으면 바로 끼어들어요. 형제 다툼에서는 한쪽 편을 들지 않아요.',
  ],
  options: [
    {
      name: '스스로 풀게 두기', how: '가까이 있다가 위험해지거나 도움을 청할 때만 끼어들어요.',
      fits: '가벼운 다툼, 아이들끼리 말로 풀어 볼 수 있을 때',
      known: 'CDC·미국소아과학회가 권하는 방식이고, 경기도교육청 안내서도 작은 다툼은 스스로 해결하게 하라고 해요. 그때마다 부모가 나서면 기대는 법을 먼저 배울 수 있다고 해요.',
    },
    {
      name: '부모가 중재하기', how: '규칙을 말하고 → 무엇 때문인지 정리하고 → 아이들 각자의 이야기를 듣고 → 아이들이 해결책을 내게 해요. 부모가 대신 정해 주지 않아요.',
      fits: '같은 다툼이 되풀이될 때, 한쪽이 늘 밀릴 때',
      known: '5~10살 형제가 있는 48가족 무작위 연구에서 중재를 배운 집 아이들이 더 자주 양보하고 서로의 입장을 더 잘 이해했어요. 주로 5살 넘은 아이를 본 연구예요.',
    },
  ],
  note: '나누기를 시켜서 하게 하기보다 아이가 스스로 고르게 했을 때 다음에 더 잘 나눴다는 3~4살 연구도 있어요.',
  src: [CDC('4-years', '4세'), S.play, S.siblings, S.mediation, S.sharing, S.goeKinder],
};
const PRAISE_KID = {
  id: 'praise-kid', emoji: '⭐', title: '지시·칭찬·보상표',
  list: [
    '이 무렵 규칙을 시험해 보는 건 자연스러워요. 장난감 정리처럼 쉬운 일을 맡기고 해내면 칭찬해요.',
    '지시는 한 번에 하나씩, "치울래?"처럼 묻지 말고 "장난감 치워 줘"처럼 말해요. 못 하는 것과 안 하는 것은 달라요.',
    '"이거 입을래, 저거 입을래?"처럼 괜찮은 것 두 가지 중에 고르게 해요.',
    '결과는 행동과 이어지게 정해요. 다투던 장난감을 잠깐 치우는 식이에요. 경고는 지킬 수 있을 때만 하고, 밥처럼 꼭 필요한 건 빼앗지 않아요.',
    '화나는 마음은 괜찮지만 때리거나 부수는 건 안 된다고 알려 주고, 말로 푸는 법을 가르쳐요.',
    '"장난감 치운 거 봤어!"처럼 무엇을 잘했는지 짚어서 칭찬해요.',
  ],
  options: [
    {
      name: '스티커 보상표', how: '바꾸고 싶은 행동 몇 가지(잠자리에 누워 있기, 변기 쓰기 등)를 정하고, 해낼 때마다 바로 스티커를 붙여요. 한 번 받은 보상은 빼앗지 않아요.',
      fits: '바꾸고 싶은 생활 습관이 분명할 때',
      known: 'CDC가 안내하는 방법이에요. 잘 안 되면 목표나 보상을 바꿔 보라고 해요.',
    },
    {
      name: '물건 보상 없이 칭찬과 관심으로', how: '스티커나 선물 대신, 무엇을 잘했는지 짚어 주는 칭찬과 관심으로 알려 줘요.',
      fits: '그림 그리기처럼 아이가 이미 좋아하는 활동',
      known: '128개 실험을 모은 분석에서 미리 약속한 물건 보상은 원래 좋아하던 활동에 대한 흥미를 떨어뜨렸고, 칭찬 같은 긍정적인 말은 흥미를 높였어요. 다만 이미 좋아하는 활동에 대한 연구라 생활 습관 보상표와는 다를 수 있어요.',
    },
  ],
  src: [S.discipline, S.directions, S.responding, S.rewards, S.deci],
};
const BODY_SAFETY = {
  id: 'body-safety', emoji: '🙈', title: '몸 안전 교육',
  list: [
    '음경·질 같은 생식기도 다른 몸 부분처럼 정확한 이름으로 불러요. 다른 이름으로 바꿔 부르면 나쁘거나 숨길 곳이라는 느낌을 줄 수 있어요.',
    '수영복으로 가리는 곳과 입은 허락 없이 남이 보거나 만지면 안 되는 곳이라고 알려 줘요. 아이도 남을 만지기 전에 "응"이라는 대답을 먼저 들어야 해요.',
    '뽀뽀·포옹을 억지로 시키지 않아요. 할머니·할아버지께도 손 흔들기나 하이파이브로 인사해도 괜찮아요. 엄마·아빠도 안아도 되는지 먼저 물어봐 주세요.',
    '깜짝 선물 같은 비밀은 지켜도 되지만, 몸에 관한 비밀은 꼭 믿는 어른에게 말하라고 해요. 말해도 혼나지 않고, 믿어 준다고 알려 줘요.',
    '3~6살에 자기 몸을 만지거나 궁금해하는 건 흔한 발달이에요. 놀라지 말고 "혼자 있는 곳에서 해"처럼 차분하게 말해요.',
    '목욕할 때, 잠자리, 병원 가기 전처럼 일상에서 짧게 되풀이해요. 어린이집·유치원도 법에 따라 6개월에 1번 넘게 성폭력 예방 교육(내 몸의 소중함, 정확한 이름, 좋은 느낌과 싫은 느낌)을 해요.',
  ],
  src: [S.bodyTalk, S.bodyBehavior, S.abusePrevention, S.childWelfare],
};

const LETTERS = {
  id: 'letters', emoji: '🔤', title: '한글·숫자 언제 가르칠까',
  body: '누리과정(만 3~5세 국가 교육과정)은 "유아 중심·놀이 중심"이에요. 초등학교 1학년 국어에서 한글을 처음부터 가르치고, 2017년부터 한글 수업이 27시간에서 68시간으로 늘었어요 (교육부).',
  options: [
    {
      name: '놀이 중심', how: '놀이·그림책·생활 속에서 글자와 수를 만나고, 학습지로 따로 가르치지 않아요. 누리과정이 이 방향이에요.',
      fits: '누리과정 방향을 따르고 싶은 집, 아이가 아직 글자에 관심이 적을 때',
      known: '미국소아과학회는 놀이하며 배우게 하는 프로그램이 성공적이라며 균형 잡힌 교육과정을 권해요. 놀이 중심 유치원을 다닌 아이가 나중에 더 나았다는 추적 연구도 있지만(HighScope, Marcon), 표본이 작거나 인과를 밝히지 못했다는 한계와 반론이 있어요. 경기도교육청 1학년 안내서는 입학 전엔 한글을 가르치기보다 책을 많이 읽어 주라고 해요.',
    },
    {
      name: '일찍 가르치기 (학습지·한글 떼기)', how: '학습지나 수업으로 글자·소리·숫자를 순서대로 가르쳐요.',
      fits: '아이가 글자에 관심을 보이는 집, 입학 전에 미리 익히게 하고 싶은 집',
      known: '글자와 소리를 짚어 가르치면 읽기 기초 기술이 오른다는 분석이 있어요(미국 NELP 2008, 연구자가 1:1·소그룹으로 자주 가르친 경우). 5살에 읽기를 배운 아이와 7살에 배운 아이를 비교한 뉴질랜드 연구에서는 11살쯤 차이가 없어졌고, 늦게 시작한 쪽이 독해가 조금 더 좋았어요(실험 연구는 아니에요). 대부분 영어권 연구라 한글에 그대로 맞을지는 알 수 없어요.',
    },
    {
      name: '관심 따라가며 생활 속에서', how: '간판·과자 봉지 글자 읽기, 집 안 물건에 단어 카드 붙이기, 같이 책 읽기, 엘리베이터·버스 번호 같은 생활 속 숫자 찾기, 놀이하며 세기를 해요.',
      fits: '두 방식 사이 어딘가를 원하는 집',
      known: '같이 책 읽기는 글자 지식과 말하기에 도움이 됐고(NELP), 어른이 이끌어 주는 놀이가 직접 가르치기보다 초기 수학에 조금 더 나았다는 분석이 있어요(Skene 2022). 다만 "이끄는 놀이"를 정하는 기준이 연구마다 달라요.',
    },
  ],
  note: '2024년 시험 조사에서 만 5세의 81%가 사교육을 받았어요. 교육부는 2026년 유아 대상 학원의 레벨테스트를 금지하는 법 개정(국회 통과)과, 36개월 이상 유아에게 하루 3시간·주 15시간이 넘는 인지 교습을 막는 계획을 냈어요.',
  src: [S.nuri, S.hangeul, S.goeFirst, S.powerOfPlay, S.highscope, S.marcon, S.lonigan, S.nelp, S.suggate, S.guidedPlay, S.privateEdu],
};
const ENGLISH = {
  id: 'english', emoji: '🌍', title: '영어 조기교육',
  body: '정규 영어 수업은 초등학교 3학년부터예요. 유치원 방과후 과정에서는 노래·게임·율동 같은 놀이 중심 영어만 하루 1시간 이내로 할 수 있어요 (교육부).',
  options: [
    {
      name: '일찍, 일주일에 몇 시간씩', how: '학원·방과후처럼 일주일에 몇 시간 영어를 접해요.',
      fits: '영어를 놀이처럼 일찍 접하게 하고 싶은 집',
      known: '노출이 적은 학교 수업 환경에서는 늦게(11살쯤) 시작한 아이가 더 빨리 배워 따라잡았고, 같은 양을 배우면 시작 나이가 결과를 가르지 않았다는 연구가 많아요(스페인 BAF 연구). 대부분 8~11살에 시작한 아이들 연구라 3~5살과는 다를 수 있어요.',
    },
    {
      name: '생활 속에서 많이 접하기 (몰입)', how: '영어를 쓰는 환경에서 지내거나 하루 중 많은 시간을 영어로 보내요.',
      fits: '영어를 생활에서 많이 쓸 수 있는 집',
      known: '캐나다 이민자 240명 연구에서 일찍 배우기 시작할수록 외국인 억양이 적었어요. 문법을 배우는 능력은 17살 무렵까지 유지된다는 대규모 연구도 있어요. 노출이 아주 많은 환경에서 나온 결과예요.',
    },
    {
      name: '초등 정규 수업까지 기다리기', how: '따로 가르치지 않고 초등 3학년 정규 수업부터 시작해요. 노래나 그림책으로 가볍게 접하는 정도로 해요.',
      fits: '우리말 말하기·읽기를 먼저 다지고 싶은 집, 사교육 부담을 줄이고 싶은 집',
      known: '노출이 적은 수업 환경이라면 늦게 시작해도 따라잡을 수 있다는 위 연구들이 이쪽 근거가 돼요.',
    },
  ],
  note: '어느 쪽이든 시작 나이만큼 얼마나, 어떤 질의 영어를 접하느냐가 중요하다고 해요.',
  src: [S.moeEnglish, S.baf, S.munoz, S.flege, S.hartshorne, S.privateEdu],
};
const SCHOOL_READY = {
  id: 'school-ready', emoji: '🎒', title: '초등학교 입학 준비',
  list: [
    '만 6세가 되는 해의 다음 해 3월 1일에 입학해요. 1년 일찍(만 5세가 된 해의 다음 해)이나 1년 늦게(만 7세가 된 해의 다음 해) 입학할 수도 있어요.',
    '취학통지서는 입학 전 해 12월 20일까지 주민센터(읍·면·동)에서 보내고, 정부24에서도 받을 수 있어요.',
    '12월~1월 학교 예비소집에는 아이와 함께 직접 가요. 오지 않으면 학교가 아이 안전을 확인해요.',
    '영유아 건강검진 8차(66~71개월)에서 예방접종 확인과 취학 전 준비 상담을 해요. 입학 전에 DTaP 5차, IPV 4차, MMR 2차, 일본뇌염 접종을 확인해요.',
    '화장실 혼자 가고 뒤처리하기, 지퍼·단추, 우유갑 열기, 젓가락처럼 스스로 하는 일을 미리 연습해 봐요. 내 물건에는 이름을 써 둬요.',
    '교육부는 유치원·어린이집과 초등학교를 잇는 "이음교육"을 늘려 5세 아이의 학교 적응을 돕겠다고 했어요 (2026).',
  ],
  src: [S.schoolAge, S.schoolNotice, S.enrollment, S.checkupItems, S.goeFirst, S.privateEdu],
};

// ---------- 초등 (만 6~11세) ----------
const PHONE_FIRST = {
  id: 'phone-first', emoji: '📱', title: '첫 스마트폰은 언제',
  body: '처음 주기에 딱 맞는 나이는 연구로 정해져 있지 않아요 (미국소아과학회). 미국소아과학회는 폰과 SNS는 따로 정하고, SNS는 13살까지 미루길 권해요.',
  options: [
    {
      name: '기다렸다 주기 (또래 가정과 같이 약속)', how: '또래 가정과 함께 약속하고 스마트폰을 미뤄요. 미국 "Wait Until 8th"는 8학년(중2) 말까지, 하이트의 "불안 세대" 운동은 고등학교 전엔 스마트폰 없이, 16살 전엔 SNS 없이를 내세워요. 그동안 통화만 되는 폰은 써도 된다고 해요.',
      fits: '주변 가정과 함께 약속하기 쉬운 집',
      known: '12살에 스마트폰이 있는 아이가 우울·비만·잠 부족과 관련이 있었다는 1만 명 넘는 관찰 연구가 있어요(2026). 관련성일 뿐 원인이라고 할 수는 없어요. 하이트의 주장은 과학적 근거가 부족하다는 반론도 있어요(Nature 2024).',
    },
    {
      name: '통화·문자 폰이나 시계 먼저', how: '통화·문자만 되는 폰이나 시계로 연락 수단만 먼저 마련해요.',
      fits: '등하교·학원·두 집 생활처럼 연락이 꼭 필요한 집',
      known: '미국소아과학회는 어린 나이엔 이런 기기가 더 잘 맞을 수 있다고 해요. 이 방식만 따로 본 연구는 찾지 못했어요.',
    },
    {
      name: '준비되면 규칙과 함께', how: '숙제 같은 일에 책임감이 있는지, 다른 기기 규칙을 잘 지키는지, 부모가 도울 준비가 됐는지 살펴보고 보호 기능과 규칙을 같이 정해요. 책임감을 보이면 제한을 조금씩 풀어요. 아직 아니라고 정해도 괜찮아요.',
      fits: '아이와 자주 이야기할 시간이 있는 집',
      known: '처음 폰을 받은 나이와 우울·성적·잠 사이에 의미 있는 관련이 없었다는 5년 추적 연구가 있어요(2023). 미국 한 지역의 저소득 가정 아이 263명을 본 연구예요.',
    },
  ],
  note: '2026년 3월부터 학교 수업 중에는 스마트기기 사용이 법으로 제한되고, 학교 안 사용·소지 규칙은 학교마다 학칙으로 정해요.',
  src: [S.phoneAge, S.firstPhone, S.wait8th, S.anxiousGen, S.phone12, S.odgers, S.phoneAgeStudy, S.schoolPhone, S.schoolPhoneNews],
};
const GAMES = {
  id: 'games', emoji: '🎮', title: '게임·유튜브',
  list: [
    '게임은 등급(전체이용가·12세·15세·청소년이용불가)을 먼저 확인해요.',
    '강제 셧다운제는 2022년에 없어졌고, 만 18세 미만은 보호자나 아이가 요청하면 게임할 수 있는 시간대를 정할 수 있어요(게임시간 선택제).',
    '13세 미만(한국 구글 계정은 14세 미만)은 유튜브 키즈나 보호자가 관리하는 계정을 쓸 수 있어요.',
    '미국소아과학회는 학령기 아이의 오락용 화면 시간으로 하루 1~2시간쯤을 예로 들고, 시간보다 내용과 잠·운동·숙제를 밀어내지 않는지를 보라고 해요. 잠들기 1시간 전엔 화면을 끄고 기기는 침실 밖에 둬요.',
    '가족 미디어 계획(미국소아과학회)처럼 규칙을 아이와 같이 정해 봐요.',
    '2025년 조사에서 만 3~9세의 26%(보호자 응답), 만 10~19세의 43%가 스마트폰 과의존 위험군이었어요 (과학기술정보통신부).',
  ],
  src: [S.gameRating, S.gameTime, S.youtubeKids, S.googleAge, S.aapMedia2026, S.mediaPlan, S.overuse],
};
const ONLINE_SAFETY = {
  id: 'online-safety', emoji: '🔐', title: 'SNS·온라인 안전',
  list: [
    '대부분의 SNS는 만 13세부터 가입할 수 있고, 한국에서는 틱톡·구글 계정처럼 만 14세가 기준인 곳이 많아요. 호주는 2025년 12월부터 16살 미만의 SNS 계정을 막고 있어요.',
    '비밀번호와 개인정보(주소, 학교, 사진)는 친구에게도 알려 주지 않기로 약속해요.',
    '사이버폭력은 청소년 10명 중 4명꼴이 겪었고, 피해는 전혀 모르는 사람에게서 가장 많이 와요 (2025 실태조사, 초4~고3).',
    '어른이 온라인에서 성적인 대화를 이어 가거나 사진을 요구하면 처벌 대상이에요. 대화방을 나가지 말고 화면을 캡처해 둔 뒤 보호자에게 알리라고 가르쳐요.',
    '학교폭력·사이버폭력은 117(24시간, 문자 #0117), 디지털 성범죄는 디지털성범죄피해자지원센터(02-735-8994, 평일 8~22시·주말 9~18시)나 24시간 여성긴급전화 1366, 긴급하면 112예요.',
  ],
  src: [S.tiktokAge, S.googleAge, S.esafety, S.cyberSurvey, S.grooming, S.report117, S.d4u],
};
const BULLYING = {
  id: 'bullying', emoji: '🛡', title: '친구 관계·학교폭력',
  list: [
    '이유 없이 자주 배나 머리가 아프다고 하거나, 학교에 가기 싫어하거나, 물건이 자주 없어지거나 망가지거나, 갑자기 친구가 없어지면 친구 관계를 살며시 물어봐요. 다른 이유일 수도 있어요.',
    '"더 얘기해 줄래?", "그때 어땠어?"처럼 묻고 끝까지 들어요. 바로 해결하려 하기보다 먼저 들어 주고, "네 잘못이 아니야"라고 말해 줘요.',
    '"무시해"나 "맞서 싸워"라고 하지 않아요. 상대 부모에게 바로 연락하기보다 학교를 통해요. 괴롭힘은 둘을 마주 앉혀 화해시키는 방식으로는 잘 풀리지 않아요.',
    '학교폭력을 알게 되면 학교나 117 학교폭력 신고센터(24시간, 문자 #0117)에 신고할 수 있고, 긴급하면 112예요. 메신저 따돌림이나 딥페이크 같은 사이버폭력도 학교폭력이에요.',
    '2026년 조사에서 초등 4~6학년 피해응답률은 5.7%로 중·고등학생보다 높았고, 언어폭력이 가장 많았어요 (교육부).',
    '우리 아이가 괴롭히는 쪽이라면 때리지 않는 방식으로 분명하고 일관되게 한계를 정하고, 필요하면 소아청소년과나 상담 전문가와 이야기해요.',
  ],
  src: [S.bullySigns, S.bullySupport, S.aapBullying, S.report117, S.bullySurvey],
};
const TALK = {
  id: 'talk', emoji: '💬', title: '대화·감정·칭찬',
  list: [
    '하루 10분이라도 TV·휴대폰을 끄고 아이 얼굴을 보며 이야기해요.',
    '"오늘 제일 좋았던 일과 힘들었던 일은?", "이번 주에 걱정되는 거 있어?"처럼 묻고, 끊지 말고 끝까지 들은 뒤 들은 말을 되짚어 줘요. 말하기 싫어하면 "준비되면 언제든 들을게"라고 해요.',
    '"그런 걸로 속상해하면 안 돼"처럼 감정을 깎아내리지 않아요. "넌 나빠" 대신 "그렇게 하는 건 싫어"처럼 행동을 말해요.',
    '노력과 과정을 칭찬하라는 연구(5학년 대상)가 유명해요. 다만 학생들에게 "성장 마인드셋"을 가르치는 교육의 효과는 작거나 대상에 따라 다르다는 분석도 있어요.',
  ],
  src: [S.familyTalk, S.cdcTalk, S.praiseEffort, S.mindsetMeta, S.mindsetMeta2],
};
const PUBERTY_TALK = {
  id: 'puberty-talk', emoji: '🌱', title: '사춘기 준비·성교육',
  list: [
    '여자아이는 보통 만 8~13세에 가슴 몽우리로, 남자아이는 만 9~14세(평균 11세)에 고환이 커지는 것으로 사춘기가 시작돼요. 첫 생리는 대개 가슴 몽우리 뒤 2~3년 안에 와요.',
    '국내에서는 여아 만 8세 전 가슴 발달, 남아 만 9세 전 고환 커짐을 성조숙증으로 봐요. 진단과 해석은 소아내분비 전문의에게 받기를 권하고, 정상인 사춘기를 늦춘다고 키가 더 크지는 않아요 (질병관리청).',
    '생리대를 가방에 미리 넣어 두고, 생리와 몽정은 사춘기에 누구나 겪는 일이고 부끄러운 게 아니라고 알려 줘요. 한 번에 끝내는 이야기가 아니라 여러 번 나누는 이야기예요.',
    '물어보면 짧고 정직하게, 몸의 정확한 이름으로 답하고 "궁금한 게 풀렸어?"라고 확인해요. 이 나이엔 친구나 인터넷에서 먼저 답을 찾기도 해서, 집에서 편하게 물어볼 수 있다는 걸 알려 줘요.',
    '기초생활수급·차상위·한부모 가정이면 9~24세 여성청소년 생리용품 바우처를 주민센터나 복지로에서 신청할 수 있어요.',
  ],
  options: [
    {
      name: '성조숙증으로 진단되면 치료', how: '기준 나이 전에 사춘기가 시작되고 검사로 진단되면 사춘기 진행을 늦추는 주사(GnRH 유사체) 치료를 해요.',
      known: '한국보건의료연구원은 정확히 진단된 아이에게는 효과와 단기·중기 안전성이 확인된 표준 치료라고 해요.',
    },
    {
      name: '기준 언저리면 지켜보기', how: '기준 나이 무렵이나 진단 기준에 못 미치는 경우 바로 치료하기보다 진행을 지켜봐요.',
      known: '진단 기준에 못 미치는 아이에게 키를 키우려고 치료하는 경우, 최종 키가 늘어난다는 근거는 찾지 못했어요 (한국보건의료연구원 문헌 분석). 의료진 61.6%는 진단 뒤에도 경과를 보며 치료를 미룬 적이 있다고 답했어요. 진단받은 아이는 2017년 약 10만 6천 명에서 2023년 약 20만 6천 명으로 늘었어요.',
    },
  ],
  src: [S.pubertyGirls, S.pubertyBoys, S.pubertyKids, S.kdcaPrecocious, S.necaPrecocious, S.precociousTrend, S.bodyTalk, S.padVoucher],
};
const MIND = {
  id: 'mind', emoji: '😟', title: '걱정·마음이 힘들 때',
  list: [
    '걱정과 두려움은 흔하지만 오래가거나 아주 심하면 불안이나 우울일 수 있어요. 불안한 아이는 짜증이나 화, 잠 문제, 두통·배앓이로 보이기도 하고 걱정을 혼자 품기도 해요. 우울한 아이는 슬퍼 보이지 않고 말썽이나 게으름으로 오해받기도 해요.',
    '걱정되면 소아청소년과나 정신건강 전문가와 먼저 이야기해요.',
    '초1·초4 때 학교에서 보호자가 학생정서·행동특성검사에 답하고, 필요하면 보호자 동의를 받아 Wee센터 같은 전문기관에 연결돼요.',
    '마음이 힘들 땐 청소년전화 1388, 정신건강상담 1577-0199(모두 24시간), 자살 위기는 109(24시간), 위급하면 112·119에 연락해요.',
  ],
  src: [S.cdcAnxiety, S.emotionCheck, S.helpLines],
};

const SCHOOL_START = {
  id: 'school-start', emoji: '🏫', title: '초등학교 1학년 적응',
  list: [
    '1학년은 3월에 "입학 초기 적응 활동"을 34시간 해요. 시기와 내용은 학교마다 달라요.',
    '학습 준비물(색종이·도화지·풀 등)은 학교에서 대부분 줘서, 입학 전엔 꼭 필요한 학용품만 준비해도 돼요. 외투·모자·신발 안쪽에 이름을 써요.',
    '집에 오면 알림장과 가정통신문 앱을 같이 확인하고, 전날 밤에 아이가 스스로 가방을 챙기게 해요.',
    '수업 중에도 선생님께 말하고 화장실에 다녀올 수 있다고 알려 주고, 사물함에 여벌옷(속옷 포함)을 넣어 둬요.',
    '15~20분쯤 집중할 수 있으면 크게 걱정하지 않아도 돼요. "학교 재미있었어?"보다 "오늘 배운 것 중에 뭐가 제일 재미있었어?"처럼 물어봐요. 처음엔 힘들어해도 대부분 잘 적응해요.',
  ],
  src: [S.firstGrade, S.goeFirst],
};
const HOMEWORK = {
  id: 'homework', emoji: '✏️', title: '숙제·공부 습관',
  body: '초등학교에서는 숙제와 성적의 관련이 중·고등학교보다 약했어요. 부모가 도와주는 횟수보다 아이가 느끼는 방식이 더 관련이 있었어요: 도움이 된다고 느낀 도움은 성취와 같이 갔고, 간섭으로 느낀 도움은 반대였어요(6학년 연구).',
  options: [
    {
      name: '옆에서 함께', how: '부모가 곁에 앉아 시작을 돕고, 짧게 나눠서 하게 해요. 문제를 대신 풀어 주지는 않아요.',
      fits: '1~2학년, 혼자 시작하기 어려워하는 아이',
      known: '미국소아과학회와 경기도교육청이 소개하는 방식이고, 부모 교육으로 초등학생의 숙제 완성이 늘었다는 분석이 있어요. 다만 자주, 간섭처럼 느껴지게 도우면 성취가 낮았다는 연구도 있어요.',
    },
    {
      name: '스스로 하고, 물어볼 때만', how: '아이가 먼저 몇 문제를 해 보고, 막히면 그때 설명해 줘요.',
      fits: '혼자서도 시작할 수 있는 아이',
      known: '미국소아과학회는 도와주기 전에 아이가 먼저 해 보게 하라고 해요. 늘 도움이 필요하면 선생님과 이야기해 보라고 해요.',
    },
    {
      name: '시간·장소만 정해 주기', how: '조용하고 밝은 자리와 시간을 아이와 같이 정하고, 내용에는 끼어들지 않아요.',
      fits: '숙제 때문에 자주 다투는 집',
      known: '미국소아과학회는 시간과 장소를 미리 정하면 숙제 다툼의 흔한 원인 두 가지가 없어진다고 해요. 부모가 규칙을 정하는 방식이 성취와 가장 관련이 컸다는 분석도 있어요(관찰 연구).',
    },
  ],
  src: [S.homework, S.homeworkMeta, S.homeworkParents, S.homeworkQuality, S.goeFirst],
};
const PRIVATE_EDU = {
  id: 'private-edu', emoji: '📚', title: '사교육·선행학습',
  body: '2025년 초등학생 84.4%가 사교육을 받았고, 일반 교과 사교육의 목적은 학교 수업 보충(49.5%)이 가장 많고 선행학습(22.7%)이 그다음이에요. 공교육정상화법은 학교의 선행 교육과 학원의 선행학습 광고를 막지만, 가정의 선택을 막지는 않아요.',
  options: [
    {
      name: '학원·선행 적극 활용', how: '학원이나 과외로 다음 학기·학년 내용을 미리 배워요.',
      fits: '진학 경쟁이 걱정되는 집, 아이가 학원을 좋아하는 경우',
      known: '사교육 효과는 연구마다 엇갈려요. 한국 연구에서는 성적을 올리는 효과는 제한적이지만 상위권 대학 입학 가능성에는 의미 있는 영향이 있었다는 분석이 있어요(KDI 2018). 비용과 아이의 시간·흥미도 같이 봐야 해요.',
    },
    {
      name: '필요한 과목만 보충', how: '어려워하는 과목만 골라 보충해요.',
      fits: '특정 과목이 뒤처질까 걱정되는 집',
      known: '가장 흔한 목적(학교 수업 보충)과 같은 방식이에요. 초6 중 성적이 낮은 아이들은 사교육을 오래 받은 영어·수학 성적이 높았다는 분석이 있어요(관찰 연구).',
    },
    {
      name: '학교 수업 중심 + 집에서 복습·독서', how: '학교 수업을 따라가고, 집에서는 주간학습안내를 보며 복습하고 책을 읽어요.',
      fits: '사교육 부담을 줄이고 싶은 집',
      known: '경기도교육청은 지나친 선행, 특히 저학년 선행은 도움이 안 되는 경우가 많다고 해요. 스스로 공부한 시간이 장기 성적과 더 관련이 컸다는 분석도 있어요(고등학생 자료).',
    },
  ],
  note: '한국 연구는 대부분 중·고등학생을 본 것이라 초등학생만의 근거는 적어요.',
  src: [S.privateEduStats, S.advanceLaw, S.bray, S.kdiTutoring, S.kimTutoring, S.goeFirst],
};
const READING_KID = {
  id: 'reading-kid', emoji: '📖', title: '책 읽기',
  list: [
    '글을 읽게 된 뒤에도 소리 내어 읽어 주는 시간을 이어 가요. 번갈아 읽거나 아이가 부모에게 읽어 줘도 좋아요. 끝까지 다 읽지 않아도 되고, 같은 책을 또 골라도 괜찮아요.',
    '경기도교육청은 열 살 전후 아이는 읽을 때보다 들을 때 더 잘 이해한다며, 매일 20분쯤, 특히 잠자기 전에 읽어 주길 권해요. 줄거리 확인 질문만 하면 부담이 될 수 있어요.',
    '도서관 회원증을 만들어요. 책이음 회원증 하나로 전국 2,900곳 넘는 참여 도서관에서 빌릴 수 있어요.',
    '2025년 조사에서 초4~고3 학생의 94.6%가 1년에 책을 한 권 넘게 읽었어요 (문화체육관광부).',
  ],
  src: [S.readAloud, S.cdcMid, S.goeFirst, S.bookLink, S.readingSurvey],
};
const MONEY = {
  id: 'money', emoji: '💰', title: '용돈·경제 교육',
  body: '어떤 방식이든 "어디에 쓸 계획이야?", "써 보니 어땠어?"처럼 돈 이야기를 나누는 게 가장 중요하다고 해요 (미국 소비자금융보호국). 저금통을 같이 만들거나 용돈기입장을 써 봐요.',
  options: [
    {
      name: '정기 용돈 (정한 날, 정한 금액)', how: '저학년은 주마다, 고학년은 달마다처럼 정한 날 정한 금액을 줘요.',
      fits: '계획 세우기와 용돈기입장을 연습하고 싶은 집',
      known: '한국은행(2003)은 달라고 할 때마다 주는 것보다 정기적으로 주는 게 낫다고 했어요. 용돈만 주는 것보다 조언·관리와 함께할 때 효과가 있었다는 네덜란드 연구가 있어요(관찰 연구).',
    },
    {
      name: '집안일 대가로', how: '정한 집안일을 하면 그만큼 받아요.',
      fits: '일과 돈의 관계를 알려 주고 싶은 집',
      known: '미국 소비자금융보호국은 가족을 위한 일로 돈을 벌 수도 있다고 안내하고, 한국은행(2003)은 집안일 대가로 용돈을 주지 말라고 했어요. 두 방식을 직접 비교한 연구는 찾지 못했어요.',
    },
    {
      name: '필요할 때마다', how: '필요한 일이 있을 때 이야기하고 그때 줘요.',
      fits: '아직 돈 계획이 어려운 어린 아이, 지출을 직접 챙기고 싶은 집',
      known: '정기 용돈보다 덜 효과적이라는 의견이 있지만(한국은행 2003), 연구 근거는 많지 않아요.',
    },
  ],
  note: '한국은행(2003)은 성적과 용돈을 엮지 말라고도 했어요.',
  src: [S.cfpb, S.bokAllowance, S.bucciol, S.cdc911],
};
const HEALTH_KID = {
  id: 'health-kid', emoji: '🏃', title: '잠·운동·눈 건강',
  list: [
    '만 6~12세는 하루 9~12시간 자는 게 권장돼요. 주말에도 비슷한 시간에 일어나고, 잠들기 1시간 전엔 화면을 끄고 침실엔 화면 기기를 두지 않아요 (미국소아과학회).',
    '하루 평균 60분 넘게 숨이 찰 만큼 움직이고, 일주일에 3일은 뛰기·매달리기처럼 힘을 쓰는 활동을 해요. 조금이라도 움직이는 게 안 움직이는 것보다 나아요 (WHO).',
    '체중 관리는 "살 빼기"가 아니라 키가 자라는 동안 균형 있게 먹고 움직이기예요. 굶기거나 아이만 따로 바꾸기보다 가족이 같이 식단과 운동을 바꾸고, 음식으로 보상하지 않아요. 질병관리청 수칙: 하루 60분 친구와 놀기, TV·스마트폰은 하루 2시간 이내, 목마를 땐 물 먼저.',
    '바깥에서 보내는 시간이 근시가 생기는 걸 줄인다는 연구가 있어요(학교에서 매일 40분 바깥 수업을 더한 중국 무작위 연구 등). 강한 햇빛이 아니라 나무 그늘이어도 효과가 있었어요. 미국소아안과사시학회는 하루 2시간 넘게 바깥에 있기를 권해요.',
    '책은 30cm 넘게 떨어져 보고, 1시간쯤 보면 10분은 먼 곳을 봐요. 근시는 주로 초1~2 무렵 발견돼서 정기적으로 시력을 검사해요. 초1·초4 학교 건강검사에 눈 검사가 들어 있어요.',
    '근시 진행을 늦추는 치료(저농도 아트로핀, 드림렌즈 등)는 효과와 감염 같은 위험을 안과 전문의와 상의해서 정해요.',
  ],
  src: [S.schoolSleep, S.whoActivity, S.kdcaObesityRules, S.kdcaObesity, S.outdoorTrial, S.outdoorLight, S.cochraneMyopia, S.aapos, S.kdcaMyopia, S.schoolCheckup, S.aaoMyopia],
};
const SAFETY_SCHOOL = {
  id: 'safety-school', emoji: '🚲', title: '자전거·길·혼자 있기',
  list: [
    '자전거는 짧게 타도 매번 헬멧을 써요. 헬멧은 머리 다칠 위험을 85%쯤 줄여요. 해 질 녘이나 어두울 땐 타지 않게 해요. 도로교통법도 자전거를 탈 때 인명보호 장구를 쓰도록 정하고 있어요.',
    '걸을 땐 스마트폰·이어폰을 쓰지 않고, 신호를 기다릴 땐 한 발 뒤에 서고, 횡단보도를 건너기 전 좌우를 보고 손을 들어요 (행정안전부).',
    '혼자 집에 있기는 정해진 나이가 없어요. 미국소아과학회는 몇 시간 혼자 있기는 보통 11~12살을 이야기하고, 대부분 10~11살쯤 돼야 규칙적으로 혼자 있을 수 있다고 해요. 더 어리면 아이 준비에 맞춰 짧은 시간부터 연습해요.',
  ],
  src: [S.bikeSafety, S.helmets, S.roadLaw, S.walkSafety, S.homeAlone],
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
  {
    id: 'y3', months: [36, 47], label: '만 3세',
    topics: [
      dev([
        '말을 두 번 이상 주고받으며 대화해요',
        '"엄마 어디 있어?"처럼 누구·뭐·어디·왜를 물어요',
        '그림책을 보며 물으면 "달려", "먹어"처럼 무슨 행동인지 말해요',
        '이름을 물으면 자기 이름을 말하고, 대부분 다른 사람도 알아들을 만큼 말해요',
        '어린이집 등원처럼 엄마·아빠와 헤어진 뒤 10분 안에 진정해요',
        '다른 아이들에게 다가가 같이 어울려 놀아요',
        '보여 주면 동그라미를 따라 그리고, 포크를 써요',
        '헐렁한 바지나 겉옷 같은 옷을 혼자 입어요',
      ], CDC('3-years', '3세')),
      ADJUST, DISCIPLINE, PRAISE_KID, FRIENDS, SCREEN, SLEEP_KID, PICKY, TEETH, SAFETY_KID,
    ],
  },
  {
    id: 'y4', months: [48, 59], label: '만 4세',
    topics: [
      dev([
        '놀이할 때 선생님·슈퍼히어로·강아지처럼 다른 무언가가 되어 흉내 내요',
        '친구가 없으면 같이 놀자고 찾고, 우는 친구를 안아 주며 위로해요',
        '"도우미" 역할을 좋아하고, 도서관·놀이터처럼 장소에 따라 행동을 달리해요',
        '네 낱말 이상으로 문장을 말하고, 그날 있었던 일을 한 가지 넘게 이야기해요',
        '"외투는 뭐 할 때 입어?" 같은 간단한 질문에 대답해요',
        '물건 색깔을 몇 가지 말하고, 잘 아는 이야기에서 다음에 무슨 일이 생기는지 말해요',
        '몸의 부분이 세 군데 넘게 있는 사람을 그리고, 크레파스를 주먹이 아닌 손가락으로 쥐어요',
        '큰 공을 대부분 잡고, 어른이 지켜보면 음식을 덜거나 물을 따라요',
      ], CDC('4-years', '4세')),
      FRIENDS, PRAISE_KID, BODY_SAFETY, LETTERS, ENGLISH, SCREEN, BEDWETTING, SLEEP_KID, PICKY, TEETH, SAFETY_KID,
    ],
  },
  {
    id: 'y5', months: [60, 71], label: '만 5세',
    topics: [
      dev([
        '친구들과 놀이할 때 규칙을 지키거나 차례를 기다려요',
        '양말 짝 맞추기, 밥 먹고 상 치우기 같은 간단한 집안일을 해요',
        '들은 이야기나 지어낸 이야기를 사건 두 가지 넘게 넣어 말해요',
        '세 번 넘게 말을 주고받으며 대화를 이어 가요',
        '10까지 세고, "어제", "내일", "아침", "밤" 같은 시간 말을 써요',
        '이야기 시간이나 만들기에 5~10분 집중해요 (화면 보는 시간 말고)',
        '자기 이름 글자 중 몇 개를 쓰고, 가리키면 글자를 몇 개 읽어요',
        '한 발로 깡충 뛰고, 단추 몇 개를 채워요',
      ], CDC('5-years', '5세')),
      SCHOOL_READY, LETTERS, ENGLISH, BODY_SAFETY, FRIENDS, PRAISE_KID, SCREEN, BEDWETTING, PICKY, TEETH, SAFETY_KID,
    ],
  },
  {
    id: 'y6', months: [72, 107], label: '만 6~8세',
    topics: [
      kid([
        '혼자 옷을 입고 신발 끈을 묶고, 공을 손으로 더 잘 받아요.',
        '친구에게 인정받고 싶은 마음이 커지고, 친구 관계와 함께하는 활동에 관심이 많아져요.',
        '부모에게서 조금씩 독립하려 하고, 앞으로의 일을 생각하기 시작해요.',
        '생각하는 힘이 빠르게 자라고, 겪은 일과 생각·감정을 말로 더 잘 표현해요.',
        '나에게만 향하던 관심이 다른 사람에게로 넓어져요.',
        '해 볼 것: 상 차리기 같은 집안일을 맡겨요. "똑똑하네"보다 "열심히 궁리했구나"처럼 한 일을 칭찬하고, "하지 마" 다음엔 대신 할 수 있는 걸 알려 줘요. 친구와의 다툼 같은 문제는 스스로 풀어 보게 해요.',
      ], S.cdcMid, S.cdc68),
      SCHOOL_START, HOMEWORK, PRIVATE_EDU, READING_KID, MONEY, TALK, BULLYING, GAMES, PHONE_FIRST, HEALTH_KID, SAFETY_SCHOOL,
    ],
  },
  {
    id: 'y9', months: [108, 143], label: '만 9~11세',
    topics: [
      kid([
        '친구 관계가 더 깊고 복잡해지고, 같은 성별 친구가 특히 중요해져요.',
        '또래 압력이 커지는 시기예요. 자기 자신을 좋게 느끼는 아이가 나쁜 또래 압력을 더 잘 버텨요.',
        '사춘기가 다가오면서 몸에 관심이 커지고, 몸에 대한 고민이나 먹는 문제가 이 무렵 시작되기도 해요. 특히 여자아이는 사춘기 몸 변화가 보이기 시작할 수 있어요.',
        '학교 공부가 어려워지고, 다른 사람의 입장을 더 잘 이해하고, 집중하는 시간이 길어져요.',
        '해 볼 것: "자랑스러워"와 함께 "스스로 뿌듯하겠다"라고 말해 줘요. 규칙에는 이유를 같이 말하고, 친구들의 가족도 알고 지내요. 친구가 위험한 걸 하자고 할 때 어떻게 할지 이야기해 둬요.',
      ], S.cdcMid, S.cdc911),
      PUBERTY_TALK, MIND, BULLYING, TALK, ONLINE_SAFETY, PHONE_FIRST, GAMES, HOMEWORK, PRIVATE_EDU, MONEY, READING_KID, HEALTH_KID, SAFETY_SCHOOL,
    ],
  },
];

// 만 개월 → 시기 번호 (0~143개월 밖이면 -1)
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
  const ask = p.months[0] < 72 ? '영유아 건강검진에서' : '학교 상담 선생님과'; // 만 6세부터는 영유아 건강검진이 없어서
  sec.append(h('p', 'hint', `${GUIDE_CHECKED} 확인. 의학적 조언이 아니에요. 아이가 걱정되면 소아청소년과나 ${ask} 상담해요.`));
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
