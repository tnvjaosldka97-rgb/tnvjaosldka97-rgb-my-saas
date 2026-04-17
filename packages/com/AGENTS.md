# Shared Contracts (`@my-saas/com`)

프론트엔드(landing, admin)와 백엔드(worker)가 공유하는 TypeScript 타입 패키지. 런타임 코드는 없고 타입만 export한다.

## 구조

```
packages/com/
├── package.json              # name: "@my-saas/com"
└── src/
    ├── index.ts              # re-export * from "./contracts"
    └── contracts.ts          # 모든 공유 타입 정의 (현재 28개)
```

## 타입 카테고리

| 카테고리 | 주요 타입 |
| --- | --- |
| Site / Marketing | `SiteSettings`, `PublicBootstrap`, `PublicMetrics` |
| Leads | `LeadSubmissionInput`, `LeadRecord`, `LeadDetail`, `LeadStatus`, `LeadTag`, `LeadNote` |
| Dashboard | `DashboardData` |
| Media | `MediaAsset`, `DirectUploadPayload` |
| AI | `AiCopySuggestionRequest`, `AiCopySuggestion` |
| Email | `EmailTemplate`, `EmailTemplateInput`, `EmailLog`, `SendEmailRequest` |
| CMS Pages | `Page`, `PageInput`, `PageSummary`, `PageStatus` |
| Admin Users | `AdminUser`, `AdminUserInput`, `AdminUserRole` |
| Logs & Stats | `AccessLog`, `ApiLog`, `SystemStats` |

정확한 필드는 `src/contracts.ts`를 진실 원본으로 참조.

## 규칙

- **모든 worker ↔ frontend 공유 타입은 반드시 여기에 정의**. 한쪽에서만 쓰는 타입도 향후 공유 가능성이 있으면 여기 둔다.
- 소비자는 `@my-saas/com`으로 import:
  ```ts
  import type { LeadRecord, SiteSettings } from '@my-saas/com'
  ```
- 타입 변경 시 세 소비자(worker, landing, admin)를 모두 확인하고 `pnpm check`로 전체 컴파일 통과 검증
- snake_case DB 컬럼은 repository에서 camelCase로 매핑해 contract 타입과 맞춘다
- enum성 문자열은 유니언 타입(`'draft' | 'published' | ...`)으로 표현

## 실행

```bash
pnpm --filter @my-saas/com check     # tsc --noEmit
pnpm check                           # 전 워크스페이스 타입 체크
```

## 주의

- 런타임 값(함수, 상수)을 여기 추가하지 않는다. 순수 타입 패키지 유지가 원칙.
- Zod 스키마 같은 검증 코드는 worker 쪽(`src/com/`)에 두고, 여기서는 그 스키마의 추론 타입만 노출할 경우에도 신중히 — dep이 생기지 않도록 `z.infer`는 worker에 남기고 contracts에는 동등한 타입을 정의한다.
