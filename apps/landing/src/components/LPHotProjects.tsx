import { Flame, ArrowRight } from 'lucide-react'
import { useProjects } from '../biz/mkt/hooks/useProjects'

export function LPHotProjects() {
  const { projects, loading } = useProjects({ sort: 'applicants' })

  if (loading || projects.length === 0) return null

  // 지원자 많은순 Top 6
  const hot = projects
    .filter((p) => p.status === 'recruiting' || p.status === 'closing')
    .slice(0, 6)

  if (hot.length === 0) return null

  return (
    <aside className="oc-hot" aria-label="지금 뜨는 프로젝트">
      <div className="oc-container">
        <div className="oc-hot-inner">
          <div className="oc-hot-head">
            <Flame size={14} strokeWidth={2.4} aria-hidden className="oc-hot-icon" />
            <span className="oc-hot-title">지금 뜨는 프로젝트</span>
          </div>
          <div className="oc-hot-rail">
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
          <a href="#market" className="oc-hot-all">
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
