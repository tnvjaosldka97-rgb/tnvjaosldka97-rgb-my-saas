import { useEffect, useRef, useState } from 'react'
import type { ApplicantDetail } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

type Props = {
  projectId: number
  projectTitle: string
  /** 외부에서 후보를 미리 알고 있으면 전달. 없으면 내부에서 서버 조회 */
  agencies?: Array<{ id: number; name: string }>
  onClose: () => void
  onSuccess?: () => void
}

type Candidate = { id: number; name: string }

export function ReviewModal({ projectId, projectTitle, agencies, onClose, onSuccess }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>(agencies ?? [])
  const [loadingCandidates, setLoadingCandidates] = useState(!agencies || agencies.length === 0)
  const [agencyUserId, setAgencyUserId] = useState<number>(agencies?.[0]?.id ?? 0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // 외부 전달 agencies가 비어있으면 서버에서 selected 파트너 조회
  useEffect(() => {
    if (candidates.length > 0) return
    let mounted = true
    setLoadingCandidates(true)
    apiFetch<{ applicants: ApplicantDetail[] }>(`/api/market/projects/${projectId}/applicants`, {
      credentials: 'include',
    })
      .then((r) => {
        if (!mounted) return
        const selected = r.applicants
          .filter((a) => a.status === 'selected')
          .map((a) => ({ id: a.agencyUserId, name: a.userName }))
        setCandidates(selected)
        setAgencyUserId(selected[0]?.id ?? 0)
      })
      .catch(() => { /* ignore */ })
      .finally(() => { if (mounted) setLoadingCandidates(false) })
    return () => { mounted = false }
  }, [projectId, candidates.length])

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

        {loadingCandidates ? (
          <div className="oc-grid-empty">선정된 파트너 불러오는 중…</div>
        ) : candidates.length === 0 ? (
          <div className="oc-auth-error" role="alert">
            이 프로젝트에서 선정된 파트너를 찾지 못했습니다. 지원자 관리에서 파트너를 먼저 선정해주세요.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="oc-auth-form">
            <label className="oc-field">
              <span>리뷰할 파트너</span>
              {candidates.length === 1 ? (
                <input type="text" readOnly className="oc-input" value={candidates[0].name} />
              ) : (
                <select className="oc-select" value={agencyUserId}
                  onChange={(e) => setAgencyUserId(Number.parseInt(e.target.value, 10))}>
                  {candidates.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
            </label>

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
        )}
      </div>
    </div>
  )
}
