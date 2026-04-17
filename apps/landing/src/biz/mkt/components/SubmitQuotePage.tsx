import { useEffect, useState } from 'react'
import type { MarketAgency, CreateQuoteInput } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { apiFetch } from '../../../com/api/client'
import '../../../landing-page.css'

// 프런트에서 대행사 목록을 별도로 갖고 오지 않고, 상세 응답의 quotes에서 agency 목록을 추리기 어렵기 때문에
// 가장 간단하게 사용자가 직접 대행사 ID를 입력하거나(임시) 기존 quotes 기반으로 선택한다.
// MVP: 기존 견적 기반 목록에서 이미 제출한 대행사가 있으면 해당 대행사 이름을 표시. 없으면 수동 입력.

export function SubmitQuotePage({ id }: { id: number }) {
  const { user, loading: authLoading } = useAuth()
  const { data, loading, error } = useProjectDetail(id)

  const [form, setForm] = useState<CreateQuoteInput & { agencyId: string }>({
    agencyId: '',
    priceMin: 0,
    priceMax: null,
    timelineMonths: 3,
    description: '',
    strength: '',
  })
  const [priceMinStr, setPriceMinStr] = useState('')
  const [priceMaxStr, setPriceMaxStr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/login'
  }, [authLoading, user])

  const knownAgencies: MarketAgency[] = data?.quotes.map((q) => q.agency) ?? []
  const uniqueAgencies = Array.from(new Map(knownAgencies.map((a) => [a.id, a])).values())

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const agencyId = Number.parseInt(form.agencyId, 10)
    const priceMin = Number.parseInt(priceMinStr, 10)
    const priceMax = priceMaxStr ? Number.parseInt(priceMaxStr, 10) : null
    if (!Number.isFinite(agencyId) || agencyId <= 0) {
      setSubmitError('대행사를 선택해주세요.')
      return
    }
    if (!Number.isFinite(priceMin) || priceMin <= 0) {
      setSubmitError('최소 가격을 입력해주세요.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await apiFetch(`/api/market/projects/${id}/quotes`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          agencyId,
          priceMin,
          priceMax,
          timelineMonths: form.timelineMonths,
          description: form.description,
          strength: form.strength || undefined,
        }),
      })
      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-auth-main"><div className="oc-container"><div className="oc-detail-skeleton">불러오는 중…</div></div></main>
        <LPFooter />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-auth-main"><div className="oc-container"><div className="oc-detail-error">{error ?? '프로젝트를 찾을 수 없습니다.'}</div></div></main>
        <LPFooter />
      </div>
    )
  }

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-auth-main">
        <div className="oc-container oc-auth-wrap">
          <div className="oc-auth-card oc-auth-card-wide">
            <a href={`/project/${id}`} className="oc-back-link">← 프로젝트로</a>
            <h1>견적 제출</h1>
            <div className="oc-detail-body" style={{ boxShadow: 'none', marginTop: 12 }}>
              <h2>{data.project.title}</h2>
              <p style={{ margin: 0 }}>업종 {data.project.industry} · 지원자 {data.project.applicantCount}팀 · 예산 {data.project.budgetMin.toLocaleString('ko-KR')}만원{data.project.budgetMax ? ` ~ ${data.project.budgetMax.toLocaleString('ko-KR')}만원` : ' ~'}</p>
            </div>

            {done ? (
              <div className="oc-lead-done">
                <span className="oc-lead-done-icon" aria-hidden>✅</span>
                <h3>견적이 제출되었습니다</h3>
                <p>광고주가 견적을 검토한 뒤 연락드립니다.</p>
                <div className="oc-form-actions">
                  <a href="/dashboard" className="oc-btn oc-btn-text">대시보드</a>
                  <a href={`/project/${id}`} className="oc-btn oc-btn-primary">프로젝트로</a>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="oc-auth-form">
                <label className="oc-field">
                  <span>대행사 선택</span>
                  {uniqueAgencies.length > 0 ? (
                    <select required className="oc-select" value={form.agencyId}
                      onChange={(e) => setForm((f) => ({ ...f, agencyId: e.target.value }))}>
                      <option value="">선택</option>
                      {uniqueAgencies.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} (평점 {a.rating.toFixed(1)})</option>
                      ))}
                    </select>
                  ) : (
                    <input type="number" required min={1} className="oc-input"
                      placeholder="대행사 ID (예: 1)"
                      value={form.agencyId}
                      onChange={(e) => setForm((f) => ({ ...f, agencyId: e.target.value }))} />
                  )}
                </label>

                <div className="oc-form-row">
                  <label className="oc-field">
                    <span>최소 제시가 (만원)</span>
                    <input type="number" required min={1} className="oc-input"
                      value={priceMinStr} onChange={(e) => setPriceMinStr(e.target.value)} />
                  </label>
                  <label className="oc-field">
                    <span>최대 제시가 (만원, 선택)</span>
                    <input type="number" min={1} className="oc-input"
                      value={priceMaxStr} onChange={(e) => setPriceMaxStr(e.target.value)} />
                  </label>
                  <label className="oc-field">
                    <span>예상 기간 (개월)</span>
                    <input type="number" required min={0.5} step={0.5} max={60} className="oc-input"
                      value={form.timelineMonths}
                      onChange={(e) => setForm((f) => ({ ...f, timelineMonths: Number.parseFloat(e.target.value) || 0 }))} />
                  </label>
                </div>

                <label className="oc-field">
                  <span>제안 내용 (20~2000자)</span>
                  <textarea required minLength={20} maxLength={2000} rows={6} className="oc-input oc-textarea"
                    placeholder="어떤 방식으로 프로젝트를 수행할지 구체적으로 적어주세요."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                  <small className="oc-field-counter">{form.description.length} / 2000</small>
                </label>

                <label className="oc-field">
                  <span>주요 강점 (40자 이내, 선택)</span>
                  <input type="text" maxLength={40} className="oc-input"
                    placeholder="예: 외식 업종 48건 실적"
                    value={form.strength ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value }))} />
                </label>

                {submitError && <div className="oc-auth-error" role="alert">{submitError}</div>}

                <div className="oc-form-actions">
                  <a href={`/project/${id}`} className="oc-btn oc-btn-text">취소</a>
                  <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg" disabled={submitting}>
                    {submitting ? '제출 중…' : '견적 제출'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
