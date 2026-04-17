-- 대행사 상세 정보 확장 (founded_year / region / team_size / avg_response_hour / portfolio_note / case_studies)
-- 각 대행사의 "실제 운영 정보" 같은 깊이의 데이터로 AgencyDetail 품질을 끌어올린다

ALTER TABLE agencies ADD COLUMN founded_year INTEGER;
ALTER TABLE agencies ADD COLUMN region TEXT;
ALTER TABLE agencies ADD COLUMN team_size TEXT;
ALTER TABLE agencies ADD COLUMN avg_response_hour REAL DEFAULT 28;
ALTER TABLE agencies ADD COLUMN portfolio_note TEXT;
ALTER TABLE agencies ADD COLUMN case_studies TEXT DEFAULT '[]';

-- 기존 15개 agency에 가상 운영 정보 주입
UPDATE agencies SET
  founded_year = 2019, region = '서울 강남', team_size = '8명', avg_response_hour = 14,
  portfolio_note = '외식·병원 대상 로컬 플레이스 상위 고정 · 블로그 체험단 연계 프로젝트가 주력입니다. 서울/경기 지역 카페 35곳, 의원 22곳과 협업 이력 보유.',
  case_studies = '[{"title":"강남 한우 전문점 플레이스 1위 유지","industry":"외식","result":"6개월 간 매출 28% 상승, 리뷰 평점 4.8 달성"},{"title":"강북 피부과 신규 오픈 마케팅","industry":"병원","result":"오픈 첫 달 내원 170건 확보, SA 전환률 4.2%"},{"title":"청담 뷰티샵 리뷰 집중 캠페인","industry":"뷰티","result":"포토리뷰 320건 · 재방문 +41%"}]'
WHERE slug = 'aurora-media';

UPDATE agencies SET
  founded_year = 2016, region = '서울 마포·전국', team_size = '22명', avg_response_hour = 12,
  portfolio_note = '퍼포먼스 중심 이커머스 전환율 개선. 월 ROAS 350% 이상 유지 프로젝트가 70%입니다. SA·DA·CRO 삼위일체로 운영합니다.',
  case_studies = '[{"title":"스마트스토어 식품 브랜드 월 매출 2.1억 → 4.8억","industry":"커머스","result":"6개월 간 ROAS 412%, 신규 유입 3.5배"},{"title":"의료기기 D2C 자사몰 구축 집행","industry":"병원","result":"월 구독 전환 38% 달성"},{"title":"프리미엄 캠핑 브랜드 쿠팡 1위","industry":"커머스","result":"카테고리 1위 12주 유지"}]'
WHERE slug = 'blue-scale';

UPDATE agencies SET
  founded_year = 2020, region = '서울 홍대·부산', team_size = '12명', avg_response_hour = 20,
  portfolio_note = '뷰티·패션 브랜드 숏폼 전문. 릴스/쇼츠/틱톡 3각 운영 및 인플루언서 30인 제휴 네트워크를 보유합니다.',
  case_studies = '[{"title":"스킨케어 브랜드 틱톡 챌린지","industry":"뷰티","result":"조회수 8200만 · 해시태그 4위"},{"title":"여성 의류 브랜드 릴스 운영","industry":"커머스","result":"팔로워 1.8만 → 8.4만, CTR 4.1%"},{"title":"패션 인플루언서 메가 캠페인","industry":"뷰티","result":"브랜드 검색량 3배"}]'
WHERE slug = 'cactus-studio';

UPDATE agencies SET
  founded_year = 2018, region = '경기 성남·수원', team_size = '7명', avg_response_hour = 22,
  portfolio_note = '지역 상권 밀착형. 네이버 플레이스 지역 키워드 점유율 관리에 특화. 경기 남부 80곳의 로컬 비즈니스와 협업.',
  case_studies = '[{"title":"수원 치과 지역 키워드 15개 상위","industry":"병원","result":"월 내원 +62%"},{"title":"성남 영어학원 플레이스 1위","industry":"학원","result":"신규 등록 2.8배"},{"title":"부천 네일샵 체인 블로그 체험단","industry":"뷰티","result":"월 예약 420건 달성"}]'
WHERE slug = 'dawn-local';

UPDATE agencies SET
  founded_year = 2015, region = '서울 판교·전국', team_size = '18명', avg_response_hour = 9,
  portfolio_note = '병원·클리닉 특화. 의료광고 심의 가이드 보유로 부적격 사유 발생 0건. 성형외과·피부과·치과 53곳과 장기 계약.',
  case_studies = '[{"title":"강남 성형외과 3사 동시 운영","industry":"병원","result":"연간 내원 8300건, 수술 전환 18%"},{"title":"치과 임플란트 지역 타겟","industry":"병원","result":"키워드 20개 상위, 월 내원 +88%"},{"title":"한의원 리브랜딩","industry":"병원","result":"브랜드 검색 4배"}]'
WHERE slug = 'echo-bridge';

UPDATE agencies SET
  founded_year = 2017, region = '서울·전국 30개 도시', team_size = '34명', avg_response_hour = 16,
  portfolio_note = '외식 프랜차이즈 본사 출신 대표. 300+ 매장과 협업. 오픈 패키지, 체인 관리, 본사 홍보 3축 서비스.',
  case_studies = '[{"title":"50호점 프랜차이즈 동시 오픈","industry":"외식","result":"오픈 2주 내 플레이스 3위 달성"},{"title":"치킨 브랜드 전국 매출 반등","industry":"외식","result":"전년 대비 +34%"},{"title":"카페 체인 영수증 리뷰 관리","industry":"외식","result":"월 리뷰 1200건 수집"}]'
WHERE slug = 'hanul-marketing';

UPDATE agencies SET
  founded_year = 2019, region = '서울 논현·디지털', team_size = '26명', avg_response_hour = 8,
  portfolio_note = '성과형 광고 전문 팀. 매주 A/B 테스트 48세트 루프. 구글·메타·네이버 통합 대시보드 제공.',
  case_studies = '[{"title":"패션 D2C 메타 광고 ROAS 482%","industry":"커머스","result":"6개월 간 매출 3.1배"},{"title":"유아용품 브랜드 구글 쇼핑","industry":"커머스","result":"월 신규 구매 +240%"},{"title":"교육 플랫폼 퍼포먼스","industry":"학원","result":"CPA 42% 감소"}]'
WHERE slug = 'seondal-ads';

UPDATE agencies SET
  founded_year = 2021, region = '서울 성수', team_size = '9명', avg_response_hour = 18,
  portfolio_note = '뷰티·패션·라이프스타일 콘텐츠 제작부터 인플루언서 캐스팅까지 원스톱. 자체 촬영 스튜디오 2개 운영.',
  case_studies = '[{"title":"화장품 론칭 인플루언서 30인","industry":"뷰티","result":"6주 내 자사몰 전환 2.3배"},{"title":"남성 뷰티 브랜드 유튜브 콜라보","industry":"뷰티","result":"구독자 0 → 3.8만"},{"title":"라이프스타일 리빙 브랜드 인스타","industry":"기타","result":"팔로워 2.1만 · 구매 전환 5.8%"}]'
WHERE slug = 'bora-creative';

UPDATE agencies SET
  founded_year = 2020, region = '광역시 중심 (대전·울산·창원)', team_size = '11명', avg_response_hour = 24,
  portfolio_note = '지방 상권 특화. 울산·창원·대전 권역 로컬 SEO와 플레이스 상위노출에 강점. 수도권 외 프로젝트 전담.',
  case_studies = '[{"title":"울산 치과 플레이스 상위 유지","industry":"병원","result":"키워드 12개 1~3위 고정"},{"title":"창원 학원 지역 SEO","industry":"학원","result":"블로그 상위 6건, 월 문의 +112%"},{"title":"대전 뷰티샵 체험단","industry":"뷰티","result":"신규 고객 +58%"}]'
WHERE slug = 'nuri-studio';

UPDATE agencies SET
  founded_year = 2018, region = '서울 역삼·이커머스 특화', team_size = '19명', avg_response_hour = 11,
  portfolio_note = '이커머스 CRO 데이터 분석 팀. 쿠팡·스마트스토어·네이버 브랜드스토어 전환율 개선 프로젝트 73건 수행.',
  case_studies = '[{"title":"반려동물 사료 N스토어 매출 4배","industry":"커머스","result":"6개월 간 월 매출 0.8억 → 3.2억"},{"title":"밀키트 쿠팡 로켓 진입","industry":"커머스","result":"카테고리 4위 · 월 구매자 1.2만"},{"title":"가전 자사몰 CRO","industry":"커머스","result":"전환율 2.1% → 5.3%"}]'
WHERE slug = 'gomi-lab';

UPDATE agencies SET
  founded_year = 2019, region = '서울 강남·한남', team_size = '15명', avg_response_hour = 10,
  portfolio_note = '의료·법무·회계 등 규제 산업 전문. 광고 심의 통과율 99%, 민감 카피 대응 경험 다수.',
  case_studies = '[{"title":"여성 전문 산부인과 마케팅","industry":"병원","result":"연간 초진 4200건"},{"title":"강남 성형외과 3사 통합","industry":"병원","result":"평균 상담 전환 28%"},{"title":"종합 로펌 블로그 운영","industry":"서비스","result":"법무 의뢰 +140%"}]'
WHERE slug = 'cham-content';

UPDATE agencies SET
  founded_year = 2017, region = '서울 강남·대치', team_size = '13명', avg_response_hour = 15,
  portfolio_note = '교육 업계 200+ 캠페인 수행. 학원·에듀테크·온라인 코스 전환 최적화와 학부모 타겟 콘텐츠가 주력.',
  case_studies = '[{"title":"대치 수학학원 설명회 홍보","industry":"학원","result":"신규 등록 +185%"},{"title":"영어 스피킹 앱 신규 회원","industry":"학원","result":"앱 다운로드 8.2만"},{"title":"미술 입시학원 합격 홍보","industry":"학원","result":"입시 설명회 사전신청 340건"}]'
WHERE slug = 'namu-digital';

UPDATE agencies SET
  founded_year = 2019, region = '서울 홍대·이태원', team_size = '10명', avg_response_hour = 17,
  portfolio_note = 'F&B 신규 오픈 전문. 디데이 60일 전부터 매장별 콘텐츠 제작, 블로그 체험단 30팀 확보 표준 프로세스.',
  case_studies = '[{"title":"강남 숯불갈비 론칭","industry":"외식","result":"오픈 1달 예약률 91%"},{"title":"연남 브런치 카페","industry":"외식","result":"플레이스 1위 · 리뷰 평점 4.9"},{"title":"홍대 라멘 바","industry":"외식","result":"줄 서는 집 인증 · 매출 2.4배"}]'
WHERE slug = 'ondol-agency';

UPDATE agencies SET
  founded_year = 2022, region = '서울 성수·라이프스타일', team_size = '6명', avg_response_hour = 19,
  portfolio_note = '라이프스타일·리빙 브랜드 브랜딩 전문. Wadiz 펀딩, D2C 자사몰 론칭까지 풀 스택으로 담당.',
  case_studies = '[{"title":"향초 브랜드 Wadiz 펀딩","industry":"커머스","result":"목표 8배 달성 · 3억 펀딩"},{"title":"세라믹 리빙 브랜드 D2C","industry":"커머스","result":"자사몰 월 구매자 8400명"},{"title":"프리미엄 침구 브랜딩","industry":"커머스","result":"브랜드 검색 5.2배"}]'
WHERE slug = 'byul-house';

UPDATE agencies SET
  founded_year = 2014, region = '전국 · 지방 중소도시 포함', team_size = '42명', avg_response_hour = 26,
  portfolio_note = '지방 자영업자 단골 전환 집중 운영. 24시간 대응 팀 보유로 대도시 외 지역 집행 시 안정성 확보.',
  case_studies = '[{"title":"부산 애견훈련소 첫 디지털 마케팅","industry":"서비스","result":"유튜브 구독자 1.2만"},{"title":"제주 한옥 숙박 플레이스","industry":"기타","result":"예약 3배, 리뷰 평점 4.8"},{"title":"광명 이사 전문 지역 광고","industry":"서비스","result":"월 문의 160건 확보"}]'
WHERE slug = 'saebyeok-mkt';
