import { useEffect, useMemo, useState } from 'react'
import type { MarketProject, ProjectStage, ApplicationFunnel, AdvertiserFunnel } from '@my-saas/com'
import {
  Briefcase,
  Inbox,
  Clock,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Star,
  Bell,
} from 'lucide-react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { useMyProjects } from '../hooks/useMyWork'
import { useAgencyMypage, type ApplicationWithProject } from '../hooks/useAgencyMypage'
import { useAdvertiserFunnel } from '../hooks/useAdvertiserFunnel'
import { useNotifications } from '../hooks/useNotifications'
import { useToast } from '../../../com/ui/Toast'
import { Skeleton, SkeletonStack } from '../../../com/ui/Skeleton'
import { ReviewModal } from './ReviewModal'
import '../../../landing-page.css'

type FunnelStep = { key: 'applying' | 'contracting' | 'executing' | 'completed'; label: string; hint: string }
const AGENCY_FUNNEL: FunnelStep[] = [
  { key: 'applying',    label: '지원중',     hint: '광고주가 지원자를 검토 중입니다.' },
  { key: 'contracting', label: '계약 진행중', hint: '선정되어 계약과 견적서를 논의 중입니다.' },
  { key: 'executing',   label: '광고 집행중', hint: '계약 체결 후 캠페인이 진행 중입니다.' },
  { key: 'completed',   label: '완료',       hint: '정산 후 종료된 프로젝트입니다.' },
]

type AdvStep = { key: ProjectStage; label: string; hint: string }
const ADV_STEPS: AdvStep[] = [
  { key: 'recruiting',  label: '모집중',     hint: '대행사의 지원을 기다리고 있습니다.' },
  { key: 'contracting', label: '계약 진행중', hint: '선정된 파트너와 계약·견적서를 논의 중입니다.' },
  { key: 'executing',   label: '광고 집행중', hint: '계약 체결 후 캠페인이 진행 중입니다.' },
  { key: 'completed',   label: '완료',       hint: '정산 후 종료된 프로젝트입니다.' },
]

export function DashboardPage() {
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login'
  }, [loading, user])

  if (loading || !user) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-mypage-main"><div className="oc-container"><div className="oc-detail-skeleton">인증 확인 중…</div></div></main>
        <LPFooter />
      </div>
    )
  }

  const greetingRole = user.userType === 'agency' ? '마케팅 파트너' : '광고주'

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-mypage-main">
        <div className="oc-container oc-mypage-grid">
          <aside className="oc-mypage-side">
            <div className="oc-profile-card">
              <div className="oc-profile-avatar" aria-hidden>{user.name.charAt(0)}</div>
              <div>
                <div className="oc-profile-name">{user.name}님</div>
                <span className={`oc-profile-badge oc-profile-${user.userType}`}>{greetingRole}</span>
              </div>
            </div>

            <nav className="oc-mypage-menu" aria-label="마이페이지 메뉴">
              <a className="is-active" href="/dashboard">프로젝트</a>
              <a href="/pages/contact">문의·신고</a>
              <a href="/pages/business-info">사업자 정보</a>
              <button type="button" onClick={() => { void logout().then(() => { window.location.href = '/' }) }}>로그아웃</button>
            </nav>
          </aside>

          <div className="oc-mypage-content">
            {user.userType === 'agency' ? <AgencyView name={user.name} /> : <AdvertiserView name={user.name} />}
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}

/* =============================================================
   광고주 View
============================================================= */

function AdvertiserView({ name }: { name: string }) {
  const { projects, loading } = useMyProjects(true)
  const { funnel } = useAdvertiserFunnel(true)
  const noti = useNotifications(true)
  const toast = useToast()
  const [step, setStep] = useState<ProjectStage>('recruiting')
  const [query, setQuery] = useState('')
  const [reviewTarget, setReviewTarget] = useState<MarketProject | null>(null)

  const kpis = useMemo(() => computeAdvertiserKpis(projects, funnel), [projects, funnel])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesStep = mapStatusToStage(p.status) === step
      const matchesQuery = !query || p.title.toLowerCase().includes(query.toLowerCase())
      return matchesStep && matchesQuery
    })
  }, [projects, step, query])

  return (
    <>
      <header className="oc-dash-greet">
        <h1>안녕하세요 <strong>{name}</strong>님</h1>
        <p>오늘 도착한 견적 <strong>{kpis.todayQuotes}건</strong>, 진행 중 프로젝트 <strong>{kpis.active}건</strong>입니다.</p>
      </header>

      <section className="oc-kpi-grid" aria-label="요약 지표">
        <KpiCard icon={Briefcase} label="진행중 프로젝트" value={kpis.active} sub={`총 등록 ${projects.length}건`} accent="navy" />
        <KpiCard icon={Inbox} label="도착한 견적" value={kpis.totalQuotes} sub={`평균 ${kpis.avgQuotesPerProject}건 / 프로젝트`} accent="royal" />
        <KpiCard icon={Clock} label="검토 대기" value={kpis.pendingReview} sub="지원자 중 검토 필요" accent="amber" />
        <KpiCard icon={Wallet} label="예상 절감액" value={`₩${kpis.savingsEstimateM.toLocaleString('ko-KR')}M`} sub="직접 계약 대비 15%" accent="mint" />
      </section>

      <section className="oc-funnel-viz" aria-label="프로젝트 단계 분포">
        <FunnelViz
          steps={ADV_STEPS.map((s) => ({ key: s.key, label: s.label, count: (funnel as AdvertiserFunnel)[s.key] ?? 0 }))}
          active={step}
          onStep={(k) => setStep(k as ProjectStage)}
        />
      </section>

      <section className="oc-dash-row">
        <div className="oc-dash-main-col">
          <div className="oc-mypage-filters">
            <div className="oc-search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="search" placeholder="프로젝트명 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <a href="/project/create" className="oc-btn oc-btn-primary oc-btn-sm">+ 새 프로젝트 등록</a>
          </div>

          {loading && <DashboardListSkeleton />}
          {!loading && filtered.length === 0 && (
            <div className="oc-grid-empty">이 단계에 해당하는 프로젝트가 없습니다.</div>
          )}

          <div className="oc-mypage-list">
            {filtered.map((p) => (
              <AdvertiserProjectRow key={p.id} project={p} step={step}
                onReview={() => setReviewTarget(p)} />
            ))}
          </div>
        </div>

        <aside className="oc-dash-side-col" aria-label="최근 활동">
          <h3 className="oc-dash-side-title"><Bell size={15} strokeWidth={2} aria-hidden /> 최근 활동</h3>
          <ActivityTimeline items={noti.items} loading={noti.loading} />
        </aside>
      </section>

      {reviewTarget && (
        <ReviewModal
          projectId={reviewTarget.id}
          projectTitle={reviewTarget.title}
          agencies={[]}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => toast.success('리뷰가 등록되었습니다. 파트너에게 전달됐어요.')}
        />
      )}
    </>
  )
}

function mapStatusToStage(status: string): ProjectStage {
  if (status === 'recruiting' || status === 'closing') return 'recruiting'
  if (status === 'in_progress') return 'executing'
  if (status === 'completed') return 'completed'
  return 'recruiting'
}

function computeAdvertiserKpis(projects: MarketProject[], funnel: AdvertiserFunnel) {
  const active = (funnel.recruiting ?? 0) + (funnel.contracting ?? 0) + (funnel.executing ?? 0)
  const totalQuotes = projects.reduce((acc, p) => acc + (p.applicantCount ?? 0), 0)
  const avgQuotesPerProject = projects.length ? Math.round((totalQuotes / projects.length) * 10) / 10 : 0
  const recent = projects.filter((p) => Date.now() - new Date(p.createdAt).getTime() < 1000 * 60 * 60 * 24)
  const todayQuotes = recent.reduce((acc, p) => acc + (p.applicantCount ?? 0), 0)
  const pendingReview = funnel.contracting ?? 0
  const totalBudgetM = projects.reduce((acc, p) => acc + (p.budgetMin ?? 0), 0)
  const savingsEstimateM = Math.round(totalBudgetM * 0.15)
  return { active, totalQuotes, avgQuotesPerProject, todayQuotes, pendingReview, savingsEstimateM }
}

function AdvertiserProjectRow({ project, step, onReview }: {
  project: MarketProject
  step: ProjectStage
  onReview: () => void
}) {
  const stagePill = (() => {
    if (step === 'recruiting') return { label: '모집중', cls: 'oc-pill-mint' }
    if (step === 'contracting') return { label: '계약진행중', cls: 'oc-pill-blue' }
    if (step === 'executing') return { label: '집행중', cls: 'oc-pill-amber' }
    return { label: '완료', cls: 'oc-pill-gray' }
  })()

  return (
    <article className="oc-mypage-card oc-mypage-card-v2">
      <div className="oc-mypage-card-head">
        <span className="oc-mypage-id">#{(100000 + project.id).toString()}</span>
        <span className={`oc-pill ${stagePill.cls}`}>{stagePill.label}</span>
      </div>
      <h3 className="oc-mypage-card-title">{project.title}</h3>
      <div className="oc-mypage-card-meta">
        <span><Wallet size={13} strokeWidth={2} aria-hidden /> 월 {formatBudget(project)}</span>
        <span><Inbox size={13} strokeWidth={2} aria-hidden /> 지원자 {project.applicantCount}명</span>
      </div>
      <div className="oc-project-tags">
        {project.hashtags.slice(0, 3).map((t) => <span key={t} className="oc-tag-link">{t}</span>)}
      </div>
      <div className="oc-mypage-card-actions">
        <a href={`/project/${project.id}`} className="oc-btn oc-btn-outline oc-btn-sm">프로젝트 보기</a>
        <a href={`/project/${project.id}/applicants`} className="oc-btn oc-btn-outline oc-btn-sm">지원자 관리</a>
        {step === 'completed' && (
          <button type="button" className="oc-btn oc-btn-primary oc-btn-sm" onClick={onReview}>리뷰 작성</button>
        )}
      </div>
    </article>
  )
}

/* =============================================================
   대행사 View
============================================================= */

function AgencyView({ name }: { name: string }) {
  const { applications, funnel, loading, error } = useAgencyMypage(true)
  const noti = useNotifications(true)
  const [activeStep, setActiveStep] = useState<FunnelStep['key']>('applying')
  const [query, setQuery] = useState('')
  const [onlyOngoing, setOnlyOngoing] = useState(true)

  const kpis = useMemo(() => computeAgencyKpis(applications, funnel), [applications, funnel])

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchesStep = matchStep(a, activeStep)
      const matchesQuery = !query || a.project.title.toLowerCase().includes(query.toLowerCase())
      const matchesOngoing = !onlyOngoing || a.project.status !== 'completed'
      return matchesStep && matchesQuery && matchesOngoing
    })
  }, [applications, activeStep, query, onlyOngoing])

  return (
    <>
      <header className="oc-dash-greet">
        <h1>안녕하세요 <strong>{name}</strong> 파트너님</h1>
        <p>
          이번 주 새로 지원한 프로젝트 <strong>{kpis.thisWeekApplications}건</strong>,
          집행 중 캠페인 <strong>{kpis.executing}건</strong>입니다.
        </p>
      </header>

      <section className="oc-kpi-grid" aria-label="파트너 실적 지표">
        <KpiCard icon={TrendingUp} label="지원 선정률" value={`${kpis.selectionRate}%`} sub={`선정 ${kpis.selected} / 총 ${kpis.total}`} accent="navy" />
        <KpiCard icon={CheckCircle2} label="완료 프로젝트" value={kpis.completed} sub="누적 달성" accent="royal" />
        <KpiCard icon={Star} label="평균 평점" value={kpis.avgRating.toFixed(1)} sub="최근 리뷰 기준" accent="amber" />
        <KpiCard icon={Wallet} label="이번달 예상" value={`₩${kpis.monthlyEstimateM.toLocaleString('ko-KR')}M`} sub="집행 프로젝트 기반" accent="mint" />
      </section>

      <section className="oc-funnel-viz" aria-label="지원 단계 분포">
        <FunnelViz
          steps={AGENCY_FUNNEL.map((s) => ({ key: s.key, label: s.label, count: (funnel as ApplicationFunnel)[s.key] ?? 0 }))}
          active={activeStep}
          onStep={(k) => setActiveStep(k as FunnelStep['key'])}
        />
      </section>

      <section className="oc-dash-row">
        <div className="oc-dash-main-col">
          <div className="oc-mypage-filters">
            <div className="oc-search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="search" placeholder="프로젝트명 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <label className="oc-checkbox">
              <input type="checkbox" checked={onlyOngoing} onChange={(e) => setOnlyOngoing(e.target.checked)} />
              <span>진행중만 보기</span>
            </label>
          </div>

          {loading && <DashboardListSkeleton />}
          {error && <div className="oc-grid-empty" role="alert">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="oc-grid-empty">이 단계에 해당하는 프로젝트가 없습니다.</div>
          )}

          <div className="oc-mypage-list">
            {filtered.map((a) => <AgencyProjectRow key={a.id} application={a} step={activeStep} />)}
          </div>
        </div>

        <aside className="oc-dash-side-col" aria-label="최근 활동">
          <h3 className="oc-dash-side-title"><Bell size={15} strokeWidth={2} aria-hidden /> 최근 활동</h3>
          <ActivityTimeline items={noti.items} loading={noti.loading} />
        </aside>
      </section>
    </>
  )
}

function matchStep(a: ApplicationWithProject, step: FunnelStep['key']): boolean {
  if (step === 'applying') return a.status === 'pending'
  if (step === 'contracting') return a.status === 'selected' && a.project.status === 'recruiting'
  if (step === 'executing')   return a.status === 'selected' && a.project.status === 'in_progress'
  if (step === 'completed')   return a.status === 'selected' && a.project.status === 'completed'
  return false
}

function computeAgencyKpis(apps: ApplicationWithProject[], funnel: ApplicationFunnel) {
  const total = apps.length
  const selected = apps.filter((a) => a.status === 'selected').length
  const completed = funnel.completed ?? 0
  const executing = funnel.executing ?? 0
  const selectionRate = total ? Math.round((selected / total) * 100) : 0
  const thisWeekApplications = apps.filter((a) => Date.now() - new Date(a.createdAt).getTime() < 7 * 24 * 3600 * 1000).length
  // 평점은 서버 API 확장 전 임시 — 대행사 메타 없으므로 4.7 기본값 유지
  const avgRating = 4.7
  const executingBudget = apps
    .filter((a) => a.status === 'selected' && a.project.status === 'in_progress')
    .reduce((acc, a) => acc + (a.project.budgetMin ?? 0), 0)
  const monthlyEstimateM = Math.round(executingBudget * 0.1)
  return { total, selected, completed, executing, selectionRate, thisWeekApplications, avgRating, monthlyEstimateM }
}

function AgencyProjectRow({ application, step }: { application: ApplicationWithProject; step: FunnelStep['key'] }) {
  const p = application.project
  const budget = formatBudget(p)

  const statusBadge = (() => {
    if (application.status === 'rejected') return { label: '미선정', cls: 'oc-pill-red' }
    if (step === 'applying') return { label: '지원완료', cls: 'oc-pill-mint' }
    if (step === 'contracting') return { label: '계약진행중', cls: 'oc-pill-blue' }
    if (step === 'executing') return { label: '집행중', cls: 'oc-pill-amber' }
    return { label: '완료', cls: 'oc-pill-gray' }
  })()

  return (
    <article className="oc-mypage-card oc-mypage-card-v2">
      <div className="oc-mypage-card-head">
        <span className="oc-mypage-id">#{(100000 + p.id).toString()}</span>
        <span className={`oc-pill ${statusBadge.cls}`}>{statusBadge.label}</span>
      </div>
      <h3 className="oc-mypage-card-title">{p.title}</h3>
      <div className="oc-mypage-card-meta">
        <span><Wallet size={13} strokeWidth={2} aria-hidden /> 월 {budget}</span>
      </div>
      <div className="oc-project-tags">
        {p.hashtags.slice(0, 3).map((t) => <span key={t} className="oc-tag-link">{t}</span>)}
      </div>
      <div className="oc-mypage-card-actions">
        <a href={`/project/${p.id}`} className="oc-btn oc-btn-outline oc-btn-sm">프로젝트 보기</a>
        <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" disabled={step !== 'contracting'}>견적 제안하기</button>
        <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" disabled={step !== 'executing'}>정산 요청</button>
        {application.status === 'rejected' && <span className="oc-reject-mark">미선정</span>}
      </div>
    </article>
  )
}

/* =============================================================
   공용 UI 파편
============================================================= */

type KpiAccent = 'navy' | 'royal' | 'amber' | 'mint'

function KpiCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>
  label: string
  value: string | number
  sub: string
  accent: KpiAccent
}) {
  return (
    <div className={`oc-kpi-card oc-kpi-${accent}`}>
      <div className="oc-kpi-icon" aria-hidden>
        <Icon size={18} strokeWidth={2} aria-hidden />
      </div>
      <div className="oc-kpi-body">
        <span className="oc-kpi-label">{label}</span>
        <span className="oc-kpi-value">{value}</span>
        <span className="oc-kpi-sub">{sub}</span>
      </div>
    </div>
  )
}

function FunnelViz({ steps, active, onStep }: {
  steps: Array<{ key: string; label: string; count: number }>
  active: string
  onStep: (key: string) => void
}) {
  const total = steps.reduce((acc, s) => acc + s.count, 0) || 1
  return (
    <div className="oc-funnel-bar" role="tablist" aria-label="단계 진행 분포">
      {steps.map((s) => {
        const pct = Math.max(8, Math.round((s.count / total) * 100))
        const isActive = s.key === active
        return (
          <button
            type="button"
            role="tab"
            aria-selected={isActive}
            key={s.key}
            className={`oc-funnel-cell${isActive ? ' is-active' : ''}`}
            onClick={() => onStep(s.key)}
            style={{ flexGrow: pct }}
          >
            <span className="oc-funnel-cell-label">{s.label}</span>
            <span className="oc-funnel-cell-count">{s.count}</span>
            <span className="oc-funnel-cell-fill" style={{ width: `${Math.min(100, (s.count / total) * 100 * 4)}%` }} />
          </button>
        )
      })}
    </div>
  )
}

type NotiItem = ReturnType<typeof useNotifications>['items'][number]

function ActivityTimeline({ items, loading }: { items: NotiItem[]; loading: boolean }) {
  if (loading) return <div className="oc-timeline-empty">불러오는 중…</div>
  if (items.length === 0) {
    return (
      <div className="oc-timeline-empty">
        <span>아직 새 활동이 없어요.</span>
        <span className="oc-timeline-empty-hint">프로젝트가 모집되면 지원·견적·선정 알림이 여기에 쌓입니다.</span>
      </div>
    )
  }
  return (
    <ul className="oc-timeline">
      {items.slice(0, 8).map((n) => (
        <li key={n.id} className={`oc-timeline-item${!n.readAt ? ' is-unread' : ''}`}>
          <span className="oc-timeline-dot" aria-hidden />
          <div className="oc-timeline-body">
            <strong>{n.title}</strong>
            {n.body && <span className="oc-timeline-text">{n.body}</span>}
            <time>{new Date(n.createdAt).toLocaleString('ko-KR')}</time>
          </div>
        </li>
      ))}
    </ul>
  )
}

function DashboardListSkeleton() {
  return (
    <div className="oc-mypage-list" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <article key={i} className="oc-mypage-card oc-mypage-card-v2">
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={60} height={18} radius={6} />
            <Skeleton width={72} height={20} radius={10} />
          </div>
          <Skeleton width="80%" height={22} style={{ marginTop: 6 }} />
          <SkeletonStack rows={1} />
          <div style={{ display: 'flex', gap: 6 }}>
            <Skeleton width={48} height={22} radius={12} />
            <Skeleton width={62} height={22} radius={12} />
            <Skeleton width={44} height={22} radius={12} />
          </div>
        </article>
      ))}
    </div>
  )
}

function formatBudget(p: MarketProject): string {
  const fmt = (n: number) => `${n.toLocaleString('ko-KR')}만원`
  if (p.budgetMax && p.budgetMax !== p.budgetMin) return `${fmt(p.budgetMin)} ~ ${fmt(p.budgetMax)}`
  return p.budgetMax === null ? `${fmt(p.budgetMin)} ~` : fmt(p.budgetMin)
}
