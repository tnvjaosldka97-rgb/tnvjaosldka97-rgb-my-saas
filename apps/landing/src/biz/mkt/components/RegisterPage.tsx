import { useState } from 'react'
import type { MarketUserType } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import '../../../landing-page.css'

export function RegisterPage() {
  const { register } = useAuth()
  const initialType: MarketUserType = (() => {
    try {
      const q = new URLSearchParams(window.location.search).get('as')
      return q === 'agency' ? 'agency' : 'advertiser'
    } catch { return 'advertiser' }
  })()
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    userType: initialType,
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        userType: form.userType,
        phone: form.phone || undefined,
      })
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : '가입 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-auth-main">
        <div className="oc-container oc-auth-wrap">
          <div className="oc-auth-card">
            <h1>회원가입</h1>
            <p className="oc-auth-sub">광고주 혹은 대행사 계정을 만들어보세요.</p>

            <form onSubmit={onSubmit} className="oc-auth-form">
              <div className="oc-role-toggle" role="radiogroup" aria-label="회원 유형">
                {(['advertiser', 'agency'] as MarketUserType[]).map((t) => (
                  <label key={t} className={`oc-role-option${form.userType === t ? ' is-active' : ''}`}>
                    <input type="radio" name="userType" value={t}
                      checked={form.userType === t}
                      onChange={() => setForm((f) => ({ ...f, userType: t }))} />
                    <strong>{t === 'advertiser' ? '광고주' : '대행사'}</strong>
                    <span>{t === 'advertiser' ? '프로젝트를 등록하고 견적을 받습니다.' : '프로젝트에 견적을 제출합니다.'}</span>
                  </label>
                ))}
              </div>

              <label className="oc-field">
                <span>이름 / 대표명</span>
                <input type="text" required minLength={2} maxLength={60} className="oc-input" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <label className="oc-field">
                <span>이메일</span>
                <input type="email" required className="oc-input" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} autoComplete="email" />
              </label>
              <label className="oc-field">
                <span>비밀번호 (8자 이상)</span>
                <input type="password" required minLength={8} maxLength={72} className="oc-input" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoComplete="new-password" />
              </label>
              <label className="oc-field">
                <span>전화번호 (선택)</span>
                <input type="tel" inputMode="tel" className="oc-input" value={form.phone}
                  placeholder="010-0000-0000"
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </label>

              {error && <div className="oc-auth-error" role="alert">{error}</div>}

              <button type="submit" className="oc-btn oc-btn-primary oc-btn-lg oc-btn-block" disabled={submitting}>
                {submitting ? '가입 중…' : '가입하고 시작하기'}
              </button>
            </form>

            <div className="oc-auth-footer">
              이미 계정이 있으신가요? <a href="/login">로그인</a>
            </div>
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
