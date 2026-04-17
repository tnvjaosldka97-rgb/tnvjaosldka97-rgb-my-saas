import { usePublicBootstrap } from '../biz/mkt/hooks/usePublicBootstrap'

export function LPHero() {
  const { data, loading } = usePublicBootstrap()
  const market = data?.metrics?.market

  const metricItems = [
    { label: '진행중 프로젝트', value: market?.activeProjects, fallback: '—' },
    { label: '인증 대행사',     value: market?.verifiedAgencies, fallback: '—' },
    { label: '평균 첫 견적',    value: market ? `${market.avgFirstQuoteHour}h` : '—', fallback: '—' },
    { label: '검증 평점',       value: market?.avgRating ? market.avgRating.toFixed(1) : '—', fallback: '—' },
  ] as Array<{ label: string; value: string | number | undefined; fallback: string }>

  return (
    <section id="top" className="oc-hero">
      <div className="oc-container">
        <div className="oc-hero-grid">
          <div className="oc-hero-copy">
            <span className="oc-hero-badge">
              <span className="oc-hero-badge-dot" aria-hidden />
              지금 {market?.activeProjects ?? '56'}건이 견적 비교 중
            </span>
            <h1>
              대한민국에서 <em>광고비 안 날리는</em> 가장 확실한 방법.
            </h1>
            <p className="oc-hero-sub">
              직접 찾지 마세요.<br />
              검증된 대행사의 견적을 한 번에 비교할 수 있습니다.
            </p>
            <div className="oc-hero-cta-row">
              <a href="#market" className="oc-btn oc-btn-primary oc-btn-lg">견적 비교하기</a>
              <a href="#lead-start" className="oc-btn oc-btn-outline oc-btn-lg">간편 1분 등록</a>
            </div>

            <ul className="oc-hero-meta" aria-label="운영 지표">
              {metricItems.map((m) => (
                <li key={m.label}>
                  <strong>{loading ? <span className="oc-hero-meta-skel" aria-hidden /> : (m.value ?? m.fallback)}</strong>
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="oc-hero-visual" aria-hidden>
            <HeroIllustration />
          </aside>
        </div>
      </div>
    </section>
  )
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" className="oc-hero-illus">
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1D4ED8" stopOpacity="0.16" />
          <stop offset="1" stopColor="#0B1E3F" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="hero-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="hero-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="hero-bar2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0B1E3F" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* 배경 블러 원 */}
      <circle cx="330" cy="70" r="60" fill="url(#hero-bg)" />
      <circle cx="80" cy="260" r="70" fill="url(#hero-bg)" />

      {/* 메인 카드 — 프로젝트 */}
      <g filter="url(#hero-shadow)" transform="translate(60 40)">
        <rect width="260" height="150" rx="16" fill="url(#hero-card)" stroke="#E2E8F0" />
        <rect x="18" y="20" width="60" height="18" rx="4" fill="#1D4ED8" fillOpacity="0.15" />
        <text x="48" y="33" fill="#1D4ED8" fontSize="10" fontWeight="700" textAnchor="middle">모집중</text>
        <text x="18" y="64" fill="#0B1E3F" fontSize="14" fontWeight="700">프리미엄 한우 6개월</text>
        <text x="18" y="82" fill="#64748B" fontSize="11">월 예산 480~620만원</text>
        <rect x="18" y="100" width="224" height="8" rx="4" fill="#E2E8F0" />
        <rect x="18" y="100" width="150" height="8" rx="4" fill="url(#hero-bar)" />
        <text x="18" y="130" fill="#0B1E3F" fontSize="11" fontWeight="600">견적 4건 도착</text>
      </g>

      {/* 작은 카드 1 */}
      <g filter="url(#hero-shadow)" transform="translate(200 220)">
        <rect width="180" height="80" rx="14" fill="url(#hero-card)" stroke="#E2E8F0" />
        <circle cx="24" cy="40" r="16" fill="#1D4ED8" />
        <text x="24" y="44" fill="white" fontSize="12" fontWeight="700" textAnchor="middle">오로라</text>
        <text x="52" y="36" fill="#0B1E3F" fontSize="12" fontWeight="700">오로라 미디어</text>
        <text x="52" y="52" fill="#64748B" fontSize="10">★ 4.8 · 완료 42건</text>
        <rect x="52" y="60" width="100" height="6" rx="3" fill="url(#hero-bar2)" />
      </g>

      {/* 작은 카드 2 */}
      <g filter="url(#hero-shadow)" transform="translate(30 180)">
        <rect width="150" height="64" rx="12" fill="url(#hero-card)" stroke="#E2E8F0" />
        <circle cx="22" cy="32" r="10" fill="#F59E0B" />
        <text x="40" y="28" fill="#0B1E3F" fontSize="11" fontWeight="700">견적 도착 ↗</text>
        <text x="40" y="44" fill="#64748B" fontSize="10">평균 28시간</text>
      </g>

      {/* 연결선 */}
      <path d="M180 120 Q 220 220 260 260" fill="none" stroke="#1D4ED8" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 4" />
    </svg>
  )
}
