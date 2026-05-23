'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ThemeLoader() {
  useEffect(() => {
    const apply = async () => {
      // First apply from localStorage for instant load (no flash). Default: light.
      const cached = localStorage.getItem('strata-theme')
      if (cached !== 'dark') {
        document.documentElement.classList.add('theme-light')
      } else {
        document.documentElement.classList.remove('theme-light')
      }

      // Then confirm from Supabase and sync
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_settings')
        .select('theme, accent_color')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.theme === 'dark') {
        document.documentElement.classList.remove('theme-light')
        localStorage.setItem('strata-theme', 'dark')
      } else {
        document.documentElement.classList.add('theme-light')
        localStorage.setItem('strata-theme', 'light')
      }

      // Restore saved accent color + derived opacity variants
      if (data?.accent_color) {
        const c = data.accent_color
        document.documentElement.style.setProperty('--accent', c)
        document.documentElement.style.setProperty('--accent-hover', c)
        document.documentElement.style.setProperty('--accent-muted', c + '20')   // ~13%
        document.documentElement.style.setProperty('--accent-ring', c + '38')    // ~22%
        document.documentElement.style.setProperty('--accent-faint', c + '14')   // ~8%
        document.documentElement.style.setProperty('--accent-glow', c + '6B')    // ~42%
        document.documentElement.style.setProperty('--accent-subtle', c + '09')  // ~3.5%
      }
    }
    apply()
  }, [])

  return null
}
