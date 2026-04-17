import { BadgeCheck, Star } from 'lucide-react'
import { usePublicBootstrap } from '../biz/mkt/hooks/usePublicBootstrap'

export function LPTrustedAgencies() {
  const { data, loading } = usePublicBootstrap()
  const agencies = data?.metrics?.market?.recentAgencies ?? []
  const totalVerified = data?.metrics?.market?.verifiedAgencies ?? 0
  const avgRating = data?.metrics?.market?.avgRating ?? 0

  if (!loading && agencies.length === 0) return null

  return (
    <section id="trusted" className="oc-section oc-section-trust">
      <div className="oc-container">
        <div className="oc-trust-head">
          <span className="oc-section-eyebrow">검증 대행사 파트너</span>
          <h2>
            평균 평점 <em>{avgRating ? avgRating.toFixed(1) : '4.7'}</em> ·{' '}
            {totalVerified || '—'}곳이 이미 합류했습니다.
          </h2>
          <p className="oc-section-sub">
            사업자 등록 · 최근 6개월 실적 3건 이상 · 포트폴리오 검증을 통과한 대행사만 플랫폼에 공개됩니다.
          </p>
        </div>

        <div className="oc-agency-wall">
          {agencies.map((a) => {
            const initial = a.name.charAt(0)
            return (
              <a key={a.id} href={`/agency/${a.slug}`} className="oc-agency-card">
                <div className="oc-agency-head">
                  <div className="oc-agency-avatar" aria-hidden>{initial}</div>
                  {a.verified && (
                    <span className="oc-agency-check" aria-label="인증 대행사">
                      <BadgeCheck size={13} strokeWidth={2.3} aria-hidden /> 인증
                    </span>
                  )}
                </div>
                <h3>{a.name}</h3>
                <div className="oc-agency-meta">
                  <span className="oc-agency-rating">
                    <Star size={12} strokeWidth={2} aria-hidden fill="currentColor" /> {a.rating.toFixed(1)}
                  </span>
                  <span>완료 {a.completedProjects}건</span>
                </div>
                <div className="oc-agency-tags">
                  {a.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="oc-tag-link">{s}</span>
                  ))}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
