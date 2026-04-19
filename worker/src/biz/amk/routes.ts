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
  adminMarkDraftPaid,
  adminRefundDraftPayment,
  adminMarkPhoneVerified,
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

// A: 대행사 검증 큐 (submitted 기본, status=all/submitted/approved/rejected)
adminMarketRoutes.get('/agency-verifications', async (c) => {
  const status = c.req.query('status') ?? 'submitted'
  const where = status === 'all' ? '' : 'WHERE verification_status = ?1'
  const stmt = c.env.DB.prepare(
    `SELECT a.id, a.slug, a.name, a.verified, a.verification_status,
            a.verification_submitted_at, a.verification_reviewed_at,
            a.verification_reject_reason, a.business_reg_no, a.ceo_name,
            a.business_reg_img_url, a.user_id,
            mu.email AS user_email, mu.name AS user_name
       FROM agencies a
       LEFT JOIN market_users mu ON mu.id = a.user_id
       ${where}
       ORDER BY COALESCE(a.verification_submitted_at, '') DESC
       LIMIT 200`,
  )
  const bound = status === 'all' ? stmt : stmt.bind(status)
  const rows = await bound.all<{
    id: number; slug: string; name: string; verified: number
    verification_status: string; verification_submitted_at: string | null
    verification_reviewed_at: string | null; verification_reject_reason: string | null
    business_reg_no: string | null; ceo_name: string | null
    business_reg_img_url: string | null; user_id: number | null
    user_email: string | null; user_name: string | null
  }>()
  const items = (rows.results ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    verified: r.verified === 1,
    status: r.verification_status,
    submittedAt: r.verification_submitted_at,
    reviewedAt: r.verification_reviewed_at,
    rejectReason: r.verification_reject_reason,
    businessRegNo: r.business_reg_no,
    ceoName: r.ceo_name,
    businessRegImgUrl: r.business_reg_img_url,
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
  }))
  return c.json({ items })
})

adminMarketRoutes.post('/agencies/:id/verify-approve', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const now = new Date().toISOString()
  await c.env.DB
    .prepare(
      `UPDATE agencies
          SET verified = 1,
              verification_status = 'approved',
              verification_reviewed_at = ?1,
              verification_reviewed_by = 'admin',
              verification_reject_reason = NULL
        WHERE id = ?2`,
    )
    .bind(now, id)
    .run()
  return c.json({ ok: true })
})

const verifyRejectSchema = z.object({ reason: z.string().max(500).default('검증 기준 미충족') })
adminMarketRoutes.post('/agencies/:id/verify-reject', zValidator('json', verifyRejectSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { reason } = c.req.valid('json')
  const now = new Date().toISOString()
  await c.env.DB
    .prepare(
      `UPDATE agencies
          SET verification_status = 'rejected',
              verification_reviewed_at = ?1,
              verification_reviewed_by = 'admin',
              verification_reject_reason = ?2
        WHERE id = ?3`,
    )
    .bind(now, reason, id)
    .run()
  return c.json({ ok: true })
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

// 유선 검증 완료 처리
const phoneVerifySchema = z.object({ note: z.string().max(500).optional() })
adminMarketRoutes.post('/drafts/:id/phone-verify', zValidator('json', phoneVerifySchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { note } = c.req.valid('json')
  await adminMarkPhoneVerified(c.env.DB, id, 'admin', note ?? null)
  return c.json({ ok: true })
})

adminMarketRoutes.post('/drafts/:id/approve', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  try {
    const draft = await adminGetDraft(c.env.DB, id)
    if (!draft) return c.json({ error: '초안을 찾을 수 없습니다.' }, 404)
    const force = c.req.query('force') === '1'
    // 1) 유선 검증 게이트
    if (!force && !draft.phoneVerifiedAt) {
      return c.json({
        error: '유선 검증 전입니다. 광고주에게 전화해서 디테일 확인 후 "유선 검증 완료" 처리해주세요.',
        stage: 'phone_verify_required',
      }, 412)
    }
    // 2) 결제 게이트
    if (!force && draft.paymentStatus !== 'paid') {
      return c.json({
        error: '등록비(₩10,000) 수령 전입니다. 결제 완료 처리 후 승인해주세요.',
        paymentStatus: draft.paymentStatus,
      }, 402)
    }
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

// C-4: 결제 완료 처리 / 환불 처리
const paymentSchema = z.object({
  method: z.enum(['bank_transfer', 'card', 'manual']).default('manual'),
  reference: z.string().max(200).optional(),
})
adminMarketRoutes.post('/drafts/:id/payment', zValidator('json', paymentSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  const { method, reference } = c.req.valid('json')
  await adminMarkDraftPaid(c.env.DB, id, method, reference ?? null)
  return c.json({ ok: true })
})

adminMarketRoutes.post('/drafts/:id/refund', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  await adminRefundDraftPayment(c.env.DB, id)
  return c.json({ ok: true })
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
