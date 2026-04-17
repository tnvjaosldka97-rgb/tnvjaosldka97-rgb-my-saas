# Admin (`@my-saas/admin`)

인증 기반 운영 콘솔. React 19 + Vite 8 (SWC 플러그인). 개발 포트 **5174**, 빌드 결과물은 `worker/public/admin/`로 출력되어 Worker가 `admin.my-saas.com`에서 서빙한다.

## 구조

```
apps/admin/src/
├── main.tsx                  # React 진입점
├── App.tsx                   # 로그인 게이트 → 사이드바 + 패널 스위처 (NAV_ITEMS)
├── styles.css                # 테마 :root CSS 변수 (_templates/themes/* 로 교체)
├── com/
│   ├── api/client.ts         # apiFetch<T>() — 모든 API 호출 진입점
│   └── ui/Panel.tsx          # 공용 패널 레이아웃
└── biz/                      # 비즈니스 모듈 (12개, 3글자 약어)
```

## biz 모듈 (12개)

| 모듈 | 엔드포인트 | UI |
| --- | --- | --- |
| `aut` | `/api/auth/*` | LoginScreen, useAuth |
| `dsh` | `/api/admin/dashboard` | 대시보드 카드, useDashboard |
| `set` | `/api/admin/settings` | 사이트 설정 폼, useSettings |
| `led` | `/api/admin/leads/*` | 리드 목록 + 상세 패널 (태그/노트), useLeads |
| `med` | `/api/admin/images/*` | MediaManager (direct upload UI), useMedia |
| `aid` | `/api/admin/ai/*` | AI 카피 생성, useAiCopy |
| `eml` | `/api/admin/email/*` | 템플릿/발송/로그, EmailPanel, useEmail |
| `pag` | `/api/admin/pages/*` | CMS 페이지 편집기, PagePanel, usePages |
| `srh` | `/api/admin/search` | 전문 검색 UI |
| `usr` | `/api/admin/users/*` | 사용자 CRUD, useUsers |
| `log` | `/api/admin/logs/*` | 접속/API 로그 뷰어, useLogs |
| `ext` | `/api/admin/ext/*` | KV/R2/WebSocket 예제 UI + 폴백 데이터 |

어드민에 없고 worker에만 있는 모듈: `hlt`, `pub`, `agt`, `vec` (API-only).

## 사이드바 구성 (`App.tsx` NAV_ITEMS)

- **Overview**: Dashboard, System
- **Management**: Users, Leads, Media, Pages, Email
- **Config**: Settings
- **Tools**: Search, Extensions
- **Logs**: Access Logs, API Logs

## 규칙

- **모든 API 호출은 `apiFetch<T>()` 사용**. 절대 `fetch()` 직접 호출 금지 (쿠키/에러 처리 일관성)
- 인증: JWT 쿠키 세션 또는 Cloudflare Access. `aut/useAuth`로 세션 체크
- GitHub OAuth 로그인 허용 사용자는 `GITHUB_ALLOWED_USERS` (현재 `tnvjaosldka97-rgb`)
- 새 컴포넌트 → `biz/{모듈}/components/*.tsx`
- 새 훅 → `biz/{모듈}/hooks/use*.ts`
- 공유 타입은 `@my-saas/com`에서 import
- Vite dev proxy: `/api` → `http://127.0.0.1:8787` (`vite.config.ts`)
- 빌드: `vite build` → `worker/public/admin/` 경로로 output (wrangler가 번들)

## 실행

```bash
pnpm --filter @my-saas/admin dev             # 5174
pnpm --filter @my-saas/admin build           # 로컬 dist/
pnpm --filter @my-saas/admin build:cloudflare  # → worker/public/admin/
pnpm --filter @my-saas/admin check           # tsc --noEmit
```

## 스타일링

`styles.css`의 `:root` CSS 변수로 테마가 정의된다. 테마 교체는 `_templates/themes/{이름}.css`의 `:root` 블록을 복붙하고 `body` 배경/`body::before` 그라디언트, 필요시 Google Fonts import도 함께 갱신한다.
