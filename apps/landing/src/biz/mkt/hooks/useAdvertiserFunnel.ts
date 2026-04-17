import { useEffect, useState } from 'react'
import type { AdvertiserFunnel } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useAdvertiserFunnel(enabled: boolean) {
  const [funnel, setFunnel] = useState<AdvertiserFunnel>({
    recruiting: 0,
    contracting: 0,
    executing: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) return
    let mounted = true
    apiFetch<{ funnel: AdvertiserFunnel }>('/api/market/me/funnel', { credentials: 'include' })
      .then((r) => { if (mounted) setFunnel(r.funnel) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [enabled])

  return { funnel, loading }
}
