import { useEffect, useState } from 'react'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import type { MarketProject, MarketProjectDetail, ProjectApplication, BudgetType } from '@my-saas/com'
import { useProjects } from '../hooks/useProjects'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../../../com/api/client'
import { useToast } from '../../../com/ui/Toast'
import { Skeleton, SkeletonStack } from '../../../com/ui/Skeleton'
import { IndustryArt } from './IndustryArt'
import { ConsultationModal } from './ConsultationModal'
import '../../../landing-page.css'

const STATUS_META: Record<MarketProject['status'], { label: string; cls: string }> = {
  recruiting: { label: '모집중', cls: 'oc-status-active' },
  closing: { label: '마감임박', cls: 'oc-status-closing' },
  in_progress: { label: '진행중', cls: 'oc-status-progress' },
  completed: { label: '완료', cls: 'oc-status-done' },
}

const BUDGET_PREFIX: Record<BudgetType, string> = {
  monthly: '월 ',
  range: '',
  fixed: '',
}

function formatBudget(p: MarketProjectDetail): string {
  const fmt = (n: number) => `${n.toLocaleString('ko-KR')}만원`
  if (p.budgetMax && p.budgetMax !== p.budgetMin) return `${fmt(p.budgetMin)} ~ ${fmt(p.budgetMax)}`
  return p.budgetMax === null ? `${fmt(p.budgetMin)} ~` : fmt(p.budgetMin)
}

export function ProjectDetailPage({ id }: { id: number }) {
  const { data, loading, error } = useProjectDetail(id)

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-detail-main">
        <div className="oc-container">
          <a href="/" className="oc-back-link"><ArrowLeft size={14} strokeWidth={2} aria-hidden /> 목록으로 돌아가기</a>

          {loading && <ProjectDetailSkeleton />}

          {error && (
            <div className="oc-detail-error" role="alert">
              <strong>불러오지 못했어요.</strong>
              <p>{error}</p>
              <a href="/" className="oc-btn oc-btn-text">홈으로 돌아가기</a>
            </div>
          )}

          {data && <ProjectDetailLayout project={data.project} />}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}

function ProjectDetailSkeleton() {
  return (
    <div className="oc-detail-grid" aria-hidden>
      <div className="oc-detail-col-main">
        <article className="oc-detail-card">
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <Skeleton width={68} height={22} radius={10} />
            <Skeleton width={44} height={22} radius={10} />
            <Skeleton width={80} height={22} radius={10} />
          </div>
          <Skeleton variant="card" height={200} style={{ marginBottom: 24 }} />
          <Skeleton width="70%" height={26} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 20 }}>
                <Skeleton width={80} height={16} />
                <Skeleton width="60%" height={16} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #E5E5E5' }}>
            <Skeleton width={120} height={18} style={{ marginBottom: 12 }} />
            <SkeletonStack rows={4} />
          </div>
        </article>
      </div>
      <aside className="oc-detail-col-side">
        <div className="oc-cta-card">
          <Skeleton width="70%" height={20} />
          <Skeleton width="90%" height={14} style={{ marginTop: 10 }} />
          <Skeleton width="100%" height={46} radius={8} style={{ marginTop: 18 }} />
          <Skeleton width="100%" height={40} radius={8} style={{ marginTop: 8 }} />
        </div>
      </aside>
    </div>
  )
}

function ProjectDetailLayout({ project }: { project: MarketProjectDetail }) {
  const { user } = useAuth()
  const toast = useToast()
  const statusMeta = STATUS_META[project.status]
  const [myApplication, setMyApplication] = useState<ProjectApplication | null>(null)
  const [loadingApp, setLoadingApp] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [consultOpen, setConsultOpen] = useState(false)

  useEffect(() => {
    if (!user || user.userType !== 'agency') return
    setLoadingApp(true)
    apiFetch<{ application: ProjectApplication | null }>(`/api/market/projects/${project.id}/my-application`, {
      credentials: 'include',
    })
      .then((r) => setMyApplication(r.application))
      .catch(() => setMyApplication(null))
      .finally(() => setLoadingApp(false))
  }, [user, project.id])

  async function apply() {
    if (!user) { window.location.href = '/login'; return }
    setApplying(true)
    setApplyError(null)
    try {
      const res = await apiFetch<{ application: ProjectApplication }>(
        `/api/market/projects/${project.id}/apply`,
        { method: 'POST', credentials: 'include', body: JSON.stringify({}) },
      )
      setMyApplication(res.application)
      toast.success('지원이 완료되었습니다. 광고주 확인을 기다려주세요.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '지원에 실패했습니다.'
      setApplyError(msg)
      toast.error(msg)
    } finally {
      setApplying(false)
    }
  }

  const isOwner = user && project.advertiserName && user.name === project.advertiserName
  const canApply = user?.userType === 'agency' && !isOwner && project.status === 'recruiting'

  return (
    <div className="oc-detail-grid">
      <div className="oc-detail-col-main">
        <article className="oc-detail-card">
          <header className="oc-detail-card-head">
            <h1>마케팅 의뢰 상세정보</h1>
            <div className="oc-detail-head-badges">
              <span className={`oc-status-badge ${statusMeta.cls}`}>{statusMeta.label}</span>
              {project.status === 'recruiting' && project.daysLeft > 0 && (
                <span className="oc-dday">D-{project.daysLeft}</span>
              )}
              <span className="oc-applicants-chip">지원자 {project.applicantCount}</span>
            </div>
          </header>

          <div className="oc-detail-cover">
            <IndustryArt industry={project.industry} color={project.industryColor} title={project.title} className="oc-detail-cover-art" />
          </div>

          <h2 className="oc-detail-title">{project.title}</h2>

          <dl className="oc-detail-table">
            <div className="oc-detail-row">
              <dt>업종</dt>
              <dd><span className="oc-industry-tag" style={{ color: project.industryColor, borderColor: project.industryColor }}>{project.industry}</span></dd>
            </div>
            <div className="oc-detail-row">
              <dt>총 예산</dt>
              <dd className="oc-detail-budget">
                {BUDGET_PREFIX[project.budgetType]}{formatBudget(project)}
              </dd>
            </div>
            {project.timeline && (
              <div className="oc-detail-row">
                <dt>운영 기간</dt>
                <dd>{project.timeline}</dd>
              </div>
            )}
            {project.marketingTypes.length > 0 && (
              <div className="oc-detail-row">
                <dt>마케팅 유형</dt>
                <dd>
                  <div className="oc-chip-row">
                    {project.marketingTypes.map((m) => <span key={m} className="oc-type-chip">{m}</span>)}
                  </div>
                </dd>
              </div>
            )}
            {project.hashtags.length > 0 && (
              <div className="oc-detail-row">
                <dt>해시태그</dt>
                <dd>
                  <div className="oc-chip-row">
                    {project.hashtags.map((t) => <span key={t} className="oc-tag-link">{t}</span>)}
                  </div>
                </dd>
              </div>
            )}
            <div className="oc-detail-row">
              <dt>광고주 연락처</dt>
              <dd>
                <div className="oc-locked-box">
                  <span className="oc-locked-text" aria-hidden>
                    업체명: ●●●●● ●●●●●<br />
                    담당자: 홍●● 이사<br />
                    연락처: 010-●●●●-●●●●<br />
                    선호하는 연락시간: 오후
                  </span>
                  <span className="oc-lock-overlay" aria-hidden>
                    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>
                <p className="oc-locked-note">정보보호를 위해 선정된 파트너에게만 상세정보를 공개합니다</p>
              </dd>
            </div>
          </dl>

          <hr className="oc-detail-divider" />

          <section className="oc-detail-description">
            <h3>프로젝트 설명</h3>
            <p>{project.description}</p>
          </section>
        </article>

        <article className="oc-detail-card">
          <header className="oc-detail-card-head">
            <h2>지원 현황</h2>
            <span className="oc-applicants-chip">현재 {project.applicantCount}팀 지원중</span>
          </header>
          <div className="oc-bid-notice">
            <strong>오픈 입찰 프로젝트</strong>
            <p>지원한 대행사의 견적서는 비공개입니다. 광고주가 지원자를 검토 후 파트너로 선정하면 계약 진행 단계로 전환됩니다.</p>
          </div>
        </article>
      </div>

      <aside className="oc-detail-col-side">
        <div className="oc-cta-card">
          <h3>{canApply ? '이 프로젝트에 지원하기' : '무료로 시작하기'}</h3>
          <p className="oc-cta-sub">비교할수록 확실해집니다</p>
          <p className="oc-cta-desc">
            {canApply
              ? '지원 후 광고주가 확인하면 계약 진행 단계로 넘어갑니다.'
              : '지금 바로 합리적인 견적을 비교하세요!'}
          </p>

          {isOwner && (
            <div className="oc-cta-note">내가 등록한 프로젝트입니다. <a href="/dashboard">대시보드</a>에서 지원자를 확인하세요.</div>
          )}

          {!user && (
            <a href="/login" className="oc-btn oc-btn-primary-blue oc-btn-block oc-btn-lg">로그인하고 지원하기</a>
          )}

          {user?.userType === 'advertiser' && !isOwner && (
            <a href="/project/create" className="oc-btn oc-btn-primary oc-btn-block oc-btn-lg">내 프로젝트 등록하기</a>
          )}

          {canApply && !loadingApp && !myApplication && (
            <>
              <button type="button" className="oc-btn oc-btn-primary-blue oc-btn-block oc-btn-lg"
                onClick={apply} disabled={applying}>
                {applying ? '지원 중…' : '프로젝트 지원'}
              </button>
              {applyError && <div className="oc-auth-error" role="alert" style={{ marginTop: 10 }}>{applyError}</div>}
            </>
          )}

          {canApply && myApplication && (
            <div className={`oc-apply-status oc-apply-${myApplication.status}`}>
              {myApplication.status === 'pending' && <><span>⏳</span> <strong>지원중</strong><span>광고주 검토 대기 중</span></>}
              {myApplication.status === 'selected' && <><span>✅</span> <strong>선정됨</strong><span>계약 진행 단계로 이동하세요</span></>}
              {myApplication.status === 'rejected' && <><span>✖</span> <strong>미선정</strong><span>다른 프로젝트를 찾아보세요</span></>}
            </div>
          )}

          {project.status !== 'recruiting' && !canApply && (
            <div className="oc-cta-note">이 프로젝트는 더 이상 지원을 받지 않습니다.</div>
          )}

          <ul className="oc-cta-perks">
            <li>✓ 검증된 대행사만 제안</li>
            <li>✓ 견적서는 선정된 파트너에게만 공개</li>
            <li>✓ 가입·수수료 없이 100% 무료</li>
          </ul>

          <button
            type="button"
            className="oc-btn oc-btn-outline oc-btn-block oc-btn-consult"
            onClick={() => setConsultOpen(true)}
          >
            <MessageCircle size={14} strokeWidth={2} aria-hidden /> 비회원 빠른 상담
          </button>
          <p className="oc-cta-sub-note">가입 없이 연락처만 남기면 담당자가 연결해드립니다.</p>
        </div>
      </aside>

      {consultOpen && (
        <ConsultationModal
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setConsultOpen(false)}
        />
      )}

      <div className="oc-detail-col-main" style={{ gridColumn: '1 / -1', marginTop: 24 }}>
        <SimilarProjects currentId={project.id} industry={project.industry} />
      </div>
    </div>
  )
}

function SimilarProjects({ currentId, industry }: { currentId: number; industry: string }) {
  const { projects, loading } = useProjects({ sort: 'latest' })
  if (loading) return null
  const similar = projects
    .filter((p) => p.id !== currentId && p.industry === industry && (p.status === 'recruiting' || p.status === 'closing'))
    .slice(0, 3)
  if (similar.length === 0) return null

  return (
    <section className="oc-detail-similar" aria-label="비슷한 프로젝트">
      <h3>같은 업종의 최근 프로젝트</h3>
      <div className="oc-detail-similar-grid">
        {similar.map((p) => (
          <a key={p.id} href={`/project/${p.id}`} className="oc-similar-card">
            <span className="oc-similar-industry" style={{ color: p.industryColor }}>{p.industry}</span>
            <h4>{p.title}</h4>
            <div className="oc-similar-meta">
              <span>월 {p.budgetMin.toLocaleString('ko-KR')}만원~</span>
              <span>지원자 {p.applicantCount}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
