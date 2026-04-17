# OnlyUp Compare — 랜딩 플랜 (Macheondle-style minimal)

> 참고: `마케팅 중개 플랫폼 랜딩페이지 역설계 분석.md`, `마케팅천재들 (Macheondle) - 아키텍처 심층 분석.md`
> 원본 구조(6블록)를 그대로 따르되, 문구·브랜드·시각 요소는 신규.

---

## 1. brief 핵심 요약 — 원본 구조가 진리다

Macheondle의 랜딩은 feature-heavy 피치 페이지가 아니다. **지금 살아있는 프로젝트 카드 리스트**가 곧 서비스 가치 증명 자체. 그래서 아래 6블록 외의 모든 섹션은 오히려 전환율을 깎는다.

| # | 섹션 | 역할 |
| - | --- | --- |
| 1 | Header + Hero | 한 줄 문제 제기 + 한 줄 해결책 + 1CTA |
| 2 | 첫 CTA | Hero 안에 배치 (동일 CTA 문구) |
| 3 | 필터 / 정렬 UI | 상태·정렬 2개 드롭다운, 카드 위 |
| 4 | 프로젝트 카드 그리드 | 3열 반응형, 상태배지·지원자·예산·태그 |
| 5 | 팝업 공지 | 3초 뒤 모달, 24시간 안 보기 |
| 6 | 푸터 | 헤더와 같은 네비 반복 |

**이전 버전이 과했던 이유**: Problem / Benefit 비교표 / Feature pillar / Proof / Pricing / FAQ / FinalCTA 7섹션 추가 → 원본 톤과 어긋남. 제거.

---

## 2. 서비스 정의

| 항목 | 값 |
| --- | --- |
| 서비스명 | OnlyUp Compare |
| 대상 | 플레이스·리뷰·블로그·SEO 대행이 필요한 자영업자 |
| 구조 | 마케팅 프로젝트 등록 → 대행사 견적 수집·비교 |
| 톤 | 신뢰감 + 직관적. 공포호소는 Hero 한 줄만 |
| 팔레트 | Navy `#0B1E3F` / Royal `#1D4ED8` / Amber `#F59E0B` / Off-white `#F8FAFC` |

---

## 3. 섹션별 카피 (직접 사용본)

### Header
- 로고: `OnlyUp Compare` + `OC` 마크
- 메뉴: `견적 비교 · 비교중인 마케팅 · 이용 가이드 · 제휴 문의`
- 우측: `로그인 / 가입` 텍스트 + `견적 비교하기` Amber 버튼

### Hero
- H1: `대한민국에서` <em>광고비 안 날리는</em> `가장 확실한 방법.`
- H2: `직접 찾지 마세요. / 검증된 대행사의 견적을 한 번에 비교할 수 있습니다.`
- CTA: `견적 비교하기` (앵커: #market)

### 필터 섹션 제목
- `비교중인 마케팅`
- 드롭다운: 상태(`전체 / 모집중 / 마감임박 / 완료`), 정렬(`최신순 / 마감임박순 / 예산높은순`)

### 카드 구조
```
[모집중 | 지원자 4명]
[업종 이니셜 블록 — 외식/병원/뷰티/학원/커머스/기타]
[프로젝트 타이틀 2줄]
[예산 강조]
[#태그 × 최대 3]
```

### 팝업 공지
- 제목: `🛡 이번 주 신규 가입 혜택`
- 본문: `첫 견적 요청 시 계약서 법무 검토를 무료로 1회 제공합니다. 선착순 50건 중 24건 남았습니다.`
- 버튼: `혜택 확인하기` / 체크박스: `24시간 동안 보지 않기`

### 푸터
- 로고 + 네비 5개(`견적 비교하기 · 비교중인 마케팅 · 이용 가이드 · 제휴 문의 · 로그인 / 가입`) + 저작권

---

## 4. 최종 파일 구조

```
apps/landing/src/
├── LandingPage.tsx
├── landing-page.css
├── App.tsx  (→ LandingPage 렌더)
└── components/
    ├── LPHeader.tsx
    ├── LPHero.tsx
    ├── LPProjectGrid.tsx
    ├── LPAnnouncementModal.tsx
    └── LPFooter.tsx
```

5개 컴포넌트, 1개 CSS. 끝.

---

## 5. 자체 점검 체크리스트

- [x] Macheondle 6블록 구조 일치 (추가 섹션 0)
- [x] CTA 문구 통일(`견적 비교하기` / `견적 비교 시작`)
- [x] Hero 진입 즉시 1CTA 가시
- [x] 필터·정렬 상태 변경 시 카드 재정렬 동작
- [x] 3열(≥1200) / 2열(768–1199) / 1열(<768) 반응형
- [x] 모달 localStorage 24h TTL(`onlyup_ann_dismissed_until`)
- [x] 경쟁사 원문 0건 — "사기당하기 가장 힘든 곳" / "검증된 대행사의 견적을 한 번에" 등 원문 어구 직접 복사 안 함
- [x] tsc 통과 · Vite HMR 반영

---

## 6. 산출물
- `landing-plan.md` (본 문서)
- `apps/landing/src/LandingPage.tsx`
- `apps/landing/src/landing-page.css`
- `apps/landing/src/App.tsx` (루트 교체)
- `apps/landing/src/components/LP{Header,Hero,ProjectGrid,AnnouncementModal,Footer}.tsx`
