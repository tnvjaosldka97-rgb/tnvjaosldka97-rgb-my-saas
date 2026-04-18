import { Flame, ArrowRight } from 'lucide-react'
import { useProjects } from '../biz/mkt/hooks/useProjects'

export function LPHotProjects() {
  const { projects, loading } = useProjects({ sort: 'applicants' })

  if (loading || projects.length === 0) return null

  // 최신 3건 (스크롤바 제거 — 한 줄에 깔끔히)
  const hot = projects
    .filter((p) => p.status === 'recruiting' || p.status === 'closing')
    .slice(0, 3)

  if (hot.length === 0) return null

  function scrollToMarket(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const el = document.getElementById('market')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.location.href = '/search'
  }

  return (
    <aside className="oc-hot" aria-label="지금 뜨는 프로젝트">
      <div className="oc-container">
        <div className="oc-hot-inner">
          <div className="oc-hot-head">
            <Flame size={14} strokeWidth={2.4} aria-hidden className="oc-hot-icon" />
            <span className="oc-hot-title">지금 뜨는 프로젝트</span>
          </div>
          <div className="oc-hot-rail oc-hot-rail--top3">
            {hot.map((p) => (
              <a key={p.id} href={`/project/${p.id}`} className="oc-hot-item">
                <span className="oc-hot-ind" style={{ background: p.industryColor }} aria-hidden />
                <span className="oc-hot-text">
                  <strong>{p.industry}</strong>
                  <span>{shorten(p.title, 26)}</span>
                </span>
                <span className="oc-hot-count">지원 {p.applicantCount}</span>
              </a>
            ))}
          </div>
          <a href="#market" onClick={scrollToMarket} className="oc-hot-all">
            전체 보기 <ArrowRight size={12} strokeWidth={2.4} aria-hidden />
          </a>
        </div>
      </div>
    </aside>
  )
}

function shorten(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}
