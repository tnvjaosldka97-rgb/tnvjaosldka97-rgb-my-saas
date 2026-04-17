import { useState } from 'react'
import type { BudgetType, MarketProject, ProjectListQuery, ProjectStatus } from '@my-saas/com'
import { useProjects } from '../biz/mkt/hooks/useProjects'
import { IndustryArt } from '../biz/mkt/components/IndustryArt'

type StatusFilter = ProjectStatus | 'all'

const STATUS_OPTS: { v: StatusFilter; label: string }[] = [
  { v: 'all', label: '전체' },
  { v: 'recruiting', label: '모집중' },
  { v: 'closing', label: '마감임박' },
  { v: 'in_progress', label: '진행중' },
  { v: 'completed', label: '완료' },
]

const SORT_OPTS: { v: NonNullable<ProjectListQuery['sort']>; label: string }[] = [
  { v: 'latest', label: '최신순' },
  { v: 'closing', label: '마감임박순' },
  { v: 'budget', label: '예산높은순' },
  { v: 'applicants', label: '지원자 많은순' },
]

const STATUS_META: Record<ProjectStatus, { label: string; cls: string }> = {
  recruiting: { label: '모집중', cls: 'oc-status-active' },
  closing: { label: '마감임박', cls: 'oc-status-closing' },
  in_progress: { label: '진행중', cls: 'oc-status-progress' },
  completed: { label: '완료', cls: 'oc-status-done' },
}

function dday(days: number, status: ProjectStatus): string | null {
  if (status === 'completed' || status === 'in_progress') return null
  if (days <= 0) return 'D-Day'
  return `D-${days}`
}

function formatBudget(p: MarketProject): string {
  const fmt = (n: number) => {
    if (n >= 10000) return `${Math.round(n / 10000 * 10) / 10}억`
    return `${n.toLocaleString('ko-KR')}만`
  }
  if (p.budgetMax && p.budgetMax !== p.budgetMin) return `${fmt(p.budgetMin)} ~ ${fmt(p.budgetMax)}원`
  return p.budgetMax === null ? `${fmt(p.budgetMin)}원 ~` : `${fmt(p.budgetMin)}원`
}

const BUDGET_PREFIX_SHORT: Record<BudgetType, string> = {
  monthly: '월 ',
  range: '',
  fixed: '',
}

export function LPProjectGrid() {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<NonNullable<ProjectListQuery['sort']>>('latest')
  const { projects, loading, error } = useProjects({ status, sort })

  return (
    <section id="market" className="oc-section oc-section-market">
      <div className="oc-container">
        <div className="oc-grid-head">
          <div>
            <h2>비교중인 마케팅</h2>
            <p className="oc-grid-sub">광고주가 올린 실제 프로젝트에 검증 대행사가 견적을 제출 중입니다.</p>
          </div>
          <div className="oc-grid-controls" role="toolbar" aria-label="프로젝트 필터">
            <select className="oc-select oc-select-ghost" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="상태">
              {STATUS_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            <select className="oc-select oc-select-ghost" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="정렬">
              {SORT_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            <span className="oc-count-text" aria-live="polite"><strong>{projects.length}</strong>건</span>
          </div>
        </div>

        {loading && (
          <div className="oc-card-grid">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="oc-card-skeleton" />)}
          </div>
        )}
        {error && !loading && <div className="oc-grid-empty" role="alert">{error}</div>}

        {!loading && !error && projects.length > 0 && (
          <div className="oc-card-grid">
            {projects.map((p) => {
              const d = dday(p.daysLeft, p.status)
              const statusMeta = STATUS_META[p.status]
              return (
                <a key={p.id} href={`/project/${p.id}`} className="oc-project-card" aria-label={`${p.title} 자세히 보기`}>
                  <div className="oc-project-art-wrap">
                    <IndustryArt industry={p.industry} color={p.industryColor} title={p.title} />
                    {p.verifiedOnly && <span className="oc-verified-stamp" title="인증 대행사만 지원 가능">✓ 인증</span>}
                    {d && <span className="oc-dday-stamp">{d}</span>}
                    <div className="oc-project-art-overlay">
                      <span className={`oc-status-dot ${statusMeta.cls}`} aria-hidden />
                      <span className="oc-status-overlay-label">{statusMeta.label}</span>
                      <span className="oc-overlay-divider" aria-hidden>|</span>
                      <span className="oc-overlay-applicants">지원자 수: <strong>{p.applicantCount}</strong></span>
                    </div>
                  </div>

                  <div className="oc-project-body">
                    <span className="oc-project-industry">{p.industry}</span>
                    <h3>{p.title}</h3>
                    <div className="oc-project-budget">
                      {BUDGET_PREFIX_SHORT[p.budgetType]}{formatBudget(p)}
                    </div>
                    <div className="oc-project-tags">
                      {p.hashtags.slice(0, 3).map((t) => <span key={t} className="oc-tag-link">{t}</span>)}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="oc-grid-empty">조건에 맞는 프로젝트가 없습니다. 필터를 조금 풀어보세요.</div>
        )}
      </div>
    </section>
  )
}
