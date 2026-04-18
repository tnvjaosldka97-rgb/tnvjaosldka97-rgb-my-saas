import { useCallback, useEffect, useState } from 'react'
import type { MarketNotification } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

type NotiResp = {
  notifications: MarketNotification[]
  unreadCount: number
  nextCursor: string | null
}

const PAGE_SIZE = 20

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<MarketNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const r = await apiFetch<NotiResp>(
        `/api/notifications?limit=${PAGE_SIZE}`,
        { credentials: 'include' },
      )
      setItems(r.notifications)
      setUnread(r.unreadCount)
      setCursor(r.nextCursor)
      setHasMore(Boolean(r.nextCursor))
    } catch {
      // 인증되지 않은 경우 무시
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const loadMore = useCallback(async () => {
    if (!enabled || !cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const r = await apiFetch<NotiResp>(
        `/api/notifications?limit=${PAGE_SIZE}&before=${encodeURIComponent(cursor)}`,
        { credentials: 'include' },
      )
      setItems((prev) => [...prev, ...r.notifications])
      setCursor(r.nextCursor)
      setHasMore(Boolean(r.nextCursor))
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }, [enabled, cursor, loadingMore])

  useEffect(() => { void refresh() }, [refresh])

  const markAllRead = useCallback(async () => {
    await apiFetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' })
    setUnread(0)
    setItems((prev) => prev.map((n) => n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
  }, [])

  return { items, unread, loading, loadingMore, hasMore, refresh, loadMore, markAllRead }
}
