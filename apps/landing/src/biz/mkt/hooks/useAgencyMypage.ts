import { useEffect, useState } from 'react'
import type { ApplicationFunnel, MarketProject, ProjectApplication } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export type ApplicationWithProject = ProjectApplication & { project: MarketProject }

export function useAgencyMypage(enabled: boolean) {
  const [applications, setApplications] = useState<ApplicationWithProject[]>([])
  const [funnel, setFunnel] = useState<ApplicationFunnel>({ applying: 0, contracting: 0, executing: 0, completed: 0 })
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let mounted = true
    setLoading(true)
    apiFetch<{ applications: ApplicationWithProject[]; funnel: ApplicationFunnel }>(
      '/api/market/me/applications',
      { credentials: 'include' },
    )
      .then((r) => {
        if (!mounted) return
        setApplications(r.applications)
        setFunnel(r.funnel)
      })
      .catch((e: unknown) => { if (mounted) setError(e instanceof Error ? e.message : '불러오지 못했습니다.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [enabled])

  return { applications, funnel, loading, error }
}
