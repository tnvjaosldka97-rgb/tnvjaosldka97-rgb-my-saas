export type SiteSettings = {
  id: number
  brand: string
  heroLabel: string
  heroTitle: string
  heroSubtitle: string
  ctaPrimary: string
  ctaSecondary: string
  updatedAt: string
}

export type LeadSubmissionInput = {
  name: string
  email: string
  company?: string
  message?: string
}

export type LeadRecord = {
  id: number
  name: string
  email: string
  company: string | null
  message: string | null
  status: string
  assignedTo: string | null
  source: string | null
  createdAt: string
}

export type AgencyCaseStudy = {
  title: string
  industry: string
  result: string
}

export type PublicAgencyDetail = {
  id: number
  slug: string
  name: string
  description: string
  specialties: string[]
  verified: boolean
  rating: number
  completedProjects: number
  totalReviews: number
  foundedYear: number | null
  region: string | null
  teamSize: string | null
  avgResponseHour: number | null
  portfolioNote: string | null
  caseStudies: AgencyCaseStudy[]
  createdAt: string
}

export type ProjectDraftInput = {
  requesterName: string
  requesterContact: string
  industry: string
  marketingType: string
  budgetRange: string
  message?: string
}

export type ProjectDraftStatus = 'pending' | 'approved' | 'rejected'

export type ProjectDraft = {
  id: number
  requesterName: string
  requesterContact: string
  industry: string
  marketingType: string
  budgetRange: string
  message: string
  status: ProjectDraftStatus
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  approvedProjectId: number | null
  rejectReason: string | null
}

export type PublicAgencyReview = {
  id: number
  projectId: number
  projectTitle: string
  rating: number
  comment: string
  createdAt: string
}

export type PublicAgencyResponse = {
  agency: PublicAgencyDetail
  reviews: PublicAgencyReview[]
}

export type MarketSummary = {
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
}

export type PublicMetrics = {
  totalLeads: number
  totalMedia: number
  market: MarketSummary | null
  updatedAt: string
}

export type PublicBootstrap = {
  settings: SiteSettings
  metrics: PublicMetrics
}

export type MediaAsset = {
  id: number
  imageId: string
  title: string
  alt: string | null
  status: string
  deliveryUrl: string | null
  previewUrl: string | null
  uploadedAt: string
}

export type DashboardData = {
  stats: {
    totalLeads: number
    totalMedia: number
    latestLeadAt: string | null
    latestSettingUpdateAt: string | null
  }
  recentLeads: LeadRecord[]
  media: MediaAsset[]
  aiConfigured: boolean
}

export type AiCopySuggestionRequest = {
  objective: string
  audience: string
  tone: string
}

export type AiCopySuggestion = {
  heroTitle: string
  heroSubtitle: string
  ctaPrimary: string
  rationale: string
}

export type DirectUploadPayload = {
  imageId: string
  uploadURL: string
}

// --- Lead CRM Enhancement ---

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export type LeadTag = {
  id: number
  leadId: number
  tag: string
  createdAt: string
}

export type LeadNote = {
  id: number
  leadId: number
  content: string
  createdBy: string
  createdAt: string
}

export type LeadDetail = LeadRecord & {
  tags: LeadTag[]
  notes: LeadNote[]
}

// --- Email System ---

export type EmailTemplate = {
  id: number
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  createdAt: string
  updatedAt: string
}

export type EmailTemplateInput = {
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
}

export type EmailLog = {
  id: number
  leadId: number
  templateId: number | null
  subject: string
  status: string
  sentAt: string
  leadName?: string
  leadEmail?: string
}

export type SendEmailRequest = {
  leadId: number
  templateId?: number
  subject?: string
  bodyHtml?: string
  bodyText?: string
}

// --- Content CMS ---

export type PageStatus = 'draft' | 'published' | 'archived'

export type Page = {
  id: number
  slug: string
  title: string
  contentMd: string
  contentHtml: string
  status: PageStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PageInput = {
  slug: string
  title: string
  contentMd: string
}

export type PageSummary = {
  id: number
  slug: string
  title: string
  status: PageStatus
  publishedAt: string | null
  updatedAt: string
}

// --- Admin System ---

export type AdminUserRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

export type AdminUser = {
  id: number
  email: string
  name: string
  role: AdminUserRole
  avatarUrl: string | null
  githubLogin: string | null
  lastLoginAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminUserInput = {
  email: string
  name: string
  role: AdminUserRole
}

export type AccessLog = {
  id: number
  userEmail: string
  action: string
  path: string
  method: string
  statusCode: number | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export type ApiLog = {
  id: number
  method: string
  path: string
  statusCode: number
  durationMs: number | null
  requestBody: string | null
  responseSize: number | null
  ipAddress: string | null
  createdAt: string
}

export type SystemStats = {
  totalUsers: number
  activeUsers: number
  totalLeads: number
  totalMedia: number
  totalPages: number
  totalEmails: number
  totalApiRequests: number
  recentAccessLogs: AccessLog[]
  recentApiLogs: ApiLog[]
}

export type ProjectStatus = 'recruiting' | 'closing' | 'in_progress' | 'completed'
export type BudgetType = 'monthly' | 'range' | 'fixed'
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

export type MarketProject = {
  id: number
  slug: string
  industry: string
  industryColor: string
  title: string
  marketingTypes: string[]
  hashtags: string[]
  budgetMin: number
  budgetMax: number | null
  budgetType: BudgetType
  status: ProjectStatus
  applicantCount: number
  verifiedOnly: boolean
  daysLeft: number
  closesAt: string | null
  createdAt: string
}

export type MarketProjectDetail = MarketProject & {
  description: string
  advertiserName: string | null
  timeline: string | null
  updatedAt: string
  /** 업종별 대표 메뉴·시술·상품 리스트 (예: 외식=메뉴명, 병원=시술명, 커머스=상품명) */
  menuItems: string[]
}

export type MarketAgency = {
  id: number
  slug: string
  name: string
  description: string
  specialties: string[]
  verified: boolean
  rating: number
  completedProjects: number
  totalReviews: number
}

export type MarketQuote = {
  id: number
  projectId: number
  agencyId: number
  priceMin: number
  priceMax: number | null
  timelineMonths: number
  description: string
  strength: string | null
  status: QuoteStatus
  createdAt: string
  agency: MarketAgency
}

export type ProjectDetailResponse = {
  project: MarketProjectDetail
  quotes: MarketQuote[]
}

export type ProjectListQuery = {
  status?: ProjectStatus | 'all'
  sort?: 'latest' | 'closing' | 'budget' | 'applicants'
}

export type ConsultationRequestInput = {
  projectId: number
  agencyId?: number | null
  requesterName: string
  requesterContact: string
  message: string
  preferredTime?: 'any' | 'morning' | 'afternoon' | 'evening'
}

export type MarketUserType = 'advertiser' | 'agency'

export type MarketUser = {
  id: number
  email: string
  name: string
  userType: MarketUserType
  phone: string | null
  createdAt: string
}

export type MarketAuthResponse = {
  user: MarketUser
}

export type MarketRegisterInput = {
  email: string
  password: string
  name: string
  userType: MarketUserType
  phone?: string
}

export type MarketLoginInput = {
  email: string
  password: string
}

export type CreateProjectInput = {
  industry: string
  industryColor?: string
  title: string
  description: string
  marketingTypes: string[]
  hashtags?: string[]
  budgetMin: number
  budgetMax?: number | null
  budgetType: BudgetType
  timeline?: string
  daysLeft?: number
  advertiserName?: string
}

export type CreateQuoteInput = {
  priceMin: number
  priceMax?: number | null
  timelineMonths: number
  description: string
  strength?: string
}

export type DashboardSummary = {
  user: MarketUser
  projects: MarketProject[]
  quotes: MarketQuote[]
}

export type ProjectStage = 'recruiting' | 'contracting' | 'executing' | 'completed'
export type ApplicationStatus = 'pending' | 'selected' | 'rejected'

export type ProjectApplication = {
  id: number
  projectId: number
  agencyUserId: number
  message: string
  status: ApplicationStatus
  createdAt: string
  project?: MarketProject
}

export type ApplicationInput = {
  message?: string
}

export type ApplicationFunnel = {
  applying: number
  contracting: number
  executing: number
  completed: number
}

export type AgencyMypageData = {
  funnel: ApplicationFunnel
  applications: ProjectApplication[]
}

export type OAuthProvider = 'kakao' | 'naver'

export type NotificationKind =
  | 'application_received'
  | 'application_selected'
  | 'application_rejected'
  | 'project_stage_changed'
  | 'review_received'

export type MarketNotification = {
  id: number
  userId: number
  kind: NotificationKind
  projectId: number | null
  applicationId: number | null
  title: string
  body: string
  link: string | null
  readAt: string | null
  createdAt: string
}

export type ApplicantDetail = ProjectApplication & {
  userName: string
  userEmail: string
}

export type ApplicationActionInput = {
  action: 'select' | 'reject'
}

export type ProjectReview = {
  id: number
  projectId: number
  agencyUserId: number
  authorUserId: number
  rating: number
  comment: string
  createdAt: string
  authorName?: string
  projectTitle?: string
}

export type ProjectReviewInput = {
  agencyUserId: number
  rating: number
  comment: string
}

export type AdvertiserFunnel = {
  recruiting: number
  contracting: number
  executing: number
  completed: number
}
