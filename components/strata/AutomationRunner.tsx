'use client'

import { useEffect } from 'react'

const RUN_KEY = 'founderos-automation-last-run'
const MEMORY_KEY = 'founderos-memory-last-sync'
const RUN_INTERVAL_MS = 1000 * 60 * 20
const MEMORY_INTERVAL_MS = 1000 * 60 * 30

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
          window.dispatchEvent(new CustomEvent('prspectve:automations-ran', { detail: data }))
          window.dispatchEvent(new CustomEvent('prspectve:notifications-refresh'))
        }
      } catch {}
    }

    const syncMemory = async () => {
      try {
        const last = Number(localStorage.getItem(MEMORY_KEY) || '0')
        if (Date.now() - last < MEMORY_INTERVAL_MS) return
        await fetch('/api/founderos/sync-memory', { method: 'POST' })
        localStorage.setItem(MEMORY_KEY, String(Date.now()))
      } catch {}
    }

    run()
    syncMemory()
    const id = window.setInterval(() => { run(); syncMemory() }, Math.min(RUN_INTERVAL_MS, MEMORY_INTERVAL_MS))
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return null
}
