import { useState } from 'react'
import { apiFetch } from '../com/api/client'
import { useToast } from '../com/ui/Toast'

const INDUSTRIES = ['외식', '병원', '뷰티', '학원', '커머스', '서비스', '기타'] as const
const MARKETING_TYPES = ['SNS마케팅', '플레이스마케팅', '블로그마케팅', '인플루언서', '리뷰관리', 'SA/DA', 'SEO'] as const
const BUDGETS = ['월 100만원 이하', '월 100~300만원', '월 300~500만원', '월 500만원 이상', '아직 정하지 못함'] as const

const BENEFITS = [
  { icon: '⚡', title: '평균 28시간 안에 견적', desc: '검증 대행사 3~5곳이 자동으로 응답합니다.' },
  { icon: '🛡', title: '검증된 대행사만 참여', desc: '사업자 등록·실적·리뷰를 통과한 대행사만 지원 가능.' },
  { icon: '💸', title: '100% 무료', desc: '광고주는 수수료 없이 견적을 받고 비교할 수 있습니다.' },
]

type FormState = {
  requesterName: string
  industry: string
  marketing: (typeof MARKETING_TYPES)[number] | ''
  budget: string
  contact: string
  message: string
}

const INITIAL: FormState = {
  requesterName: '',
  industry: '',
  marketing: '',
  budget: '',
  contact: '',
  message: '',
}

export function LPLeadStart() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const toast = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'submitting') return

    // 클라이언트 측 검증 — 빈 필드가 서버까지 가서 ZodError 뜨는 것을 미리 차단
    const missing: string[] = []
    if (!form.requesterName.trim()) missing.push('성함 또는 회사명')
    if (!form.industry) missing.push('업종')
    if (!form.marketing) missing.push('원하는 마케팅')
    if (!form.budget) missing.push('월 예산')
    const contactDigits = form.contact.replace(/\D/g, '').length
    if (!form.contact.trim()) missing.push('연락처')

    if (missing.length > 0) {
      const msg = `${missing[0]}을(를) 입력해주세요.`
      setErrorMessage(msg)
      setState('error')
      toast.error(msg)
      return
    }
    if (contactDigits < 9) {
      const msg = '연락처를 010-0000-0000 형식으로 입력해주세요.'
      setErrorMessage(msg)
      setState('error')
      toast.error(msg)
      return
    }

    setState('submitting')
    setErrorMessage(null)
    try {
      await apiFetch('/api/public/project-drafts', {
        method: 'POST',
        body: JSON.stringify({
          requesterName: form.requesterName.trim(),
          requesterContact: form.contact.trim(),
          industry: form.industry,
          marketingType: form.marketing,
          budgetRange: form.budget,
          message: form.message.trim() || '',
        }),
      })
      setState('done')
      toast.success('프로젝트 초안이 접수되었습니다. 운영팀 검토 후 24시간 내 공개됩니다.')
    } catch (err) {
      const raw = err instanceof Error ? err.message : '전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
      // 서버 ZodError 응답일 때 이용자에게 친숙하게 변환
      const friendly = raw.includes('ZodError')
        ? '입력값을 다시 확인해주세요. 업종·마케팅 유형·예산·연락처·성함이 모두 필요합니다.'
        : raw
      setErrorMessage(friendly)
      setState('error')
      toast.error(friendly)
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

          <div className="oc-lead-trust">
            운영팀이 직접 검토해 부적격 의뢰는 공개되지 않습니다.
            <br />
            <small>접수 → 운영팀 검토 → 공개 (평균 6~12시간)</small>
          </div>
        </div>

        <form className="oc-lead-form" onSubmit={onSubmit} aria-label="프로젝트 간편 등록" noValidate>
          {done ? (
            <div className="oc-lead-done" role="status" aria-live="polite">
              <span className="oc-lead-done-icon" aria-hidden>✅</span>
              <h3>접수 완료</h3>
              <p>운영팀이 검토 후 24시간 내로 프로젝트를 공개하고,<br />연락처로 진행 상황을 안내해드립니다.</p>
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
                <span>성함 또는 회사명</span>
                <input
                  required
                  type="text"
                  placeholder="예: 김정우 대표 / (주)온리업"
                  value={form.requesterName}
                  onChange={(e) => setForm((f) => ({ ...f, requesterName: e.target.value }))}
                  className="oc-input"
                  minLength={2}
                  maxLength={40}
                  autoComplete="name"
                />
              </label>

              <div className="oc-form-row">
                <label className="oc-field">
                  <span>업종</span>
                  <select
                    required
                    value={form.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    className="oc-select"
                  >
                    <option value="">업종 선택</option>
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
                  >
                    <option value="">유형 선택</option>
                    {MARKETING_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </label>
              </div>

              <label className="oc-field">
                <span>월 예산</span>
                <select
                  required
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  className="oc-select"
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

              <label className="oc-field">
                <span>상세 요청사항 (선택)</span>
                <textarea
                  className="oc-input oc-textarea"
                  rows={3}
                  maxLength={800}
                  placeholder="예산 외 특별한 조건이나 목표가 있다면 적어주세요. (선택 입력)"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
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
                {submitting ? '전송 중…' : '프로젝트 접수하기 →'}
              </button>
              <p className="oc-lead-note">가입이나 결제 없이 운영팀이 직접 검토해드립니다.</p>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
