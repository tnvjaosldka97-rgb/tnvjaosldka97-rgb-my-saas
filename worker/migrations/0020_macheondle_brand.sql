-- 브랜드 리브랜딩: OnlyUp Compare → 마케팅천재 (영문 약자 MCY)
-- site_settings + pages 본문에 포함된 모든 참조를 일괄 교체

UPDATE site_settings SET
  brand = '마케팅천재',
  hero_label = '검증된 대행사 견적 비교 플랫폼',
  hero_title = '대한민국에서 광고비 안 날리는 가장 확실한 방법',
  hero_subtitle = '직접 찾지 마세요. 검증된 대행사의 견적을 한 번에 비교할 수 있습니다.',
  cta_primary = '견적 비교하기',
  cta_secondary = '대행사로 합류하기',
  updated_at = datetime('now')
WHERE id = 1;

-- pages 본문에 '마케팅천재' / 'MCY'로 교체
UPDATE pages SET
  title = REPLACE(title, 'OnlyUp Compare', '마케팅천재'),
  content_md = REPLACE(REPLACE(REPLACE(content_md,
      'OnlyUp Compare', '마케팅천재'),
      'onlyup-compare.com', 'mcy.co.kr'),
      'advertiser@mcy.co.kr', 'advertiser@mcy.co.kr'),
  content_html = REPLACE(REPLACE(REPLACE(content_html,
      'OnlyUp Compare', '마케팅천재'),
      'onlyup-compare.com', 'mcy.co.kr'),
      'advertiser@mcy.co.kr', 'advertiser@mcy.co.kr'),
  updated_at = datetime('now');

-- 법적·정보 페이지 3종 추가(없으면 seed) — 회사소개 / 청소년보호정책 / 공지사항
INSERT OR REPLACE INTO pages (slug, title, content_md, content_html, status, published_at, created_at, updated_at) VALUES
(
  'about',
  '마케팅천재 소개',
  '# 마케팅천재란?

마케팅천재(MCY)는 **광고주와 검증된 마케팅 대행사를 연결하는 양측 비교 플랫폼**입니다.

## 우리가 해결하는 문제

광고주는 대행사를 직접 찾고, 전화 돌리고, 견적을 비교하는 데 수십 시간을 씁니다. 그런데도 실제 실력을 확인하기 어렵습니다. 대행사는 조건이 맞지 않는 문의에 시간을 빼앗기고, 좋은 광고주를 만나기까지 긴 영업 과정을 거쳐야 합니다.

마케팅천재는 이 비효율을 제거합니다.

## 플랫폼 원칙

- **검증 우선**: 사업자 등록과 최근 실적, 리뷰를 통과한 대행사만 지원할 수 있습니다
- **투명한 비교**: 가격, 일정, 실적을 한 화면에서 비교합니다
- **수수료 없는 직거래**: 광고주와 대행사가 직접 계약하고, 플랫폼은 검증·중개만 담당합니다
- **리뷰 기반 성장**: 완료 프로젝트와 리뷰가 대행사의 다음 기회로 이어집니다

## 운영 지표

- 진행중 프로젝트 실시간 공개
- 인증 대행사 평균 평점 4.7 이상
- 첫 견적 평균 도착 시간 28시간
- 수수료 0원 · 광고주 100% 무료',
  '<h1>마케팅천재란?</h1><p>마케팅천재(MCY)는 <strong>광고주와 검증된 마케팅 대행사를 연결하는 양측 비교 플랫폼</strong>입니다.</p><h2>우리가 해결하는 문제</h2><p>광고주는 대행사를 직접 찾고, 전화 돌리고, 견적을 비교하는 데 수십 시간을 씁니다. 그런데도 실제 실력을 확인하기 어렵습니다. 대행사는 조건이 맞지 않는 문의에 시간을 빼앗기고, 좋은 광고주를 만나기까지 긴 영업 과정을 거쳐야 합니다.</p><p>마케팅천재는 이 비효율을 제거합니다.</p><h2>플랫폼 원칙</h2><ul><li><strong>검증 우선</strong>: 사업자 등록과 최근 실적, 리뷰를 통과한 대행사만 지원할 수 있습니다</li><li><strong>투명한 비교</strong>: 가격, 일정, 실적을 한 화면에서 비교합니다</li><li><strong>수수료 없는 직거래</strong>: 광고주와 대행사가 직접 계약하고, 플랫폼은 검증·중개만 담당합니다</li><li><strong>리뷰 기반 성장</strong>: 완료 프로젝트와 리뷰가 대행사의 다음 기회로 이어집니다</li></ul><h2>운영 지표</h2><ul><li>진행중 프로젝트 실시간 공개</li><li>인증 대행사 평균 평점 4.7 이상</li><li>첫 견적 평균 도착 시간 28시간</li><li>수수료 0원 · 광고주 100% 무료</li></ul>',
  'published', datetime('now'), datetime('now'), datetime('now')
),
(
  'youth',
  '청소년보호정책',
  '# 청소년보호정책

마케팅천재는 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 청소년보호법을 준수하여, 청소년이 유해한 환경으로부터 보호받을 수 있도록 최선의 노력을 다하고 있습니다.

## 1. 청소년보호 담당자

- 소속: 운영팀
- 이메일: youth@mcy.co.kr
- 처리 기한: 영업일 기준 5일 이내

## 2. 보호 조치

- 광고주가 등록하는 프로젝트 내용을 운영팀이 검토하며, 청소년에게 부적절한 내용이 포함된 경우 비공개 처리합니다
- 성인 대상 업종은 별도 인증을 거쳐야만 등록이 허용됩니다
- 청소년 이용자 신고 채널을 24시간 운영합니다

## 3. 청소년 유해정보 신고

- 이메일: youth@mcy.co.kr
- 운영팀이 24시간 이내 접수 확인 후 조치 결과를 안내해 드립니다

시행일: 2026년 4월 18일',
  '<h1>청소년보호정책</h1><p>마케팅천재는 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 청소년보호법을 준수하여, 청소년이 유해한 환경으로부터 보호받을 수 있도록 최선의 노력을 다하고 있습니다.</p><h2>1. 청소년보호 담당자</h2><ul><li>소속: 운영팀</li><li>이메일: youth@mcy.co.kr</li><li>처리 기한: 영업일 기준 5일 이내</li></ul><h2>2. 보호 조치</h2><ul><li>광고주가 등록하는 프로젝트 내용을 운영팀이 검토하며, 청소년에게 부적절한 내용이 포함된 경우 비공개 처리합니다</li><li>성인 대상 업종은 별도 인증을 거쳐야만 등록이 허용됩니다</li><li>청소년 이용자 신고 채널을 24시간 운영합니다</li></ul><h2>3. 청소년 유해정보 신고</h2><ul><li>이메일: youth@mcy.co.kr</li><li>운영팀이 24시간 이내 접수 확인 후 조치 결과를 안내해 드립니다</li></ul><p>시행일: 2026년 4월 18일</p>',
  'published', datetime('now'), datetime('now'), datetime('now')
),
(
  'notice',
  '공지사항',
  '# 공지사항

마케팅천재 운영과 관련된 주요 변경 사항, 업데이트, 이벤트를 안내합니다.

## 2026년 4월

### 플랫폼 정식 오픈
마케팅천재가 공식 오픈했습니다. 광고주 100% 무료 이용 정책을 발표합니다.

### 검증 대행사 15곳 합류
사업자등록·실적·포트폴리오 심사를 통과한 15개 대행사가 플랫폼에 공식 합류했습니다.

### 이번 주 신규 광고주 혜택
첫 프로젝트 등록 시 운영팀이 무료 매칭 컨설팅을 30분 제공해드립니다.

## 문의

- 고객센터: help@mcy.co.kr
- 제휴문의: biz@mcy.co.kr
- 대행사 파트너 문의: partner@mcy.co.kr',
  '<h1>공지사항</h1><p>마케팅천재 운영과 관련된 주요 변경 사항, 업데이트, 이벤트를 안내합니다.</p><h2>2026년 4월</h2><h3>플랫폼 정식 오픈</h3><p>마케팅천재가 공식 오픈했습니다. 광고주 100% 무료 이용 정책을 발표합니다.</p><h3>검증 대행사 15곳 합류</h3><p>사업자등록·실적·포트폴리오 심사를 통과한 15개 대행사가 플랫폼에 공식 합류했습니다.</p><h3>이번 주 신규 광고주 혜택</h3><p>첫 프로젝트 등록 시 운영팀이 무료 매칭 컨설팅을 30분 제공해드립니다.</p><h2>문의</h2><ul><li>고객센터: help@mcy.co.kr</li><li>제휴문의: biz@mcy.co.kr</li><li>대행사 파트너 문의: partner@mcy.co.kr</li></ul>',
  'published', datetime('now'), datetime('now'), datetime('now')
);

-- 기존 contact 페이지 이메일 도메인도 교체
UPDATE pages SET
  content_md = REPLACE(REPLACE(REPLACE(REPLACE(content_md,
      'advertiser@onlyup-compare.com', 'advertiser@mcy.co.kr'),
      'partner@onlyup-compare.com', 'partner@mcy.co.kr'),
      'biz@onlyup-compare.com', 'biz@mcy.co.kr'),
      'help@onlyup-compare.com', 'help@mcy.co.kr'),
  content_html = REPLACE(REPLACE(REPLACE(REPLACE(content_html,
      'advertiser@onlyup-compare.com', 'advertiser@mcy.co.kr'),
      'partner@onlyup-compare.com', 'partner@mcy.co.kr'),
      'biz@onlyup-compare.com', 'biz@mcy.co.kr'),
      'help@onlyup-compare.com', 'help@mcy.co.kr'),
  updated_at = datetime('now')
WHERE slug IN ('contact', 'privacy');
