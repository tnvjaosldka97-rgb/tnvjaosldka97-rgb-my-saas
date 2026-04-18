import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppBindings } from '../../com/bindings'
import {
  clearMarketSession,
  hashPassword,
  issueMarketSession,
  marketAuthConfigured,
  readMarketSession,
  verifyPassword,
} from './service'
import {
  createMarketUser,
  findMarketUserByEmail,
  findMarketUserById,
  toMarketUser,
} from './repository'
import { handleOAuthCallback, handleOAuthStart, isConfigured, kakaoConfig, naverConfig } from './oauth'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(2).max(60),
  userType: z.enum(['advertiser', 'agency']),
  phone: z.string().max(32).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
})

export const marketAuthRoutes = new Hono<{ Bindings: AppBindings }>()

marketAuthRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  if (!marketAuthConfigured(c.env)) return c.json({ error: 'Auth not configured' }, 503)
  try {
    const input = c.req.valid('json')
    const existing = await findMarketUserByEmail(c.env.DB, input.email)
    if (existing) return c.json({ error: '이미 가입된 이메일입니다.' }, 409)
    const passwordHash = await hashPassword(input.password)
    const user = await createMarketUser(c.env.DB, {
      email: input.email,
      passwordHash,
      name: input.name,
      userType: input.userType,
      phone: input.phone ?? null,
    })

    // C-1: 대행사 가입 시 agencies 기본 프로필 자동 생성 → SubmitQuote에서 본인 선택 가능
    if (input.userType === 'agency') {
      try {
        const slug = `agency-${user.id}-${Math.random().toString(36).slice(2, 8)}`
        const now = new Date().toISOString()
        await c.env.DB
          .prepare(
            `INSERT INTO agencies
               (slug, name, description, specialties, verified, rating,
                completed_projects, total_reviews, user_id, created_at)
             VALUES (?1, ?2, '', '[]', 0, 0, 0, 0, ?3, ?4)`,
          )
          .bind(slug, user.name, user.id, now)
          .run()
      } catch (err) {
        console.warn('[mau/register] agency auto-create failed', err)
      }
    }

    await issueMarketSession(c, user.id, user.email)
    return c.json({ user }, 201)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[mau/register]', msg, e)
    return c.json({ error: msg }, 500)
  }
})

marketAuthRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  if (!marketAuthConfigured(c.env)) return c.json({ error: 'Auth not configured' }, 503)
  const input = c.req.valid('json')
  const row = await findMarketUserByEmail(c.env.DB, input.email)
  if (!row) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  const ok = await verifyPassword(input.password, row.password_hash)
  if (!ok) return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  const user = toMarketUser(row)
  await issueMarketSession(c, user.id, user.email)
  return c.json({ user })
})

marketAuthRoutes.post('/logout', async (c) => {
  clearMarketSession(c)
  return c.json({ ok: true })
})

marketAuthRoutes.get('/me', async (c) => {
  const session = await readMarketSession(c)
  if (!session) return c.json({ error: 'Not authenticated' }, 401)
  const user = await findMarketUserById(c.env.DB, session.userId)
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json({ user })
})

marketAuthRoutes.get('/oauth/status', (c) => {
  return c.json({
    kakao: isConfigured(kakaoConfig(c.env)),
    naver: isConfigured(naverConfig(c.env)),
  })
})

marketAuthRoutes.get('/oauth/kakao', (c) => handleOAuthStart(c, kakaoConfig(c.env)))
marketAuthRoutes.get('/oauth/kakao/callback', (c) => handleOAuthCallback(c, kakaoConfig(c.env)))
marketAuthRoutes.get('/oauth/naver', (c) => handleOAuthStart(c, naverConfig(c.env)))
marketAuthRoutes.get('/oauth/naver/callback', (c) => handleOAuthCallback(c, naverConfig(c.env)))
