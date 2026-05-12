'use client'

import { useCallback, useEffect, useState } from 'react'

export function useFounderState() {
  const [state, setState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/founderos/state', { cache: 'no-store' })
      if (!res.ok) throw new Error('Could not load FounderOS state')
      setState(await res.json())
    } catch (e: any) {
      setError(e?.message || 'Could not load FounderOS state')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { state, loading, error, refresh }
}
