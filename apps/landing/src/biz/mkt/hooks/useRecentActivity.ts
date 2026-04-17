import { useEffect, useState } from 'react'
import { apiFetch } from '../../../com/api/client'

export type ActivityItem = {
  id: string
  kind: 'quote' | 'review'
  at: string
  agencyName: string
  projectTitle: string
  industry: string
  priceMin: number
  rating: number | null
}

export function useRecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    apiFetch<{ items: ActivityItem[] }>('/api/public/recent-activity')
      .then((r) => { if (mounted) setItems(r.items) })
      .catch(() => { /* ignore */ })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return { items, loading }
}
