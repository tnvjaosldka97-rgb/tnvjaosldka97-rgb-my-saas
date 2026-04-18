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
  adminListDrafts,
  adminGetDraft,
  adminApproveDraft,
  adminRejectDraft,
  adminMarketOverview,
  adminSetAgencyVerified,
  adminSetConsultationStatus,
  adminSetProjectStage,
  adminDeleteReview,
  adminListMembers,
  adminSetMemberStatus,
} from './repository'
import { sendEmailSafe, renderDraftApprovedEmail, renderDraftRejectedEmail } from '../eml/mailer'

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

// 회원 관리 (market_users) — C-3
adminMarketRoutes.get('/members', async (c) => {
  const status = c.req.query('status')
  const type = c.req.query('type')
  const items = await adminListMembers(c.env.DB, status, type)
  return c.json({ items })
})

const memberStatusSchema = z.object({ status: z.enum(['active', 'suspended']) })
adminMarketRoutes.patch('/members/:id/status', zValidator('json', memberStatusSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { status } = c.req.valid('json')
  await adminSetMemberStatus(c.env.DB, id, status)
  return c.json({ ok: true })
})

// 프로젝트 초안 (비회원 접수 → 승인)
adminMarketRoutes.get('/drafts', async (c) => {
  const status = c.req.query('status')
  const items = await adminListDrafts(c.env.DB, status)
  return c.json({ items })
})

adminMarketRoutes.post('/drafts/:id/approve', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  try {
    // 승인 전 draft 정보 보존 (이메일 발송용)
    const draft = await adminGetDraft(c.env.DB, id)
    const projectId = await adminApproveDraft(c.env.DB, id, 'admin')
    // C-2: 요청자에게 승인 메일 (Resend 미설정 시 safe skip)
    if (draft?.requesterContact) {
      const title = `${draft.industry} · ${draft.marketingType}`
      const email = renderDraftApprovedEmail(draft.requesterName, projectId, title)
      await sendEmailSafe(c.env, draft.requesterContact, email.subject, email.html, email.text)
    }
    return c.json({ ok: true, projectId })
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : '승인 실패' }, 400)
  }
})

const rejectSchema = z.object({ reason: z.string().max(500).default('반려') })
adminMarketRoutes.post('/drafts/:id/reject', zValidator('json', rejectSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { reason } = c.req.valid('json')
  const draft = await adminGetDraft(c.env.DB, id)
  await adminRejectDraft(c.env.DB, id, 'admin', reason)
  // C-2: 요청자에게 반려 메일
  if (draft?.requesterContact) {
    const email = renderDraftRejectedEmail(draft.requesterName, reason)
    await sendEmailSafe(c.env, draft.requesterContact, email.subject, email.html, email.text)
  }
  return c.json({ ok: true })
})
