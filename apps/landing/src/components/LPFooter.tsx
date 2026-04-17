const PRIMARY_LINKS = [
  { label: '견적 비교하기', href: '/quotes/compare' },
  { label: '비교중인 마케팅', href: '/#market' },
  { label: '이용 가이드', href: '/#guide' },
  { label: '파트너 지원', href: '/register?as=agency' },
]

const LEGAL_LINKS = [
  { label: '회사소개', href: '/pages/about' },
  { label: '이용약관', href: '/pages/terms' },
  { label: '개인정보처리방침', href: '/pages/privacy', strong: true },
  { label: '청소년보호정책', href: '/pages/youth' },
  { label: '사업자정보', href: '/pages/business-info' },
  { label: '공지사항', href: '/pages/notice' },
  { label: '제휴문의', href: '/register?as=agency' },
  { label: '고객센터', href: '/pages/contact' },
]

export function LPFooter() {
  return (
    <footer className="oc-footer">
      <div className="oc-container">
        <div className="oc-footer-top">
          <a href="/" className="oc-logo oc-footer-logo" aria-label="마케팅천재 홈">
            <strong className="oc-logo-wordmark">마케팅천재</strong>
          </a>
          <nav className="oc-footer-links" aria-label="주요 메뉴">
            {PRIMARY_LINKS.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
          </nav>
        </div>

        <div className="oc-footer-mid">
          <nav className="oc-footer-legal" aria-label="법적 고지 및 안내">
            {LEGAL_LINKS.map((l, i) => (
              <span key={l.label} className="oc-footer-legal-item">
                <a href={l.href} className={l.strong ? 'is-strong' : undefined}>{l.label}</a>
                {i < LEGAL_LINKS.length - 1 && <span aria-hidden className="oc-footer-sep">·</span>}
              </span>
            ))}
          </nav>
        </div>

        <div className="oc-footer-biz">
          <div>
            <strong>(주)마케팅천재</strong>
            <span>대표 · 운영 시점에 공지</span>
            <span>사업자등록번호 · 운영 시점에 공지</span>
            <span>통신판매업 신고번호 · 운영 시점에 공지</span>
          </div>
          <div>
            <span>주소 · 서울특별시 강남구 (운영 시점에 정확한 주소 공지)</span>
            <span>고객센터 · <a href="mailto:help@mcy.co.kr">help@mcy.co.kr</a> (평일 10:00–19:00)</span>
            <span>제휴문의 · <a href="mailto:biz@mcy.co.kr">biz@mcy.co.kr</a></span>
          </div>
        </div>

        <div className="oc-footer-bottom">
          <span>© 2026 마케팅천재(MCY). All rights reserved.</span>
          <span className="oc-footer-note">
            마케팅천재는 광고주-대행사 간 중개 플랫폼으로, 개별 계약의 당사자가 아닙니다.
            이메일 무단수집을 거부하며 위반 시 정보통신망법에 의해 처벌됩니다.
          </span>
        </div>
      </div>
    </footer>
  )
}
