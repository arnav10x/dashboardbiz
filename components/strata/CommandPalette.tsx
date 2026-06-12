'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, CheckSquare, TrendingUp, DollarSign, CalendarDays, Sparkles,
  BarChart2, Trophy, Settings, Search, Plus, UserPlus, SunMoon, LogOut,
  CornerDownLeft, PenLine,
} from 'lucide-react'

type Command = {
  id: string
  label: string
  hint?: string
  keywords: string
  section: 'Navigate' | 'Actions'
  icon: any
  perform: () => void
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => { setOpen(false); setQuery(''); setActiveIdx(0) }, [])

  const go = useCallback((href: string) => { close(); router.push(href) }, [close, router])

  const toggleTheme = useCallback(async () => {
    close()
    const isLight = document.documentElement.classList.toggle('theme-light')
    const theme = isLight ? 'light' : 'dark'
    localStorage.setItem('strata-theme', theme)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('user_settings').upsert({ user_id: user.id, theme }, { onConflict: 'user_id' })
  }, [close])

  const signOut = useCallback(async () => {
    close()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }, [close, router])

  const commands: Command[] = useMemo(() => [
    { id: 'new-task',   label: 'New task',            hint: 'Create',  keywords: 'add create todo task new', section: 'Actions', icon: Plus,     perform: () => go('/dashboard/tasks?new=1') },
    { id: 'new-lead',   label: 'Add lead',            hint: 'Create',  keywords: 'add create lead prospect deal pipeline new', section: 'Actions', icon: UserPlus, perform: () => go('/dashboard/pipeline?new=1') },
    { id: 'log-period', label: 'Log revenue & expenses', hint: 'Create', keywords: 'log revenue expense period pl profit data entry money', section: 'Actions', icon: PenLine, perform: () => go('/dashboard/period-entry') },
    { id: 'ask-ai',     label: 'Ask the AI Coach',    hint: 'AI',      keywords: 'ai coach copilot chat ask help advice', section: 'Actions', icon: Sparkles, perform: () => go('/dashboard/ai-copilot') },
    { id: 'theme',      label: 'Toggle light / dark theme', hint: 'Theme', keywords: 'theme dark light mode appearance toggle switch', section: 'Actions', icon: SunMoon, perform: toggleTheme },
    { id: 'sign-out',   label: 'Sign out',            hint: 'Account', keywords: 'sign out logout exit leave', section: 'Actions', icon: LogOut,  perform: signOut },
    { id: 'overview',   label: 'Overview',     keywords: 'home dashboard overview main', section: 'Navigate', icon: LayoutDashboard, perform: () => go('/dashboard') },
    { id: 'tasks',      label: 'Tasks',        keywords: 'tasks todo daily checklist', section: 'Navigate', icon: CheckSquare, perform: () => go('/dashboard/tasks') },
    { id: 'pipeline',   label: 'Pipeline',     keywords: 'pipeline leads crm deals sales kanban', section: 'Navigate', icon: TrendingUp, perform: () => go('/dashboard/pipeline') },
    { id: 'finance',    label: 'Finance',      keywords: 'finance money pl profit loss expenses revenue burn', section: 'Navigate', icon: DollarSign, perform: () => go('/dashboard/finance') },
    { id: 'calendar',   label: 'Calendar',     keywords: 'calendar schedule events pl daily', section: 'Navigate', icon: CalendarDays, perform: () => go('/dashboard/pl-calendar') },
    { id: 'ai-coach',   label: 'AI Coach',     keywords: 'ai coach copilot chat assistant', section: 'Navigate', icon: Sparkles, perform: () => go('/dashboard/ai-copilot') },
    { id: 'reports',    label: 'Reports',      keywords: 'reports analytics insights performance', section: 'Navigate', icon: BarChart2, perform: () => go('/dashboard/reports') },
    { id: 'achievements', label: 'Achievements', keywords: 'achievements badges xp rank level streak', section: 'Navigate', icon: Trophy, perform: () => go('/dashboard/achievements') },
    { id: 'settings',   label: 'Settings',     keywords: 'settings profile account preferences theme target', section: 'Navigate', icon: Settings, perform: () => go('/dashboard/settings') },
  ], [go, toggleTheme, signOut])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c => c.label.toLowerCase().includes(q) || c.keywords.includes(q))
  }, [commands, query])

  const sections = useMemo(() => {
    const order: Command['section'][] = query.trim() ? ['Actions', 'Navigate'] : ['Actions', 'Navigate']
    return order
      .map(name => ({ name, items: filtered.filter(c => c.section === name) }))
      .filter(s => s.items.length > 0)
  }, [filtered, query])

  const flat = useMemo(() => sections.flatMap(s => s.items), [sections])

  // Global shortcuts: ⌘K / Ctrl+K toggles, Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setActiveIdx(0)
      } else if (e.key === 'Escape' && open) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    const onOpenEvent = () => { setOpen(true); setQuery(''); setActiveIdx(0) }
    window.addEventListener('prspectve-open-palette', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('prspectve-open-palette', onOpenEvent)
    }
  }, [open, close])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => { setActiveIdx(0) }, [query])

  // Keep the active row visible while arrowing through results
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); flat[activeIdx]?.perform() }
  }

  if (!open) return null

  let runningIdx = -1
  return (
    <div className="cmdk-overlay" onMouseDown={e => { if (e.target === e.currentTarget) close() }}>
      <div className="cmdk-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search pages or run a command…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}
          />
          <kbd className="cmdk-kbd">esc</kbd>
        </div>

        <div ref={listRef} style={{ overflowY: 'auto', padding: '6px 6px 8px' }}>
          {flat.length === 0 && (
            <p style={{ padding: '22px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {sections.map(section => (
            <div key={section.name}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.6, padding: '8px 10px 4px' }}>
                {section.name}
              </p>
              {section.items.map(cmd => {
                runningIdx += 1
                const idx = runningIdx
                return (
                  <button
                    key={cmd.id}
                    data-idx={idx}
                    data-active={idx === activeIdx}
                    className="cmdk-item"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={cmd.perform}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px',
                      borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, background: idx === activeIdx ? 'var(--accent-muted)' : 'var(--overlay-faint)',
                      border: `1px solid ${idx === activeIdx ? 'var(--accent-ring)' : 'var(--border)'}`,
                    }}>
                      <cmd.icon style={{ width: 13, height: 13, color: idx === activeIdx ? 'var(--accent)' : 'var(--text-muted)' }} />
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: idx === activeIdx ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {cmd.label}
                    </span>
                    {cmd.hint && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', opacity: 0.7 }}>{cmd.hint}</span>
                    )}
                    {idx === activeIdx && <CornerDownLeft style={{ width: 12, height: 12, color: 'var(--text-muted)', flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 14px', borderTop: '1px solid var(--border)', background: 'var(--overlay-micro)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
            <kbd className="cmdk-kbd">↑</kbd><kbd className="cmdk-kbd">↓</kbd> navigate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
            <kbd className="cmdk-kbd">↵</kbd> select
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', opacity: 0.7 }}>prspectve</span>
        </div>
      </div>
    </div>
  )
}
