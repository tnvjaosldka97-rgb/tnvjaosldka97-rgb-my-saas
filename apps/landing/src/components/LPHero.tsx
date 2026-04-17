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
    <svg viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg" className="oc-hero-illus" role="img" aria-label="OnlyUp Compare 서비스 요약 일러스트">
      <defs>
        <radialGradient id="hero-blob-blue" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#1D4ED8" stopOpacity="0.25" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-blob-amber" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="hero-bar-royal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="hero-bar-amber" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="hero-pill-mint" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <filter id="hero-shadow-md" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#0B1E3F" floodOpacity="0.12" />
        </filter>
        <filter id="hero-shadow-sm" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#0B1E3F" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* 배경 부드러운 블롭 */}
      <circle cx="360" cy="60" r="110" fill="url(#hero-blob-blue)" />
      <circle cx="70" cy="280" r="120" fill="url(#hero-blob-amber)" />
      <circle cx="380" cy="280" r="70" fill="url(#hero-blob-blue)" />

      {/* 우상단 성과 배지 */}
      <g filter="url(#hero-shadow-sm)" transform="translate(296 14)">
        <rect width="126" height="34" rx="17" fill="url(#hero-pill-mint)" />
        <circle cx="17" cy="17" r="5" fill="white" fillOpacity="0.95" />
        <path d="M14 17l2 2 4-4" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="30" y="21" fill="white" fontSize="11" fontWeight="800" letterSpacing="-0.02em">검증 완료 · 15곳</text>
      </g>

      {/* sparkles */}
      <g fill="#F59E0B" opacity="0.85">
        <path d="M22 80l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" />
        <path d="M420 160l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" />
        <path d="M148 22l1.2 2.4 2.4 1.2-2.4 1.2-1.2 2.4-1.2-2.4-2.4-1.2 2.4-1.2z" />
      </g>

      {/* 메인 카드 — 프로젝트 */}
      <g filter="url(#hero-shadow-md)" transform="translate(56 58)">
        <rect width="272" height="164" rx="18" fill="url(#hero-card)" stroke="#E2E8F0" strokeWidth="1" />
        {/* status row */}
        <rect x="20" y="22" width="62" height="20" rx="5" fill="#DBEAFE" />
        <circle cx="30" cy="32" r="3" fill="#1D4ED8" />
        <text x="38" y="36" fill="#1E40AF" fontSize="10" fontWeight="800">모집중</text>
        <rect x="88" y="22" width="48" height="20" rx="5" fill="#FEF3C7" />
        <text x="112" y="36" fill="#B45309" fontSize="10" fontWeight="800" textAnchor="middle">D-9</text>
        {/* industry icon */}
        <rect x="222" y="18" width="32" height="32" rx="8" fill="#EF4444" fillOpacity="0.12" />
        <path d="M232 26v16M238 26v16M246 26v8c0 2 2 3 4 3" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        {/* title */}
        <text x="20" y="72" fill="#0B1E3F" fontSize="15" fontWeight="800" letterSpacing="-0.02em">프리미엄 한우 · 6개월</text>
        <text x="20" y="90" fill="#64748B" fontSize="11.5">월 예산 480 ~ 620만원 · 외식</text>
        {/* progress */}
        <text x="20" y="114" fill="#0B1E3F" fontSize="10.5" fontWeight="700">견적 수령 진행률</text>
        <text x="252" y="114" fill="#1D4ED8" fontSize="10.5" fontWeight="800" textAnchor="end">4 / 5건</text>
        <rect x="20" y="120" width="232" height="7" rx="3.5" fill="#EEF2FF" />
        <rect x="20" y="120" width="186" height="7" rx="3.5" fill="url(#hero-bar-royal)" />
        {/* tags */}
        <rect x="20" y="138" width="56" height="16" rx="4" fill="#F8FAFC" />
        <text x="48" y="150" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle">#플레이스</text>
        <rect x="80" y="138" width="44" height="16" rx="4" fill="#F8FAFC" />
        <text x="102" y="150" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle">#블로그</text>
        <rect x="128" y="138" width="36" height="16" rx="4" fill="#F8FAFC" />
        <text x="146" y="150" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle">#SNS</text>
      </g>

      {/* 대행사 카드 */}
      <g filter="url(#hero-shadow-md)" transform="translate(210 244)">
        <rect width="196" height="82" rx="15" fill="url(#hero-card)" stroke="#E2E8F0" strokeWidth="1" />
        {/* mark */}
        <rect x="14" y="14" width="36" height="36" rx="9" fill="#0B1E3F" />
        <text x="32" y="37" fill="white" fontSize="13" fontWeight="800" textAnchor="middle">오</text>
        {/* name + verified */}
        <text x="58" y="28" fill="#0B1E3F" fontSize="12.5" fontWeight="800">오로라 미디어</text>
        <g transform="translate(148 18)">
          <rect width="36" height="14" rx="7" fill="#D1FAE5" />
          <path d="M8 7l2 2 4-4" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="26" y="10.5" fill="#047857" fontSize="8.5" fontWeight="800" textAnchor="middle">인증</text>
        </g>
        <text x="58" y="42" fill="#64748B" fontSize="10">★ 4.8 · 완료 42건 · 외식/병원</text>
        {/* tiny mini chart */}
        <polyline points="14,70 30,66 46,62 62,58 78,54 94,52 110,48 126,46 142,44 158,40" fill="none" stroke="url(#hero-bar-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="158" cy="40" r="3" fill="#F59E0B" stroke="white" strokeWidth="2" />
      </g>

      {/* 응답시간 배지 */}
      <g filter="url(#hero-shadow-sm)" transform="translate(22 218)">
        <rect width="164" height="68" rx="14" fill="url(#hero-card)" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="12" y="14" width="26" height="26" rx="7" fill="#1D4ED8" fillOpacity="0.12" />
        <path d="M25 22v5l3.5 3.5" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="25" cy="27" r="7" stroke="#1D4ED8" strokeWidth="2" fill="none" />
        <text x="44" y="25" fill="#0B1E3F" fontSize="11" fontWeight="800">평균 첫 견적</text>
        <text x="44" y="40" fill="#1D4ED8" fontSize="18" fontWeight="800" letterSpacing="-0.03em">28<tspan fontSize="10" fill="#64748B" fontWeight="700"> 시간</tspan></text>
        <text x="12" y="58" fill="#64748B" fontSize="9" fontWeight="600">최근 12개월 중앙값 기준</text>
      </g>

      {/* 흐름 화살표 */}
      <path
        d="M170 152 C 200 200, 210 228, 230 250"
        fill="none"
        stroke="#1D4ED8"
        strokeOpacity="0.35"
        strokeWidth="1.8"
        strokeDasharray="2 5"
      />
      <circle cx="230" cy="250" r="3" fill="#1D4ED8" fillOpacity="0.5" />
    </svg>
  )
}
