import { useEffect, useState } from 'react'
import type { ProjectDetailResponse } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useProjectDetail(id: number) {
  const [data, setData] = useState<ProjectDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    apiFetch<ProjectDetailResponse>(`/api/public/projects/${id}`)
      .then((result) => {
        if (mounted) setData(result)
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
  }, [id])

  return { data, loading, error }
}
