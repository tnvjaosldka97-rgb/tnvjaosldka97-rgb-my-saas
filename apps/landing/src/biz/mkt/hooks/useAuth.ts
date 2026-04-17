import { useCallback, useEffect, useState } from 'react'
import type { MarketUser, MarketLoginInput, MarketRegisterInput } from '@my-saas/com'
import { apiFetch } from '../../../com/api/client'

type AuthState = {
  user: MarketUser | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null })

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const { user } = await apiFetch<{ user: MarketUser }>('/api/mau/me', { credentials: 'include' })
      setState({ user, loading: false, error: null })
    } catch {
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (input: MarketLoginInput) => {
    const { user } = await apiFetch<{ user: MarketUser }>('/api/mau/login', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(input),
    })
    setState({ user, loading: false, error: null })
    return user
  }, [])

  const register = useCallback(async (input: MarketRegisterInput) => {
    const { user } = await apiFetch<{ user: MarketUser }>('/api/mau/register', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(input),
    })
    setState({ user, loading: false, error: null })
    return user
  }, [])

  const logout = useCallback(async () => {
    await apiFetch<{ ok: boolean }>('/api/mau/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setState({ user: null, loading: false, error: null })
  }, [])

  return { ...state, login, register, logout, refresh }
}
