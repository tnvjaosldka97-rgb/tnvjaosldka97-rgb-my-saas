import { useEffect, useState } from 'react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../../../com/api/client'
import { useToast } from '../../../com/ui/Toast'
import '../../../landing-page.css'

type OAuthStatus = { kakao: boolean; naver: boolean }

export function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oauth, setOauth] = useState<OAuthStatus>({ kakao: false, naver: false })

  useEffect(() => {
    apiFetch<OAuthStatus>('/api/mau/oauth/status').then(setOauth).catch(() => {})
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ email, password })
      window.location.href = '/dashboard'
    } catch (err) {
      const status = (err as { status?: number } | null)?.status
      if (status === 401 || status === 400) {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.')
      } else if (status === 429) {
        setError('로그인 시도가 너무 많습니다. 1분 뒤 다시 시도해주세요.')
      } else if (status && status >= 500) {
        setError('일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function social(provider: 'kakao' | 'naver') {
    if (!oauth[provider]) {
      const label = provider === 'kakao' ? '카카오' : '네이버'
      toast.info(`${label} 로그인은 준비 중입니다. 이메일로 가입해주세요.`)
      // 이메일 입력 포커스
      setTimeout(() => {
        const emailEl = document.querySelector<HTMLInputElement>('input[type="email"]')
        emailEl?.focus()
      }, 60)
      return
    }
    window.location.href = `/api/mau/oauth/${provider}`
  }

  const canSubmit = email.length >= 5 && password.length >= 8 && !submitting

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-auth-main">
        <div className="oc-container oc-auth-wrap">
          <div className="oc-auth-card">
            <div className="oc-social-stack">
              <button type="button" className="oc-social-btn oc-social-kakao" onClick={() => social('kakao')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 3C6.48 3 2 6.55 2 10.9c0 2.87 1.94 5.39 4.82 6.82-.15.52-.96 3.3-1 3.54 0 0-.02.18.1.24.12.06.25.02.25.02.34-.05 3.93-2.57 4.55-3 .42.06.85.09 1.28.09 5.52 0 10-3.55 10-7.9C22 6.55 17.52 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </button>
              <button type="button" className="oc-social-btn oc-social-naver" onClick={() => social('naver')}>
                <span className="oc-social-n" aria-hidden>N</span>
                네이버로 시작하기
              </button>
            </div>

            <div className="oc-divider"><span>또는</span></div>

            <div className="oc-brand-stack">
              <span className="oc-brand-sub">광고대행사 매칭 플랫폼</span>
              <span className="oc-brand-main">마케팅천재야</span>
            </div>

            <form onSubmit={onSubmit} className="oc-auth-form">
              <label className="oc-field">
                <span>아이디 (이메일)</span>
                <input type="email" required className={`oc-input ${error ? 'is-error' : ''}`}
                  placeholder="아이디를 입력해주세요"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              <label className="oc-field">
                <span>비밀번호</span>
                <input type="password" required minLength={8} className={`oc-input ${error ? 'is-error' : ''}`}
                  placeholder="비밀번호를 입력해주세요"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </label>

              {error && <div className="oc-auth-error" role="alert">{error}</div>}

              <button type="submit" className={`oc-btn oc-btn-primary-blue oc-btn-block oc-btn-lg${!canSubmit ? ' is-disabled' : ''}`} disabled={!canSubmit}>
                {submitting ? '로그인 중…' : '로그인하기'}
              </button>

              <div className="oc-auth-footer">
                <a href="/pages/contact">비밀번호 문의</a>
                <span className="oc-auth-footer-sep">·</span>
                <a href="/register">회원가입</a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
