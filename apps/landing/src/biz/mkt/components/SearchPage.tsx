import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import type { MarketProject } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { apiFetch } from '../../../com/api/client'
import { Skeleton } from '../../../com/ui/Skeleton'
import { EmptyState } from '../../../com/ui/EmptyState'
import '../../../landing-page.css'

type Agency = {
  id: number
  slug: string
  name: string
  verified: boolean
  rating: number
  completedProjects: number
  specialties: string[]
}

export function SearchPage({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [projects, setProjects] = useState<MarketProject[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([
      apiFetch<{ projects: MarketProject[] }>('/api/public/projects'),
      apiFetch<{ agencies: Agency[] }>('/api/public/agencies'),
    ])
      .then(([pRes, aRes]) => {
        if (!mounted) return
        setProjects(pRes.projects)
        setAgencies(aRes.agencies)
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const { matchedProjects, matchedAgencies } = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { matchedProjects: [], matchedAgencies: [] }
    return {
      matchedProjects: projects.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q) ||
        p.hashtags.some((t) => t.toLowerCase().includes(q)) ||
        p.marketingTypes.some((m) => m.toLowerCase().includes(q)),
      ),
      matchedAgencies: agencies.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.specialties.some((s) => s.toLowerCase().includes(q)),
      ),
    }
  }, [projects, agencies, query])

  const hasQuery = query.trim().length > 0
  const totalResults = matchedProjects.length + matchedAgencies.length

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-search-main">
        <div className="oc-container">
          <a href="/" className="oc-back-link"><ArrowLeft size={14} strokeWidth={2} aria-hidden /> 홈으로</a>

          <div className="oc-search-hero">
            <h1>전체 검색</h1>
            <p>프로젝트 · 대행사 · 업종 · 태그 통합 검색</p>
            <div className="oc-search-hero-input">
              <Search size={18} strokeWidth={2} aria-hidden />
              <input
                type="search"
                autoFocus
                placeholder="예: 외식 · 피부과 · 플레이스마케팅 · 오로라"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {hasQuery && !loading && (
              <p className="oc-search-count" aria-live="polite">
                검색 결과 <strong>{totalResults}</strong>건 (프로젝트 {matchedProjects.length} · 대행사 {matchedAgencies.length})
              </p>
            )}
          </div>

          {loading && (
            <div className="oc-search-skel">
              <Skeleton width="100%" height={60} />
              <Skeleton width="100%" height={60} />
              <Skeleton width="100%" height={60} />
            </div>
          )}

          {!loading && !hasQuery && (
            <EmptyState
              variant="no-result"
              title="검색어를 입력해주세요"
              description="프로젝트명, 업종(외식/병원/뷰티/학원/커머스/서비스/기타), 마케팅 유형, 대행사명 모두 가능합니다."
            />
          )}

          {!loading && hasQuery && totalResults === 0 && (
            <EmptyState
              variant="no-result"
              title="일치하는 결과가 없어요"
              description={`"${query}" 검색 결과가 0건입니다. 업종 필터(외식/병원/뷰티 등)로 시도해보세요.`}
              action={<button type="button" className="oc-btn oc-btn-outline" onClick={() => setQuery('')}>초기화</button>}
            />
          )}

          {!loading && hasQuery && matchedProjects.length > 0 && (
            <section className="oc-search-section">
              <h2>프로젝트 <span>{matchedProjects.length}건</span></h2>
              <ul className="oc-search-list">
                {matchedProjects.slice(0, 20).map((p) => (
                  <li key={p.id}>
                    <a href={`/project/${p.id}`} className="oc-search-item">
                      <span className="oc-search-item-ind" style={{ color: p.industryColor }}>{p.industry}</span>
                      <div className="oc-search-item-body">
                        <strong>{p.title}</strong>
                        <span>월 {p.budgetMin.toLocaleString('ko-KR')}만원~ · 지원자 {p.applicantCount}명</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!loading && hasQuery && matchedAgencies.length > 0 && (
            <section className="oc-search-section">
              <h2>대행사 <span>{matchedAgencies.length}곳</span></h2>
              <ul className="oc-search-list">
                {matchedAgencies.map((a) => (
                  <li key={a.id}>
                    <a href={`/agency/${a.slug}`} className="oc-search-item oc-search-item-agency">
                      <span className="oc-search-item-mark">{a.name.charAt(0)}</span>
                      <div className="oc-search-item-body">
                        <strong>{a.name}</strong>
                        <span>★ {a.rating.toFixed(1)} · 완료 {a.completedProjects}건 · {a.specialties.slice(0, 2).join(' · ')}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
