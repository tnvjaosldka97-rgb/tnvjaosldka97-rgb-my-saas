import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../../com/api/client'

type Props = {
  projectId: number
  agencyId?: number | null
  agencyName?: string
  projectTitle: string
  onClose: () => void
}

const TIMES = [
  { v: 'any' as const, label: '아무 때나' },
  { v: 'morning' as const, label: '오전' },
  { v: 'afternoon' as const, label: '오후' },
  { v: 'evening' as const, label: '저녁' },
]

export function ConsultationModal({ projectId, agencyId, agencyName, projectTitle, onClose }: Props) {
  const [form, setForm] = useState({
    requesterName: '',
    requesterContact: '',
    message: '',
    preferredTime: 'any' as (typeof TIMES)[number]['v'],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeBtnRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch('/api/public/consultations', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          agencyId: agencyId ?? null,
          requesterName: form.requesterName,
          requesterContact: form.requesterContact,
          message: form.message,
          preferredTime: form.preferredTime,
        }),
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="oc-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="oc-consult-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="oc-modal oc-consult-modal">
        <button type="button" ref={closeBtnRef} className="oc-modal-close" onClick={onClose} aria-label="닫기">×</button>
        {done ? (
          <div className="oc-lead-done">
            <span className="oc-lead-done-icon" aria-hidden>✅</span>
            <h3 id="oc-consult-title">상담 신청 완료</h3>
            <p>대행사가 곧 연락드립니다. 선호 시간대 내에 연결해드릴게요.</p>
            <button type="button" className="oc-btn oc-btn-primary" onClick={onClose}>확인</button>
          </div>
        ) : (
          <>
            <h3 id="oc-consult-title">상담 신청</h3>
            <p className="oc-consult-target">
              <strong>{projectTitle}</strong>
              {agencyName && <span> · {agencyName}</span>}
            </p>

            <form onSubmit={onSubmit} className="oc-auth-form">
              <label className="oc-field">
                <span>이름</span>
                <input type="text" required minLength={2} maxLength={40} className="oc-input"
                  value={form.requesterName}
                  onChange={(e) => setForm((f) => ({ ...f, requesterName: e.target.value }))} />
              </label>
              <label className="oc-field">
                <span>연락처 (이메일 또는 전화번호)</span>
                <input type="text" required minLength={6} maxLength={60} className="oc-input"
                  value={form.requesterContact}
                  onChange={(e) => setForm((f) => ({ ...f, requesterContact: e.target.value }))} />
              </label>
              <label className="oc-field">
                <span>상담 내용 (20~500자)</span>
                <textarea required minLength={20} maxLength={500} rows={4} className="oc-input oc-textarea"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                <small className="oc-field-counter">{form.message.length} / 500</small>
              </label>
              <div className="oc-field">
                <span>선호 연락 시간</span>
                <div className="oc-radio-row">
                  {TIMES.map((t) => (
                    <label key={t.v} className={`oc-radio-chip${form.preferredTime === t.v ? ' is-active' : ''}`}>
                      <input type="radio" name="preferredTime" value={t.v}
                        checked={form.preferredTime === t.v}
                        onChange={() => setForm((f) => ({ ...f, preferredTime: t.v }))} />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className="oc-auth-error" role="alert">{error}</div>}

              <div className="oc-modal-row">
                <button type="button" className="oc-btn oc-btn-text" onClick={onClose}>취소</button>
                <button type="submit" className="oc-btn oc-btn-primary" disabled={submitting}>
                  {submitting ? '제출 중…' : '상담 신청'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
