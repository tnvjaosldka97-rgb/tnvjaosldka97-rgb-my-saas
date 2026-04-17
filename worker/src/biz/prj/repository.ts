import type {
  AdvertiserFunnel,
  ApplicationFunnel,
  ApplicationStatus,
  ConsultationRequestInput,
  CreateProjectInput,
  CreateQuoteInput,
  MarketAgency,
  MarketProject,
  MarketProjectDetail,
  MarketQuote,
  ProjectApplication,
  ProjectListQuery,
  ProjectReview,
  ProjectStage,
  ProjectStatus,
  BudgetType,
  QuoteStatus,
} from '@my-saas/com'
import type { D1DatabaseLike } from '../../com/bindings'
import { allRows, isoNow } from '../../com/db'

type ProjectRow = {
  id: number
  slug: string
  industry: string
  industry_color: string
  title: string
  description: string
  marketing_types: string
  hashtags: string
  budget_min: number
  budget_max: number | null
  budget_type: string
  status: string
  applicant_count: number
  verified_only: number
  days_left: number
  advertiser_name: string | null
  timeline: string | null
  closes_at: string | null
  menu_items: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

type AgencyRow = {
  id: number
  slug: string
  name: string
  description: string
  specialties: string
  verified: number
  rating: number
  completed_projects: number
  total_reviews: number
}

type QuoteRow = {
  id: number
  project_id: number
  agency_id: number
  price_min: number
  price_max: number | null
  timeline_months: number
  description: string
  strength: string | null
  status: string
  created_at: string
  a_id: number
  a_slug: string
  a_name: string
  a_description: string
  a_specialties: string
  a_verified: number
  a_rating: number
  a_completed_projects: number
  a_total_reviews: number
}

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function mapProjectCard(row: ProjectRow): MarketProject {
  return {
    id: row.id,
    slug: row.slug,
    industry: row.industry,
    industryColor: row.industry_color,
    title: row.title,
    marketingTypes: parseJsonArray(row.marketing_types),
    hashtags: parseJsonArray(row.hashtags),
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    budgetType: row.budget_type as BudgetType,
    status: row.status as ProjectStatus,
    applicantCount: row.applicant_count,
    verifiedOnly: row.verified_only === 1,
    daysLeft: row.days_left,
    closesAt: row.closes_at,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }
}

function mapProjectDetail(row: ProjectRow): MarketProjectDetail {
  return {
    ...mapProjectCard(row),
    description: row.description,
    advertiserName: row.advertiser_name,
    timeline: row.timeline,
    updatedAt: row.updated_at,
    menuItems: parseJsonArray(row.menu_items ?? '[]'),
  }
}

function mapAgency(row: AgencyRow): MarketAgency {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    specialties: parseJsonArray(row.specialties),
    verified: row.verified === 1,
    rating: row.rating,
    completedProjects: row.completed_projects,
    totalReviews: row.total_reviews,
  }
}

function mapQuoteWithAgency(row: QuoteRow): MarketQuote {
  return {
    id: row.id,
    projectId: row.project_id,
    agencyId: row.agency_id,
    priceMin: row.price_min,
    priceMax: row.price_max,
    timelineMonths: row.timeline_months,
    description: row.description,
    strength: row.strength,
    status: row.status as QuoteStatus,
    createdAt: row.created_at,
    agency: mapAgency({
      id: row.a_id,
      slug: row.a_slug,
      name: row.a_name,
      description: row.a_description,
      specialties: row.a_specialties,
      verified: row.a_verified,
      rating: row.a_rating,
      completed_projects: row.a_completed_projects,
      total_reviews: row.a_total_reviews,
    }),
  }
}

export async function listProjects(
  db: D1DatabaseLike,
  query: ProjectListQuery,
): Promise<MarketProject[]> {
  const status = query.status && query.status !== 'all' ? query.status : null
  const orderBy = (() => {
    switch (query.sort) {
      case 'closing':
        return 'days_left ASC, created_at DESC'
      case 'budget':
        return 'budget_min DESC'
      case 'applicants':
        return 'applicant_count DESC'
      default:
        return 'created_at DESC'
    }
  })()

  const where = status ? 'WHERE status = ?1' : ''
  const stmt = db.prepare(
    `SELECT * FROM projects ${where} ORDER BY ${orderBy} LIMIT 50`,
  )
  const bound = status ? stmt.bind(status) : stmt
  const rows = await allRows<ProjectRow>(bound)
  return rows.map(mapProjectCard)
}

export async function getProjectById(
  db: D1DatabaseLike,
  id: number,
): Promise<MarketProjectDetail | null> {
  const row = await db
    .prepare('SELECT * FROM projects WHERE id = ?1 LIMIT 1')
    .bind(id)
    .first<ProjectRow>()
  return row ? mapProjectDetail(row) : null
}

function toSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${base || 'project'}-${rand}`
}

export async function createProject(
  db: D1DatabaseLike,
  userId: number,
  input: CreateProjectInput,
): Promise<MarketProjectDetail> {
  const now = isoNow()
  const slug = toSlug(input.title)
  const stmt = db.prepare(
    `INSERT INTO projects (
       slug, industry, industry_color, title, description, marketing_types, hashtags,
       budget_min, budget_max, budget_type, status, applicant_count, verified_only,
       days_left, advertiser_name, timeline, closes_at, created_at, updated_at, user_id
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'recruiting', 0, 0, ?11, ?12, ?13, NULL, ?14, ?14, ?15)`,
  )
  await stmt
    .bind(
      slug,
      input.industry,
      input.industryColor ?? '#64748B',
      input.title,
      input.description,
      JSON.stringify(input.marketingTypes),
      JSON.stringify(input.hashtags ?? []),
      input.budgetMin,
      input.budgetMax ?? null,
      input.budgetType,
      input.daysLeft ?? 0,
      input.advertiserName ?? null,
      input.timeline ?? null,
      now,
      userId,
    )
    .run()
  const row = await db
    .prepare('SELECT * FROM projects WHERE slug = ?1 LIMIT 1')
    .bind(slug)
    .first<ProjectRow>()
  if (!row) throw new Error('Failed to create project')
  return mapProjectDetail(row)
}

export async function createQuote(
  db: D1DatabaseLike,
  userId: number,
  projectId: number,
  agencyId: number,
  input: CreateQuoteInput,
): Promise<void> {
  const now = isoNow()
  await db
    .prepare(
      `INSERT INTO quotes (project_id, agency_id, price_min, price_max, timeline_months,
         description, strength, status, created_at, updated_at, user_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'pending', ?8, ?8, ?9)`,
    )
    .bind(
      projectId,
      agencyId,
      input.priceMin,
      input.priceMax ?? null,
      input.timelineMonths,
      input.description,
      input.strength ?? null,
      now,
      userId,
    )
    .run()
  // NOTE: applicant_count는 createApplication에서만 증가시킴. quote는 apply 이후 단계라 중복 카운트 방지.
  await db
    .prepare('UPDATE projects SET updated_at = ?1 WHERE id = ?2')
    .bind(now, projectId)
    .run()
}

export async function createConsultation(
  db: D1DatabaseLike,
  input: ConsultationRequestInput,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO consultations (project_id, agency_id, requester_name, requester_contact,
         message, preferred_time, status, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending', ?7)`,
    )
    .bind(
      input.projectId,
      input.agencyId ?? null,
      input.requesterName,
      input.requesterContact,
      input.message,
      input.preferredTime ?? 'any',
      isoNow(),
    )
    .run()
}

export async function listProjectsByUser(
  db: D1DatabaseLike,
  userId: number,
): Promise<MarketProject[]> {
  const rows = await allRows<ProjectRow>(
    db.prepare('SELECT * FROM projects WHERE user_id = ?1 ORDER BY created_at DESC').bind(userId),
  )
  return rows.map(mapProjectCard)
}

export async function listQuotesByUser(
  db: D1DatabaseLike,
  userId: number,
): Promise<MarketQuote[]> {
  const stmt = db
    .prepare(
      `SELECT q.id, q.project_id, q.agency_id, q.price_min, q.price_max,
              q.timeline_months, q.description, q.strength, q.status, q.created_at,
              a.id AS a_id, a.slug AS a_slug, a.name AS a_name,
              a.description AS a_description, a.specialties AS a_specialties,
              a.verified AS a_verified, a.rating AS a_rating,
              a.completed_projects AS a_completed_projects,
              a.total_reviews AS a_total_reviews
       FROM quotes q
       JOIN agencies a ON a.id = q.agency_id
       WHERE q.user_id = ?1
       ORDER BY q.created_at DESC`,
    )
    .bind(userId)
  const rows = await allRows<QuoteRow>(stmt)
  return rows.map(mapQuoteWithAgency)
}

export async function getProjectOwner(
  db: D1DatabaseLike,
  projectId: number,
): Promise<number | null> {
  const row = await db
    .prepare('SELECT user_id FROM projects WHERE id = ?1')
    .bind(projectId)
    .first<{ user_id: number | null }>()
  return row?.user_id ?? null
}

type ApplicationRow = {
  id: number
  project_id: number
  agency_user_id: number
  message: string
  status: string
  created_at: string
}

function mapApplication(row: ApplicationRow): ProjectApplication {
  return {
    id: row.id,
    projectId: row.project_id,
    agencyUserId: row.agency_user_id,
    message: row.message,
    status: row.status as ApplicationStatus,
    createdAt: row.created_at,
  }
}

export async function findApplication(
  db: D1DatabaseLike,
  projectId: number,
  agencyUserId: number,
): Promise<ProjectApplication | null> {
  const row = await db
    .prepare('SELECT * FROM project_applications WHERE project_id = ?1 AND agency_user_id = ?2 LIMIT 1')
    .bind(projectId, agencyUserId)
    .first<ApplicationRow>()
  return row ? mapApplication(row) : null
}

export async function createApplication(
  db: D1DatabaseLike,
  projectId: number,
  agencyUserId: number,
  message: string,
): Promise<ProjectApplication> {
  const now = isoNow()
  await db
    .prepare(
      `INSERT INTO project_applications (project_id, agency_user_id, message, status, created_at, updated_at)
       VALUES (?1, ?2, ?3, 'pending', ?4, ?4)`,
    )
    .bind(projectId, agencyUserId, message, now)
    .run()
  await db
    .prepare('UPDATE projects SET applicant_count = applicant_count + 1, updated_at = ?1 WHERE id = ?2')
    .bind(now, projectId)
    .run()
  const created = await findApplication(db, projectId, agencyUserId)
  if (!created) throw new Error('Failed to create application')
  return created
}

export async function listApplicationsByAgency(
  db: D1DatabaseLike,
  agencyUserId: number,
): Promise<Array<ProjectApplication & { project: MarketProject }>> {
  type JoinedRow = {
    a_id: number
    project_id: number
    agency_user_id: number
    message: string
    a_status: string
    created_at: string
    p_id: number
    slug: string
    industry: string
    industry_color: string
    title: string
    description: string
    marketing_types: string
    hashtags: string
    budget_min: number
    budget_max: number | null
    budget_type: string
    status: string
    applicant_count: number
    verified_only: number
    days_left: number
    advertiser_name: string | null
    timeline: string | null
    closes_at: string | null
    p_created_at: string
    updated_at: string
  }
  const rows = await allRows<JoinedRow>(
    db
      .prepare(
        `SELECT a.id AS a_id, a.project_id, a.agency_user_id, a.message,
                a.status AS a_status, a.created_at,
                p.id AS p_id, p.slug, p.industry, p.industry_color, p.title, p.description,
                p.marketing_types, p.hashtags, p.budget_min, p.budget_max, p.budget_type,
                p.status, p.applicant_count, p.verified_only, p.days_left, p.advertiser_name,
                p.timeline, p.closes_at, p.created_at AS p_created_at, p.updated_at
         FROM project_applications a
         JOIN projects p ON p.id = a.project_id
         WHERE a.agency_user_id = ?1
         ORDER BY a.created_at DESC`,
      )
      .bind(agencyUserId),
  )
  return rows.map((r) => {
    const projectRow: ProjectRow = {
      id: r.p_id,
      slug: r.slug,
      industry: r.industry,
      industry_color: r.industry_color,
      title: r.title,
      description: r.description,
      marketing_types: r.marketing_types,
      hashtags: r.hashtags,
      budget_min: r.budget_min,
      budget_max: r.budget_max,
      budget_type: r.budget_type,
      status: r.status,
      applicant_count: r.applicant_count,
      verified_only: r.verified_only,
      days_left: r.days_left,
      advertiser_name: r.advertiser_name,
      timeline: r.timeline,
      closes_at: r.closes_at,
      menu_items: null,
      image_url: null,
      created_at: r.p_created_at,
      updated_at: r.updated_at,
    }
    return {
      id: r.a_id,
      projectId: r.project_id,
      agencyUserId: r.agency_user_id,
      message: r.message,
      status: r.a_status as ApplicationStatus,
      createdAt: r.created_at,
      project: mapProjectCard(projectRow),
    }
  })
}

export async function agencyFunnel(
  db: D1DatabaseLike,
  agencyUserId: number,
): Promise<ApplicationFunnel> {
  const row = await db
    .prepare(
      `SELECT
         SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS applying,
         SUM(CASE WHEN a.status = 'selected' AND p.stage = 'contracting' THEN 1 ELSE 0 END) AS contracting,
         SUM(CASE WHEN a.status = 'selected' AND p.stage = 'executing' THEN 1 ELSE 0 END) AS executing,
         SUM(CASE WHEN a.status = 'selected' AND p.stage = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM project_applications a
       JOIN projects p ON p.id = a.project_id
       WHERE a.agency_user_id = ?1`,
    )
    .bind(agencyUserId)
    .first<{ applying: number | null; contracting: number | null; executing: number | null; completed: number | null }>()
  return {
    applying: row?.applying ?? 0,
    contracting: row?.contracting ?? 0,
    executing: row?.executing ?? 0,
    completed: row?.completed ?? 0,
  }
}

export async function listApplicantsForProject(
  db: D1DatabaseLike,
  projectId: number,
): Promise<Array<ProjectApplication & { userName: string; userEmail: string }>> {
  const rows = await allRows<ApplicationRow & { user_name: string; user_email: string }>(
    db
      .prepare(
        `SELECT a.*, u.name AS user_name, u.email AS user_email
         FROM project_applications a
         JOIN market_users u ON u.id = a.agency_user_id
         WHERE a.project_id = ?1
         ORDER BY a.created_at DESC`,
      )
      .bind(projectId),
  )
  return rows.map((r) => ({
    ...mapApplication(r),
    userName: r.user_name,
    userEmail: r.user_email,
  }))
}

export async function getApplicationById(
  db: D1DatabaseLike,
  id: number,
): Promise<(ProjectApplication & { projectOwnerId: number | null }) | null> {
  const row = await db
    .prepare(
      `SELECT a.*, p.user_id AS project_owner_id
       FROM project_applications a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = ?1`,
    )
    .bind(id)
    .first<ApplicationRow & { project_owner_id: number | null }>()
  if (!row) return null
  return { ...mapApplication(row), projectOwnerId: row.project_owner_id }
}

export async function setApplicationStatus(
  db: D1DatabaseLike,
  id: number,
  status: 'selected' | 'rejected',
): Promise<void> {
  const now = isoNow()
  const col = status === 'selected' ? 'selected_at' : 'rejected_at'
  await db
    .prepare(`UPDATE project_applications SET status = ?1, ${col} = ?2, updated_at = ?2 WHERE id = ?3`)
    .bind(status, now, id)
    .run()
}

export async function setProjectStage(
  db: D1DatabaseLike,
  projectId: number,
  stage: ProjectStage,
): Promise<void> {
  const now = isoNow()
  const legacyStatus = (() => {
    if (stage === 'recruiting') return 'recruiting'
    if (stage === 'contracting') return 'recruiting'
    if (stage === 'executing') return 'in_progress'
    return 'completed'
  })()
  await db
    .prepare('UPDATE projects SET stage = ?1, status = ?2, updated_at = ?3 WHERE id = ?4')
    .bind(stage, legacyStatus, now, projectId)
    .run()
}

export async function getProjectStage(
  db: D1DatabaseLike,
  projectId: number,
): Promise<ProjectStage | null> {
  const row = await db
    .prepare('SELECT stage FROM projects WHERE id = ?1')
    .bind(projectId)
    .first<{ stage: string }>()
  return (row?.stage as ProjectStage | undefined) ?? null
}

export async function hasSelectedApplication(
  db: D1DatabaseLike,
  projectId: number,
): Promise<boolean> {
  const row = await db
    .prepare("SELECT id FROM project_applications WHERE project_id = ?1 AND status = 'selected' LIMIT 1")
    .bind(projectId)
    .first<{ id: number }>()
  return Boolean(row)
}

type ReviewRow = {
  id: number
  project_id: number
  agency_user_id: number
  author_user_id: number
  rating: number
  comment: string
  created_at: string
}

function mapReview(row: ReviewRow, authorName?: string, projectTitle?: string): ProjectReview {
  return {
    id: row.id,
    projectId: row.project_id,
    agencyUserId: row.agency_user_id,
    authorUserId: row.author_user_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    authorName,
    projectTitle,
  }
}

export async function createProjectReview(
  db: D1DatabaseLike,
  input: {
    projectId: number
    agencyUserId: number
    authorUserId: number
    rating: number
    comment: string
  },
): Promise<ProjectReview> {
  const now = isoNow()
  await db
    .prepare(
      `INSERT INTO project_reviews (project_id, agency_user_id, author_user_id, rating, comment, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(input.projectId, input.agencyUserId, input.authorUserId, input.rating, input.comment, now)
    .run()
  const row = await db
    .prepare(
      'SELECT * FROM project_reviews WHERE project_id = ?1 AND agency_user_id = ?2 AND author_user_id = ?3 ORDER BY created_at DESC LIMIT 1',
    )
    .bind(input.projectId, input.agencyUserId, input.authorUserId)
    .first<ReviewRow>()
  if (!row) throw new Error('Failed to create review')
  return mapReview(row)
}

export async function listReviewsForAgencyUser(
  db: D1DatabaseLike,
  agencyUserId: number,
): Promise<ProjectReview[]> {
  const rows = await allRows<ReviewRow & { author_name: string; project_title: string }>(
    db
      .prepare(
        `SELECT r.*, u.name AS author_name, p.title AS project_title
         FROM project_reviews r
         JOIN market_users u ON u.id = r.author_user_id
         JOIN projects p ON p.id = r.project_id
         WHERE r.agency_user_id = ?1
         ORDER BY r.created_at DESC`,
      )
      .bind(agencyUserId),
  )
  return rows.map((r) => mapReview(r, r.author_name, r.project_title))
}

export async function advertiserFunnel(
  db: D1DatabaseLike,
  userId: number,
): Promise<AdvertiserFunnel> {
  const row = await db
    .prepare(
      `SELECT
         SUM(CASE WHEN stage = 'recruiting' THEN 1 ELSE 0 END) AS recruiting,
         SUM(CASE WHEN stage = 'contracting' THEN 1 ELSE 0 END) AS contracting,
         SUM(CASE WHEN stage = 'executing' THEN 1 ELSE 0 END) AS executing,
         SUM(CASE WHEN stage = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM projects WHERE user_id = ?1`,
    )
    .bind(userId)
    .first<{ recruiting: number | null; contracting: number | null; executing: number | null; completed: number | null }>()
  return {
    recruiting: row?.recruiting ?? 0,
    contracting: row?.contracting ?? 0,
    executing: row?.executing ?? 0,
    completed: row?.completed ?? 0,
  }
}

export async function advanceProjectStage(
  db: D1DatabaseLike,
  projectId: number,
  next: 'executing' | 'completed',
): Promise<void> {
  await setProjectStage(db, projectId, next)
}

export async function listQuotesForProject(
  db: D1DatabaseLike,
  projectId: number,
): Promise<MarketQuote[]> {
  const stmt = db
    .prepare(
      `SELECT q.id, q.project_id, q.agency_id, q.price_min, q.price_max,
              q.timeline_months, q.description, q.strength, q.status, q.created_at,
              a.id AS a_id, a.slug AS a_slug, a.name AS a_name,
              a.description AS a_description, a.specialties AS a_specialties,
              a.verified AS a_verified, a.rating AS a_rating,
              a.completed_projects AS a_completed_projects,
              a.total_reviews AS a_total_reviews
       FROM quotes q
       JOIN agencies a ON a.id = q.agency_id
       WHERE q.project_id = ?1
       ORDER BY q.created_at ASC`,
    )
    .bind(projectId)
  const rows = await allRows<QuoteRow>(stmt)
  return rows.map(mapQuoteWithAgency)
}
