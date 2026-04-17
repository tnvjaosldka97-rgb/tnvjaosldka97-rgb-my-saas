const PRIMARY_LINKS = [
  { label: '견적 비교하기', href: '/quotes/compare' },
  { label: '비교중인 마케팅', href: '/#market' },
  { label: '이용 가이드', href: '/#guide' },
  { label: '파트너 지원', href: '/register?as=agency' },
]

const LEGAL_LINKS = [
  { label: '이용약관', href: '/pages/terms' },
  { label: '개인정보처리방침', href: '/pages/privacy' },
  { label: '사업자정보', href: '/pages/business-info' },
  { label: '문의하기', href: '/pages/contact' },
]

export function LPFooter() {
  return (
    <footer className="oc-footer">
      <div className="oc-container">
        <div className="oc-footer-top">
          <a href="/" className="oc-logo oc-footer-logo">
            <span className="oc-logo-mark">OC</span>
            <span>OnlyUp Compare</span>
          </a>
          <nav className="oc-footer-links" aria-label="주요 메뉴">
            {PRIMARY_LINKS.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
          </nav>
        </div>
        <div className="oc-footer-mid">
          <nav className="oc-footer-legal" aria-label="법적 고지">
            {LEGAL_LINKS.map((l, i) => (
              <span key={l.label}>
                <a href={l.href}>{l.label}</a>
                {i < LEGAL_LINKS.length - 1 && <span aria-hidden className="oc-footer-sep">·</span>}
              </span>
            ))}
          </nav>
        </div>
        <div className="oc-footer-bottom">
          <span>© 2026 OnlyUp Compare. All rights reserved.</span>
          <span>OnlyUp Compare는 광고주-대행사 간 중개 플랫폼으로, 개별 계약의 당사자가 아닙니다.</span>
        </div>
      </div>
    </footer>
  )
}
