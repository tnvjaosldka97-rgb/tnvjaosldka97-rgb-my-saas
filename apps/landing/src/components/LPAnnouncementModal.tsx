import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'onlyup_ann_dismissed_until'
const DAY_MS = 24 * 60 * 60 * 1000
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function LPAnnouncementModal() {
  const [open, setOpen] = useState(false)
  const [skip, setSkip] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    if (skip) {
      try { localStorage.setItem(STORAGE_KEY, String(Date.now() + DAY_MS)) } catch { /* noop */ }
    }
    setOpen(false)
  }, [skip])

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
      if (Date.now() < until) return
    } catch {
      // localStorage 접근 실패해도 열기
    }

    // 트리거: 페이지 스크롤 65% 도달 or 16초 경과 (둘 중 먼저) — 즉시 팝업 안티패턴 회피
    let triggered = false
    const trigger = () => {
      if (triggered) return
      triggered = true
      setOpen(true)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return
      const ratio = window.scrollY / total
      if (ratio >= 0.65) trigger()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const t = setTimeout(trigger, 16000)
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  if (!open) return null

  return (
    <div
      className="oc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oc-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="oc-modal" ref={modalRef}>
        <button type="button" ref={closeBtnRef} className="oc-modal-close" onClick={close} aria-label="닫기">×</button>
        <div className="oc-modal-emoji" aria-hidden>🎁</div>
        <h3 id="oc-modal-title">이번 주 신규 광고주 혜택</h3>
        <p>
          첫 프로젝트 등록 시, 운영팀이 <b>무료 매칭 컨설팅</b>을 도와드립니다.
          어떤 대행사가 우리 업종에 맞는지 30분 통화로 먼저 진단받으세요.
        </p>
        <div className="oc-modal-row">
          <label className="oc-modal-skip">
            <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} />
            24시간 동안 보지 않기
          </label>
          <a href="#lead-start" className="oc-btn oc-btn-primary" onClick={close}>혜택 확인하기</a>
        </div>
      </div>
    </div>
  )
}
