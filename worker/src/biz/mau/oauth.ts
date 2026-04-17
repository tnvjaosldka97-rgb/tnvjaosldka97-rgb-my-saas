import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { AppBindings } from '../../com/bindings'
import { isoNow } from '../../com/db'
import { hashPassword, issueMarketSession } from './service'
import { createMarketUser, findMarketUserByEmail, toMarketUser } from './repository'

const STATE_COOKIE = 'oc_oauth_state'

export type ProviderConfig = {
  name: 'kakao' | 'naver'
  clientId?: string
  clientSecret?: string
  authUrl: string
  tokenUrl: string
  userUrl: string
  scope?: string
}

export function kakaoConfig(env: AppBindings): ProviderConfig {
  return {
    name: 'kakao',
    clientId: env.KAKAO_CLIENT_ID,
    clientSecret: env.KAKAO_CLIENT_SECRET,
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    tokenUrl: 'https://kauth.kakao.com/oauth/token',
    userUrl: 'https://kapi.kakao.com/v2/user/me',
  }
}

export function naverConfig(env: AppBindings): ProviderConfig {
  return {
    name: 'naver',
    clientId: env.NAVER_CLIENT_ID,
    clientSecret: env.NAVER_CLIENT_SECRET,
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    tokenUrl: 'https://nid.naver.com/oauth2.0/token',
    userUrl: 'https://openapi.naver.com/v1/nid/me',
    scope: 'profile email',
  }
}

export function isConfigured(cfg: ProviderConfig): boolean {
  return Boolean(cfg.clientId && cfg.clientSecret)
}

export function redirectUriFor(c: Context<{ Bindings: AppBindings }>, provider: string): string {
  const url = new URL(c.req.url)
  return `${url.origin}/api/mau/oauth/${provider}/callback`
}

export function setStateCookie(c: Context, state: string) {
  const isSecure = new URL(c.req.url).protocol === 'https:'
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Lax',
    path: '/',
    maxAge: 600,
  })
}

export function readAndClearState(c: Context, provided: string | undefined): boolean {
  if (!provided) return false
  const stored = getCookie(c, STATE_COOKIE)
  if (!stored) return false
  const isSecure = new URL(c.req.url).protocol === 'https:'
  deleteCookie(c, STATE_COOKIE, { httpOnly: true, secure: isSecure, sameSite: 'Lax', path: '/' })
  return stored === provided
}

type TokenResponse = { access_token?: string; error?: string; error_description?: string }

export async function exchangeCode(cfg: ProviderConfig, code: string, redirectUri: string, stateForNaver?: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: cfg.clientId!,
    client_secret: cfg.clientSecret!,
    redirect_uri: redirectUri,
    code,
  })
  if (cfg.name === 'naver' && stateForNaver) params.set('state', stateForNaver)
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  const data = (await res.json()) as TokenResponse
  if (!data.access_token) throw new Error(data.error_description ?? data.error ?? 'Token exchange failed')
  return data.access_token
}

type KakaoUser = {
  id: number
  kakao_account?: { email?: string; profile?: { nickname?: string } }
}
type NaverUser = {
  response?: { id: string; email?: string; name?: string; nickname?: string }
}

export async function fetchOAuthUser(cfg: ProviderConfig, token: string): Promise<{ providerUserId: string; email: string | null; name: string }> {
  const res = await fetch(cfg.userUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${cfg.name} user`)
  const data = (await res.json()) as KakaoUser | NaverUser
  if (cfg.name === 'kakao') {
    const k = data as KakaoUser
    return {
      providerUserId: String(k.id),
      email: k.kakao_account?.email ?? null,
      name: k.kakao_account?.profile?.nickname ?? '카카오 사용자',
    }
  }
  const n = data as NaverUser
  return {
    providerUserId: n.response?.id ?? '',
    email: n.response?.email ?? null,
    name: n.response?.name ?? n.response?.nickname ?? '네이버 사용자',
  }
}

export async function findOrCreateOAuthUser(
  db: AppBindings['DB'],
  provider: 'kakao' | 'naver',
  profile: { providerUserId: string; email: string | null; name: string },
) {
  // 1. 이미 연결된 소셜 계정 확인
  const existing = await db
    .prepare('SELECT user_id FROM market_oauth_identities WHERE provider = ?1 AND provider_user_id = ?2 LIMIT 1')
    .bind(provider, profile.providerUserId)
    .first<{ user_id: number }>()
  if (existing) {
    const userRow = await db
      .prepare('SELECT * FROM market_users WHERE id = ?1')
      .bind(existing.user_id)
      .first<Parameters<typeof toMarketUser>[0]>()
    if (userRow) return toMarketUser(userRow)
  }

  // 2. 동일 이메일 계정이 있으면 연결
  if (profile.email) {
    const row = await findMarketUserByEmail(db, profile.email)
    if (row) {
      await db
        .prepare('INSERT INTO market_oauth_identities (user_id, provider, provider_user_id, created_at) VALUES (?1, ?2, ?3, ?4)')
        .bind(row.id, provider, profile.providerUserId, isoNow())
        .run()
      return toMarketUser(row)
    }
  }

  // 3. 신규 계정 생성 (랜덤 비밀번호 — 소셜 로그인만 가능한 계정)
  const placeholder = crypto.randomUUID() + crypto.randomUUID()
  const passwordHash = await hashPassword(placeholder)
  const email = profile.email ?? `${provider}_${profile.providerUserId}@social.onlyup-compare`
  const user = await createMarketUser(db, {
    email,
    passwordHash,
    name: profile.name,
    userType: 'agency',
    phone: null,
  })
  await db
    .prepare('INSERT INTO market_oauth_identities (user_id, provider, provider_user_id, created_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(user.id, provider, profile.providerUserId, isoNow())
    .run()
  return user
}

export async function handleOAuthStart(c: Context<{ Bindings: AppBindings }>, cfg: ProviderConfig) {
  if (!isConfigured(cfg)) {
    return c.json({ error: `${cfg.name} OAuth가 설정되지 않았습니다. 관리자에게 문의하세요.` }, 503)
  }
  const state = crypto.randomUUID()
  setStateCookie(c, state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId!,
    redirect_uri: redirectUriFor(c, cfg.name),
    state,
  })
  if (cfg.scope) params.set('scope', cfg.scope)
  return c.redirect(`${cfg.authUrl}?${params}`)
}

export async function handleOAuthCallback(c: Context<{ Bindings: AppBindings }>, cfg: ProviderConfig) {
  if (!isConfigured(cfg)) return c.json({ error: `${cfg.name} OAuth가 설정되지 않았습니다.` }, 503)
  const code = c.req.query('code')
  const state = c.req.query('state')
  if (!code) return c.json({ error: 'Missing code' }, 400)
  if (!readAndClearState(c, state)) return c.json({ error: 'Invalid state' }, 403)
  try {
    const token = await exchangeCode(cfg, code, redirectUriFor(c, cfg.name), state)
    const profile = await fetchOAuthUser(cfg, token)
    const user = await findOrCreateOAuthUser(c.env.DB, cfg.name, profile)
    await issueMarketSession(c, user.id, user.email)
    return c.redirect('/dashboard')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OAuth 실패'
    return c.json({ error: msg }, 500)
  }
}
