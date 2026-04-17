-- 브랜드 최종 변경: 마케팅천재 → 마케팅천재야 (고유명사)
-- + projects.menu_items 컬럼 추가: 업종별 대표 메뉴/시술/제품 더미 데이터

UPDATE site_settings SET
  brand = '마케팅천재야',
  updated_at = datetime('now')
WHERE id = 1;

UPDATE pages SET
  title = REPLACE(title, '마케팅천재', '마케팅천재야'),
  content_md = REPLACE(content_md, '마케팅천재', '마케팅천재야'),
  content_html = REPLACE(content_html, '마케팅천재', '마케팅천재야'),
  updated_at = datetime('now');

-- "마케팅천재야야" 로 이중 접미 난 경우 복구
UPDATE pages SET
  title = REPLACE(title, '마케팅천재야야', '마케팅천재야'),
  content_md = REPLACE(content_md, '마케팅천재야야', '마케팅천재야'),
  content_html = REPLACE(content_html, '마케팅천재야야', '마케팅천재야'),
  updated_at = datetime('now');

-- ============================================================================
-- projects.menu_items (JSON array): 업종별 대표 메뉴/시술/상품 리스트
-- ============================================================================

ALTER TABLE projects ADD COLUMN menu_items TEXT DEFAULT '[]';

-- 외식 (11개 프로젝트)
UPDATE projects SET menu_items = '["숯불 꽃등심 (100g)","갈비살 모듬","한우 차돌","육회 비빔밥","된장찌개","한우 사골곰탕","시그니처 정식"]' WHERE slug = 'premium-hanwoo-6m';
UPDATE projects SET menu_items = '["숯불 꽃등심 180g","특수부위 모듬","와규 안심","한우 육회","전복 버터구이","된장찌개","한우 사골 해장국"]' WHERE slug = 'jinmioak-franchise-launch';
UPDATE projects SET menu_items = '["히루 코스 12품","요루 코스 16품","시그니처 디너 20품","제철 스시 오마카세","계절 한정 사케","특선 디저트 트리오"]' WHERE slug = 'shiro-omakase-luxury';
UPDATE projects SET menu_items = '["불곰 대창","양념 곱창","돼지껍데기","닭발 매운맛","오징어 통구이","치즈 떡볶이","해장 라면"]' WHERE slug = 'bbq-mukbang-shorts';
UPDATE projects SET menu_items = '["비건 아보카도 토스트","유기농 샐러드 볼","비건 크루아상","식물성 라떼","캐슈 요거트 파르페","베리 스무디"]' WHERE slug = 'veganly-brunch-ig';
UPDATE projects SET menu_items = '["보리비빔밥","강된장 보리밥","보리순두부","나물 반찬 8종","보리 식혜","제철 나물 정식"]' WHERE slug = 'boribap-newopen';
UPDATE projects SET menu_items = '["한우 불고기 밀키트","감바스 밀키트","로제 파스타 밀키트","차돌 된장 밀키트","부대찌개 밀키트","해물탕 밀키트"]' WHERE slug = 'dalkong-mealkit-cj';
UPDATE projects SET menu_items = '["시그니처 라떼","에스프레소 토닉","크루아상 세트","브런치 플레이트","계절 케이크","냉 드립"]' WHERE slug = 'cafe-franchise-package';

-- 병원 (7개)
UPDATE projects SET menu_items = '["레이저 토닝","보톡스 이마","필러 팔자","물광 주사","스킨부스터","여드름 흉터 레이저"]' WHERE slug = 'skin-clinic-launch';
UPDATE projects SET menu_items = '["보톡스 이마 50u","필러 팔자 1cc","리쥬란힐러","레이저 토닝 5회","포텐자 3회","울쎄라 300샷"]' WHERE slug = 'yeoksam-dermatology-relaunch';
UPDATE projects SET menu_items = '["척추 도수치료","교정 추나","목 디스크 치료","허리 한약 처방","침 치료","운동 재활 20회"]' WHERE slug = 'bundang-chuck-hanbang';
UPDATE projects SET menu_items = '["임플란트 (1개)","지르코니아 크라운","투명교정","스케일링","임플란트 뼈이식","보철 치료"]' WHERE slug = 'busan-implant-package';
UPDATE projects SET menu_items = '["난임 초진 상담","시험관 1회차","인공수정","배란 유도","초음파 검진","산전 검사 패키지"]' WHERE slug = 'mom-clinic-ivf-ga';
UPDATE projects SET menu_items = '["코 성형","눈 재수술","윤곽 3종","지방이식","리프팅 실","상담 예약"]' WHERE slug = 'daegu-plastic-open';
UPDATE projects SET menu_items = '["임플란트","신경치료","미백 치료","레진 충전","치아 교정","치아 보철"]' WHERE slug = 'dental-local-long';

-- 뷰티 (6개)
UPDATE projects SET menu_items = '["시그니처 립밤","글로우 쿠션","매트 립스틱","아이섀도우 팔레트","브로우 펜슬","마스카라"]' WHERE slug = 'beauty-influencer-ops';
UPDATE projects SET menu_items = '["립케어 세럼","글로시 틴트","하이드라 립마스크","비건 립밤 3종","오버나잇 립 오일","볼륨 립 글로스"]' WHERE slug = 'lipsy-d2c-launch';
UPDATE projects SET menu_items = '["젤 네일 풀세트","프렌치 네일","시즌 아트","네일 케어","발 관리","연장 네일"]' WHERE slug = 'maronie-nail-salon';
UPDATE projects SET menu_items = '["토너","앰플","크림","선크림","클렌징 오일","마스크팩 10매"]' WHERE slug = 'glowly-skincare-tiktok';
UPDATE projects SET menu_items = '["라벤더 디퓨저","유자 캔들","우디 향수 세트","차량용 디퓨저","리필 오일","시즌 한정 선물세트"]' WHERE slug = 'bomnal-aroma-kakao';
UPDATE projects SET menu_items = '["두피 샴푸 500ml","헤어 에센스","트리트먼트 팩","두피 토너","헤어 미스트","홈케어 스텝 3종"]' WHERE slug = 'purebloom-haircare-review';
UPDATE projects SET menu_items = '["커트","염색","펌","뿌리 염색","클리닉","스타일링 + 케어"]' WHERE slug = 'hair-salon-retention';

-- 학원 (4개)
UPDATE projects SET menu_items = '["수학 정규반","수학 심화반","모의고사 파이널","1:1 개별 과외","주말 특강","설명회 예약"]' WHERE slug = 'ipsi-academy-place';
UPDATE projects SET menu_items = '["중등 기초반","고등 내신반","수능 파이널","주말 특강","여름 특강","1:1 VIP반"]' WHERE slug = 'edison-math-seminar';
UPDATE projects SET menu_items = '["1:1 비즈니스 영어","회화 집중반","TOEIC 스피킹","면접 영어","주말 집중 과정","그룹 원어민 수업"]' WHERE slug = 'talkingon-english-adult';
UPDATE projects SET menu_items = '["초등 코딩 정규","로봇 창의 수업","스크래치 입문","파이썬 기초","여름 방학 특강","학부모 설명회"]' WHERE slug = 'codelab-kids-offline';
UPDATE projects SET menu_items = '["기초 데생 반","유화 클래스","입시 실기","포트폴리오 컨설팅","주말 특강","단기 드로잉 클래스"]' WHERE slug = 'artbridge-highschool';

-- 커머스 (4개)
UPDATE projects SET menu_items = '["스마트스토어 베스트","신상품 10종","한정 기획전","3+1 묶음","리뷰 EVENT","무료 배송 라인업"]' WHERE slug = 'smartstore-review-cro';
UPDATE projects SET menu_items = '["2인용 텐트","4인용 글램핑 텐트","다운 침낭","경량 테이블","캠핑용 LED 랜턴","프리미엄 캠핑 세트"]' WHERE slug = 'camp-green-coupang';
UPDATE projects SET menu_items = '["연어 건조 사료","홀리스틱 사료","스킨케어 사료","다이어트 사료","시니어 케어 사료","힐링 간식 세트"]' WHERE slug = 'petforever-naver-brand';
UPDATE projects SET menu_items = '["베이직 원피스","니트 가디건","시즌 자켓","미니 백","액세서리 세트","공동구매 한정"]' WHERE slug = 'mintcolor-ig-shop';
UPDATE projects SET menu_items = '["스타터 와인박스 3병","시그니처 박스 5병","프리미엄 6병","와인 잔 세트","와인 오프너","월간 구독 프리미엄"]' WHERE slug = 'onwhay-wine-subscription';

-- 서비스 (4개)
UPDATE projects SET menu_items = '["1인 가구 이사","포장 이사","반포장 이사","사무실 이사","원룸 이사","입주 청소 패키지"]' WHERE slug = 'jimssa-local-moving';
UPDATE projects SET menu_items = '["기초 복종 훈련","1:1 방문 훈련","문제행동 교정","사회화 훈련","어질리티 코스","보호자 교육"]' WHERE slug = 'bauhaus-pet-training';
UPDATE projects SET menu_items = '["법인 설립 패키지","노무 컨설팅","계약서 검토","상표 출원","내용증명 발송","정기 자문"]' WHERE slug = 'sinchon-law-consulting';
UPDATE projects SET menu_items = '["주택 설계","상업 공간 설계","리모델링 기획","인테리어 감리","3D 시뮬레이션","컨셉 컨설팅"]' WHERE slug = 'hwa-architect-portfolio';

-- 기타 (2개)
UPDATE projects SET menu_items = '["한옥 독채 스테이","조식 서비스","전통 다도 체험","한복 대여","한옥 마루 패키지","야외 바베큐"]' WHERE slug = 'jeonju-traditional-hanok';
UPDATE projects SET menu_items = '["엔진오일 교환","종합 점검","타이어 4본 교체","배터리 교체","브레이크 패드","차량 실내 청소"]' WHERE slug = 'auto-repair-local-seo';
UPDATE projects SET menu_items = '["엔진오일 교환","타이어 교체","배터리 점검","종합 점검","정비 견적 상담","세차 + 광택"]' WHERE slug = 'namsan-car-repair';
