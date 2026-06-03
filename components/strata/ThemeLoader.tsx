'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ThemeLoader() {
  useEffect(() => {
    const apply = async () => {
      // Apply from localStorage instantly; default to light if no preference set
      const cached = localStorage.getItem('strata-theme')
      const resolveInstant = (theme: string | null) => {
        if (theme === 'auto') {
          const h = new Date().getHours()
          return h >= 6 && h < 20 ? 'light' : 'dark'
        }
        return theme === 'dark' ? 'dark' : 'light'
      }
      if (resolveInstant(cached) === 'dark') {
        document.documentElement.classList.remove('theme-light')
      } else {
        document.documentElement.classList.add('theme-light')
      }

      // Confirm from Supabase and sync
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_settings')
        .select('theme, accent_color')
        .eq('user_id', user.id)
        .maybeSingle()

      const resolveTheme = (theme: string | null) => {
        if (theme === 'auto') {
          const h = new Date().getHours()
          return h >= 6 && h < 20 ? 'light' : 'dark'
        }
        return theme === 'dark' ? 'dark' : 'light'
      }

      const resolved = resolveTheme(data?.theme ?? null)
      if (resolved === 'dark') {
        document.documentElement.classList.remove('theme-light')
        localStorage.setItem('strata-theme', data?.theme === 'auto' ? 'auto' : 'dark')
      } else {
        document.documentElement.classList.add('theme-light')
        localStorage.setItem('strata-theme', data?.theme === 'auto' ? 'auto' : 'light')
      }

      // Restore saved accent color + derived opacity variants
      if (data?.accent_color) {
        const c = data.accent_color
        document.documentElement.style.setProperty('--accent', c)
        document.documentElement.style.setProperty('--accent-hover', c)
        document.documentElement.style.setProperty('--accent-muted', c + '20')
        document.documentElement.style.setProperty('--accent-ring', c + '38')
        document.documentElement.style.setProperty('--accent-faint', c + '14')
        document.documentElement.style.setProperty('--accent-glow', c + '6B')
        document.documentElement.style.setProperty('--accent-subtle', c + '09')
      }
    }
    apply()
  }, [])

  return null
}
