import { agentsMiddleware } from 'hono-agents'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { Hono } from 'hono'
import { serveBoundAsset } from './com/assets'
import type { AppBindings } from './com/bindings'
import { OpsAgent } from './biz/agt/ops-agent'
import { agentRoutes } from './biz/agt/routes'
import { applySecurityHeaders, enforceAdminAccess } from './com/security'
import { requireRole } from './com/rbac'
import { aiRoutes } from './biz/aid/routes'
import { adminMarketRoutes } from './biz/amk/routes'
import { authRoutes } from './biz/aut/routes'
import { marketAuthRoutes } from './biz/mau/routes'
import { notificationRoutes } from './biz/not/routes'
import { marketProjectRoutes } from './biz/prj/routes'
import { dashboardRoutes } from './biz/dsh/routes'
import { extRoutes } from './biz/ext/routes'
import { healthRoutes } from './biz/hlt/routes'
import { leadsRoutes } from './biz/led/routes'
import { mediaRoutes } from './biz/med/routes'
import { publicRoutes } from './biz/pub/routes'
import { searchRoutes } from './biz/srh/routes'
import { settingsRoutes } from './biz/set/routes'
import { emailRoutes } from './biz/eml/routes'
import { pageRoutes } from './biz/pag/routes'
import { vectorRoutes } from './biz/vec/routes'
import { userRoutes } from './biz/usr/routes'
import { logRoutes } from './biz/log/routes'
import { logApiRequest } from './biz/log/repository'
import { rateLimit } from './com/rate-limit'

export function createApp() {
  const app = new Hono<{ Bindings: AppBindings }>()

  app.use('*', applySecurityHeaders)
  app.use('*', enforceAdminAccess)
  app.use('/agents/*', agentsMiddleware())
  app.use('/api/*', cors({
    origin: (origin) => {
      const allowed = [
        'https://my-saas.com',
        'https://admin.my-saas.com',
        'https://app.my-saas.com',
      ]
      if (!origin) return origin
      if (allowed.includes(origin)) return origin
      if (origin.startsWith('http://localhost:')) return origin
      return undefined
    },
    credentials: true,
  }))
  app.use('/api/*', etag())

  // 한글 응답 안정성 — charset=utf-8 강제 주입 (etag/caching 경유 시 charset 탈락 방지)
  app.use('/api/*', async (c, next) => {
    await next()
    const ct = c.res.headers.get('Content-Type') ?? ''
    if ((ct.startsWith('application/json') || ct.startsWith('text/plain') || ct.startsWith('text/html')) && !ct.toLowerCase().includes('charset')) {
      const headers = new Headers(c.res.headers)
      const base = ct.split(';')[0].trim()
      headers.set('Content-Type', `${base}; charset=utf-8`)
      c.res = new Response(c.res.body, { status: c.res.status, statusText: c.res.statusText, headers })
    }
  })

  // H-3: Rate Limiting (로그인, 리드, 이메일, AI)
  app.use('/api/auth/login', rateLimit({ maxRequests: 10, windowSeconds: 60 }))
  app.use('/api/auth/github', rateLimit({ maxRequests: 10, windowSeconds: 60 }))
  app.use('/api/public/leads', rateLimit({ maxRequests: 5, windowSeconds: 60 }))
  app.use('/api/public/project-drafts', rateLimit({ maxRequests: 3, windowSeconds: 60 }))
  app.use('/api/admin/email/send', rateLimit({ maxRequests: 10, windowSeconds: 60 }))
  app.use('/api/admin/ai/*', rateLimit({ maxRequests: 20, windowSeconds: 60 }))

  // API 요청 로깅 미들웨어
  app.use('/api/*', async (c, next) => {
    const start = Date.now()
    await next()
    const duration = Date.now() - start
    const path = new URL(c.req.url).pathname
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? ''
    try {
      await logApiRequest(c.env.DB, c.req.method, path, c.res.status, duration, undefined, undefined, ip)
    } catch {
      // 로깅 실패 무시
    }
  })

  // SEO: robots.txt
  app.get('/robots.txt', (c) => {
    const domain = c.env.APP_DOMAIN ?? 'my-saas.com'
    return c.text(`User-agent: *\nAllow: /\nDisallow: /api/admin/\nDisallow: /admin/\n\nSitemap: https://${domain}/sitemap.xml`)
  })

  // SEO: sitemap.xml — 랜딩 / CMS 페이지 / 공개 프로젝트 / 공개 대행사
  app.get('/sitemap.xml', async (c) => {
    const domain = c.env.APP_DOMAIN ?? 'my-saas.com'
    const saas = c.env.SAAS_DOMAIN ?? `app.${domain}`
    let urls = `  <url><loc>https://${domain}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`
    try {
      const { results: pages } = await c.env.DB
        .prepare("SELECT slug, updated_at FROM pages WHERE status = 'published' ORDER BY updated_at DESC")
        .all<{ slug: string; updated_at: string }>()
      for (const p of pages) {
        const lastmod = p.updated_at?.split(' ')[0] ?? ''
        urls += `  <url><loc>https://${saas}/${p.slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>\n`
      }
    } catch { /* pages 테이블 없음 */ }
    try {
      const { results: projects } = await c.env.DB
        .prepare("SELECT id, updated_at FROM projects WHERE status IN ('recruiting', 'closing', 'in_progress') ORDER BY created_at DESC LIMIT 200")
        .all<{ id: number; updated_at: string }>()
      for (const p of projects) {
        const lastmod = p.updated_at?.split(' ')[0] ?? ''
        urls += `  <url><loc>https://${domain}/project/${p.id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>daily</changefreq><priority>0.7</priority></url>\n`
      }
    } catch { /* projects 테이블 없음 */ }
    try {
      const { results: agencies } = await c.env.DB
        .prepare('SELECT slug, created_at FROM agencies WHERE verified = 1 ORDER BY created_at DESC LIMIT 100')
        .all<{ slug: string; created_at: string }>()
      for (const a of agencies) {
        const lastmod = a.created_at?.split(' ')[0] ?? ''
        urls += `  <url><loc>https://${domain}/agency/${a.slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.6</priority></url>\n`
      }
    } catch { /* agencies 테이블 없음 */ }
    return c.body(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`, 200, { 'Content-Type': 'application/xml' })
  })

  // 공개 API (인증/역할 불필요)
  app.route('/api/health', healthRoutes)
  app.route('/api/auth', authRoutes)
  app.route('/api/public', publicRoutes)

  // 마켓 사용자 (광고주/대행사) 인증 및 인증 필요 쓰기
  app.use('/api/mau/register', rateLimit({ maxRequests: 5, windowSeconds: 60 }))
  app.use('/api/mau/login', rateLimit({ maxRequests: 10, windowSeconds: 60 }))
  app.use('/api/mau/oauth/*', rateLimit({ maxRequests: 20, windowSeconds: 60 }))
  app.use('/api/public/consultations', rateLimit({ maxRequests: 5, windowSeconds: 60 }))
  app.use('/api/market/projects/*/apply', rateLimit({ maxRequests: 20, windowSeconds: 60 }))
  app.route('/api/mau', marketAuthRoutes)
  app.route('/api/market', marketProjectRoutes)
  app.route('/api/notifications', notificationRoutes)

  // M-4: role 기반 권한 — viewer (읽기 전용)
  app.use('/api/admin/dashboard', requireRole('viewer'))
  app.use('/api/admin/search', requireRole('viewer'))
  app.use('/api/admin/logs/*', requireRole('viewer'))

  // M-4: role 기반 권한 — editor (콘텐츠 수정)
  app.use('/api/admin/market/*', requireRole('editor'))
  app.use('/api/admin/settings', requireRole('editor'))
  app.use('/api/admin/leads/*', requireRole('editor'))
  app.use('/api/admin/images/*', requireRole('editor'))
  app.use('/api/admin/email/*', requireRole('editor'))
  app.use('/api/admin/pages/*', requireRole('editor'))
  app.use('/api/admin/ai/*', requireRole('editor'))
  app.use('/api/admin/vec/*', requireRole('editor'))
  app.use('/api/admin/agt/*', requireRole('editor'))
  app.use('/api/admin/ext/*', requireRole('editor'))

  // M-4: role 기반 권한 — admin (사용자 관리)
  app.use('/api/admin/users/*', requireRole('admin'))

  app.route('/api/admin/market', adminMarketRoutes)
  app.route('/api/admin/dashboard', dashboardRoutes)
  app.route('/api/admin/settings', settingsRoutes)
  app.route('/api/admin/leads', leadsRoutes)
  app.route('/api/admin/images', mediaRoutes)
  app.route('/api/admin/ai', aiRoutes)
  app.route('/api/admin/agt', agentRoutes)
  app.route('/api/admin/search', searchRoutes)
  app.route('/api/admin/vec', vectorRoutes)
  app.route('/api/admin/email', emailRoutes)
  app.route('/api/admin/pages', pageRoutes)
  app.route('/api/admin/ext', extRoutes)
  app.route('/api/admin/users', userRoutes)
  app.route('/api/admin/logs', logRoutes)

  app.all('*', async (c) => serveBoundAsset(c))

  return app
}

const app = createApp()

export { OpsAgent }
export default app
