import { useEffect, useState } from 'react'
import type { ApplicantDetail } from '@my-saas/com'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { useProjectDetail } from '../hooks/useProjectDetail'
import { useApplicants } from '../hooks/useApplicants'
import { apiFetch } from '../../../com/api/client'
import '../../../landing-page.css'

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  pending: { label: '검토중', cls: 'oc-pill-gray' },
  selected: { label: '선정됨', cls: 'oc-pill-mint' },
  rejected: { label: '미선정', cls: 'oc-pill-red' },
}

export function ApplicantsManagePage({ projectId }: { projectId: number }) {
  const { user, loading: authLoading } = useAuth()
  const detail = useProjectDetail(projectId)
  const { applicants, loading, error, act } = useApplicants(projectId)
  const [pending, setPending] = useState<number | null>(null)
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/login'
  }, [authLoading, user])

  if (authLoading || !user || detail.loading) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-mypage-main"><div className="oc-container"><div className="oc-detail-skeleton">인증 확인 중…</div></div></main>
        <LPFooter />
      </div>
    )
  }

  if (!detail.data) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-mypage-main"><div className="oc-container"><div className="oc-detail-error">프로젝트를 찾을 수 없습니다.</div></div></main>
        <LPFooter />
      </div>
    )
  }

  async function onAct(id: number, action: 'select' | 'reject') {
    setPending(id)
    try { await act(id, action) } finally { setPending(null) }
  }

  async function advanceTo(next: 'executing' | 'completed') {
    setAdvancing(true)
    try {
      await apiFetch(`/api/market/projects/${projectId}/stage`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ next }),
      })
      window.location.reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : '전환 실패')
    } finally {
      setAdvancing(false)
    }
  }

  const project = detail.data.project
  const hasSelected = applicants.some((a) => a.status === 'selected')
  const stageLabel = (() => {
    if (project.status === 'recruiting') return '모집중'
    if (project.status === 'closing') return '마감임박'
    if (project.status === 'in_progress') return '진행중'
    return '완료'
  })()

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-mypage-main">
        <div className="oc-container">
          <a href="/dashboard" className="oc-back-link">+ 대시보드로</a>

          <article className="oc-detail-card">
            <header className="oc-detail-card-head">
              <div>
                <span className="oc-mypage-id">#{(100000 + project.id).toString()}</span>
                <h1 style={{ margin: '4px 0 0', fontSize: 18 }}>{project.title}</h1>
              </div>
              <div className="oc-detail-head-badges">
                <span className="oc-pill oc-pill-blue">{stageLabel}</span>
                <span className="oc-applicants-chip">지원자 {applicants.length}</span>
              </div>
            </header>
            <div className="oc-manage-actions">
              <span className="oc-manage-label">프로젝트 단계 전환</span>
              <button type="button" className="oc-btn oc-btn-outline oc-btn-sm"
                onClick={() => advanceTo('executing')}
                disabled={advancing || !hasSelected || project.status === 'in_progress' || project.status === 'completed'}>
                집행중으로 전환
              </button>
              <button type="button" className="oc-btn oc-btn-outline oc-btn-sm"
                onClick={() => advanceTo('completed')}
                disabled={advancing || project.status !== 'in_progress'}>
                완료 처리
              </button>
            </div>
          </article>

          {loading && <div className="oc-grid-empty">불러오는 중…</div>}
          {error && <div className="oc-grid-empty" role="alert">{error}</div>}
          {!loading && applicants.length === 0 && (
            <div className="oc-grid-empty">아직 지원자가 없습니다. 평균 28시간 내 도착합니다.</div>
          )}

          {applicants.length > 0 && (
            <ul className="oc-applicants-list">
              {applicants.map((a) => (
                <ApplicantRow key={a.id} applicant={a} pending={pending === a.id}
                  onAct={(action) => onAct(a.id, action)} />
              ))}
            </ul>
          )}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}

function ApplicantRow({ applicant, pending, onAct }: {
  applicant: ApplicantDetail
  pending: boolean
  onAct: (action: 'select' | 'reject') => void
}) {
  const pill = STATUS_PILL[applicant.status] ?? { label: applicant.status, cls: 'oc-pill-gray' }
  return (
    <li className="oc-applicant-card">
      <div className="oc-applicant-main">
        <div className="oc-applicant-avatar" aria-hidden>{applicant.userName.charAt(0)}</div>
        <div className="oc-applicant-body">
          <div className="oc-applicant-row">
            <h3>{applicant.userName}</h3>
            <span className={`oc-pill ${pill.cls}`}>{pill.label}</span>
          </div>
          <div className="oc-applicant-meta">
            {applicant.userEmail} · {new Date(applicant.createdAt).toLocaleString('ko-KR')}
          </div>
          {applicant.message && <p className="oc-applicant-message">{applicant.message}</p>}
        </div>
      </div>
      <div className="oc-applicant-actions">
        <button type="button" className="oc-btn oc-btn-primary-blue oc-btn-sm"
          disabled={pending || applicant.status === 'selected'}
          onClick={() => onAct('select')}>
          {applicant.status === 'selected' ? '선정됨' : '선정하기'}
        </button>
        <button type="button" className="oc-btn oc-btn-outline oc-btn-sm"
          disabled={pending || applicant.status === 'rejected'}
          onClick={() => onAct('reject')}>
          {applicant.status === 'rejected' ? '미선정' : '반려'}
        </button>
      </div>
    </li>
  )
}
