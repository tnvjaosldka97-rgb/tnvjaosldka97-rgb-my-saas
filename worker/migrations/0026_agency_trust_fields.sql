-- P4: 대행사 신뢰 정보 확장 (사업자등록증·연혁·대표 인사말·대표 레퍼런스·이력)
ALTER TABLE agencies ADD COLUMN business_reg_no TEXT;
ALTER TABLE agencies ADD COLUMN business_reg_img_url TEXT;
ALTER TABLE agencies ADD COLUMN ceo_name TEXT;
ALTER TABLE agencies ADD COLUMN ceo_message TEXT;
ALTER TABLE agencies ADD COLUMN founded_history TEXT DEFAULT '[]';
ALTER TABLE agencies ADD COLUMN featured_references TEXT DEFAULT '[]';
ALTER TABLE agencies ADD COLUMN ceo_career TEXT DEFAULT '[]';

-- 인증 대행사 샘플 시드 (3곳에 풍부한 더미 데이터)
UPDATE agencies SET
  business_reg_no = '123-45-67890',
  ceo_name = '이서준',
  ceo_message = '저희 오로라 미디어는 2020년부터 F&B·뷰티 브랜드를 중심으로 250건 이상의 캠페인을 집행해왔습니다. 단순히 노출만 올리는 것이 아니라, 광고주의 매출과 단골 고객 전환에 집중합니다. "광고비는 남의 돈이 아니라, 우리 돈처럼" 이라는 원칙으로 일합니다.',
  founded_history = '[{"year":2020,"event":"법인 설립 (서울 성동)"},{"year":2021,"event":"스타벅스 리저브 캠페인 수주"},{"year":2022,"event":"업계 최초 네이버 플레이스 최적화 자동화 툴 개발"},{"year":2023,"event":"누적 캠페인 200건 돌파"},{"year":2024,"event":"인플루언서 자체 관리 플랫폼 런칭"}]',
  featured_references = '[{"client":"스타벅스 리저브","campaign":"성수 팝업 플레이스 마케팅","result":"방문자 3.2배, 재방문율 48%","period":"2023.04 - 2023.06"},{"client":"CJ제일제당 비비고","campaign":"신제품 바이럴 SNS 캠페인","result":"노출 1,240만, CTR 4.8%","period":"2023.08 - 2023.10"},{"client":"하이네켄 코리아","campaign":"성수 페스티벌 인플루언서 매칭","result":"UGC 380건, 자발 공유 1.2만","period":"2024.05 - 2024.07"}]',
  ceo_career = '[{"year":"2012-2017","role":"제일기획 디지털본부 AE"},{"year":"2017-2020","role":"카카오 커머스 마케팅팀 팀장"},{"year":"2020-현재","role":"오로라 미디어 대표"}]'
WHERE slug = 'aurora-media';

UPDATE agencies SET
  business_reg_no = '234-56-78901',
  ceo_name = '박지훈',
  ceo_message = '블루스케일은 성과형 마케팅에 특화된 팀입니다. 광고비 1원까지 추적하고, 주 단위로 리포트합니다. 막연한 브랜드 홍보가 아니라, 실제 구매·회원가입·예약 전환을 만드는 캠페인만 진행합니다.',
  founded_history = '[{"year":2018,"event":"법인 설립"},{"year":2019,"event":"구글 프리미어 파트너 인증"},{"year":2021,"event":"메타 비즈니스 파트너 등급 획득"},{"year":2023,"event":"누적 광고비 집행 300억 돌파"},{"year":2024,"event":"자체 대시보드 SaaS 베타 런칭"}]',
  featured_references = '[{"client":"쿠팡 이츠","campaign":"서울 플레이스 SA 캠페인","result":"ROAS 720%, 신규 주문 2.4만","period":"2023.10 - 2024.03"},{"client":"버거킹","campaign":"신메뉴 런칭 퍼포먼스","result":"전환단가 52% 절감","period":"2024.01 - 2024.04"},{"client":"뮤지컬 킹키부츠","campaign":"티켓 예매 전환 최적화","result":"ROAS 480%, 매진 2회차","period":"2024.06 - 2024.08"}]',
  ceo_career = '[{"year":"2010-2014","role":"이노션 월드와이드 AE"},{"year":"2014-2018","role":"구글코리아 애드워즈팀 매니저"},{"year":"2018-현재","role":"블루스케일 퍼포먼스 대표"}]'
WHERE slug = 'blue-scale';

UPDATE agencies SET
  business_reg_no = '345-67-89012',
  ceo_name = '최윤서',
  ceo_message = '캑터스 스튜디오는 숏폼·릴스·틱톡 전문 팀입니다. 편집자 8명 전원이 30만+ 팔로워 운영 경험이 있고, 트렌드가 뜨면 48시간 안에 광고주 콘텐츠로 제작합니다. 알고리즘이 바뀔 때마다 대응 매뉴얼을 내부에서 주간 업데이트합니다.',
  founded_history = '[{"year":2021,"event":"서울 성수 스튜디오 오픈"},{"year":2022,"event":"틱톡 크리에이티브 파트너 인증"},{"year":2023,"event":"인플루언서 풀 800명 확보"},{"year":2024,"event":"자체 편집 AI 툴 공개"}]',
  featured_references = '[{"client":"이니스프리","campaign":"신제품 릴스 바이럴","result":"조회수 3,400만, 저장 12만","period":"2024.02 - 2024.04"},{"client":"무신사","campaign":"가을 시즌 숏폼 시리즈","result":"구매 전환 2.8배","period":"2024.08 - 2024.10"}]',
  ceo_career = '[{"year":"2016-2019","role":"CJ ENM 디지털스튜디오 PD"},{"year":"2019-2021","role":"Sandbox Network 크리에이터 매니저"},{"year":"2021-현재","role":"캑터스 스튜디오 대표"}]'
WHERE slug = 'cactus-studio';
