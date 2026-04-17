import { useEffect, useState } from 'react'
import type { MarketProject, MarketQuote } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useMyProjects(enabled: boolean) {
  const [projects, setProjects] = useState<MarketProject[]>([])
  const [loading, setLoading] = useState(enabled)
  useEffect(() => {
    if (!enabled) return
    let mounted = true
    setLoading(true)
    apiFetch<{ projects: MarketProject[] }>('/api/market/me/projects', { credentials: 'include' })
      .then((r) => { if (mounted) setProjects(r.projects) })
      .catch(() => { if (mounted) setProjects([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [enabled])
  return { projects, loading }
}

export function useMyQuotes(enabled: boolean) {
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(enabled)
  useEffect(() => {
    if (!enabled) return
    let mounted = true
    setLoading(true)
    apiFetch<{ quotes: MarketQuote[] }>('/api/market/me/quotes', { credentials: 'include' })
      .then((r) => { if (mounted) setQuotes(r.quotes) })
      .catch(() => { if (mounted) setQuotes([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [enabled])
  return { quotes, loading }
}
