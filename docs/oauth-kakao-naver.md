# 카카오 / 네이버 소셜 로그인 설정 가이드

현재 코드는 OAuth 2.0 인증 플로우가 **모두 구현되어 있음**. 실제 동작하려면 두 플랫폼에 앱을 등록하고 클라이언트 ID/Secret만 시크릿으로 주입하면 끝난다.

## 필요 콜백 URL (공통)

운영(프로덕션) 도메인 기준:

- 카카오: `https://my-saas.com/api/mau/oauth/kakao/callback`
- 네이버: `https://my-saas.com/api/mau/oauth/naver/callback`

커스텀 도메인을 아직 안 붙였다면 Workers 기본 도메인 사용:

- 카카오: `https://my-saas.tnvjaosldka97.workers.dev/api/mau/oauth/kakao/callback`
- 네이버: `https://my-saas.tnvjaosldka97.workers.dev/api/mau/oauth/naver/callback`

로컬 개발 시 같이 등록: `http://localhost:8787/api/mau/oauth/{kakao|naver}/callback`

---

## 1) 카카오

1. https://developers.kakao.com 로그인 (카카오 계정 필요)
2. **내 애플리케이션 → 애플리케이션 추가하기**
   - 앱 이름: `마케팅천재야`
   - 회사명: `MCY` (임시)
3. **앱 키** 메뉴에서 **REST API 키** 복사 → `KAKAO_CLIENT_ID`
4. **앱 설정 → 플랫폼 → Web 플랫폼 등록**
   - 사이트 도메인: `https://my-saas.com` (또는 workers.dev 도메인)
5. **제품 설정 → 카카오 로그인**
   - **활성화 ON**
   - Redirect URI 등록 (위 콜백 URL)
6. **동의 항목**에서 다음 항목 **필수 동의**로 설정
   - 닉네임 (profile_nickname)
   - 카카오계정(이메일) — 필수 동의 받으려면 사업자 등록 심사 필요. 임시로 선택 동의로 둬도 동작함.
7. **보안 → Client Secret**
   - **ON** → 코드 복사 → `KAKAO_CLIENT_SECRET`

## 2) 네이버

1. https://developers.naver.com 로그인
2. **Application → 애플리케이션 등록**
   - 애플리케이션 이름: `마케팅천재야`
   - 사용 API: **네이버 로그인**
   - 제공 정보 선택: **이메일 주소 / 이름 / 별명 (필수)**
3. 환경 추가: **PC 웹**
   - 서비스 URL: `https://my-saas.com`
   - Callback URL: 위 콜백 URL
4. 등록 완료 후 **Client ID** / **Client Secret** 확인 → 아래로 주입

## 3) 시크릿 주입

로컬 (`worker/.dev.vars`):

```
KAKAO_CLIENT_ID=<발급받은 REST API 키>
KAKAO_CLIENT_SECRET=<카카오 Client Secret>
NAVER_CLIENT_ID=<네이버 Client ID>
NAVER_CLIENT_SECRET=<네이버 Client Secret>
```

프로덕션 (Cloudflare Workers):

```bash
cd worker
npx wrangler secret put KAKAO_CLIENT_ID
npx wrangler secret put KAKAO_CLIENT_SECRET
npx wrangler secret put NAVER_CLIENT_ID
npx wrangler secret put NAVER_CLIENT_SECRET
```

각 명령 실행 시 값을 붙여넣으면 끝.

## 4) 검증

설정 후:

```
curl https://my-saas.tnvjaosldka97.workers.dev/api/mau/oauth/status
# {"kakao":true,"naver":true}  ← 이렇게 나와야 정상
```

이제 `/login` 페이지의 카카오/네이버 버튼이 실제 인증 플로우로 진행된다.

## 동작 흐름

1. 사용자가 `/login` 에서 "카카오로 시작하기" 클릭
2. `/api/mau/oauth/kakao` 로 이동 → state 쿠키 심고 kauth.kakao.com 으로 리다이렉트
3. 사용자가 카카오에서 승인 → `/api/mau/oauth/kakao/callback?code=&state=` 로 복귀
4. 코드 → 토큰 교환 → 프로필 조회 (id·email·nickname)
5. `market_oauth_identities` 테이블에서 기존 연결 확인
   - 있으면 해당 `market_users` 로 세션 발급
   - 없고 같은 이메일 가입자가 있으면 자동 연결
   - 둘 다 없으면 **신규 대행사 계정 생성** (userType='agency')
6. `/dashboard` 로 리다이렉트

## 주의

- 네이버는 이메일 제공 **필수** 동의로 설정. 이메일 없이 오면 `${provider}_{id}@social.onlyup-compare` 형식의 더미 이메일로 가입됨 (현재 코드).
- 신규 OAuth 유저는 `userType='agency'` 로 가입됨. 광고주도 OAuth 허용할 경우 가입 직후 사용자 유형 선택 UI 추가 필요.
- 프로덕션 배포 직전에 Redirect URI 가 실제 도메인과 일치하는지 반드시 재확인.
