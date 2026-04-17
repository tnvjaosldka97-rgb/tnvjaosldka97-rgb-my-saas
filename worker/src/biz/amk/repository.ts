import type { D1DatabaseLike } from '../../com/bindings'
import { allRows, isoNow } from '../../com/db'

// ============================================================================
// Types (admin market 전용 집계 뷰)
// ============================================================================

export type AdminProjectRow = {
  id: number
  slug: string
  industry: string
  title: string
  status: string
  stage: string
  budgetMin: number
  budgetMax: number | null
  applicantCount: number
  daysLeft: number
  advertiserName: string | null
  createdAt: string
}

export type AdminAgencyRow = {
  id: number
  slug: string
  name: string
  verified: boolean
  rating: number
  completedProjects: number
  totalReviews: number
  specialties: string[]
  createdAt: string
}

export type AdminApplicationRow = {
  id: number
  projectId: number
  projectTitle: string
  agencyUserId: number
  agencyUserName: string
  agencyUserEmail: string
  status: string
  message: string
  createdAt: string
}

export type AdminConsultationRow = {
  id: number
  projectId: number
  projectTitle: string
  agencyId: number | null
  agencyName: string | null
  requesterName: string
  requesterContact: string
  message: string
  preferredTime: string
  status: string
  createdAt: string
}

export type AdminDraftRow = {
  id: number
  requesterName: string
  requesterContact: string
  industry: string
  marketingType: string
  budgetRange: string
  message: string
  status: string
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  approvedProjectId: number | null
  rejectReason: string | null
}

export type AdminReviewRow = {
  id: number
  projectId: number
  projectTitle: string
  agencyId: number
  agencyName: string
  rating: number
  comment: string
  createdAt: string
}

export type MarketOverviewMetrics = {
  totalProjects: number
  recruitingProjects: number
  executingProjects: number
  completedProjects: number
  totalAgencies: number
  verifiedAgencies: number
  totalApplications: number
  pendingApplications: number
  totalConsultations: number
  pendingConsultations: number
  totalReviews: number
  avgRating: number
  totalDrafts: number
  pendingDrafts: number
  weeklyProjects: number[] // 7 buckets, index 0 = 6주전, index 6 = 이번주
  industryDistribution: Array<{ industry: string; count: number }>
  recentActivity: Array<{ kind: string; label: string; at: string }>
}

function parseJsonArray(raw: string): string[] {
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p.map(String) : [] } catch { return [] }
}

// ============================================================================
// Projects
// ============================================================================

export async function adminListProjects(db: D1DatabaseLike): Promise<AdminProjectRow[]> {
  type Row = {
    id: number; slug: string; industry: string; title: string; status: string; stage: string
    budget_min: number; budget_max: number | null; applicant_count: number; days_left: number
    advertiser_name: string | null; created_at: string
  }
  const rows = await allRows<Row>(
    db.prepare(
      `SELECT id, slug, industry, title, status, stage, budget_min, budget_max,
              applicant_count, days_left, advertiser_name, created_at
       FROM projects
       ORDER BY created_at DESC
       LIMIT 200`,
    ),
  )
  return rows.map((r) => ({
    id: r.id, slug: r.slug, industry: r.industry, title: r.title,
    status: r.status, stage: r.stage,
    budgetMin: r.budget_min, budgetMax: r.budget_max,
    applicantCount: r.applicant_count, daysLeft: r.days_left,
    advertiserName: r.advertiser_name, createdAt: r.created_at,
  }))
}

export async function adminSetProjectStage(
  db: D1DatabaseLike,
  id: number,
  stage: 'recruiting' | 'contracting' | 'executing' | 'completed',
): Promise<void> {
  const legacyStatus =
    stage === 'executing' ? 'in_progress' : stage === 'completed' ? 'completed' : 'recruiting'
  await db
    .prepare('UPDATE projects SET stage = ?1, status = ?2, updated_at = ?3 WHERE id = ?4')
    .bind(stage, legacyStatus, isoNow(), id)
    .run()
}

// ============================================================================
// Agencies
// ============================================================================

export async function adminListAgencies(db: D1DatabaseLike): Promise<AdminAgencyRow[]> {
  type Row = {
    id: number; slug: string; name: string; verified: number; rating: number
    completed_projects: number; total_reviews: number; specialties: string; created_at: string
  }
  const rows = await allRows<Row>(
    db.prepare(
      `SELECT id, slug, name, verified, rating, completed_projects, total_reviews, specialties, created_at
       FROM agencies
       ORDER BY rating DESC, completed_projects DESC
       LIMIT 200`,
    ),
  )
  return rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name,
    verified: r.verified === 1, rating: r.rating,
    completedProjects: r.completed_projects, totalReviews: r.total_reviews,
    specialties: parseJsonArray(r.specialties), createdAt: r.created_at,
  }))
}

export async function adminSetAgencyVerified(
  db: D1DatabaseLike,
  id: number,
  verified: boolean,
): Promise<void> {
  await db
    .prepare('UPDATE agencies SET verified = ?1 WHERE id = ?2')
    .bind(verified ? 1 : 0, id)
    .run()
}

// ============================================================================
// Applications
// ============================================================================

export async function adminListApplications(db: D1DatabaseLike): Promise<AdminApplicationRow[]> {
  type Row = {
    id: number; project_id: number; project_title: string
    agency_user_id: number; agency_name: string; agency_email: string
    status: string; message: string; created_at: string
  }
  const rows = await allRows<Row>(
    db.prepare(
      `SELECT a.id, a.project_id, p.title AS project_title,
              a.agency_user_id, u.name AS agency_name, u.email AS agency_email,
              a.status, a.message, a.created_at
       FROM project_applications a
       JOIN projects p ON p.id = a.project_id
       JOIN market_users u ON u.id = a.agency_user_id
       ORDER BY a.created_at DESC
       LIMIT 200`,
    ),
  )
  return rows.map((r) => ({
    id: r.id, projectId: r.project_id, projectTitle: r.project_title,
    agencyUserId: r.agency_user_id, agencyUserName: r.agency_name, agencyUserEmail: r.agency_email,
    status: r.status, message: r.message, createdAt: r.created_at,
  }))
}

// ============================================================================
// Consultations
// ============================================================================

export async function adminListConsultations(db: D1DatabaseLike): Promise<AdminConsultationRow[]> {
  type Row = {
    id: number; project_id: number; project_title: string
    agency_id: number | null; agency_name: string | null
    requester_name: string; requester_contact: string; message: string
    preferred_time: string; status: string; created_at: string
  }
  const rows = await allRows<Row>(
    db.prepare(
      `SELECT c.id, c.project_id, p.title AS project_title,
              c.agency_id, a.name AS agency_name,
              c.requester_name, c.requester_contact, c.message, c.preferred_time,
              c.status, c.created_at
       FROM consultations c
       JOIN projects p ON p.id = c.project_id
       LEFT JOIN agencies a ON a.id = c.agency_id
       ORDER BY c.created_at DESC
       LIMIT 200`,
    ),
  )
  return rows.map((r) => ({
    id: r.id, projectId: r.project_id, projectTitle: r.project_title,
    agencyId: r.agency_id, agencyName: r.agency_name,
    requesterName: r.requester_name, requesterContact: r.requester_contact,
    message: r.message, preferredTime: r.preferred_time,
    status: r.status, createdAt: r.created_at,
  }))
}

export async function adminSetConsultationStatus(
  db: D1DatabaseLike,
  id: number,
  status: 'pending' | 'contacted' | 'closed',
): Promise<void> {
  await db.prepare('UPDATE consultations SET status = ?1 WHERE id = ?2').bind(status, id).run()
}

// ============================================================================
// Reviews
// ============================================================================

export async function adminListReviews(db: D1DatabaseLike): Promise<AdminReviewRow[]> {
  type Row = {
    id: number; project_id: number; project_title: string
    agency_id: number; agency_name: string
    rating: number; comment: string; created_at: string
  }
  const rows = await allRows<Row>(
    db.prepare(
      `SELECT r.id, r.project_id, p.title AS project_title,
              r.agency_id, a.name AS agency_name,
              r.rating, r.comment, r.created_at
       FROM reviews r
       JOIN projects p ON p.id = r.project_id
       JOIN agencies a ON a.id = r.agency_id
       ORDER BY r.created_at DESC
       LIMIT 200`,
    ),
  )
  return rows.map((r) => ({
    id: r.id, projectId: r.project_id, projectTitle: r.project_title,
    agencyId: r.agency_id, agencyName: r.agency_name,
    rating: r.rating, comment: r.comment, createdAt: r.created_at,
  }))
}

export async function adminDeleteReview(db: D1DatabaseLike, id: number): Promise<void> {
  await db.prepare('DELETE FROM reviews WHERE id = ?1').bind(id).run()
}

// ============================================================================
// Project Drafts (비회원 접수 → 슈퍼어드민 승인)
// ============================================================================

const INDUSTRY_COLOR: Record<string, string> = {
  외식:   '#EF4444',
  병원:   '#06B6D4',
  뷰티:   '#EC4899',
  학원:   '#6366F1',
  커머스: '#F59E0B',
  서비스: '#14B8A6',
  기타:   '#64748B',
}

const BUDGET_RANGE_MAP: Record<string, { min: number; max: number | null }> = {
  '월 100만원 이하':     { min: 50, max: 100 },
  '월 100~300만원':      { min: 100, max: 300 },
  '월 300~500만원':      { min: 300, max: 500 },
  '월 500만원 이상':     { min: 500, max: 1500 },
  '아직 정하지 못함':    { min: 100, max: 500 },
}

function slugifyForDraft(label: string, id: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'draft'
  return `${base}-${id}-${Math.random().toString(36).slice(2, 6)}`
}

export async function adminListDrafts(
  db: D1DatabaseLike,
  statusFilter?: string,
): Promise<AdminDraftRow[]> {
  type Row = {
    id: number; requester_name: string; requester_contact: string
    industry: string; marketing_type: string; budget_range: string
    message: string; status: string; submitted_at: string
    reviewed_at: string | null; reviewed_by: string | null
    approved_project_id: number | null; reject_reason: string | null
  }
  const where = statusFilter && statusFilter !== 'all' ? 'WHERE status = ?1' : ''
  const stmt = db.prepare(
    `SELECT id, requester_name, requester_contact, industry, marketing_type,
            budget_range, message, status, submitted_at,
            reviewed_at, reviewed_by, approved_project_id, reject_reason
       FROM project_drafts
       ${where}
       ORDER BY submitted_at DESC
       LIMIT 200`,
  )
  const bound = statusFilter && statusFilter !== 'all' ? stmt.bind(statusFilter) : stmt
  const rows = await allRows<Row>(bound)
  return rows.map((r) => ({
    id: r.id,
    requesterName: r.requester_name,
    requesterContact: r.requester_contact,
    industry: r.industry,
    marketingType: r.marketing_type,
    budgetRange: r.budget_range,
    message: r.message,
    status: r.status,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    reviewedBy: r.reviewed_by,
    approvedProjectId: r.approved_project_id,
    rejectReason: r.reject_reason,
  }))
}

export async function adminGetDraft(db: D1DatabaseLike, id: number): Promise<AdminDraftRow | null> {
  const rows = await adminListDrafts(db)
  return rows.find((r) => r.id === id) ?? null
}

export async function adminApproveDraft(
  db: D1DatabaseLike,
  id: number,
  reviewer: string,
): Promise<number> {
  const draft = await adminGetDraft(db, id)
  if (!draft) throw new Error('Draft not found')
  if (draft.status !== 'pending') throw new Error('이미 처리된 초안입니다.')

  const now = isoNow()
  const industry = draft.industry
  const industryColor = INDUSTRY_COLOR[industry] ?? '#64748B'
  const budget = BUDGET_RANGE_MAP[draft.budgetRange] ?? { min: 200, max: 400 }
  const title = `${industry} · ${draft.marketingType} — ${draft.requesterName}님 의뢰 프로젝트`
  const description = draft.message.trim().length >= 20
    ? draft.message
    : `${industry} 업종의 ${draft.marketingType} 마케팅을 진행할 파트너를 찾고 있습니다. 예산 범위: ${draft.budgetRange}. 상세 조건은 접수 시 담당자가 요청자와 조율합니다.`

  const slug = slugifyForDraft(draft.marketingType, id)
  await db
    .prepare(
      `INSERT INTO projects (
         slug, industry, industry_color, title, description,
         marketing_types, hashtags, budget_min, budget_max, budget_type,
         status, applicant_count, verified_only, days_left,
         advertiser_name, timeline, closes_at, created_at, updated_at, user_id
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'monthly',
         'recruiting', 0, 0, 14, ?10, NULL, datetime('now','+14 days'), ?11, ?11, NULL)`,
    )
    .bind(
      slug,
      industry,
      industryColor,
      title,
      description,
      JSON.stringify([draft.marketingType]),
      JSON.stringify([]),
      budget.min,
      budget.max,
      draft.requesterName,
      now,
    )
    .run()

  const createdRow = await db
    .prepare('SELECT id FROM projects WHERE slug = ?1 LIMIT 1')
    .bind(slug)
    .first<{ id: number }>()
  const newProjectId = createdRow?.id ?? 0

  await db
    .prepare(
      `UPDATE project_drafts
         SET status = 'approved', reviewed_at = ?1, reviewed_by = ?2, approved_project_id = ?3
       WHERE id = ?4`,
    )
    .bind(now, reviewer, newProjectId, id)
    .run()

  return newProjectId
}

export async function adminRejectDraft(
  db: D1DatabaseLike,
  id: number,
  reviewer: string,
  reason: string,
): Promise<void> {
  const now = isoNow()
  await db
    .prepare(
      `UPDATE project_drafts
         SET status = 'rejected', reviewed_at = ?1, reviewed_by = ?2, reject_reason = ?3
       WHERE id = ?4 AND status = 'pending'`,
    )
    .bind(now, reviewer, reason, id)
    .run()
}

// ============================================================================
// Overview (KPI + distribution + activity)
// ============================================================================

export async function adminMarketOverview(db: D1DatabaseLike): Promise<MarketOverviewMetrics> {
  const projects = await db.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN stage = 'recruiting' THEN 1 ELSE 0 END) AS recruiting,
       SUM(CASE WHEN stage = 'executing' THEN 1 ELSE 0 END) AS executing,
       SUM(CASE WHEN stage = 'completed' THEN 1 ELSE 0 END) AS completed
     FROM projects`,
  ).first<{ total: number; recruiting: number; executing: number; completed: number }>()

  const agencies = await db.prepare(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) AS verified, AVG(rating) AS avg_rating
     FROM agencies`,
  ).first<{ total: number; verified: number; avg_rating: number | null }>()

  const drafts = await db.prepare(
    `SELECT
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       COUNT(*) AS total
     FROM project_drafts`,
  ).first<{ pending: number | null; total: number | null }>().catch(() => null)

  const apps = await db.prepare(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM project_applications`,
  ).first<{ total: number; pending: number }>()

  const cons = await db.prepare(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM consultations`,
  ).first<{ total: number; pending: number }>()

  const reviews = await db.prepare(`SELECT COUNT(*) AS total FROM reviews`).first<{ total: number }>()

  // 지난 7주 프로젝트 등록 bucket
  const weeklyRes = await allRows<{ age: number }>(
    db.prepare(
      `SELECT CAST((julianday('now') - julianday(created_at)) AS INTEGER) AS age
         FROM projects
        WHERE julianday('now') - julianday(created_at) < 49`,
    ),
  ).catch(() => [])
  const weeklyProjects = Array<number>(7).fill(0)
  for (const row of weeklyRes) {
    const week = 6 - Math.min(6, Math.floor(row.age / 7))
    if (week >= 0 && week <= 6) weeklyProjects[week]++
  }

  const distRows = await allRows<{ industry: string; cnt: number }>(
    db.prepare(`SELECT industry, COUNT(*) AS cnt FROM projects GROUP BY industry ORDER BY cnt DESC`),
  )

  const recentProjects = await allRows<{ title: string; created_at: string; stage: string }>(
    db.prepare(`SELECT title, created_at, stage FROM projects ORDER BY created_at DESC LIMIT 8`),
  )

  const recentConsultations = await allRows<{ requester_name: string; created_at: string }>(
    db.prepare(`SELECT requester_name, created_at FROM consultations ORDER BY created_at DESC LIMIT 5`),
  )

  const activity = [
    ...recentProjects.map((p) => ({
      kind: 'project' as const,
      label: `${p.title} (${p.stage})`,
      at: p.created_at,
    })),
    ...recentConsultations.map((c) => ({
      kind: 'consultation' as const,
      label: `${c.requester_name}님 상담 요청`,
      at: c.created_at,
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8)

  return {
    totalProjects: projects?.total ?? 0,
    recruitingProjects: projects?.recruiting ?? 0,
    executingProjects: projects?.executing ?? 0,
    completedProjects: projects?.completed ?? 0,
    totalAgencies: agencies?.total ?? 0,
    verifiedAgencies: agencies?.verified ?? 0,
    totalApplications: apps?.total ?? 0,
    pendingApplications: apps?.pending ?? 0,
    totalConsultations: cons?.total ?? 0,
    pendingConsultations: cons?.pending ?? 0,
    totalReviews: reviews?.total ?? 0,
    avgRating: Math.round(((agencies?.avg_rating ?? 0)) * 10) / 10,
    totalDrafts: drafts?.total ?? 0,
    pendingDrafts: drafts?.pending ?? 0,
    weeklyProjects,
    industryDistribution: distRows.map((d) => ({ industry: d.industry, count: d.cnt })),
    recentActivity: activity,
  }
}
