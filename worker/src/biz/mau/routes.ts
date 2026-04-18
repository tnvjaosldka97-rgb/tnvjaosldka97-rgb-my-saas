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
import { requireMarketUser, type MarketAuthVariables } from './middleware'
import { createDirectUpload } from '../med/images'
import { imagesConfigured } from '../../com/env'

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

// --- M-3: 대행사 자체 프로필 편집 ---
const agencyRoutes = new Hono<{ Bindings: AppBindings; Variables: MarketAuthVariables }>()
agencyRoutes.use('*', requireMarketUser)

type AgencyRow = {
  id: number; slug: string; name: string; description: string
  specialties: string; verified: number; rating: number
  completed_projects: number; total_reviews: number
  founded_year: number | null; region: string | null; team_size: string | null
  avg_response_hour: number | null; portfolio_note: string | null; case_studies: string
}

function parseJsonArr(raw: string | null): unknown[] {
  try { const v = JSON.parse(raw ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}

agencyRoutes.get('/me', async (c) => {
  const user = c.get('marketUser')
  const row = await c.env.DB
    .prepare(
      `SELECT id, slug, name, description, specialties, verified, rating,
              completed_projects, total_reviews,
              founded_year, region, team_size, avg_response_hour,
              portfolio_note, case_studies
       FROM agencies WHERE user_id = ?1 LIMIT 1`,
    )
    .bind(user.userId)
    .first<AgencyRow>()
  if (!row) return c.json({ error: '대행사 프로필이 없습니다.' }, 404)
  return c.json({
    agency: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      specialties: parseJsonArr(row.specialties),
      verified: row.verified === 1,
      rating: row.rating,
      completedProjects: row.completed_projects,
      totalReviews: row.total_reviews,
      foundedYear: row.founded_year,
      region: row.region,
      teamSize: row.team_size,
      avgResponseHour: row.avg_response_hour,
      portfolioNote: row.portfolio_note,
      caseStudies: parseJsonArr(row.case_studies),
    },
  })
})

const agencyEditSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(2000).optional(),
  specialties: z.array(z.string().max(40)).max(20).optional(),
  region: z.string().max(40).nullable().optional(),
  teamSize: z.string().max(40).nullable().optional(),
  foundedYear: z.number().int().min(1900).max(2100).nullable().optional(),
  portfolioNote: z.string().max(2000).nullable().optional(),
  caseStudies: z
    .array(
      z.object({
        title: z.string().max(200),
        industry: z.string().max(60),
        result: z.string().max(500),
      }),
    )
    .max(12)
    .optional(),
})

agencyRoutes.patch('/me', zValidator('json', agencyEditSchema), async (c) => {
  const user = c.get('marketUser')
  const input = c.req.valid('json')
  const existing = await c.env.DB
    .prepare('SELECT id FROM agencies WHERE user_id = ?1 LIMIT 1')
    .bind(user.userId)
    .first<{ id: number }>()
  if (!existing) return c.json({ error: '대행사 프로필이 없습니다.' }, 404)

  const sets: string[] = []
  const binds: (string | number | null)[] = []
  let i = 1
  if (input.name !== undefined) { sets.push(`name = ?${i++}`); binds.push(input.name) }
  if (input.description !== undefined) { sets.push(`description = ?${i++}`); binds.push(input.description) }
  if (input.specialties !== undefined) { sets.push(`specialties = ?${i++}`); binds.push(JSON.stringify(input.specialties)) }
  if (input.region !== undefined) { sets.push(`region = ?${i++}`); binds.push(input.region) }
  if (input.teamSize !== undefined) { sets.push(`team_size = ?${i++}`); binds.push(input.teamSize) }
  if (input.foundedYear !== undefined) { sets.push(`founded_year = ?${i++}`); binds.push(input.foundedYear) }
  if (input.portfolioNote !== undefined) { sets.push(`portfolio_note = ?${i++}`); binds.push(input.portfolioNote) }
  if (input.caseStudies !== undefined) { sets.push(`case_studies = ?${i++}`); binds.push(JSON.stringify(input.caseStudies)) }

  if (sets.length === 0) return c.json({ ok: true, updated: 0 })
  const sql = `UPDATE agencies SET ${sets.join(', ')} WHERE id = ?${i}`
  binds.push(existing.id)
  await c.env.DB.prepare(sql).bind(...binds).run()
  return c.json({ ok: true, updated: sets.length })
})

marketAuthRoutes.route('/agency', agencyRoutes)

// --- M-4: 아바타 업로드 (Cloudflare Images direct upload) ---
const avatarRoutes = new Hono<{ Bindings: AppBindings; Variables: MarketAuthVariables }>()
avatarRoutes.use('*', requireMarketUser)

avatarRoutes.post('/upload-url', async (c) => {
  const user = c.get('marketUser')
  // CF Images 설정되어 있으면 direct upload URL 반환
  if (imagesConfigured(c.env)) {
    try {
      const payload = await createDirectUpload(c.env, { title: `avatar-${user.userId}`, alt: 'user avatar' })
      return c.json({ mode: 'cf-images', ...payload }, 201)
    } catch (err) {
      console.error('[mau/avatar/upload-url]', err)
    }
  }
  // Fallback: 클라이언트가 /data-url 로 base64 POST
  return c.json({ mode: 'data-url' }, 200)
})

const confirmAvatarSchema = z.object({ imageId: z.string().min(1).max(120) })
avatarRoutes.post('/confirm', zValidator('json', confirmAvatarSchema), async (c) => {
  const user = c.get('marketUser')
  const { imageId } = c.req.valid('json')
  const hash = c.env.CLOUDFLARE_IMAGES_DELIVERY_HASH
  if (!hash) return c.json({ error: 'CLOUDFLARE_IMAGES_DELIVERY_HASH 미설정' }, 500)
  const url = `https://imagedelivery.net/${hash}/${imageId}/public`
  await c.env.DB
    .prepare('UPDATE market_users SET avatar_url = ?1, updated_at = ?2 WHERE id = ?3')
    .bind(url, new Date().toISOString(), user.userId)
    .run()
  return c.json({ ok: true, avatarUrl: url })
})

// Fallback: base64 data URL 직접 저장 (최대 600KB)
const dataUrlSchema = z.object({
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/, '이미지 data URL 형식이 아닙니다.').max(800_000),
})
avatarRoutes.post('/data-url', zValidator('json', dataUrlSchema), async (c) => {
  const user = c.get('marketUser')
  const { dataUrl } = c.req.valid('json')
  await c.env.DB
    .prepare('UPDATE market_users SET avatar_url = ?1, updated_at = ?2 WHERE id = ?3')
    .bind(dataUrl, new Date().toISOString(), user.userId)
    .run()
  return c.json({ ok: true, avatarUrl: dataUrl })
})

avatarRoutes.delete('/', async (c) => {
  const user = c.get('marketUser')
  await c.env.DB
    .prepare('UPDATE market_users SET avatar_url = NULL, updated_at = ?1 WHERE id = ?2')
    .bind(new Date().toISOString(), user.userId)
    .run()
  return c.json({ ok: true })
})

marketAuthRoutes.route('/me/avatar', avatarRoutes)
