import { useCallback, useEffect, useState } from 'react'
import type { ApplicantDetail } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useApplicants(projectId: number | null) {
  const [applicants, setApplicants] = useState<ApplicantDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const r = await apiFetch<{ applicants: ApplicantDetail[] }>(
        `/api/market/projects/${projectId}/applicants`,
        { credentials: 'include' },
      )
      setApplicants(r.applicants)
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { void refresh() }, [refresh])

  const act = useCallback(async (applicationId: number, action: 'select' | 'reject') => {
    await apiFetch(`/api/market/applications/${applicationId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    await refresh()
  }, [refresh])

  return { applicants, loading, error, act, refresh }
}
