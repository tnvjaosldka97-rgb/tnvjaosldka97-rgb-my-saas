import { useState } from 'react'

const INDUSTRIES = ['외식', '병원', '뷰티', '학원', '커머스', '서비스', '기타'] as const
const MARKETING_TYPES = ['SNS마케팅', '플레이스마케팅', '블로그마케팅', '인플루언서', '리뷰관리', 'SA/DA', 'SEO'] as const
const BUDGETS = ['월 100만원 이하', '월 100~300만원', '월 300~500만원', '월 500만원 이상', '아직 정하지 못함'] as const

const BENEFITS = [
  { icon: '⚡', title: '평균 28시간 안에 견적', desc: '검증 대행사 3~5곳이 자동으로 응답합니다.' },
  { icon: '🛡', title: '검증된 대행사만 참여', desc: '사업자 등록·실적·리뷰를 통과한 대행사만 지원 가능.' },
  { icon: '💸', title: '100% 무료', desc: '광고주는 수수료 없이 견적을 받고 비교할 수 있습니다.' },
]

export function LPLeadStart() {
  const [form, setForm] = useState({
    industry: '',
    marketing: '' as (typeof MARKETING_TYPES)[number] | '',
    budget: '',
    contact: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

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

        <form className="oc-lead-form" onSubmit={onSubmit} aria-label="프로젝트 간편 등록">
          {submitted ? (
            <div className="oc-lead-done" role="status">
              <span className="oc-lead-done-icon" aria-hidden>✅</span>
              <h3>접수 완료</h3>
              <p>담당자가 확인 후 24시간 이내에 연락드립니다.</p>
              <button type="button" className="oc-btn oc-btn-text" onClick={() => { setSubmitted(false); setForm({ industry: '', marketing: '', budget: '', contact: '' }) }}>
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
                <select required value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className="oc-select">
                  <option value="">업종을 선택하세요</option>
                  {INDUSTRIES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>

              <label className="oc-field">
                <span>원하는 마케팅</span>
                <select required value={form.marketing} onChange={(e) => setForm((f) => ({ ...f, marketing: e.target.value as typeof form.marketing }))} className="oc-select">
                  <option value="">마케팅 유형을 선택하세요</option>
                  {MARKETING_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>

              <label className="oc-field">
                <span>월 예산</span>
                <select required value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} className="oc-select">
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
                  placeholder="010-0000-0000"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  className="oc-input"
                />
              </label>

              <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg oc-btn-block">
                견적 받기 →
              </button>
              <p className="oc-lead-note">가입이나 결제 없이 견적만 확인할 수 있습니다.</p>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
