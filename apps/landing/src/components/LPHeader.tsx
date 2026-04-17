import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../biz/mkt/hooks/useAuth'
import { useNotifications } from '../biz/mkt/hooks/useNotifications'

type NavItem = { href: string; label: string; matcher: (path: string, hash: string) => boolean }

const NAV: NavItem[] = [
  { href: '/quotes/compare', label: '견적 비교하기', matcher: (p) => p.startsWith('/quotes') },
  { href: '/#market', label: '비교중인 마케팅', matcher: (p, h) => p === '/' && h === '#market' },
  { href: '/#guide', label: '이용안내', matcher: (p, h) => p === '/' && h === '#guide' },
  { href: '/pages/features', label: '더보기', matcher: (p) => p.startsWith('/pages') },
]

export function LPHeader() {
  const [open, setOpen] = useState(false)
  const [pathHash, setPathHash] = useState({ path: '/', hash: '' })
  const { user, loading, logout } = useAuth()
  const noti = useNotifications(Boolean(user))
  const [notiOpen, setNotiOpen] = useState(false)
  const notiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => setPathHash({ path: window.location.pathname, hash: window.location.hash })
    update()
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    return () => {
      window.removeEventListener('hashchange', update)
      window.removeEventListener('popstate', update)
    }
  }, [])

  useEffect(() => {
    if (!notiOpen) return
    const onClick = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [notiOpen])

  return (
    <header className="oc-header">
      <div className="oc-container oc-header-inner">
        <a href="/" className="oc-logo" aria-label="마케팅천재야 홈">
          <strong className="oc-logo-wordmark">마케팅천재야</strong>
        </a>

        <nav className="oc-nav" aria-label="주요 메뉴">
          {NAV.map((item) => {
            const active = item.matcher(pathHash.path, pathHash.hash)
            return (
              <a
                key={item.label}
                href={item.href}
                className={active ? 'is-active' : undefined}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </a>
            )
          })}
          <a href="/#lead-start" className="oc-nav-pill">
            <span className="oc-nav-pill-dot" aria-hidden />프로젝트 알림
          </a>
        </nav>

        <div className="oc-header-cta-group">
          <a href="/search" className="oc-header-search" aria-label="전체 검색">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </a>
          {!loading && user ? (
            <>
              <div className="oc-noti-wrap" ref={notiRef}>
                <button type="button" className="oc-noti-bell" aria-label="알림" aria-expanded={notiOpen}
                  onClick={() => {
                    setNotiOpen((v) => !v)
                    if (!notiOpen && noti.unread > 0) void noti.markAllRead()
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                  </svg>
                  {noti.unread > 0 && <span className="oc-noti-dot" aria-label={`${noti.unread}개 안읽음`}>{noti.unread > 9 ? '9+' : noti.unread}</span>}
                </button>
                {notiOpen && (
                  <div className="oc-noti-dropdown" role="menu">
                    <div className="oc-noti-head">
                      <strong>알림</strong>
                      {noti.items.length > 0 && <button type="button" className="oc-noti-clear" onClick={() => void noti.markAllRead()}>모두 읽음</button>}
                    </div>
                    {noti.loading && <div className="oc-noti-empty">불러오는 중…</div>}
                    {!noti.loading && noti.items.length === 0 && (
                      <div className="oc-noti-empty">아직 알림이 없습니다.</div>
                    )}
                    <ul className="oc-noti-list">
                      {noti.items.slice(0, 8).map((n) => (
                        <li key={n.id} className={`oc-noti-item${!n.readAt ? ' is-unread' : ''}`}>
                          <a href={n.link ?? '#'}>
                            <strong>{n.title}</strong>
                            {n.body && <span>{n.body}</span>}
                            <time>{new Date(n.createdAt).toLocaleString('ko-KR')}</time>
                          </a>
                        </li>
                      ))}
                    </ul>
                    {noti.items.length > 0 && (
                      <a href="/notifications" className="oc-noti-footer">전체 알림 보기 →</a>
                    )}
                  </div>
                )}
              </div>
              <a href="/dashboard" className="oc-btn-text">{user.name}님</a>
              <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" onClick={() => { void logout().then(() => { window.location.href = '/' }) }}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="oc-btn oc-btn-primary-blue oc-btn-sm">로그인 / 회원가입</a>
              <a href="/#partner" className="oc-btn oc-btn-outline oc-btn-sm">제휴문의</a>
            </>
          )}
          <button
            type="button"
            className="oc-hamburger"
            aria-label="메뉴 열기"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {open && (
        <div className="oc-container oc-mobile-drawer">
          <a href="/search" onClick={() => setOpen(false)}>🔍 전체 검색</a>
          {NAV.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <a href="/#lead-start" onClick={() => setOpen(false)}>프로젝트 접수</a>
          {user ? (
            <>
              <a href="/dashboard" onClick={() => setOpen(false)}>대시보드 · {user.name}님</a>
              <a href="/notifications" onClick={() => setOpen(false)}>알림 {noti.unread > 0 && <span className="oc-drawer-badge">{noti.unread}</span>}</a>
              <button type="button" onClick={() => { void logout().then(() => { window.location.href = '/' }) }} className="oc-drawer-logout">로그아웃</button>
            </>
          ) : (
            <a href="/login" onClick={() => setOpen(false)}>로그인 / 회원가입</a>
          )}
        </div>
      )}
    </header>
  )
}
