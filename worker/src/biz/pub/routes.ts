import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppBindings } from '../../com/bindings'
import { createLead, leadCount } from '../led/repository'
import { mediaCount } from '../med/repository'
import { listPublishedPages, getPageBySlug } from '../pag/repository'
import {
  createConsultation,
  getProjectById,
  listProjects,
  listQuotesForProject,
} from '../prj/repository'
import { getSiteSettings } from '../set/repository'

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  company: z.string().optional(),
  message: z.string().optional(),
})

export const publicRoutes = new Hono<{ Bindings: AppBindings }>()

publicRoutes.get('/bootstrap', async (c) => {
  const settings = await getSiteSettings(c.env.DB)

  let market: {
    activeProjects: number
    verifiedAgencies: number
    totalQuotes: number
    avgFirstQuoteHour: number
    avgRating: number
    totalIndustries: number
    recentAgencies: Array<{
      id: number
      slug: string
      name: string
      verified: boolean
      rating: number
      completedProjects: number
      specialties: string[]
    }>
  } | null = null

  try {
    const row = await c.env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM projects WHERE stage != 'completed') AS active_projects,
        (SELECT COUNT(*) FROM agencies WHERE verified = 1) AS verified_agencies,
        (SELECT COUNT(*) FROM quotes) AS total_quotes,
        (SELECT ROUND(AVG(rating), 1) FROM agencies WHERE verified = 1) AS avg_rating,
        (SELECT COUNT(DISTINCT industry) FROM projects) AS total_industries`,
    ).first<{
      active_projects: number | null
      verified_agencies: number | null
      total_quotes: number | null
      avg_rating: number | null
      total_industries: number | null
    }>()

    const agencyRowsRaw = await c.env.DB.prepare(
      `SELECT id, slug, name, verified, rating, completed_projects, specialties
         FROM agencies
         WHERE verified = 1
         ORDER BY rating DESC, completed_projects DESC
         LIMIT 10`,
    ).all<{ id: number; slug: string; name: string; verified: number; rating: number; completed_projects: number; specialties: string }>()

    const recent = (agencyRowsRaw.results ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      verified: r.verified === 1,
      rating: r.rating,
      completedProjects: r.completed_projects,
      specialties: parseJson(r.specialties),
    }))

    market = {
      activeProjects: row?.active_projects ?? 0,
      verifiedAgencies: row?.verified_agencies ?? 0,
      totalQuotes: row?.total_quotes ?? 0,
      avgFirstQuoteHour: 28,
      avgRating: row?.avg_rating ?? 0,
      totalIndustries: row?.total_industries ?? 0,
      recentAgencies: recent,
    }
  } catch {
    // projects/agencies 테이블이 아직 없으면 market은 null
    market = null
  }

  const metrics = {
    totalLeads: await leadCount(c.env.DB),
    totalMedia: await mediaCount(c.env.DB),
    market,
    updatedAt: settings.updatedAt,
  }

  return c.json({ settings, metrics })
})

function parseJson(raw: string): string[] {
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p.map(String) : []
  } catch { return [] }
}

publicRoutes.post('/leads', zValidator('json', leadSchema), async (c) => {
  const payload = c.req.valid('json')
  await createLead(c.env.DB, payload)
  return c.json({ ok: true }, 201)
})

publicRoutes.get('/pages', async (c) => {
  return c.json(await listPublishedPages(c.env.DB))
})

publicRoutes.get('/pages/:slug', async (c) => {
  const slug = c.req.param('slug')
  const page = await getPageBySlug(c.env.DB, slug)
  if (!page || page.status !== 'published') return c.json({ error: 'Page not found' }, 404)
  return c.json(page)
})

const projectListQuerySchema = z.object({
  status: z.enum(['all', 'recruiting', 'closing', 'in_progress', 'completed']).optional(),
  sort: z.enum(['latest', 'closing', 'budget', 'applicants']).optional(),
})

publicRoutes.get('/projects', zValidator('query', projectListQuerySchema), async (c) => {
  const { status, sort } = c.req.valid('query')
  const projects = await listProjects(c.env.DB, { status, sort })
  return c.json({ projects })
})

publicRoutes.get('/projects/:id', async (c) => {
  const idRaw = c.req.param('id')
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const project = await getProjectById(c.env.DB, id)
  if (!project) return c.json({ error: 'Project not found' }, 404)
  // 오픈입찰이나 견적 내용은 비공개. 공개 상세에서는 프로젝트 메타만 반환.
  return c.json({ project, quotes: [] })
})

publicRoutes.get('/recent-activity', async (c) => {
  type QuoteRow = {
    id: number; created_at: string; agency_name: string; project_title: string
    industry: string; price_min: number
  }
  type ReviewRow = {
    id: number; created_at: string; agency_name: string; project_title: string; rating: number
  }

  const quotesRes = await c.env.DB
    .prepare(
      `SELECT q.id, q.created_at, q.price_min,
              a.name AS agency_name,
              p.title AS project_title, p.industry
         FROM quotes q
         JOIN agencies a ON a.id = q.agency_id
         JOIN projects p ON p.id = q.project_id
        ORDER BY q.created_at DESC
        LIMIT 14`,
    )
    .all<QuoteRow>()

  const reviewsRes = await c.env.DB
    .prepare(
      `SELECT r.id, r.created_at, r.rating,
              a.name AS agency_name,
              p.title AS project_title
         FROM reviews r
         JOIN agencies a ON a.id = r.agency_id
         JOIN projects p ON p.id = r.project_id
        ORDER BY r.created_at DESC
        LIMIT 6`,
    )
    .all<ReviewRow>()

  const combined = [
    ...(quotesRes.results ?? []).map((q) => ({
      id: `q-${q.id}`,
      kind: 'quote' as const,
      at: q.created_at,
      agencyName: q.agency_name,
      projectTitle: q.project_title,
      industry: q.industry,
      priceMin: q.price_min,
      rating: null,
    })),
    ...(reviewsRes.results ?? []).map((r) => ({
      id: `r-${r.id}`,
      kind: 'review' as const,
      at: r.created_at,
      agencyName: r.agency_name,
      projectTitle: r.project_title,
      industry: '',
      priceMin: 0,
      rating: r.rating,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 12)

  return c.json({ items: combined })
})

publicRoutes.get('/agencies/:slug', async (c) => {
  const slug = c.req.param('slug')
  const agencyRow = await c.env.DB
    .prepare(
      `SELECT id, slug, name, description, specialties, verified, rating,
              completed_projects, total_reviews, created_at
       FROM agencies WHERE slug = ?1 LIMIT 1`,
    )
    .bind(slug)
    .first<{
      id: number; slug: string; name: string; description: string
      specialties: string; verified: number; rating: number
      completed_projects: number; total_reviews: number; created_at: string
    }>()

  if (!agencyRow) return c.json({ error: 'Agency not found' }, 404)

  const reviewsRes = await c.env.DB
    .prepare(
      `SELECT r.id, r.project_id, p.title AS project_title,
              r.rating, r.comment, r.created_at
       FROM reviews r
       JOIN projects p ON p.id = r.project_id
       WHERE r.agency_id = ?1
       ORDER BY r.created_at DESC
       LIMIT 30`,
    )
    .bind(agencyRow.id)
    .all<{ id: number; project_id: number; project_title: string; rating: number; comment: string; created_at: string }>()

  return c.json({
    agency: {
      id: agencyRow.id,
      slug: agencyRow.slug,
      name: agencyRow.name,
      description: agencyRow.description,
      specialties: parseJson(agencyRow.specialties),
      verified: agencyRow.verified === 1,
      rating: agencyRow.rating,
      completedProjects: agencyRow.completed_projects,
      totalReviews: agencyRow.total_reviews,
      createdAt: agencyRow.created_at,
    },
    reviews: (reviewsRes.results ?? []).map((r) => ({
      id: r.id,
      projectId: r.project_id,
      projectTitle: r.project_title,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    })),
  })
})

const consultationSchema = z.object({
  projectId: z.number().int().positive(),
  agencyId: z.number().int().positive().nullable().optional(),
  requesterName: z.string().min(2).max(40),
  requesterContact: z.string().min(6).max(60),
  message: z.string().min(20).max(500),
  preferredTime: z.enum(['any', 'morning', 'afternoon', 'evening']).optional(),
})

publicRoutes.post('/consultations', zValidator('json', consultationSchema), async (c) => {
  const input = c.req.valid('json')
  const project = await getProjectById(c.env.DB, input.projectId)
  if (!project) return c.json({ error: 'Project not found' }, 404)
  await createConsultation(c.env.DB, {
    projectId: input.projectId,
    agencyId: input.agencyId ?? null,
    requesterName: input.requesterName,
    requesterContact: input.requesterContact,
    message: input.message,
    preferredTime: input.preferredTime ?? 'any',
  })
  return c.json({ ok: true }, 201)
})

