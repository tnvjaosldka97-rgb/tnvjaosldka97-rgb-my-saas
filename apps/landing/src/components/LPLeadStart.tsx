import { useState } from 'react'
import { apiFetch } from '../com/api/client'

const INDUSTRIES = ['외식', '병원', '뷰티', '학원', '커머스', '서비스', '기타'] as const
const MARKETING_TYPES = ['SNS마케팅', '플레이스마케팅', '블로그마케팅', '인플루언서', '리뷰관리', 'SA/DA', 'SEO'] as const
const BUDGETS = ['월 100만원 이하', '월 100~300만원', '월 300~500만원', '월 500만원 이상', '아직 정하지 못함'] as const

const BENEFITS = [
  { icon: '⚡', title: '평균 28시간 안에 견적', desc: '검증 대행사 3~5곳이 자동으로 응답합니다.' },
  { icon: '🛡', title: '검증된 대행사만 참여', desc: '사업자 등록·실적·리뷰를 통과한 대행사만 지원 가능.' },
  { icon: '💸', title: '100% 무료', desc: '광고주는 수수료 없이 견적을 받고 비교할 수 있습니다.' },
]

type FormState = {
  industry: string
  marketing: (typeof MARKETING_TYPES)[number] | ''
  budget: string
  contact: string
}

const INITIAL: FormState = { industry: '', marketing: '', budget: '', contact: '' }

function syntheticLeadPayload(form: FormState) {
  const digits = form.contact.replace(/\D/g, '')
  const syntheticEmail = digits
    ? `p${digits}@pending.onlyup-compare.com`
    : 'lead@pending.onlyup-compare.com'
  const name = form.industry ? `간편 견적 — ${form.industry}` : '간편 견적 요청'
  const message =
    `[간편 견적 요청]\n` +
    `업종: ${form.industry || '-'}\n` +
    `마케팅 유형: ${form.marketing || '-'}\n` +
    `월 예산: ${form.budget || '-'}\n` +
    `연락처: ${form.contact || '-'}`
  return { name, email: syntheticEmail, company: form.industry || undefined, message }
}

export function LPLeadStart() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'submitting') return
    setState('submitting')
    setErrorMessage(null)
    try {
      await apiFetch('/api/public/leads', {
        method: 'POST',
        body: JSON.stringify(syntheticLeadPayload(form)),
      })
      setState('done')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '전송에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setState('error')
    }
  }

  function reset() {
    setForm(INITIAL)
    setState('idle')
    setErrorMessage(null)
  }

  const submitting = state === 'submitting'
  const done = state === 'done'

  return (
    <section id="lead-start" className="oc-section oc-section-alt">
      <div className="oc-container oc-lead-grid">
        <div className="oc-lead-info">
          <span className="oc-section-eyebrow">광고주 시작하기</span>
          <h2>1분만 투자하면, 경쟁 견적이 먼저 찾아옵니다.</h2>
          <p className="oc-section-sub">
            전화 돌리지 마세요. 검증 대행사가 당신의 조건을 보고 먼저 제안합니다.
          </p>

          <ul className="oc-benefits" aria-label="광고주 혜택">
            {BENEFITS.map((b) => (
              <li key={b.title} className="oc-benefit">
                <span className="oc-benefit-icon" aria-hidden>{b.icon}</span>
                <div>
                  <strong>{b.title}</strong>
                  <span>{b.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form className="oc-lead-form" onSubmit={onSubmit} aria-label="프로젝트 간편 등록" noValidate>
          {done ? (
            <div className="oc-lead-done" role="status" aria-live="polite">
              <span className="oc-lead-done-icon" aria-hidden>✅</span>
              <h3>접수 완료</h3>
              <p>담당자가 확인 후 24시간 이내에 연락드립니다.</p>
              <button type="button" className="oc-btn oc-btn-text" onClick={reset}>
                다시 등록하기
              </button>
            </div>
          ) : (
            <>
              <div className="oc-lead-form-head">
                <h3>프로젝트 1분 등록</h3>
                <span className="oc-free-chip">무료</span>
              </div>

              <label className="oc-field">
                <span>업종</span>
                <select
                  required
                  value={form.industry}
                  onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                  className="oc-select"
                  autoComplete="off"
                >
                  <option value="">업종을 선택하세요</option>
                  {INDUSTRIES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>

              <label className="oc-field">
                <span>원하는 마케팅</span>
                <select
                  required
                  value={form.marketing}
                  onChange={(e) => setForm((f) => ({ ...f, marketing: e.target.value as FormState['marketing'] }))}
                  className="oc-select"
                  autoComplete="off"
                >
                  <option value="">마케팅 유형을 선택하세요</option>
                  {MARKETING_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>

              <label className="oc-field">
                <span>월 예산</span>
                <select
                  required
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  className="oc-select"
                  autoComplete="off"
                >
                  <option value="">예산 범위를 선택하세요</option>
                  {BUDGETS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>

              <label className="oc-field">
                <span>연락처</span>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  className="oc-input"
                  minLength={9}
                  maxLength={20}
                />
              </label>

              {errorMessage && (
                <div className="oc-auth-error" role="alert">{errorMessage}</div>
              )}

              <button
                type="submit"
                className="oc-btn oc-btn-primary oc-btn-lg oc-btn-block"
                disabled={submitting}
              >
                {submitting ? '전송 중…' : '견적 받기 →'}
              </button>
              <p className="oc-lead-note">가입이나 결제 없이 견적만 확인할 수 있습니다.</p>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
