import { Sparkles } from 'lucide-react'
import { usePublicBootstrap } from '../biz/mkt/hooks/usePublicBootstrap'

export function LPFinalCta() {
  const { data } = usePublicBootstrap()
  const market = data?.metrics?.market

  return (
    <section className="oc-section oc-final-cta">
      <div className="oc-container">
        <div className="oc-final-cta-box">
          <span className="oc-final-cta-badge">
            <Sparkles size={13} strokeWidth={2.2} aria-hidden /> 오늘 등록하면 28시간 안에 견적이 도착합니다
          </span>
          <h2>
            대행사 찾느라 버리는 시간,<br />
            <em>이번 프로젝트부터 제로로.</em>
          </h2>
          <p>
            검증 대행사 <strong>{market?.verifiedAgencies ?? 15}곳</strong>이 당신의 조건을 보고 먼저 제안합니다.
            가입 없이, 수수료 없이, 무료로.
          </p>
          <div className="oc-final-cta-actions">
            <a href="/project/create" className="oc-btn oc-btn-primary oc-btn-lg">새 프로젝트 등록하기</a>
            <a href="/#market" className="oc-btn oc-btn-outline oc-btn-lg">진행 중인 프로젝트 먼저 보기</a>
          </div>
          <ul className="oc-final-cta-trust" aria-label="신뢰 지표">
            <li><strong>{market?.activeProjects ?? '—'}</strong>개 활성 프로젝트</li>
            <li><strong>{market?.totalQuotes ?? '—'}</strong>건 제출 견적</li>
            <li><strong>{market?.avgRating ? market.avgRating.toFixed(1) : '4.7'}</strong> 평균 평점</li>
            <li>수수료 <strong>0원</strong></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
