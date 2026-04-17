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

  const apps = await db.prepare(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM project_applications`,
  ).first<{ total: number; pending: number }>()

  const cons = await db.prepare(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM consultations`,
  ).first<{ total: number; pending: number }>()

  const reviews = await db.prepare(`SELECT COUNT(*) AS total FROM reviews`).first<{ total: number }>()

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
    industryDistribution: distRows.map((d) => ({ industry: d.industry, count: d.cnt })),
    recentActivity: activity,
  }
}
