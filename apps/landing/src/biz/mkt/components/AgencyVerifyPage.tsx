import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ShieldCheck, Upload, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { apiFetch } from '../../../com/api/client'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../../../com/ui/Toast'
import { Skeleton } from '../../../com/ui/Skeleton'
import '../../../landing-page.css'

type Status = {
  status: 'none' | 'submitted' | 'approved' | 'rejected'
  submittedAt: string | null
  reviewedAt: string | null
  rejectReason: string | null
  businessRegNo: string | null
  ceoName: string | null
}

export function AgencyVerifyPage() {
  const { user, loading: authLoading } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<Status | null>(null)
  const [businessRegNo, setBusinessRegNo] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) { window.location.href = '/login'; return }
    if (!user) return
    if (user.userType !== 'agency') { window.location.href = '/dashboard'; return }
    ;(async () => {
      try {
        const r = await apiFetch<Status>('/api/mau/agency/verification', { credentials: 'include' })
        setState(r)
        if (r.businessRegNo) setBusinessRegNo(r.businessRegNo)
        if (r.ceoName) setCeoName(r.ceoName)
      } catch {
        setState({ status: 'none', submittedAt: null, reviewedAt: null, rejectReason: null, businessRegNo: null, ceoName: null })
      } finally { setLoading(false) }
    })()
  }, [authLoading, user])

  async function onImagePick(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 업로드 가능합니다.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('5MB 이하 파일만 업로드 가능합니다.'); return }
    const url = await fileToResized(file, 1400, 0.82)
    setImageDataUrl(url)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!businessRegNo.match(/^\d{3}-\d{2}-\d{5}$/)) {
      toast.error('사업자등록번호는 123-45-67890 형식으로 입력해주세요.')
      return
    }
    if (ceoName.trim().length < 2) { toast.error('대표자명을 입력해주세요.'); return }
    if (!imageDataUrl) { toast.error('사업자등록증 이미지를 첨부해주세요.'); return }

    setSubmitting(true)
    try {
      await apiFetch('/api/mau/agency/verification', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessRegNo,
          ceoName: ceoName.trim(),
          businessRegImg: imageDataUrl,
        }),
      })
      toast.success('검증 요청을 접수했습니다. 운영팀 검토 후 이메일로 안내드립니다.')
      setState({ status: 'submitted', submittedAt: new Date().toISOString(), reviewedAt: null, rejectReason: null, businessRegNo, ceoName })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally { setSubmitting(false) }
  }

  function fileToResized(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = () => { img.src = reader.result as string }
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('캔버스 생성 실패'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-notis-main">
        <div className="oc-container" style={{ maxWidth: 720 }}>
          <a href="/dashboard" className="oc-back-link"><ArrowLeft size={14} strokeWidth={2} aria-hidden /> 대시보드로</a>

          <header className="oc-notis-head">
            <div>
              <h1><ShieldCheck size={22} strokeWidth={2} aria-hidden /> 대행사 검증 신청</h1>
              <p>사업자등록증을 제출해 검증 파트너로 등록하세요. 검증된 대행사만 프로젝트에 노출됩니다.</p>
            </div>
          </header>

          {loading ? (
            <Skeleton variant="card" height={280} />
          ) : (
            <>
              {state?.status === 'submitted' && (
                <div className="oc-verify-banner oc-verify-banner--pending">
                  <Clock size={16} strokeWidth={2} aria-hidden />
                  <div>
                    <strong>검토 대기중</strong>
                    <p>제출하신 {new Date(state.submittedAt ?? '').toLocaleString('ko-KR')}. 평균 24시간 내 처리됩니다.</p>
                  </div>
                </div>
              )}
              {state?.status === 'approved' && (
                <div className="oc-verify-banner oc-verify-banner--approved">
                  <CheckCircle2 size={16} strokeWidth={2} aria-hidden />
                  <div>
                    <strong>검증 완료 ✓</strong>
                    <p>검증 파트너로 등록되었습니다. 프로젝트 리스트에 '인증' 배지가 표시됩니다.</p>
                  </div>
                </div>
              )}
              {state?.status === 'rejected' && (
                <div className="oc-verify-banner oc-verify-banner--rejected">
                  <XCircle size={16} strokeWidth={2} aria-hidden />
                  <div>
                    <strong>검증 반려</strong>
                    <p>사유: {state.rejectReason}</p>
                    <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>서류 보완 후 재제출 가능합니다.</p>
                  </div>
                </div>
              )}

              {(state?.status === 'none' || state?.status === 'rejected') && (
                <form onSubmit={onSubmit} className="oc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label className="oc-field">
                    <span>사업자등록번호 *</span>
                    <input
                      value={businessRegNo}
                      onChange={(e) => setBusinessRegNo(e.target.value)}
                      placeholder="123-45-67890"
                      maxLength={12}
                      required
                    />
                  </label>
                  <label className="oc-field">
                    <span>대표자명 *</span>
                    <input
                      value={ceoName}
                      onChange={(e) => setCeoName(e.target.value)}
                      placeholder="홍길동"
                      maxLength={40}
                      required
                    />
                  </label>
                  <div className="oc-field">
                    <span>사업자등록증 이미지 *</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) void onImagePick(f)
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="oc-btn oc-btn-outline oc-btn-sm"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Upload size={14} strokeWidth={2} aria-hidden /> 이미지 선택
                      </button>
                      {imageDataUrl && (
                        <span style={{ fontSize: 12.5, color: '#059669', fontWeight: 700 }}>
                          ✓ 업로드 완료 ({Math.round(imageDataUrl.length / 1024)}KB)
                        </span>
                      )}
                    </div>
                    {imageDataUrl && (
                      <img
                        src={imageDataUrl}
                        alt="사업자등록증 미리보기"
                        style={{ marginTop: 10, maxWidth: '100%', maxHeight: 280, borderRadius: 8, border: '1px solid #E5E7EB' }}
                      />
                    )}
                    <p style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
                      jpg/png/webp · 5MB 이하 · 자동 리사이즈됩니다.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button type="submit" className="oc-btn oc-btn-primary" disabled={submitting}>
                      <ShieldCheck size={14} strokeWidth={2} aria-hidden /> {submitting ? '제출 중…' : '검증 요청 제출'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
