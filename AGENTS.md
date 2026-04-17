# my-saas — 에이전트 작업 가이드

> Cloudflare Workers 기반 SaaS 프로젝트. Hono API + React 두 개 앱(landing, admin)을 단일 Worker에서 서빙한다. 이 문서는 Codex, Claude Code 등 에이전트가 본 저장소에서 안전하게 작업하기 위한 공용 운영 문서다.

## 현재 배포 설정

| 항목 | 값 |
| --- | --- |
| Cloudflare Account ID | `25241c072cd5ef34a3d6317fbbd38fe3` |
| D1 database | `my-saas-db` (binding `DB`, id `8f4f6960-6d56-4fee-a042-e5153340eb11`) |
| KV namespace | `MY_SAAS_KV` (binding `APP_KV`, id `e3da355f9fda4e859c1b5d2e9eadd2c6`) |
| App domain | `my-saas.com` |
| Admin domain | `admin.my-saas.com` |
| SaaS app domain | `app.my-saas.com` |
| GitHub Client ID | `Ov23liQpMsGtFwItJjte` |
| GitHub allowed users | `tnvjaosldka97-rgb` |
| Admin access mode | `hybrid` (Cloudflare Access + JWT 세션) |
| 진실 원본 | `worker/wrangler.jsonc` (배포), `worker/.dev.vars` (로컬 시크릿, gitignore) |

> 배포 시크릿(`ADMIN_LOGIN_PASSWORD`, `ADMIN_JWT_SECRET`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY`, `AI_PROVIDER_API_KEY`, `CLOUDFLARE_IMAGES_API_TOKEN`)은 `wrangler secret put`으로 등록한다. 이 문서에 시크릿 값을 적지 않는다.

## 프로젝트 구조

```
my-saas/
├── worker/                    # Hono + Cloudflare Workers API (src/index.ts)
├── apps/landing/              # 공개 랜딩 페이지 (React 19 + Vite 8)
├── apps/admin/                # 인증 기반 운영 콘솔 (React 19 + Vite 8)
├── packages/com/              # 프론트-백엔드 공유 타입 (@my-saas/com)
├── cli/                       # 별도 스캐폴더 패키지 (create-my-saas, 워크스페이스 밖)
├── _templates/                # 새 biz 모듈 템플릿 + 30개 CSS 테마 프리셋
├── docs/                      # 운영 문서
└── .github/workflows/         # ci.yml, deploy-staging.yml, deploy-production.yml
```

`pnpm-workspace.yaml`은 `apps/*`, `packages/*`, `worker` 3개 패턴을 포함한다. `cli/`는 워크스페이스에 포함되지 않는 독립 배포용 npm 패키지다.

## 기술 스택

| Layer | Technology |
| --- | --- |
| Language | TypeScript (strict) |
| API | Hono 4 on Cloudflare Workers |
| Frontend | React 19 + Vite 8 (SWC) — landing, admin 각각 별도 앱 |
| Database | Cloudflare D1 (SQLite) |
| Storage | KV (캐시/세션), R2 (선택, 주석 상태) |
| Media | Cloudflare Images (direct upload, 선택) |
| AI | Workers AI + AI Gateway + Vectorize (Vectorize는 주석 상태) |
| Realtime | Durable Objects + WebSocket (`OpsAgent`) |
| Auth | JWT 쿠키 세션 + Cloudflare Access + GitHub OAuth (하이브리드) |
| Testing | Vitest (`worker/test/`) |
| Package Manager | pnpm 9.15 (workspace monorepo) |
| Node | ≥ 20.19 (Vite 8 요구사항, 22.12+ 권장) |
| CI/CD | GitHub Actions → Cloudflare Workers |

## 실행 방법

```bash
pnpm install
# 최초 1회: cp worker/.dev.vars.example worker/.dev.vars 후 시크릿 채우기
pnpm --filter @my-saas/worker db:migrate:local
pnpm dev                      # 3개 병렬: landing:5173 + admin:5174 + worker:8787
```

| 스크립트 | 동작 |
| --- | --- |
| `pnpm dev` | 세 개 서비스 병렬 기동 |
| `pnpm dev:remote` | 원격 Cloudflare 리소스 연결 (AI/Vectorize/Agents) |
| `pnpm dev:worker` | Worker만 |
| `pnpm dev:apps` | 프론트엔드 둘만 |
| `pnpm check` | 전 패키지 `tsc --noEmit` |
| `pnpm test` | worker Vitest |
| `pnpm build` | landing + admin 프로덕션 빌드 (→ `worker/public/{landing,admin}/`) |
| `pnpm deploy:staging` | build → D1 원격 마이그레이션(staging) → staging 배포 |
| `pnpm deploy:prod` | build → D1 원격 마이그레이션 → production 배포 |

## 아키텍처

```
Browser
  → Cloudflare Workers (worker/src/index.ts createApp())
    → 미들웨어: applySecurityHeaders → enforceAdminAccess → agentsMiddleware → cors → etag
    → API 로깅 미들웨어가 /api/* 전체 요청을 api_logs에 자동 기록
    → 라우트 모듈(16개):
        /api/health                 → hlt
        /api/auth/*                 → aut  (JWT 세션, GitHub OAuth)
        /api/public/*               → pub  (bootstrap, lead submit, public pages)
        /api/admin/dashboard        → dsh
        /api/admin/settings         → set
        /api/admin/leads            → led  (CRM: 목록, 상세, 태그, 노트)
        /api/admin/images           → med  (Cloudflare Images)
        /api/admin/ai               → aid  (AI Gateway 카피)
        /api/admin/email            → eml  (Resend 템플릿/발송/로그)
        /api/admin/pages            → pag  (CMS 페이지 CRUD/발행)
        /api/admin/agt              → agt  (Durable Object 에이전트)
        /api/admin/search           → srh  (SQL LIKE 전문 검색)
        /api/admin/vec              → vec  (Vectorize 시맨틱 검색, 활성 시)
        /api/admin/users            → usr
        /api/admin/logs             → log  (접속/API 로그, 통계)
        /api/admin/ext              → ext  (KV/R2/WS/AI 예제)
    → * → serveBoundAsset (호스트별 SPA 정적 에셋)
        → admin.my-saas.com → /admin/
        → app.my-saas.com   → /landing/ (PageListView)
        → my-saas.com       → /landing/
```

### 인증 모델

- `ADMIN_ACCESS_MODE`: `cloudflare-access` | `session` | `hybrid` | `off`. 현재 `hybrid`.
- `enforceAdminAccess` 미들웨어가 `/api/admin/*`, `/agents/*` 보호
- Cloudflare Access 헤더(`Cf-Access-Authenticated-User-Email`)와 JWT 쿠키 세션 병행
- GitHub OAuth 로그인은 `GITHUB_ALLOWED_USERS` allowlist로 필터링
- localhost는 항상 허용 (개발 편의)

### Cloudflare 바인딩

| 바인딩 | 타입 | 상태 | 설명 |
| --- | --- | --- | --- |
| `DB` | D1 (`my-saas-db`) | 활성 | 메인 DB |
| `ASSETS` | Assets | 활성 | 프론트 정적자산 (`./public`) |
| `APP_KV` | KV (`MY_SAAS_KV`) | 활성 | 키값 저장소 |
| `AI` | Workers AI | 활성(remote) | 텍스트 생성, 임베딩 |
| `OpsAgent` | Durable Object | 활성 | 운영 에이전트 |
| `DOC_INDEX` | Vectorize | 주석 | 시맨틱 검색. 활성화 시 `wrangler vectorize create my-saas-doc-index` 필요 |
| `MEDIA_R2` | R2 | 주석 | 오브젝트 저장소. 활성화 시 `wrangler r2 bucket create my-saas-media` 필요 |

### D1 스키마 (10개 마이그레이션)

```
0001_initial             site_settings, leads, media_assets
0002_enhance_leads       leads 컬럼 확장 + lead_tags, lead_notes
0003_email_system        email_templates, email_logs
0004_pages               pages (slug/title/content_md/content_html)
0005_seed_sample_pages   기본 CMS 페이지 seed
0006_admin_system        admin_users, access_logs, api_logs
0007_guide_page          가이드 페이지 seed
0008_guide_pricing       요금제 가이드 seed
0009_pricing_guide_page  요금제 가이드 페이지 보강
0010_ai_dev_guide        AI 개발 가이드 seed
0011_replace_cms_with_onlyup  CMS 페이지 → 마케팅천재야 페이지 4종으로 교체
0012_market_schema       projects/agencies/quotes/consultations/reviews + 시드
0013_market_auth         market_users + 인증 컬럼
0014_applications        project_applications + OAuth identities + project.stage
0015_notifications_reviews  notifications + project_reviews
0016_onlyup_brand_and_legal_pages  site_settings OnlyUp + 약관/개인정보/사업자정보 페이지
0017_rich_campaign_seeds  agencies +10 / projects +30 / quotes·reviews·consultations 풍부화
0018_enrich_agencies     agencies에 founded_year/region/team_size/avg_response_hour/portfolio_note/case_studies 6필드 추가
0019_project_drafts      비회원 프로젝트 접수 → 슈퍼어드민 승인 큐 테이블
```

주요 테이블: `site_settings`(싱글톤), `leads`, `lead_tags`, `lead_notes`, `media_assets`, `email_templates`, `email_logs`, `pages`, `admin_users`, `access_logs`, `api_logs`.

### 보안 헤더

`applySecurityHeaders`가 모든 요청에 적용 (WebSocket 제외): CSP (`self` + `imagedelivery.net`), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, COOP, Permissions-Policy. 로그인/리드/이메일/AI 라우트에는 rate limit 적용.

## 모듈 규칙

- `com/` — 공통 인프라 (비즈니스 로직 없음)
- `biz/{3글자}/` — 비즈니스 모듈. 3글자 약어 준수
- `biz/ext/` — 예제/확장 모듈 (KV/R2/WS/AI 데모)

| Worker 파일 | 역할 |
| --- | --- |
| `routes.ts` | Hono 라우터 (`new Hono<{ Bindings: AppBindings }>()`) |
| `repository.ts` | D1 쿼리 (prepared statement 필수) |
| `service.ts` | 비즈니스 로직 (필요 시) |

| Frontend 파일 | 역할 |
| --- | --- |
| `hooks/use*.ts` | React 훅 (API 호출 + 상태 관리) |
| `components/*.tsx` | UI 컴포넌트 |

프론트 API 호출은 항상 `com/api/client.ts`의 `apiFetch<T>()`로 통일.

## 코드 스타일

- 3글자 모듈 약어 규칙 준수
- routes/repository/service 파일 분리
- 공유 타입은 반드시 `packages/com/src/contracts.ts`에 정의
- Hono 라우트: `new Hono<{ Bindings: AppBindings }>()` 패턴
- Zod + `@hono/zod-validator`로 입력 검증
- 명확한 코드 > 영리한 코드
- "why" 주석만, "what" 주석 금지

## 테스트

- Vitest (`worker/test/app.test.ts`)
- `app.request(url, init, mockEnv)` HTTP 레벨 패턴
- `createTestEnv()` / `createAiVectorEnv()` mock 헬퍼
- `ADMIN_ACCESS_MODE: 'off'`로 인증 우회
- 바인딩(D1, KV, AI, Vectorize, R2)은 mock 객체
- `agents`/`hono-agents`는 `vi.mock()`
- 새 라우트 추가 시 반드시 대응 테스트 작성

## 시크릿

`.dev.vars` (로컬, gitignore) 와 `wrangler secret put` (배포)에 공통으로 등록:

| 키 | 용도 | 필수 |
| --- | --- | --- |
| `ADMIN_LOGIN_PASSWORD` | 어드민 로그인 비밀번호 | 필수 |
| `ADMIN_JWT_SECRET` | JWT 서명 키 (랜덤 64자+ 권장) | 필수 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | GitHub 로그인 시 |
| `RESEND_API_KEY` | 이메일 발송 | 이메일 사용 시 |
| `AI_PROVIDER_API_KEY` | AI Gateway 외부 프로바이더 키 | Workers AI 아닌 경우 |
| `CLOUDFLARE_IMAGES_API_TOKEN` | Images direct upload | 이미지 사용 시 |

공개 값(Client ID, allowed users, Account ID, Images delivery hash 등)은 `wrangler.jsonc`의 `vars`에 둔다.

## CI/CD

| 워크플로우 | 트리거 | 동작 |
| --- | --- | --- |
| `ci.yml` | PR, `main` push | install → check → test → build |
| `deploy-staging.yml` | `develop` push | build → D1 staging 마이그레이션 → staging 배포 |
| `deploy-production.yml` | `main` push | build → D1 prod 마이그레이션 → production 배포 |

GitHub Secrets 필수: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## 디자인 테마 시스템

`_templates/themes/` 폴더에 30개 CSS 테마 프리셋(다크 11 + 라이트 19). 사용자가 "테마를 X로 바꿔줘"라고 요청하면:

1. `_templates/themes/{테마명}.css` 읽기
2. `apps/landing/src/styles.css`의 `:root` 변수 교체
3. `apps/admin/src/styles.css`의 `:root` 변수 교체
4. `body` 배경/`body::before` 그라디언트 교체
5. Google Fonts 필요 시 각 `index.html`에 import

프리셋 목록은 `_templates/themes/README.md` 참고.

## CMS 가이드 페이지

`app.my-saas.com`에 CMS로 발행된 운영 가이드가 `pages` 테이블에 seed되어 있다 (`/api/public/pages/:slug`로 노출). 현재 포함 예: `prerequisites`, `my-project-setup`, `token-setup`, `ai-dev-guide`, `guide`, `pricing-guide`, `domain-setup`, `auth-setup`, `ai-setup`, `email-setup`, `db-rag-guide`, `design-guide`, `faq`, `presentation`. 정확한 목록은 `SELECT slug, title FROM pages WHERE status='published'`로 확인.

## 개발 규칙 (중요)

- `AGENTS.md`와 `CLAUDE.md`는 **항상 동일한 내용**으로 유지. 한쪽이 바뀌면 다른 한쪽도 즉시 양방향 동기화.
- 기능 추가/구조 변경/정책 변경/API 변경 시 관련 문서를 즉시 갱신.
- 공통 로직은 중복 복사하지 말고 `com/`으로 정리.
- 모듈·서비스는 책임을 명확히, 결합도 낮추고 응집도 높임.
- 변경은 전체 흐름(입력→처리→저장→출력)에서 점검. 국소적으로만 보지 않는다.
- 모든 작업 전후 영향분석 수행.
- 공유 타입(`@my-saas/com`) 변경 시 worker + landing + admin 세 쪽 모두 검증.

## 문서 우선순위

1. `AGENTS.md` / `CLAUDE.md` (루트) — 공용 운영 기준 (항상 동기화)
2. 서브디렉토리 `CLAUDE.md` / `AGENTS.md` — 각 영역 상세
3. `_templates/themes/README.md` — 테마 프리셋 가이드
4. `_templates/README.md` — 신규 모듈 생성 가이드
5. `docs/` — 운영 문서 (Cloudflare 세팅, 배포, 보안, 예제 등)
6. `README.md` — 외부용 프로젝트 소개

## Daily 기록 규칙

- 모든 작업 기록은 `docs/daily/YYYY-MM-DD/` 아래에 저장
- 에이전트별 파일: `codex.md`, `claude.md`
- 큰 구조 변경, 파일 이동, 삭제, 테스트 결과는 반드시 기록
- `AGENTS.md`와 `CLAUDE.md`는 항상 함께 수정하고 동일하게 유지
