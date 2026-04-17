import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../../com/api/client'

type Props = {
  projectId: number
  projectTitle: string
  agencies: Array<{ id: number; name: string }>
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewModal({ projectId, projectTitle, agencies, onClose, onSuccess }: Props) {
  const [agencyUserId, setAgencyUserId] = useState(agencies[0]?.id ?? 0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
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
    if (!agencyUserId) { setError('리뷰 대상 파트너를 선택해주세요.'); return }
    if (comment.length < 5) { setError('리뷰는 5자 이상 작성해주세요.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch(`/api/market/projects/${projectId}/reviews`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ agencyUserId, rating, comment }),
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="oc-modal-backdrop" role="dialog" aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="oc-modal oc-review-modal">
        <button type="button" ref={closeRef} className="oc-modal-close" onClick={onClose} aria-label="닫기">×</button>
        <h3>리뷰 작성</h3>
        <p className="oc-consult-target">
          <strong>{projectTitle}</strong>
        </p>
        <form onSubmit={onSubmit} className="oc-auth-form">
          {agencies.length > 1 && (
            <label className="oc-field">
              <span>리뷰할 파트너</span>
              <select className="oc-select" value={agencyUserId}
                onChange={(e) => setAgencyUserId(Number.parseInt(e.target.value, 10))}>
                {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
          )}

          <div className="oc-field">
            <span>별점</span>
            <div className="oc-rating-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button"
                  className={`oc-rating-star${rating >= n ? ' is-on' : ''}`}
                  aria-label={`${n}점`}
                  onClick={() => setRating(n)}>★</button>
              ))}
              <strong>{rating}.0</strong>
            </div>
          </div>

          <label className="oc-field">
            <span>리뷰 내용 (5~500자)</span>
            <textarea required minLength={5} maxLength={500} rows={5} className="oc-input oc-textarea"
              value={comment} onChange={(e) => setComment(e.target.value)} />
            <small className="oc-field-counter">{comment.length} / 500</small>
          </label>

          {error && <div className="oc-auth-error" role="alert">{error}</div>}

          <div className="oc-modal-row">
            <button type="button" className="oc-btn oc-btn-text" onClick={onClose}>취소</button>
            <button type="submit" className="oc-btn oc-btn-primary" disabled={submitting}>
              {submitting ? '제출 중…' : '리뷰 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
