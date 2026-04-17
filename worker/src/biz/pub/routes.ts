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

