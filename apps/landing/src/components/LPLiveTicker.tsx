import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { useRecentActivity, type ActivityItem } from '../biz/mkt/hooks/useRecentActivity'

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60 * 1000) return '방금 전'
  if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)}분 전`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / 3600000)}시간 전`
  return `${Math.round(diff / (24 * 3600000))}일 전`
}

function formatItem(item: ActivityItem): string {
  if (item.kind === 'review') {
    return `${item.agencyName}이 새 리뷰를 받았어요 — ★ ${item.rating}`
  }
  return `${item.agencyName} · "${shorten(item.projectTitle, 28)}"에 견적 제출 (월 ${item.priceMin.toLocaleString('ko-KR')}만원~)`
}

function shorten(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}

export function LPLiveTicker() {
  const { items, loading } = useRecentActivity()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 3800)
    return () => clearInterval(t)
  }, [items.length])

  if (loading || items.length === 0) return null

  const item = items[idx] ?? items[0]

  return (
    <div className="oc-section oc-section-ticker" aria-label="실시간 활동">
      <div className="oc-container">
        <div className="oc-ticker">
          <span className="oc-ticker-badge" aria-hidden>
            <span className="oc-ticker-pulse" />
            <Activity size={11} strokeWidth={2.4} aria-hidden /> LIVE
          </span>
          <div className="oc-ticker-rail" aria-live="polite">
            <div key={item.id} className="oc-ticker-item">
              <span className={`oc-ticker-kind oc-ticker-${item.kind}`}>
                {item.kind === 'quote' ? '견적 도착' : '리뷰'}
              </span>
              <span className="oc-ticker-text">{formatItem(item)}</span>
            </div>
          </div>
          <time className="oc-ticker-time">{relTime(item.at)}</time>
        </div>
      </div>
    </div>
  )
}
