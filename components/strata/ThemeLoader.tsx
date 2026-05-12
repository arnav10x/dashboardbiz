'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ThemeLoader() {
  useEffect(() => {
    const apply = async () => {
      // First apply from localStorage for instant load (no flash)
      const cached = localStorage.getItem('strata-theme')
      if (cached === 'light') {
        document.documentElement.classList.add('theme-light')
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

      if (data?.theme === 'light') {
        document.documentElement.classList.add('theme-light')
        localStorage.setItem('strata-theme', 'light')
      } else {
        document.documentElement.classList.remove('theme-light')
        localStorage.setItem('strata-theme', 'dark')
      }

      // Restore saved accent color
      if (data?.accent_color) {
        document.documentElement.style.setProperty('--accent', data.accent_color)
        document.documentElement.style.setProperty('--accent-hover', data.accent_color)
        document.documentElement.style.setProperty('--accent-muted', data.accent_color + '20')
      }
    }
    apply()
  }, [])

  return null
}
