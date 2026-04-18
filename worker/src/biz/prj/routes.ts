import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppBindings } from '../../com/bindings'
import { requireMarketUser, type MarketAuthVariables } from '../mau/middleware'
import { createNotification } from '../not/repository'
import {
  advanceProjectStage,
  advertiserFunnel,
  agencyFunnel,
  createApplication,
  createProject,
  createProjectReview,
  createQuote,
  findApplication,
  getApplicationById,
  getProjectById,
  getProjectOwner,
  getProjectStage,
  hasSelectedApplication,
  listApplicantsForProject,
  listApplicationsByAgency,
  listProjectsByUser,
  listQuotesByUser,
  listReviewsForAgencyUser,
  setApplicationStatus,
  setProjectStage,
} from './repository'

const createProjectSchema = z.object({
  industry: z.string().min(1).max(20),
  industryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  marketingTypes: z.array(z.string().min(1)).min(1).max(8),
  hashtags: z.array(z.string().min(1)).max(10).optional(),
  budgetMin: z.number().int().positive(),
  budgetMax: z.number().int().positive().nullable().optional(),
  budgetType: z.enum(['monthly', 'range', 'fixed']),
  timeline: z.string().max(40).optional(),
  daysLeft: z.number().int().min(0).max(365).optional(),
  advertiserName: z.string().max(60).optional(),
})

const createQuoteSchema = z.object({
  agencyId: z.number().int().positive(),
  priceMin: z.number().int().positive(),
  priceMax: z.number().int().positive().nullable().optional(),
  timelineMonths: z.number().positive().max(60),
  description: z.string().min(20).max(2000),
  strength: z.string().max(40).optional(),
})

export const marketProjectRoutes = new Hono<{
  Bindings: AppBindings
  Variables: MarketAuthVariables
}>()

marketProjectRoutes.use('*', requireMarketUser)

marketProjectRoutes.post('/projects', zValidator('json', createProjectSchema), async (c) => {
  const user = c.get('marketUser')
  const input = c.req.valid('json')
  const project = await createProject(c.env.DB, user.userId, input)
  return c.json({ project }, 201)
})

marketProjectRoutes.post(
  '/projects/:id/quotes',
  zValidator('json', createQuoteSchema),
  async (c) => {
    const user = c.get('marketUser')
    const projectId = Number.parseInt(c.req.param('id'), 10)
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return c.json({ error: 'Invalid project id' }, 400)
    }
    const project = await getProjectById(c.env.DB, projectId)
    if (!project) return c.json({ error: 'Project not found' }, 404)
    const owner = await getProjectOwner(c.env.DB, projectId)
    if (owner !== null && owner === user.userId) {
      return c.json({ error: '자신의 프로젝트에는 견적을 제출할 수 없습니다.' }, 403)
    }
    const input = c.req.valid('json')
    await createQuote(c.env.DB, user.userId, projectId, input.agencyId, {
      priceMin: input.priceMin,
      priceMax: input.priceMax ?? null,
      timelineMonths: input.timelineMonths,
      description: input.description,
      strength: input.strength,
    })
    return c.json({ ok: true }, 201)
  },
)

marketProjectRoutes.get('/me/projects', async (c) => {
  const user = c.get('marketUser')
  const projects = await listProjectsByUser(c.env.DB, user.userId)
  return c.json({ projects })
})

marketProjectRoutes.get('/me/quotes', async (c) => {
  const user = c.get('marketUser')
  const quotes = await listQuotesByUser(c.env.DB, user.userId)
  return c.json({ quotes })
})

const applySchema = z.object({
  message: z.string().max(500).optional(),
})

marketProjectRoutes.post('/projects/:id/apply', zValidator('json', applySchema), async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const project = await getProjectById(c.env.DB, projectId)
  if (!project) return c.json({ error: 'Project not found' }, 404)
  const owner = await getProjectOwner(c.env.DB, projectId)
  if (owner === user.userId) return c.json({ error: '자신의 프로젝트에는 지원할 수 없습니다.' }, 403)
  const existing = await findApplication(c.env.DB, projectId, user.userId)
  if (existing) return c.json({ error: '이미 지원한 프로젝트입니다.', application: existing }, 409)
  const { message } = c.req.valid('json')
  const application = await createApplication(c.env.DB, projectId, user.userId, message ?? '')
  if (owner) {
    await createNotification(c.env.DB, {
      userId: owner,
      kind: 'application_received',
      title: '새 지원자 도착',
      body: `${project.title}에 대행사가 지원했습니다.`,
      projectId,
      applicationId: application.id,
      link: `/project/${projectId}/applicants`,
    })
  }
  return c.json({ application }, 201)
})

const actionSchema = z.object({ action: z.enum(['select', 'reject']) })

marketProjectRoutes.patch(
  '/applications/:id/status',
  zValidator('json', actionSchema),
  async (c) => {
    const user = c.get('marketUser')
    const id = Number.parseInt(c.req.param('id'), 10)
    if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
    const application = await getApplicationById(c.env.DB, id)
    if (!application) return c.json({ error: 'Application not found' }, 404)
    if (application.projectOwnerId !== user.userId) {
      return c.json({ error: '프로젝트 소유자만 처리할 수 있습니다.' }, 403)
    }
    const { action } = c.req.valid('json')
    const nextStatus = action === 'select' ? 'selected' : 'rejected'
    await setApplicationStatus(c.env.DB, id, nextStatus)

    // 프로젝트 stage 자동 전환: 첫 선정 시 recruiting → contracting
    const stage = await getProjectStage(c.env.DB, application.projectId)
    if (nextStatus === 'selected' && stage === 'recruiting') {
      await setProjectStage(c.env.DB, application.projectId, 'contracting')
      await createNotification(c.env.DB, {
        userId: user.userId,
        kind: 'project_stage_changed',
        title: '프로젝트가 계약 진행 단계로 전환되었습니다',
        body: '이제 선정된 파트너와 견적서/계약을 논의할 수 있습니다.',
        projectId: application.projectId,
        link: `/project/${application.projectId}/applicants`,
      })
    }

    await createNotification(c.env.DB, {
      userId: application.agencyUserId,
      kind: nextStatus === 'selected' ? 'application_selected' : 'application_rejected',
      title: nextStatus === 'selected' ? '축하합니다! 파트너로 선정되었습니다' : '아쉽게도 선정되지 않았습니다',
      body: nextStatus === 'selected'
        ? '계약 진행 단계로 이동하세요.'
        : '다른 프로젝트에 지원해보세요.',
      projectId: application.projectId,
      applicationId: id,
      link: `/project/${application.projectId}`,
    })

    return c.json({ ok: true })
  },
)

const reviewSchema = z.object({
  agencyUserId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(500),
})

marketProjectRoutes.post('/projects/:id/reviews', zValidator('json', reviewSchema), async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const owner = await getProjectOwner(c.env.DB, projectId)
  if (owner !== user.userId) return c.json({ error: '프로젝트 소유자만 리뷰를 남길 수 있습니다.' }, 403)
  const stage = await getProjectStage(c.env.DB, projectId)
  if (stage !== 'completed') return c.json({ error: '완료된 프로젝트만 리뷰를 작성할 수 있습니다.' }, 400)
  const input = c.req.valid('json')
  const review = await createProjectReview(c.env.DB, {
    projectId,
    agencyUserId: input.agencyUserId,
    authorUserId: user.userId,
    rating: input.rating,
    comment: input.comment,
  })
  await createNotification(c.env.DB, {
    userId: input.agencyUserId,
    kind: 'review_received',
    title: '새 리뷰가 도착했습니다',
    body: `★ ${input.rating} 리뷰를 받았습니다.`,
    projectId,
    link: '/dashboard',
  })
  return c.json({ review }, 201)
})

marketProjectRoutes.get('/agencies/:userId/reviews', async (c) => {
  const userId = Number.parseInt(c.req.param('userId'), 10)
  if (!Number.isFinite(userId) || userId <= 0) return c.json({ error: 'Invalid user id' }, 400)
  const reviews = await listReviewsForAgencyUser(c.env.DB, userId)
  return c.json({ reviews })
})

marketProjectRoutes.get('/me/funnel', async (c) => {
  const user = c.get('marketUser')
  const funnel = await advertiserFunnel(c.env.DB, user.userId)
  return c.json({ funnel })
})

// H-4: 프로젝트 편집 (owner · recruiting/contracting 상태만)
const updateProjectSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(20).max(2000).optional(),
  marketingTypes: z.array(z.string().min(1)).min(1).max(8).optional(),
  hashtags: z.array(z.string().min(1)).max(10).optional(),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().nullable().optional(),
  budgetType: z.enum(['monthly', 'range', 'fixed']).optional(),
  timeline: z.string().max(40).optional(),
  daysLeft: z.number().int().min(0).max(365).optional(),
})

marketProjectRoutes.patch('/projects/:id', zValidator('json', updateProjectSchema), async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const owner = await getProjectOwner(c.env.DB, projectId)
  if (owner !== user.userId) return c.json({ error: '프로젝트 소유자만 수정할 수 있습니다.' }, 403)
  const stage = await getProjectStage(c.env.DB, projectId)
  if (stage !== 'recruiting' && stage !== 'contracting') {
    return c.json({ error: '모집중·계약진행중 단계에서만 수정할 수 있습니다.' }, 400)
  }
  const input = c.req.valid('json')
  const fields: string[] = []
  const binds: (string | number | null)[] = []
  const push = (col: string, val: string | number | null) => {
    fields.push(`${col} = ?${fields.length + 1}`)
    binds.push(val)
  }
  if (input.title !== undefined) push('title', input.title)
  if (input.description !== undefined) push('description', input.description)
  if (input.marketingTypes !== undefined) push('marketing_types', JSON.stringify(input.marketingTypes))
  if (input.hashtags !== undefined) push('hashtags', JSON.stringify(input.hashtags))
  if (input.budgetMin !== undefined) push('budget_min', input.budgetMin)
  if (input.budgetMax !== undefined) push('budget_max', input.budgetMax)
  if (input.budgetType !== undefined) push('budget_type', input.budgetType)
  if (input.timeline !== undefined) push('timeline', input.timeline)
  if (input.daysLeft !== undefined) push('days_left', input.daysLeft)
  if (fields.length === 0) return c.json({ error: '변경할 항목이 없습니다.' }, 400)
  fields.push(`updated_at = ?${fields.length + 1}`)
  binds.push(new Date().toISOString())
  binds.push(projectId)
  await c.env.DB.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?${binds.length}`)
    .bind(...binds)
    .run()
  return c.json({ ok: true })
})

// H-5: 프로젝트 취소
marketProjectRoutes.post('/projects/:id/cancel', async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const owner = await getProjectOwner(c.env.DB, projectId)
  if (owner !== user.userId) return c.json({ error: '프로젝트 소유자만 취소할 수 있습니다.' }, 403)
  const stage = await getProjectStage(c.env.DB, projectId)
  if (stage === 'completed' || stage === 'cancelled') {
    return c.json({ error: '이미 완료·취소된 프로젝트입니다.' }, 400)
  }
  const now = new Date().toISOString()
  await c.env.DB
    .prepare("UPDATE projects SET stage = 'cancelled', status = 'completed', updated_at = ?1 WHERE id = ?2")
    .bind(now, projectId)
    .run()
  return c.json({ ok: true })
})

// H-6: 대행사 지원 취소 (본인 · status='pending'만)
marketProjectRoutes.delete('/applications/:id', async (c) => {
  const user = c.get('marketUser')
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid application id' }, 400)
  const application = await getApplicationById(c.env.DB, id)
  if (!application) return c.json({ error: 'Application not found' }, 404)
  if (application.agencyUserId !== user.userId) {
    return c.json({ error: '본인 지원만 취소할 수 있습니다.' }, 403)
  }
  if (application.status !== 'pending') {
    return c.json({ error: '검토 대기 중인 지원만 취소할 수 있습니다.' }, 400)
  }
  const now = new Date().toISOString()
  await c.env.DB
    .prepare('DELETE FROM project_applications WHERE id = ?1')
    .bind(id)
    .run()
  // 지원자 수 감소
  await c.env.DB
    .prepare('UPDATE projects SET applicant_count = MAX(0, applicant_count - 1), updated_at = ?1 WHERE id = ?2')
    .bind(now, application.projectId)
    .run()
  return c.json({ ok: true })
})

const advanceSchema = z.object({ next: z.enum(['executing', 'completed']) })

marketProjectRoutes.patch('/projects/:id/stage', zValidator('json', advanceSchema), async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const owner = await getProjectOwner(c.env.DB, projectId)
  if (owner !== user.userId) return c.json({ error: '프로젝트 소유자만 변경할 수 있습니다.' }, 403)
  const current = await getProjectStage(c.env.DB, projectId)
  const { next } = c.req.valid('json')
  if (next === 'executing' && current !== 'contracting') {
    return c.json({ error: '계약 진행중인 프로젝트만 집행 단계로 넘길 수 있습니다.' }, 400)
  }
  if (next === 'completed' && current !== 'executing') {
    return c.json({ error: '집행 중인 프로젝트만 완료 처리할 수 있습니다.' }, 400)
  }
  if (next === 'executing') {
    const hasSelected = await hasSelectedApplication(c.env.DB, projectId)
    if (!hasSelected) return c.json({ error: '선정된 파트너가 있어야 집행 단계로 넘어갈 수 있습니다.' }, 400)
  }
  await advanceProjectStage(c.env.DB, projectId, next)
  return c.json({ ok: true })
})

marketProjectRoutes.get('/projects/:id/my-application', async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const application = await findApplication(c.env.DB, projectId, user.userId)
  return c.json({ application })
})

marketProjectRoutes.get('/me/applications', async (c) => {
  const user = c.get('marketUser')
  const applications = await listApplicationsByAgency(c.env.DB, user.userId)
  const funnel = await agencyFunnel(c.env.DB, user.userId)
  return c.json({ applications, funnel })
})

marketProjectRoutes.get('/projects/:id/applicants', async (c) => {
  const user = c.get('marketUser')
  const projectId = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(projectId) || projectId <= 0) return c.json({ error: 'Invalid project id' }, 400)
  const owner = await getProjectOwner(c.env.DB, projectId)
  if (owner !== user.userId) return c.json({ error: '프로젝트 소유자만 조회할 수 있습니다.' }, 403)
  const applicants = await listApplicantsForProject(c.env.DB, projectId)
  return c.json({ applicants })
})
