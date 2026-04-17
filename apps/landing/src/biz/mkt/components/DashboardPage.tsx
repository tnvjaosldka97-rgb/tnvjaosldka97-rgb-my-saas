import { useEffect, useMemo, useState } from 'react'
import type { MarketProject, ProjectStage } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { useMyProjects } from '../hooks/useMyWork'
import { useAgencyMypage, type ApplicationWithProject } from '../hooks/useAgencyMypage'
import { useAdvertiserFunnel } from '../hooks/useAdvertiserFunnel'
import { ReviewModal } from './ReviewModal'
import '../../../landing-page.css'

type FunnelStep = { key: 'applying' | 'contracting' | 'executing' | 'completed'; label: string; hint: string }
const FUNNEL: FunnelStep[] = [
  { key: 'applying', label: '프로젝트 지원중', hint: '광고주가 지원자를 검토 중입니다.' },
  { key: 'contracting', label: '계약 진행중', hint: '선정되어 계약과 견적서를 논의 중입니다.' },
  { key: 'executing', label: '광고 집행중', hint: '계약 체결 후 캠페인이 진행 중입니다.' },
  { key: 'completed', label: '완료', hint: '정산 후 종료된 프로젝트입니다.' },
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
                <span className={`oc-profile-badge oc-profile-${user.userType}`}>
                  {user.userType === 'agency' ? '마케팅 파트너' : '광고주'}
                </span>
              </div>
              <button type="button" className="oc-profile-edit" aria-label="프로필 편집">✎</button>
            </div>

            <nav className="oc-mypage-menu" aria-label="마이페이지 메뉴">
              <a className="is-active" href="/dashboard">📁 프로젝트</a>
              <a href="#conversations">💬 대화 내용</a>
              <a href="#settlements">💰 정산 안내</a>
              <button type="button" onClick={() => { void logout().then(() => { window.location.href = '/' }) }}>⇦ 로그아웃</button>
            </nav>
          </aside>

          <div className="oc-mypage-content">
            {user.userType === 'agency' ? <AgencyView /> : <AdvertiserView />}
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}

function AgencyView() {
  const { applications, funnel, loading, error } = useAgencyMypage(true)
  const [activeStep, setActiveStep] = useState<FunnelStep['key']>('applying')
  const [query, setQuery] = useState('')
  const [onlyOngoing, setOnlyOngoing] = useState(true)

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
      <h1 className="oc-mypage-title">프로젝트 현황</h1>

      <div className="oc-funnel" role="tablist" aria-label="프로젝트 단계">
        {FUNNEL.map((step, i) => {
          const count = funnel[step.key]
          const active = step.key === activeStep
          return (
            <button key={step.key} type="button" role="tab" aria-selected={active}
              onClick={() => setActiveStep(step.key)}
              className={`oc-funnel-step${active ? ' is-active' : ''}`}>
              <div className="oc-funnel-label">
                {step.label}
                <span className="oc-funnel-info" title={step.hint} aria-label={step.hint}>?</span>
              </div>
              <div className="oc-funnel-count">{count}건</div>
              {i < FUNNEL.length - 1 && <span className="oc-funnel-arrow" aria-hidden>›</span>}
            </button>
          )
        })}
      </div>

      <div className="oc-mypage-filters">
        <div className="oc-search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="search" placeholder="프로젝트명 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="oc-checkbox">
          <input type="checkbox" checked={onlyOngoing} onChange={(e) => setOnlyOngoing(e.target.checked)} />
          <span>진행중 프로젝트만 보기</span>
        </label>
      </div>

      {loading && <div className="oc-grid-empty">불러오는 중…</div>}
      {error && <div className="oc-grid-empty" role="alert">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="oc-grid-empty">이 단계에 해당하는 프로젝트가 없습니다.</div>
      )}

      <div className="oc-mypage-list">
        {filtered.map((a) => <AgencyProjectRow key={a.id} application={a} step={activeStep} />)}
      </div>
    </>
  )
}

function matchStep(a: ApplicationWithProject, step: FunnelStep['key']): boolean {
  if (step === 'applying') return a.status === 'pending'
  if (step === 'contracting') return a.status === 'selected' && a.project.status === 'recruiting'
  if (step === 'executing') return a.status === 'selected' && a.project.status === 'in_progress'
  if (step === 'completed') return a.status === 'selected' && a.project.status === 'completed'
  return false
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
    <article className="oc-mypage-card">
      <div className="oc-mypage-card-body">
        <span className="oc-mypage-id">#{(100000 + p.id).toString()}</span>
        <span className={`oc-pill ${statusBadge.cls}`}>{statusBadge.label}</span>
        <h3>
          <span className="oc-mypage-card-icon" aria-hidden>▤</span> {p.title}
        </h3>
        <div className="oc-mypage-meta">
          <span aria-hidden>💰</span> 월 예산: {budget}
        </div>
        <div className="oc-project-tags">
          {p.hashtags.slice(0, 3).map((t) => <span key={t} className="oc-tag-link">{t}</span>)}
        </div>
      </div>
      <div className="oc-mypage-card-actions">
        <a href={`/project/${p.id}`} className="oc-btn oc-btn-outline oc-btn-sm">프로젝트 보기</a>
        <button type="button" className="oc-btn oc-btn-outline oc-btn-sm"
          disabled={step !== 'contracting'}>제안하기</button>
        <button type="button" className="oc-btn oc-btn-outline oc-btn-sm"
          disabled={step !== 'executing'}>광고완료 및 정산요청</button>
        {application.status === 'rejected' && <span className="oc-reject-mark">미선정</span>}
      </div>
    </article>
  )
}

type AdvStep = { key: ProjectStage; label: string; hint: string }
const ADV_STEPS: AdvStep[] = [
  { key: 'recruiting', label: '모집중', hint: '대행사의 지원을 기다리고 있습니다.' },
  { key: 'contracting', label: '계약 진행중', hint: '선정된 파트너와 계약·견적서를 논의 중입니다.' },
  { key: 'executing', label: '광고 집행중', hint: '계약 체결 후 캠페인이 진행 중입니다.' },
  { key: 'completed', label: '완료', hint: '정산 후 종료된 프로젝트입니다.' },
]

function mapStatusToStage(status: string): ProjectStage {
  if (status === 'recruiting' || status === 'closing') return 'recruiting'
  if (status === 'in_progress') return 'executing'
  if (status === 'completed') return 'completed'
  return 'recruiting'
}

function AdvertiserView() {
  const { projects, loading } = useMyProjects(true)
  const { funnel } = useAdvertiserFunnel(true)
  const [step, setStep] = useState<ProjectStage>('recruiting')
  const [query, setQuery] = useState('')
  const [reviewTarget, setReviewTarget] = useState<MarketProject | null>(null)

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesStep = mapStatusToStage(p.status) === step
      const matchesQuery = !query || p.title.toLowerCase().includes(query.toLowerCase())
      return matchesStep && matchesQuery
    })
  }, [projects, step, query])

  return (
    <>
      <h1 className="oc-mypage-title">프로젝트 현황</h1>

      <div className="oc-funnel" role="tablist" aria-label="프로젝트 단계">
        {ADV_STEPS.map((s, i) => {
          const active = s.key === step
          const count = funnel[s.key]
          return (
            <button key={s.key} type="button" role="tab" aria-selected={active}
              onClick={() => setStep(s.key)}
              className={`oc-funnel-step${active ? ' is-active' : ''}`}>
              <div className="oc-funnel-label">
                {s.label}
                <span className="oc-funnel-info" title={s.hint}>?</span>
              </div>
              <div className="oc-funnel-count">{count}건</div>
              {i < ADV_STEPS.length - 1 && <span className="oc-funnel-arrow" aria-hidden>›</span>}
            </button>
          )
        })}
      </div>

      <div className="oc-mypage-filters">
        <div className="oc-search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="search" placeholder="프로젝트명 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <a href="/project/create" className="oc-btn oc-btn-primary oc-btn-sm">+ 새 프로젝트 등록</a>
      </div>

      {loading && <div className="oc-grid-empty">불러오는 중…</div>}
      {!loading && filtered.length === 0 && (
        <div className="oc-grid-empty">이 단계에 해당하는 프로젝트가 없습니다.</div>
      )}

      <div className="oc-mypage-list">
        {filtered.map((p) => (
          <AdvertiserProjectRow key={p.id} project={p} step={step}
            onReview={() => setReviewTarget(p)} />
        ))}
      </div>

      {reviewTarget && (
        <ReviewModal
          projectId={reviewTarget.id}
          projectTitle={reviewTarget.title}
          agencies={[]}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => { /* TODO: toast */ }}
        />
      )}
    </>
  )
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
    <article className="oc-mypage-card">
      <div className="oc-mypage-card-body">
        <span className="oc-mypage-id">#{(100000 + project.id).toString()}</span>
        <span className={`oc-pill ${stagePill.cls}`}>{stagePill.label}</span>
        <h3>
          <span className="oc-mypage-card-icon" aria-hidden>▤</span> {project.title}
        </h3>
        <div className="oc-mypage-meta">
          <span aria-hidden>💰</span> 월 예산: {formatBudget(project)} · 지원자 {project.applicantCount}
        </div>
        <div className="oc-project-tags">
          {project.hashtags.slice(0, 3).map((t) => <span key={t} className="oc-tag-link">{t}</span>)}
        </div>
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

function formatBudget(p: MarketProject): string {
  const fmt = (n: number) => `${n.toLocaleString('ko-KR')}만원`
  if (p.budgetMax && p.budgetMax !== p.budgetMin) return `${fmt(p.budgetMin)} ~ ${fmt(p.budgetMax)}`
  return p.budgetMax === null ? `${fmt(p.budgetMin)} ~` : fmt(p.budgetMin)
}

