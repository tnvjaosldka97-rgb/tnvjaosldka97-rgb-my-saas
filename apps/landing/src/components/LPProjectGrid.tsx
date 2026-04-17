import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { BudgetType, MarketProject, ProjectListQuery, ProjectStatus } from '@my-saas/com'
import { useProjects } from '../biz/mkt/hooks/useProjects'
import { IndustryArt } from '../biz/mkt/components/IndustryArt'
import { Skeleton } from '../com/ui/Skeleton'
import { EmptyState } from '../com/ui/EmptyState'

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

const INDUSTRY_OPTS = ['전체', '외식', '병원', '뷰티', '학원', '커머스', '서비스', '기타'] as const
type IndustryFilter = (typeof INDUSTRY_OPTS)[number]

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
  const [industry, setIndustry] = useState<IndustryFilter>('전체')
  const [query, setQuery] = useState('')
  const { projects, loading, error } = useProjects({ status, sort })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (industry !== '전체' && p.industry !== industry) return false
      if (!q) return true
      const inTitle = p.title.toLowerCase().includes(q)
      const inTag = p.hashtags.some((t) => t.toLowerCase().includes(q))
      const inIndustry = p.industry.toLowerCase().includes(q)
      return inTitle || inTag || inIndustry
    })
  }, [projects, industry, query])

  const resetFilters = () => {
    setStatus('all')
    setSort('latest')
    setIndustry('전체')
    setQuery('')
  }

  return (
    <section id="market" className="oc-section oc-section-market">
      <div className="oc-container">
        <div className="oc-grid-head">
          <div>
            <h2>비교중인 마케팅</h2>
            <p className="oc-grid-sub">광고주가 올린 실제 프로젝트에 검증 대행사가 견적을 제출 중입니다.</p>
          </div>
          <div className="oc-grid-controls" role="toolbar" aria-label="프로젝트 필터">
            <div className="oc-search-input oc-search-input-lg">
              <Search size={15} strokeWidth={2} aria-hidden />
              <input
                type="search"
                placeholder="프로젝트명·업종·태그 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="검색"
              />
              {query && (
                <button
                  type="button"
                  className="oc-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="검색어 지우기"
                >
                  <X size={13} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
            <select className="oc-select oc-select-ghost" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="상태">
              {STATUS_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            <select className="oc-select oc-select-ghost" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="정렬">
              {SORT_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="oc-industry-chips" role="tablist" aria-label="업종 필터">
          {INDUSTRY_OPTS.map((ind) => {
            const active = industry === ind
            return (
              <button
                key={ind}
                type="button"
                role="tab"
                aria-selected={active}
                className={`oc-industry-chip${active ? ' is-active' : ''}`}
                onClick={() => setIndustry(ind)}
              >
                {ind}
              </button>
            )
          })}
          <span className="oc-count-text" aria-live="polite"><strong>{filtered.length}</strong>건</span>
        </div>

        {loading && (
          <div className="oc-card-grid">
            {Array.from({ length: 8 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        )}
        {error && !loading && (
          <EmptyState
            variant="error"
            title="데이터를 불러오지 못했어요"
            description={error}
            action={<button type="button" className="oc-btn oc-btn-outline" onClick={() => location.reload()}>새로고침</button>}
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="oc-card-grid">
            {filtered.map((p) => {
              const d = dday(p.daysLeft, p.status)
              const statusMeta = STATUS_META[p.status]
              const peek = computePeek(p)
              return (
                <a key={p.id} href={`/project/${p.id}`} className="oc-project-card" data-peek={peek} aria-label={`${p.title} 자세히 보기`}>
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

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            variant={query || industry !== '전체' || status !== 'all' ? 'no-result' : 'no-data'}
            title={query || industry !== '전체' || status !== 'all' ? '조건에 맞는 프로젝트가 없어요' : '아직 등록된 프로젝트가 없어요'}
            description={query || industry !== '전체' || status !== 'all'
              ? '필터를 조금 풀어보거나 다른 업종을 선택해보세요.'
              : '첫 프로젝트가 등록되면 여기에 표시됩니다.'}
            action={
              (query || industry !== '전체' || status !== 'all') && (
                <button type="button" className="oc-btn oc-btn-outline" onClick={resetFilters}>필터 초기화</button>
              )
            }
          />
        )}
      </div>
    </section>
  )
}

function computePeek(p: MarketProject): string {
  if (p.status === 'closing') return `D-${p.daysLeft} · 마감 임박 · 지원자 ${p.applicantCount}명`
  if (p.status === 'in_progress') return `광고 집행 중 · 파트너 선정 완료`
  if (p.status === 'completed') return `프로젝트 완료 · 리뷰 공개됨`
  // recruiting (기본)
  if (p.applicantCount >= 6) return `지원자 ${p.applicantCount}명 · 경쟁률 높은 프로젝트`
  if (p.applicantCount >= 3) return `견적 ${p.applicantCount}건 도착 · 평균 응답 28시간`
  return `견적 대기 중 · 평균 응답 28시간 · 초기 진입 기회`
}

function ProjectCardSkeleton() {
  return (
    <div className="oc-project-card oc-project-card-skel" aria-hidden>
      <div className="oc-project-art-wrap">
        <Skeleton variant="card" height="100%" radius={0} style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div className="oc-project-body">
        <Skeleton width={48} height={14} />
        <Skeleton width="85%" height={18} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={14} style={{ marginTop: 10 }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Skeleton width={46} height={20} radius={10} />
          <Skeleton width={58} height={20} radius={10} />
        </div>
      </div>
    </div>
  )
}
