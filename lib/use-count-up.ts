'use client'
import { useEffect, useRef, useState } from 'react'

/** Animates a number from its previous value to `to` with ease-out cubic. */
export function useCountUp(to: number, duration = 900): number {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number>()
  const prevRef = useRef(0)
  useEffect(() => {
    const from = prevRef.current
    prevRef.current = to
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(animate)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [to, duration])
  return displayed
}
