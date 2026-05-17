'use client'

import { useEffect } from 'react'

const RUN_KEY = 'founderos-automation-last-run'
const RUN_INTERVAL_MS = 1000 * 60 * 20

export function AutomationRunner() {
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const last = Number(localStorage.getItem(RUN_KEY) || '0')
        if (Date.now() - last < RUN_INTERVAL_MS) return
        const res = await fetch('/api/founderos/automations/run', { method: 'POST' })
        if (!res.ok || cancelled) return
        localStorage.setItem(RUN_KEY, String(Date.now()))
        const data = await res.json().catch(() => null)
        if (data?.created?.length || data?.notifications?.length) {
          window.dispatchEvent(new CustomEvent('founderos:automations-ran', { detail: data }))
          window.dispatchEvent(new CustomEvent('founderos:notifications-refresh'))
        }
      } catch {}
    }

    run()
    const id = window.setInterval(run, RUN_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return null
}
