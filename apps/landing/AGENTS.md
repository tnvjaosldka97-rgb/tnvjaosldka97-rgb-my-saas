# Landing (`@my-saas/landing`)

공개 랜딩 페이지 + 공개 CMS 뷰어. React 19 + Vite 8 (SWC). 개발 포트 **5173**, 빌드 결과물은 `worker/public/landing/`로 출력되어 Worker가 `my-saas.com` / `app.my-saas.com`에서 서빙한다 (`app.` 호스트에서는 `PageListView`가 기본 진입).

## 구조

```
apps/landing/src/
├── main.tsx                  # React 진입점
├── App.tsx                   # Hero + FeatureGrid + LeadCapture + ArchDiagram + Download
├── styles.css                # 테마 :root CSS 변수
├── com/
│   ├── api/client.ts         # apiFetch<T>()
│   ├── ui/Section.tsx        # 공용 섹션 래퍼
│   └── url.ts                # 도메인/경로 헬퍼
└── biz/
    ├── mkt/                  # 마케팅 모듈 (메인)
    │   ├── hooks/usePublicBootstrap.ts   # /api/public/bootstrap
    │   └── components/
    │       ├── HeroPanel.tsx
    │       ├── FeatureGrid.tsx
    │       ├── LeadCapturePanel.tsx
    │       ├── DownloadPanel.tsx
    │       ├── ArchDiagram.tsx
    │       ├── PageListView.tsx          # app.my-saas.com 진입 화면
    │       └── PageView.tsx              # /:slug 공개 CMS 페이지 렌더
    └── ext/
        └── fallbackSiteSettings.ts       # 오프라인 폴백
```

## 데이터 소스

- **공개 부트스트랩**: `GET /api/public/bootstrap` → `SiteSettings` + `PublicMetrics`
- **리드 제출**: `POST /api/public/leads`
- **공개 페이지**: `GET /api/public/pages`, `GET /api/public/pages/:slug`

API가 실패하면 `biz/ext/fallbackSiteSettings.ts`의 정적 값을 사용한다.

## 규칙

- **모든 API 호출은 `apiFetch<T>()` 사용**
- 새 컴포넌트 → `biz/{모듈}/components/*.tsx`
- 새 훅 → `biz/{모듈}/hooks/use*.ts`
- 공유 타입은 `@my-saas/com`에서 import
- 랜딩 전용 타입도 필요하면 `packages/com`에 넣어 admin/worker와 일관 유지
- Vite dev proxy: `/api` → `http://127.0.0.1:8787` (`vite.config.ts`)
- 빌드: `vite build` → `worker/public/landing/`

## 실행

```bash
pnpm --filter @my-saas/landing dev             # 5173
pnpm --filter @my-saas/landing build           # 로컬 dist/
pnpm --filter @my-saas/landing build:cloudflare  # → worker/public/landing/
pnpm --filter @my-saas/landing check           # tsc --noEmit
```

## 스타일링

`styles.css`의 `:root` CSS 변수로 테마 정의. admin과 동일한 테마 프리셋을 공유하므로 `_templates/themes/{이름}.css` 교체 시 양쪽(`apps/landing/src/styles.css`, `apps/admin/src/styles.css`) 모두 갱신한다.
