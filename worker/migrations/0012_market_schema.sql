-- Market: projects, agencies, quotes, consultations, reviews

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL,
  industry_color TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  marketing_types TEXT NOT NULL DEFAULT '[]',
  hashtags TEXT NOT NULL DEFAULT '[]',
  budget_min INTEGER NOT NULL,
  budget_max INTEGER,
  budget_type TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'recruiting',
  applicant_count INTEGER NOT NULL DEFAULT 0,
  verified_only INTEGER NOT NULL DEFAULT 0,
  days_left INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  advertiser_name TEXT,
  timeline TEXT,
  closes_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

CREATE TABLE IF NOT EXISTS agencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  specialties TEXT NOT NULL DEFAULT '[]',
  verified INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  completed_projects INTEGER NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_rating ON agencies(rating DESC);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  agency_id INTEGER NOT NULL,
  price_min INTEGER NOT NULL,
  price_max INTEGER,
  timeline_months REAL NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  strength TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
);
CREATE INDEX IF NOT EXISTS idx_quotes_project ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_agency ON quotes(agency_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_unique ON quotes(project_id, agency_id);

CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  agency_id INTEGER,
  requester_name TEXT NOT NULL,
  requester_contact TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  preferred_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
);
CREATE INDEX IF NOT EXISTS idx_consultations_project ON consultations(project_id);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  agency_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_agency ON reviews(agency_id);

-- Seed: 5 agencies
INSERT INTO agencies (slug, name, description, specialties, verified, rating, completed_projects, total_reviews, created_at) VALUES
('aurora-media', '오로라 미디어', '외식·병원 중심으로 지역 기반 SNS·플레이스 마케팅에 특화한 대행사입니다.', '["SNS마케팅","플레이스마케팅","리뷰관리"]', 1, 4.8, 42, 38, datetime('now')),
('blue-scale', '블루스케일 퍼포먼스', '성과형 광고(SA/DA)와 리타겟팅을 중심으로 이커머스 전환율을 끌어올립니다.', '["성과형마케팅","SA/DA","CRO"]', 1, 4.6, 67, 55, datetime('now')),
('cactus-studio', '캑터스 스튜디오', '뷰티·패션 브랜드의 인플루언서와 숏폼 컨텐츠 제작을 담당합니다.', '["인플루언서","SNS마케팅","숏폼콘텐츠"]', 1, 4.9, 31, 29, datetime('now')),
('dawn-local', '던 로컬', '지역 서비스(학원·자동차·부동산)의 네이버 플레이스와 블로그 상위 노출에 강점이 있습니다.', '["플레이스마케팅","블로그마케팅","SEO"]', 1, 4.5, 24, 21, datetime('now')),
('echo-bridge', '에코브릿지', '병원·클리닉의 종합 마케팅과 의료법 준수 콘텐츠 설계를 담당합니다.', '["종합마케팅","SNS마케팅","의료광고"]', 1, 4.7, 19, 17, datetime('now'));

-- Seed: 9 projects (mirrors the landing project grid)
INSERT INTO projects (slug, industry, industry_color, title, description, marketing_types, hashtags, budget_min, budget_max, budget_type, status, applicant_count, verified_only, days_left, advertiser_name, timeline, closes_at, created_at, updated_at) VALUES
('premium-hanwoo-6m', '외식', '#EF4444', '프리미엄 한우 전문점 · 종합 마케팅 6개월',
  '강남 2호점 오픈에 맞춰 플레이스·블로그·SNS 세 축으로 6개월 종합 캠페인을 기획 중입니다. 경쟁 한우 전문점 대비 프리미엄 포지셔닝을 만들고 예약 전환을 끌어올리는 것이 목표입니다.',
  '["플레이스마케팅","블로그마케팅"]', '["#카페침투","#리뷰관리","#SNS"]',
  480, 620, 'monthly', 'recruiting', 4, 1, 9, '김정우 대표', '6개월', datetime('now', '+9 days'), datetime('now', '-2 days'), datetime('now')),
('skin-clinic-launch', '병원', '#06B6D4', '피부과 의원 · 신규 지점 오픈 집중 마케팅',
  '신규 지점 오픈 3개월 전부터 종합 마케팅을 진행할 대행사를 찾습니다. 의료법 준수 카피, 플레이스 최적화, 타겟 광고 3축이 필요합니다.',
  '["종합마케팅"]', '["#SA","#DA","#지역광고"]',
  3000, NULL, 'fixed', 'closing', 7, 1, 2, '이수아 원장', '3개월', datetime('now', '+2 days'), datetime('now', '-5 days'), datetime('now')),
('beauty-influencer-ops', '뷰티', '#EC4899', '여성 화장품 브랜드 · 인플루언서 상시 운영',
  '자사몰 트래픽과 전환을 동시에 올릴 인플루언서 상시 운영 파트너를 찾습니다. 릴스·쇼츠 중심의 숏폼 콘텐츠 제작 역량이 중요합니다.',
  '["SNS마케팅","인플루언서"]', '["#릴스","#쇼츠"]',
  1200, 1800, 'range', 'recruiting', 5, 0, 14, '박서진 마케터', '6개월', datetime('now', '+14 days'), datetime('now', '-3 days'), datetime('now')),
('ipsi-academy-place', '학원', '#6366F1', '입시 학원 · 네이버 플레이스 상위노출 3개월',
  '대치동 입시 학원의 네이버 플레이스 상위 노출과 블로그 체험단 운영을 맡아줄 대행사를 찾습니다.',
  '["플레이스마케팅"]', '["#블로그","#지역"]',
  180, 240, 'monthly', 'recruiting', 3, 1, 12, '조은비 실장', '3개월', datetime('now', '+12 days'), datetime('now', '-1 days'), datetime('now')),
('cafe-franchise-package', '외식', '#EF4444', '카페 프랜차이즈 · 오픈 3개월 집중 패키지',
  '신규 가맹점 오픈 직후 3개월 동안 플레이스와 리뷰 관리를 집중적으로 해줄 대행사를 찾습니다.',
  '["플레이스마케팅","리뷰관리"]', '["#영수증리뷰","#포토리뷰"]',
  320, 400, 'monthly', 'closing', 6, 1, 3, '최민호 점장', '3개월', datetime('now', '+3 days'), datetime('now', '-6 days'), datetime('now')),
('smartstore-review-cro', '커머스', '#F59E0B', '스마트스토어 · 리뷰 전환 개선 캠페인',
  '기존 스마트스토어의 리뷰 품질을 끌어올리고, Q&A와 상세페이지 개선까지 일괄 담당할 파트너가 필요합니다.',
  '["리뷰관리","CRO"]', '["#포토리뷰","#QnA"]',
  220, 280, 'monthly', 'recruiting', 2, 0, 21, '한지훈 대표', '4개월', datetime('now', '+21 days'), datetime('now', '-4 days'), datetime('now')),
('dental-local-long', '병원', '#06B6D4', '치과 의원 · 지역 상위노출 장기 제휴',
  '강남권 치과 의원의 지역 상위 노출을 12개월 이상 장기로 담당할 대행사를 찾습니다. 이미 1차 계약은 완료되어 진행 중입니다.',
  '["플레이스마케팅","블로그마케팅"]', '["#카페침투","#지역"]',
  540, 720, 'monthly', 'in_progress', 9, 1, 0, '윤지혜 원장', '12개월', NULL, datetime('now', '-30 days'), datetime('now')),
('hair-salon-retention', '뷰티', '#EC4899', '헤어살롱 · 재방문 고객 리마케팅',
  '한번 방문한 고객의 재방문을 끌어올리기 위한 카카오톡/인스타그램 리마케팅 파트너가 필요합니다.',
  '["SNS마케팅","리마케팅"]', '["#인스타","#카카오"]',
  90, 120, 'monthly', 'recruiting', 2, 0, 18, '이수빈 점장', '6개월', datetime('now', '+18 days'), datetime('now', '-2 days'), datetime('now')),
('auto-repair-local-seo', '기타', '#64748B', '자동차 정비소 · 검색 유입 증가 프로젝트',
  '지역 기반 자동차 정비소 검색 노출을 3개월 동안 올려줄 대행사와의 협업을 마쳤고, 리뷰 단계입니다.',
  '["SEO","플레이스마케팅"]', '["#지역SEO"]',
  140, 180, 'monthly', 'completed', 11, 1, 0, '강태영 사장', '3개월', NULL, datetime('now', '-120 days'), datetime('now'));

-- Seed: quotes for several projects (first few projects get 2~3 quotes each)
INSERT INTO quotes (project_id, agency_id, price_min, price_max, timeline_months, description, strength, status, created_at, updated_at) VALUES
(1, 1, 520, 600, 6, '초기 2개월 플레이스 최적화 + 블로그 체험단 40팀, 3~6개월 구간 SNS 광고와 리뷰 관리로 전환율을 올립니다.', '외식 업종 48건 실적', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days')),
(1, 4, 480, 550, 6, '지역 키워드 플레이스 상위 고정과 네이버 블로그 상위 2건을 1개월 내 확보합니다.', '지역 키워드 SEO', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days')),
(1, 2, 580, 620, 6, 'SA 중심 예약 전환 캠페인과 A/B 테스트로 예약률을 22% 이상 끌어올립니다.', '성과형 광고 전문', 'pending', datetime('now', '-12 hours'), datetime('now', '-12 hours')),
(2, 5, 2800, 3000, 3, '의료법 준수 카피 가이드를 먼저 만들고, 신규 지점 오픈 D-30부터 집중 집행합니다.', '의료광고 전문', 'pending', datetime('now', '-2 days'), datetime('now', '-2 days')),
(2, 2, 2900, 3200, 3, '구글 애즈·메타 광고·네이버 GFA를 통합 운영해 오픈 첫 달 내원 200건을 목표로 합니다.', '채널 통합 운영', 'pending', datetime('now', '-2 days'), datetime('now', '-2 days')),
(2, 1, 2700, 2950, 3.5, '플레이스 + 지역 블로그 중심으로 오픈 직후 트래픽을 확보한 뒤 SNS를 층위로 쌓아올립니다.', '지역 기반 접근', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days')),
(3, 3, 1400, 1600, 6, '월 6건 릴스와 12건 쇼츠, 메가·마이크로 인플루언서를 조합해 브랜드 검색량을 35% 높입니다.', '숏폼 콘텐츠 제작력', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days')),
(3, 5, 1500, 1700, 6, '브랜드 톤앤매너 가이드 구축부터 참여하고, 의료·화장품 규정 준수 심사도 지원합니다.', '브랜드 가이드 구축', 'pending', datetime('now', '-18 hours'), datetime('now', '-18 hours')),
(4, 4, 190, 220, 3, '지역 카페 8곳과 제휴해 블로그 체험단을 확보하고, 플레이스 리뷰 평점을 4.7 이상 유지합니다.', '로컬 네트워크', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days')),
(4, 1, 200, 240, 3, '플레이스 키워드 15개 점유율을 1위 4개, 3위 이내 10개 이상으로 끌어올립니다.', '플레이스 상위 고정', 'pending', datetime('now', '-10 hours'), datetime('now', '-10 hours')),
(5, 1, 330, 380, 3, '오픈 초기 60일 리뷰 전략과 영수증 리뷰 프로모션을 설계해 평점 4.8을 확보합니다.', '리뷰 전략 설계', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days')),
(5, 4, 320, 360, 3, '신규 가맹점 인근 주요 검색 키워드 10개를 3주 내 상위 노출로 안정화합니다.', '오픈 직후 상위 고정', 'pending', datetime('now', '-6 hours'), datetime('now', '-6 hours')),
(6, 2, 220, 260, 4, 'CRO 중심으로 상세페이지 8개를 AB 테스트하고, 리뷰 품질 점수를 자동 관리합니다.', 'CRO 전문', 'pending', datetime('now', '-20 hours'), datetime('now', '-20 hours')),
(7, 4, 560, 680, 12, '이미 4개월 진행 중이며, 지역 키워드 점유율과 리뷰 평점 4.9를 유지하고 있습니다.', '장기 운영 안정성', 'accepted', datetime('now', '-120 days'), datetime('now', '-90 days')),
(8, 3, 95, 115, 6, '인스타그램 DM 자동화와 카카오톡 채널 친구 확보를 패키지로 제공합니다.', '자동화 셋업', 'pending', datetime('now', '-1 days'), datetime('now', '-1 days'));

-- Seed: one review for completed project (project id 9)
INSERT INTO quotes (project_id, agency_id, price_min, price_max, timeline_months, description, strength, status, created_at, updated_at) VALUES
(9, 4, 150, 170, 3, '지역 검색 15개 키워드 상위 노출을 3주 내 확보해 월 유입을 2.3배 증가시켰습니다.', '지역 SEO 집행력', 'completed', datetime('now', '-110 days'), datetime('now', '-20 days'));

INSERT INTO reviews (quote_id, project_id, agency_id, rating, comment, created_at) VALUES
(
  (SELECT id FROM quotes WHERE project_id = 9 AND agency_id = 4),
  9, 4, 5,
  '3개월 계약 동안 검색 유입이 2.3배 늘었습니다. 보고서도 주간 단위로 꼼꼼했어요.',
  datetime('now', '-10 days')
);
