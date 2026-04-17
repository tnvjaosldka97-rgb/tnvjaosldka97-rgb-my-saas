const LINKS = [
  { label: '견적 비교하기', href: '#market' },
  { label: '비교중인 마케팅', href: '#market' },
  { label: '이용 가이드', href: '#guide' },
  { label: '제휴 문의', href: '#partner' },
  { label: '로그인 / 가입', href: '#login' },
]

export function LPFooter() {
  return (
    <footer className="oc-footer">
      <div className="oc-container">
        <div className="oc-footer-top">
          <a href="#top" className="oc-logo" style={{ color: 'white' }}>
            <span className="oc-logo-mark">OC</span>
            <span>OnlyUp Compare</span>
          </a>
          <nav className="oc-footer-links" aria-label="바닥글 메뉴">
            {LINKS.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
          </nav>
        </div>
        <div className="oc-footer-bottom">
          <span>© 2026 OnlyUp Compare. All rights reserved.</span>
          <span>사업자 정보 및 통신판매업 신고번호는 운영 시점에 게시됩니다.</span>
        </div>
      </div>
    </footer>
  )
}
