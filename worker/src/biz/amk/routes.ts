import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppBindings } from '../../com/bindings'
import {
  adminListProjects,
  adminListAgencies,
  adminListApplications,
  adminListConsultations,
  adminListReviews,
  adminMarketOverview,
  adminSetAgencyVerified,
  adminSetConsultationStatus,
  adminSetProjectStage,
  adminDeleteReview,
} from './repository'

export const adminMarketRoutes = new Hono<{ Bindings: AppBindings }>()

adminMarketRoutes.get('/overview', async (c) => {
  const data = await adminMarketOverview(c.env.DB)
  return c.json(data)
})

adminMarketRoutes.get('/projects', async (c) => {
  const items = await adminListProjects(c.env.DB)
  return c.json({ items })
})

const stageSchema = z.object({
  stage: z.enum(['recruiting', 'contracting', 'executing', 'completed']),
})
adminMarketRoutes.patch('/projects/:id/stage', zValidator('json', stageSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { stage } = c.req.valid('json')
  await adminSetProjectStage(c.env.DB, id, stage)
  return c.json({ ok: true })
})

adminMarketRoutes.get('/agencies', async (c) => {
  const items = await adminListAgencies(c.env.DB)
  return c.json({ items })
})

const verifiedSchema = z.object({ verified: z.boolean() })
adminMarketRoutes.patch('/agencies/:id/verified', zValidator('json', verifiedSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { verified } = c.req.valid('json')
  await adminSetAgencyVerified(c.env.DB, id, verified)
  return c.json({ ok: true })
})

adminMarketRoutes.get('/applications', async (c) => {
  const items = await adminListApplications(c.env.DB)
  return c.json({ items })
})

adminMarketRoutes.get('/consultations', async (c) => {
  const items = await adminListConsultations(c.env.DB)
  return c.json({ items })
})

const consStatusSchema = z.object({ status: z.enum(['pending', 'contacted', 'closed']) })
adminMarketRoutes.patch('/consultations/:id/status', zValidator('json', consStatusSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { status } = c.req.valid('json')
  await adminSetConsultationStatus(c.env.DB, id, status)
  return c.json({ ok: true })
})

adminMarketRoutes.get('/reviews', async (c) => {
  const items = await adminListReviews(c.env.DB)
  return c.json({ items })
})

adminMarketRoutes.delete('/reviews/:id', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  await adminDeleteReview(c.env.DB, id)
  return c.json({ ok: true })
})
