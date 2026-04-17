import { useEffect, useState } from 'react'
import type { DashboardData } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>()

  useEffect(() => {
    apiFetch<DashboardData>('/api/admin/dashboard').then(setDashboard)
  }, [])

  return { dashboard }
}
