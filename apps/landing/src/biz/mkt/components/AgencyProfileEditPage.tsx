import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Save, Plus, X, Camera } from 'lucide-react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { apiFetch } from '../../../com/api/client'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../../../com/ui/Toast'
import { Skeleton } from '../../../com/ui/Skeleton'
import '../../../landing-page.css'

type CaseStudy = { title: string; industry: string; result: string }
type AgencyProfile = {
  id: number
  slug: string
  name: string
  description: string
  specialties: string[]
  region: string | null
  teamSize: string | null
  foundedYear: number | null
  portfolioNote: string | null
  caseStudies: CaseStudy[]
}

export function AgencyProfileEditPage() {
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<AgencyProfile | null>(null)
  const [specInput, setSpecInput] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) { window.location.href = '/login'; return }
    if (!user) return
    if (user.userType !== 'agency') { window.location.href = '/dashboard'; return }
    ;(async () => {
      try {
        const r = await apiFetch<{ agency: AgencyProfile }>(
          '/api/mau/agency/me',
          { credentials: 'include' },
        )
        setProfile(r.agency)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '프로필을 불러오지 못했습니다.')
      } finally { setLoading(false) }
    })()
  }, [authLoading, user, toast])

  function patch<K extends keyof AgencyProfile>(key: K, value: AgencyProfile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p))
  }

  function addSpecialty() {
    const v = specInput.trim()
    if (!v || !profile) return
    if (profile.specialties.includes(v)) return
    patch('specialties', [...profile.specialties, v])
    setSpecInput('')
  }

  function removeSpecialty(v: string) {
    if (!profile) return
    patch('specialties', profile.specialties.filter((x) => x !== v))
  }

  function updateCase(idx: number, key: keyof CaseStudy, value: string) {
    if (!profile) return
    const next = profile.caseStudies.map((c, i) => (i === idx ? { ...c, [key]: value } : c))
    patch('caseStudies', next)
  }

  function addCase() {
    if (!profile) return
    patch('caseStudies', [...profile.caseStudies, { title: '', industry: '', result: '' }])
  }

  function removeCase(idx: number) {
    if (!profile) return
    patch('caseStudies', profile.caseStudies.filter((_, i) => i !== idx))
  }

  async function onAvatarPick(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 업로드 가능합니다.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('5MB 이하 파일만 업로드 가능합니다.'); return }
    setAvatarUploading(true)
    try {
      const upload = await apiFetch<{ imageId: string; uploadURL: string }>(
        '/api/mau/me/avatar/upload-url',
        { method: 'POST', credentials: 'include' },
      )
      const form = new FormData()
      form.append('file', file)
      const up = await fetch(upload.uploadURL, { method: 'POST', body: form })
      if (!up.ok) throw new Error('이미지 업로드에 실패했습니다.')
      await apiFetch('/api/mau/me/avatar/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: upload.imageId }),
      })
      await refreshAuth()
      toast.success('프로필 이미지를 변경했습니다.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setAvatarUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onSave() {
    if (!profile) return
    setSaving(true)
    try {
      await apiFetch('/api/mau/agency/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          description: profile.description,
          specialties: profile.specialties,
          region: profile.region || null,
          teamSize: profile.teamSize || null,
          foundedYear: profile.foundedYear,
          portfolioNote: profile.portfolioNote || null,
          caseStudies: profile.caseStudies.filter((c) => c.title.trim()),
        }),
      })
      toast.success('프로필을 저장했습니다.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally { setSaving(false) }
  }

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-notis-main">
        <div className="oc-container" style={{ maxWidth: 860 }}>
          <a href="/dashboard" className="oc-back-link"><ArrowLeft size={14} strokeWidth={2} aria-hidden /> 대시보드로</a>
          <header className="oc-notis-head">
            <div>
              <h1>대행사 프로필 편집</h1>
              <p>공개 프로필 페이지에 노출되는 정보를 관리합니다.</p>
            </div>
          </header>

          {loading ? (
            <Skeleton variant="card" height={320} />
          ) : !profile ? (
            <p>프로필이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <section className="oc-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover` : 'linear-gradient(135deg, #0B1E3F, #1D4ED8)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 22, flexShrink: 0,
                }}>
                  {!user?.avatarUrl && (user?.name?.[0] ?? 'U')}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 15 }}>프로필 이미지</strong>
                  <p style={{ margin: '4px 0 10px', fontSize: 12.5, color: '#64748B' }}>5MB 이하의 jpg/png 권장</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void onAvatarPick(f)
                    }}
                  />
                  <button
                    type="button"
                    className="oc-btn oc-btn-outline oc-btn-sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    <Camera size={14} strokeWidth={2} /> {avatarUploading ? '업로드 중…' : '이미지 변경'}
                  </button>
                </div>
              </section>

              <section className="oc-card">
                <label className="oc-field">
                  <span>대행사 이름</span>
                  <input value={profile.name} maxLength={80} onChange={(e) => patch('name', e.target.value)} />
                </label>
                <label className="oc-field">
                  <span>한 줄 소개 / 설명</span>
                  <textarea rows={4} maxLength={2000} value={profile.description} onChange={(e) => patch('description', e.target.value)} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <label className="oc-field">
                    <span>지역</span>
                    <input value={profile.region ?? ''} maxLength={40} onChange={(e) => patch('region', e.target.value)} />
                  </label>
                  <label className="oc-field">
                    <span>팀 규모</span>
                    <input value={profile.teamSize ?? ''} maxLength={40} placeholder="예: 5~10명" onChange={(e) => patch('teamSize', e.target.value)} />
                  </label>
                  <label className="oc-field">
                    <span>설립연도</span>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={profile.foundedYear ?? ''}
                      onChange={(e) => {
                        const n = Number.parseInt(e.target.value, 10)
                        patch('foundedYear', Number.isFinite(n) ? n : null)
                      }}
                    />
                  </label>
                </div>
              </section>

              <section className="oc-card">
                <h3 style={{ marginTop: 0 }}>전문 분야</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {profile.specialties.map((s) => (
                    <span key={s} className="oc-chip">
                      {s}
                      <button type="button" aria-label={`${s} 삭제`} onClick={() => removeSpecialty(s)}>
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={specInput}
                    maxLength={40}
                    placeholder="예: 퍼포먼스마케팅"
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" onClick={addSpecialty}>
                    <Plus size={14} strokeWidth={2} /> 추가
                  </button>
                </div>
              </section>

              <section className="oc-card">
                <label className="oc-field">
                  <span>포트폴리오 요약</span>
                  <textarea rows={4} maxLength={2000} value={profile.portfolioNote ?? ''} onChange={(e) => patch('portfolioNote', e.target.value)} />
                </label>
              </section>

              <section className="oc-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h3 style={{ margin: 0 }}>대표 사례 ({profile.caseStudies.length}/12)</h3>
                  <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" onClick={addCase} disabled={profile.caseStudies.length >= 12}>
                    <Plus size={14} strokeWidth={2} /> 사례 추가
                  </button>
                </div>
                {profile.caseStudies.length === 0 && (
                  <p style={{ color: '#64748B', fontSize: 13 }}>등록된 사례가 없습니다.</p>
                )}
                {profile.caseStudies.map((c, idx) => (
                  <div key={idx} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong style={{ fontSize: 13, color: '#475569' }}>사례 #{idx + 1}</strong>
                      <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" onClick={() => removeCase(idx)}>삭제</button>
                    </div>
                    <label className="oc-field">
                      <span>제목</span>
                      <input value={c.title} maxLength={200} onChange={(e) => updateCase(idx, 'title', e.target.value)} />
                    </label>
                    <label className="oc-field">
                      <span>업종</span>
                      <input value={c.industry} maxLength={60} onChange={(e) => updateCase(idx, 'industry', e.target.value)} />
                    </label>
                    <label className="oc-field">
                      <span>성과</span>
                      <input value={c.result} maxLength={500} placeholder="예: 6개월 내 매출 3배" onChange={(e) => updateCase(idx, 'result', e.target.value)} />
                    </label>
                  </div>
                ))}
              </section>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <a href={`/agency/${profile.slug}`} className="oc-btn oc-btn-outline">공개 프로필 보기</a>
                <button type="button" className="oc-btn oc-btn-primary" onClick={onSave} disabled={saving}>
                  <Save size={14} strokeWidth={2} aria-hidden /> {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
