import { Check, Sparkles } from 'lucide-react'

type Plan = {
  name: string
  subtitle: string
  price: string
  priceSuffix?: string
  features: string[]
  cta: { label: string; href: string }
  highlight?: 'free' | 'popular' | 'pro'
}

const PLANS: Plan[] = [
  {
    name: '광고주',
    subtitle: '언제나 무료',
    price: '₩0',
    features: [
      '프로젝트 등록 · 견적 수신 무제한',
      '대행사 15곳+ 자동 매칭',
      '가격·일정·실적 한 화면 비교',
      '계약 및 리뷰 작성',
      '운영팀 분쟁 중재',
    ],
    cta: { label: '프로젝트 1분 등록', href: '/#lead-start' },
    highlight: 'free',
  },
  {
    name: 'Partner',
    subtitle: '대행사 활성 플랜',
    price: '₩49,000',
    priceSuffix: '/ 월',
    features: [
      '월 무제한 견적 제출',
      '상위 노출 가중치',
      '광고주 사전 알림 (등록 직후)',
      '전용 운영 담당자',
      '실적 · 리뷰 자동 누적',
    ],
    cta: { label: '파트너 지원', href: '/register?as=agency' },
    highlight: 'popular',
  },
  {
    name: 'Partner Plus',
    subtitle: '전문 영역 플랜',
    price: '₩149,000',
    priceSuffix: '/ 월',
    features: [
      'Partner 모든 기능 포함',
      '독점 카테고리 제안권',
      'API 연동 (CRM · 분석 툴)',
      '맞춤 리포트 · 인사이트',
      '전담 계정 매니저',
    ],
    cta: { label: '파트너 문의', href: '/pages/contact' },
    highlight: 'pro',
  },
]

export function LPPricing() {
  return (
    <section id="pricing" className="oc-section oc-section-pricing">
      <div className="oc-container">
        <div className="oc-pricing-head">
          <span className="oc-section-eyebrow">요금 안내</span>
          <h2>광고주는 무료, 대행사는 실적이 쌓이는 만큼 커집니다.</h2>
          <p className="oc-section-sub">
            숨은 수수료 없이, 모든 요금과 혜택을 투명하게 공개합니다. 언제든 변경·해지할 수 있습니다.
          </p>
        </div>

        <div className="oc-pricing-grid">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`oc-plan oc-plan-${p.highlight ?? 'free'}${p.highlight === 'popular' ? ' is-popular' : ''}`}
            >
              {p.highlight === 'popular' && (
                <span className="oc-plan-badge">
                  <Sparkles size={11} strokeWidth={2.4} aria-hidden /> 가장 인기
                </span>
              )}
              <header className="oc-plan-head">
                <h3>{p.name}</h3>
                <p>{p.subtitle}</p>
              </header>
              <div className="oc-plan-price">
                <strong>{p.price}</strong>
                {p.priceSuffix && <span>{p.priceSuffix}</span>}
              </div>
              <ul className="oc-plan-features">
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={13} strokeWidth={2.4} aria-hidden /> {f}
                  </li>
                ))}
              </ul>
              <a
                href={p.cta.href}
                className={`oc-btn ${p.highlight === 'popular' ? 'oc-btn-primary' : 'oc-btn-outline'} oc-btn-block`}
              >
                {p.cta.label}
              </a>
            </article>
          ))}
        </div>

        <div className="oc-pricing-note">
          <strong>부가세 별도 · 월 단위 구독 · 언제든 해지</strong>
          <span>엔터프라이즈(연 단위 · 채널 제휴 · 다수 계정)는 <a href="/pages/contact">별도 문의</a>로 확인해주세요.</span>
        </div>
      </div>
    </section>
  )
}
