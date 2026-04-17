import { useEffect } from 'react'
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { useToast } from '../../../com/ui/Toast'
import { Skeleton, SkeletonStack } from '../../../com/ui/Skeleton'
import { EmptyState } from '../../../com/ui/EmptyState'
import '../../../landing-page.css'

export function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const noti = useNotifications(Boolean(user))
  const toast = useToast()

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/login'
  }, [authLoading, user])

  if (authLoading || !user) {
    return (
      <div className="onlyup-scope">
        <LPHeader />
        <main className="oc-notis-main"><div className="oc-container"><Skeleton variant="card" height={240} /></div></main>
        <LPFooter />
      </div>
    )
  }

  async function markAll() {
    try {
      await noti.markAllRead()
      toast.success(`${noti.unread}개 알림을 모두 읽음 처리했습니다.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '처리 실패')
    }
  }

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-notis-main">
        <div className="oc-container">
          <a href="/dashboard" className="oc-back-link"><ArrowLeft size={14} strokeWidth={2} aria-hidden /> 대시보드로</a>

          <header className="oc-notis-head">
            <div>
              <h1><Bell size={22} strokeWidth={2} aria-hidden /> 알림</h1>
              <p>
                전체 <strong>{noti.items.length}</strong>건
                {noti.unread > 0 && <> · 안읽음 <strong className="oc-notis-unread">{noti.unread}</strong>건</>}
              </p>
            </div>
            {noti.unread > 0 && (
              <button type="button" className="oc-btn oc-btn-outline oc-btn-sm" onClick={markAll}>
                <CheckCheck size={14} strokeWidth={2} aria-hidden /> 모두 읽음
              </button>
            )}
          </header>

          {noti.loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: 16, background: 'white', borderRadius: 12, border: '1px solid #E5E5E5' }}>
                  <Skeleton width="60%" height={16} />
                  <div style={{ marginTop: 8 }}>
                    <SkeletonStack rows={2} />
                  </div>
                </div>
              ))}
            </div>
          ) : noti.items.length === 0 ? (
            <EmptyState
              variant="package"
              title="아직 새 알림이 없어요"
              description="프로젝트가 등록되거나 견적이 도착하면 여기로 알림이 옵니다."
              action={<a href="/dashboard" className="oc-btn oc-btn-primary">대시보드로</a>}
            />
          ) : (
            <ul className="oc-notis-list">
              {noti.items.map((n) => (
                <li key={n.id} className={`oc-notis-card${!n.readAt ? ' is-unread' : ''}`}>
                  <a href={n.link ?? '#'}>
                    <div className="oc-notis-body">
                      <strong>{n.title}</strong>
                      {n.body && <p>{n.body}</p>}
                      <time>{new Date(n.createdAt).toLocaleString('ko-KR')}</time>
                    </div>
                    {!n.readAt && <span className="oc-notis-dot" aria-label="안읽음" />}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
