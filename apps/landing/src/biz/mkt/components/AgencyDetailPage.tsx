import { useEffect, useState } from 'react'
import { BadgeCheck, Star, Briefcase, MessageSquare, ArrowLeft } from 'lucide-react'
import type { PublicAgencyDetail, PublicAgencyReview } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { NotFoundPage } from './NotFoundPage'
import { apiFetch } from '../../../com/api/client'
import { Skeleton, SkeletonStack } from '../../../com/ui/Skeleton'
import '../../../landing-page.css'

export function AgencyDetailPage({ slug }: { slug: string }) {
  const [data, setData] = useState<{ agency: PublicAgencyDetail; reviews: PublicAgencyReview[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    apiFetch<{ agency: PublicAgencyDetail; reviews: PublicAgencyReview[] }>(`/api/public/agencies/${encodeURIComponent(slug)}`)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (notFound) return <NotFoundPage />

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-agency-main">
        <div className="oc-container">
          <a href="/" className="oc-back-link"><ArrowLeft size={14} strokeWidth={2} aria-hidden /> 돌아가기</a>

          {loading ? (
            <AgencySkeleton />
          ) : data ? (
            <AgencyContent agency={data.agency} reviews={data.reviews} />
          ) : null}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}

function AgencyContent({ agency, reviews }: { agency: PublicAgencyDetail; reviews: PublicAgencyReview[] }) {
  const initial = agency.name.charAt(0)
  const avgRatingFromReviews = reviews.length
    ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
    : agency.rating

  return (
    <>
      <header className="oc-agency-hero">
        <div className="oc-agency-hero-mark" aria-hidden>{initial}</div>
        <div className="oc-agency-hero-body">
          <div className="oc-agency-hero-row">
            <h1>{agency.name}</h1>
            {agency.verified && (
              <span className="oc-agency-check" aria-label="인증 대행사">
                <BadgeCheck size={14} strokeWidth={2.4} aria-hidden /> 인증 파트너
              </span>
            )}
          </div>
          <p className="oc-agency-desc">{agency.description}</p>

          <ul className="oc-agency-stats" aria-label="대행사 지표">
            <li>
              <Star size={14} strokeWidth={2} aria-hidden fill="currentColor" />
              <strong>{agency.rating.toFixed(1)}</strong>
              <span>평균 평점</span>
            </li>
            <li>
              <Briefcase size={14} strokeWidth={2} aria-hidden />
              <strong>{agency.completedProjects}</strong>
              <span>완료 프로젝트</span>
            </li>
            <li>
              <MessageSquare size={14} strokeWidth={2} aria-hidden />
              <strong>{agency.totalReviews}</strong>
              <span>누적 리뷰</span>
            </li>
          </ul>
        </div>
      </header>

      <section className="oc-agency-section">
        <h2>전문 분야</h2>
        <div className="oc-agency-specialty-wall">
          {agency.specialties.map((s) => (
            <span key={s} className="oc-agency-specialty">{s}</span>
          ))}
        </div>
      </section>

      <section className="oc-agency-section">
        <h2>
          최근 리뷰
          {reviews.length > 0 && <span className="oc-agency-reviews-count">· 평균 ★ {avgRatingFromReviews.toFixed(1)}</span>}
        </h2>

        {reviews.length === 0 ? (
          <div className="oc-agency-reviews-empty">
            아직 공개된 리뷰가 없습니다. 첫 협업 후 광고주 리뷰가 공개됩니다.
          </div>
        ) : (
          <ul className="oc-agency-reviews">
            {reviews.map((r) => (
              <li key={r.id} className="oc-agency-review-card">
                <div className="oc-agency-review-head">
                  <span className="oc-agency-review-stars" aria-label={`${r.rating}점`}>
                    {'★'.repeat(r.rating)}<span className="oc-agency-review-stars-dim">{'★'.repeat(5 - r.rating)}</span>
                  </span>
                  <time>{new Date(r.createdAt).toLocaleDateString('ko-KR')}</time>
                </div>
                <p className="oc-agency-review-comment">{r.comment}</p>
                <span className="oc-agency-review-project">— {r.projectTitle}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="oc-agency-cta">
        <div>
          <h3>이 파트너와 협업해보고 싶다면</h3>
          <p>관심 있는 프로젝트에 직접 상담을 요청해보세요.</p>
        </div>
        <a href="/#market" className="oc-btn oc-btn-primary oc-btn-lg">관련 프로젝트 보기</a>
      </section>
    </>
  )
}

function AgencySkeleton() {
  return (
    <div className="oc-agency-skel">
      <div className="oc-agency-hero" style={{ marginBottom: 32 }}>
        <Skeleton variant="circle" width={88} height={88} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton width="60%" height={26} />
          <SkeletonStack rows={2} />
          <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
            <Skeleton width={90} height={20} />
            <Skeleton width={90} height={20} />
            <Skeleton width={90} height={20} />
          </div>
        </div>
      </div>
      <Skeleton width={120} height={18} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 28 }}>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} width={80} height={28} radius={14} />)}
      </div>
      <Skeleton width={120} height={18} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="card" height={96} />
        ))}
      </div>
    </div>
  )
}
