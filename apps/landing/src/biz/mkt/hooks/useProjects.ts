import { useEffect, useState } from 'react'
import type { MarketProject, ProjectListQuery } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useProjects(query: ProjectListQuery) {
  const [projects, setProjects] = useState<MarketProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const status = query.status ?? 'all'
  const sort = query.sort ?? 'latest'

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (sort !== 'latest') params.set('sort', sort)
    const qs = params.toString()
    const url = qs ? `/api/public/projects?${qs}` : '/api/public/projects'

    apiFetch<{ projects: MarketProject[] }>(url)
      .then((result) => {
        if (mounted) setProjects(result.projects)
      })
      .catch((e: unknown) => {
        if (mounted) setError(e instanceof Error ? e.message : '프로젝트를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [status, sort])

  return { projects, loading, error }
}
