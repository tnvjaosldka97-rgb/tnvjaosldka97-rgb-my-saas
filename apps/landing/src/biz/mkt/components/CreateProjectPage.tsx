import { useEffect, useState } from 'react'
import type { BudgetType, CreateProjectInput } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../../../com/api/client'
import '../../../landing-page.css'

const INDUSTRIES = ['외식', '병원', '뷰티', '학원', '커머스', '서비스', '기타'] as const
const MARKETING_TYPES = ['SNS마케팅', '플레이스마케팅', '블로그마케팅', '인플루언서', '리뷰관리', '성과형마케팅', 'SA/DA', 'SEO', '숏폼콘텐츠'] as const
const BUDGET_TYPES: { v: BudgetType; label: string }[] = [
  { v: 'monthly', label: '월 예산' },
  { v: 'range', label: '범위' },
  { v: 'fixed', label: '고정' },
]

export function CreateProjectPage() {
  const { user, loading } = useAuth()
  const [form, setForm] = useState({
    industry: '',
    title: '',
    description: '',
    marketingTypes: [] as string[],
    hashtags: '',
    budgetMin: '',
    budgetMax: '',
    budgetType: 'monthly' as BudgetType,
    timeline: '',
    daysLeft: '14',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login'
  }, [loading, user])

  function toggleMarketing(m: string) {
    setForm((f) => ({
      ...f,
      marketingTypes: f.marketingTypes.includes(m)
        ? f.marketingTypes.filter((x) => x !== m)
        : [...f.marketingTypes, m],
    }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.marketingTypes.length === 0) {
      setError('마케팅 유형을 1개 이상 선택해주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const input: CreateProjectInput = {
        industry: form.industry,
        title: form.title,
        description: form.description,
        marketingTypes: form.marketingTypes,
        hashtags: form.hashtags
          .split(/[\s,]+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10),
        budgetMin: Number.parseInt(form.budgetMin, 10),
        budgetMax: form.budgetMax ? Number.parseInt(form.budgetMax, 10) : null,
        budgetType: form.budgetType,
        timeline: form.timeline || undefined,
        daysLeft: form.daysLeft ? Number.parseInt(form.daysLeft, 10) : undefined,
        advertiserName: user?.name,
      }
      const res = await apiFetch<{ project: { id: number } }>('/api/market/projects', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(input),
      })
      window.location.href = `/project/${res.project.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-auth-main"><div className="oc-container"><div className="oc-detail-skeleton">인증 확인 중…</div></div></main>
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
            <a href="/dashboard" className="oc-back-link">← 대시보드로</a>
            <h1>새 프로젝트 등록</h1>
            <p className="oc-auth-sub">검증 대행사에게 견적을 받을 프로젝트를 등록합니다.</p>

            <form onSubmit={onSubmit} className="oc-auth-form">
              <label className="oc-field">
                <span>프로젝트 제목 (5~120자)</span>
                <input type="text" required minLength={5} maxLength={120} className="oc-input"
                  placeholder="예: 프리미엄 한우 전문점 · 종합 마케팅 6개월"
                  value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </label>

              <div className="oc-form-row">
                <label className="oc-field">
                  <span>업종</span>
                  <select required className="oc-select" value={form.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}>
                    <option value="">선택</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </label>
                <label className="oc-field">
                  <span>예상 기간</span>
                  <input type="text" className="oc-input" placeholder="예: 3개월"
                    value={form.timeline} onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))} />
                </label>
              </div>

              <label className="oc-field">
                <span>프로젝트 설명 (20~2000자)</span>
                <textarea required minLength={20} maxLength={2000} rows={6} className="oc-input oc-textarea"
                  placeholder="어떤 목표로 어떤 마케팅을 원하는지 구체적으로 적어주세요."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                <small className="oc-field-counter">{form.description.length} / 2000</small>
              </label>

              <div className="oc-field">
                <span>마케팅 유형 (중복 선택)</span>
                <div className="oc-chip-check">
                  {MARKETING_TYPES.map((m) => (
                    <label key={m} className={`oc-check-chip${form.marketingTypes.includes(m) ? ' is-active' : ''}`}>
                      <input type="checkbox" checked={form.marketingTypes.includes(m)} onChange={() => toggleMarketing(m)} />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              <label className="oc-field">
                <span>해시태그 (쉼표 또는 공백 구분, 최대 10개)</span>
                <input type="text" className="oc-input" placeholder="#카페침투 #리뷰관리 #SNS"
                  value={form.hashtags} onChange={(e) => setForm((f) => ({ ...f, hashtags: e.target.value }))} />
              </label>

              <div className="oc-form-row">
                <label className="oc-field">
                  <span>예산 유형</span>
                  <select required className="oc-select" value={form.budgetType}
                    onChange={(e) => setForm((f) => ({ ...f, budgetType: e.target.value as BudgetType }))}>
                    {BUDGET_TYPES.map((b) => <option key={b.v} value={b.v}>{b.label}</option>)}
                  </select>
                </label>
                <label className="oc-field">
                  <span>최소 예산 (만원)</span>
                  <input type="number" required min={1} className="oc-input"
                    value={form.budgetMin} onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))} />
                </label>
                <label className="oc-field">
                  <span>최대 예산 (만원, 선택)</span>
                  <input type="number" min={1} className="oc-input"
                    value={form.budgetMax} onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))} />
                </label>
              </div>

              <label className="oc-field">
                <span>모집 마감일까지 (일)</span>
                <input type="number" min={0} max={365} className="oc-input"
                  value={form.daysLeft} onChange={(e) => setForm((f) => ({ ...f, daysLeft: e.target.value }))} />
              </label>

              {error && <div className="oc-auth-error" role="alert">{error}</div>}

              <div className="oc-form-actions">
                <a href="/dashboard" className="oc-btn oc-btn-text">취소</a>
                <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg" disabled={submitting}>
                  {submitting ? '등록 중…' : '프로젝트 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
