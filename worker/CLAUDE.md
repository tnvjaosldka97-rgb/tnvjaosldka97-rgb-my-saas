# Worker (Hono API)

Cloudflare Workers 위에서 Hono 4를 돌리는 my-saas 백엔드. 프론트 정적 에셋(`./public/{landing,admin}/`)도 이 Worker가 같이 서빙한다.

## 구조

```
worker/
├── src/
│   ├── index.ts              # createApp() — 미들웨어 + 라우트 등록, OpsAgent export
│   ├── com/                  # 공통 인프라 (비즈니스 로직 없음)
│   │   ├── bindings.ts       # AppBindings 타입 (D1/KV/AI/DO + env vars + secrets)
│   │   ├── db.ts             # D1 prepared statement 헬퍼
│   │   ├── http.ts           # 공용 응답/에러 헬퍼
│   │   ├── env.ts            # env 유틸
│   │   ├── security.ts       # enforceAdminAccess, applySecurityHeaders, rate limit
│   │   ├── assets.ts         # 호스트별 SPA 정적 에셋 서빙
│   │   ├── ai-gateway.ts     # AI Gateway 연동
│   │   └── workers-ai.ts     # Workers AI 텍스트 생성 + 임베딩
│   └── biz/                  # 비즈니스 모듈 (16개, 3글자 약어)
├── migrations/               # D1 SQL (0001 ~ 0010)
├── test/app.test.ts          # Vitest — app.request() + mock 바인딩
├── wrangler.jsonc            # 바인딩 + vars + migrations
├── .dev.vars                 # 로컬 시크릿 (gitignore)
├── .dev.vars.example         # 템플릿
└── public/                   # 빌드된 landing/admin 에셋 (build 시 채워짐)
```

## biz 모듈 (16개)

| 3글자 | 엔드포인트 | 설명 |
| --- | --- | --- |
| `hlt` | `/api/health` | 헬스체크 |
| `aut` | `/api/auth/*` | JWT 세션, GitHub OAuth 콜백 |
| `pub` | `/api/public/*` | bootstrap, lead submit, 공개 페이지 |
| `dsh` | `/api/admin/dashboard` | 대시보드 집계 |
| `set` | `/api/admin/settings` | 사이트 설정 CRUD |
| `led` | `/api/admin/leads/*` | 리드 CRM (목록/상세/상태/태그/노트) |
| `med` | `/api/admin/images/*` | Cloudflare Images (direct upload, 메타) |
| `aid` | `/api/admin/ai/*` | AI Gateway 카피 생성 |
| `eml` | `/api/admin/email/*` | Resend 템플릿/발송/로그 |
| `pag` | `/api/admin/pages/*` | CMS 페이지 CRUD + 발행 |
| `agt` | `/api/admin/agt/*` | OpsAgent (Durable Object) 스냅샷/작업 |
| `srh` | `/api/admin/search` | SQL LIKE 기반 전문 검색 |
| `vec` | `/api/admin/vec/*` | Vectorize 시맨틱 검색 (Vectorize 활성 시) |
| `usr` | `/api/admin/users/*` | 사용자 CRUD, 역할, 활성화 |
| `log` | `/api/admin/logs/*` | 접속/API 로그, 시스템 통계 |
| `ext` | `/api/admin/ext/*` | KV/R2/WS/AI 예제 (참고용) |

## 미들웨어 순서

```
applySecurityHeaders
  → enforceAdminAccess    # /api/admin/*, /agents/* 보호
  → agentsMiddleware      # hono-agents
  → cors                  # /api/* 경로
  → etag
  → (모듈별 rate limit: login, leads, email, AI)
  → API 로깅 → api_logs 자동 기록
  → 라우트
  → * → serveBoundAsset (호스트별 SPA)
```

## 바인딩 (`wrangler.jsonc`)

| 바인딩 | 타입 | 상태 | 리소스 |
| --- | --- | --- | --- |
| `DB` | D1 | 활성 | `my-saas-db` (`8f4f6960-6d56-4fee-a042-e5153340eb11`) |
| `ASSETS` | Assets | 활성 | `./public` |
| `APP_KV` | KV | 활성 | `MY_SAAS_KV` (`e3da355f9fda4e859c1b5d2e9eadd2c6`) |
| `AI` | Workers AI | 활성 (remote) | — |
| `OpsAgent` | Durable Object | 활성 | `new_sqlite_classes: ["OpsAgent"]` |
| `DOC_INDEX` | Vectorize | 주석 | 활성화 시 `wrangler vectorize create my-saas-doc-index --dimensions 384 --metric cosine` |
| `MEDIA_R2` | R2 | 주석 | 활성화 시 `wrangler r2 bucket create my-saas-media` |

env vars (공개):
`ENV_NAME`, `APP_DOMAIN`, `ADMIN_DOMAIN`, `SAAS_DOMAIN`, `ADMIN_ACCESS_MODE`,
`ADMIN_ALLOWED_EMAILS`, `ADMIN_LOGIN_EMAIL`, `CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_IMAGES_DELIVERY_HASH`, `AI_GATEWAY_ACCOUNT_ID`, `AI_GATEWAY_ID`,
`AI_PROVIDER`, `AI_MODEL`, `AI_TEXT_MODEL`, `AI_EMBED_MODEL`,
`GITHUB_ALLOWED_USERS`, `GITHUB_CLIENT_ID`.

## 시크릿

로컬은 `.dev.vars`, 배포는 `wrangler secret put`:

| 키 | 용도 | 필수 |
| --- | --- | --- |
| `ADMIN_LOGIN_PASSWORD` | 어드민 비밀번호 | 필수 |
| `ADMIN_JWT_SECRET` | JWT 서명 | 필수 |
| `GITHUB_CLIENT_SECRET` | OAuth secret | GitHub 로그인 시 |
| `RESEND_API_KEY` | 이메일 발송 | 이메일 시 |
| `AI_PROVIDER_API_KEY` | AI Gateway 외부 프로바이더 | 외부 AI 사용 시 |
| `CLOUDFLARE_IMAGES_API_TOKEN` | Images direct upload | 이미지 사용 시 |

## 규칙

- 새 모듈: `src/biz/{3글자}/routes.ts` 생성 → `src/index.ts`에 `.route()` 등록 → `test/app.test.ts`에 테스트 추가
- DB 쿼리는 prepared statement만 사용 (SQL 인젝션 방지)
- 입력 검증은 Zod + `@hono/zod-validator`
- 공유 타입은 `@my-saas/com`에서 import, 신규 타입은 `packages/com/src/contracts.ts`에 먼저 추가
- Hono 라우트는 `new Hono<{ Bindings: AppBindings }>()` 패턴
- 에러 응답: `c.json({ error: "..." }, status)` 통일
- 관리자 라우트는 자동으로 `enforceAdminAccess` 통과 대상 — 라우트 파일에서 별도 가드 불필요

## 실행

```bash
pnpm --filter @my-saas/worker dev                 # local D1/KV + wrangler dev
pnpm --filter @my-saas/worker dev:remote          # 원격 Cloudflare 리소스 연결
pnpm --filter @my-saas/worker db:migrate:local    # 로컬 D1 마이그레이션
pnpm --filter @my-saas/worker db:migrate:remote   # prod D1 마이그레이션
pnpm --filter @my-saas/worker test                # Vitest
pnpm --filter @my-saas/worker deploy              # wrangler deploy
```

## 테스트

- `app.request(url, init, mockEnv)` HTTP 레벨 검증
- `createTestEnv()` / `createAiVectorEnv()` 헬퍼로 mock 바인딩 생성
- `ADMIN_ACCESS_MODE: 'off'`로 인증 우회
- `agents` / `hono-agents`는 `vi.mock()`
- 새 라우트 추가 시 성공 경로 + 대표 에러 케이스 최소 커버
