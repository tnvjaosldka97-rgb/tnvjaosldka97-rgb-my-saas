import { useCallback, useEffect, useState } from 'react'
import type { MarketNotification } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<MarketNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const r = await apiFetch<{ notifications: MarketNotification[]; unreadCount: number }>(
        '/api/notifications',
        { credentials: 'include' },
      )
      setItems(r.notifications)
      setUnread(r.unreadCount)
    } catch {
      // 인증되지 않은 경우 무시
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => { void refresh() }, [refresh])

  const markAllRead = useCallback(async () => {
    await apiFetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' })
    setUnread(0)
    setItems((prev) => prev.map((n) => n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
  }, [])

  return { items, unread, loading, refresh, markAllRead }
}
