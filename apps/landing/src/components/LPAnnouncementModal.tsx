import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'onlyup_ann_dismissed_until'
const DAY_MS = 24 * 60 * 60 * 1000

export function LPAnnouncementModal() {
  const [open, setOpen] = useState(false)
  const [skip, setSkip] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
      if (Date.now() < until) return
    } catch {
      // localStorage 접근 실패해도 열기
    }
    const t = setTimeout(() => setOpen(true), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function close() {
    if (skip) {
      try { localStorage.setItem(STORAGE_KEY, String(Date.now() + DAY_MS)) } catch {}
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="oc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oc-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="oc-modal">
        <button type="button" ref={closeBtnRef} className="oc-modal-close" onClick={close} aria-label="닫기">×</button>
        <div className="oc-modal-emoji" aria-hidden>🛡</div>
        <h3 id="oc-modal-title">이번 달 신규 보증 가입 50% 마감</h3>
        <p>
          Pro Shield 월정액을 2개월 무료로 제공하는 프로모션이 진행 중입니다.
          선착순 140건 중 <b>68건 남았습니다.</b>
        </p>
        <div className="oc-modal-row">
          <label className="oc-modal-skip">
            <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} />
            24시간 동안 보지 않기
          </label>
          <a href="#pricing" className="oc-btn oc-btn-primary" onClick={close}>혜택 확인하기</a>
        </div>
      </div>
    </div>
  )
}
