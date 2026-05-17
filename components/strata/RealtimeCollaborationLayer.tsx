'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeCollaborationLayer() {
  const [typing, setTyping] = useState('')
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: owned } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).maybeSingle()
      const { data: member } = owned?.id ? { data: null } : await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle()
      const workspaceId = owned?.id || member?.workspace_id
      if (!workspaceId) return

      channel = supabase.channel(`founderos-workspace-${workspaceId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${workspaceId}` }, payload => {
          window.dispatchEvent(new CustomEvent('founderos:team-live-update', { detail: { type: 'task', payload } }))
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline_leads', filter: `workspace_id=eq.${workspaceId}` }, payload => {
          window.dispatchEvent(new CustomEvent('founderos:team-live-update', { detail: { type: 'pipeline', payload } }))
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_events', filter: `workspace_id=eq.${workspaceId}` }, payload => {
          window.dispatchEvent(new CustomEvent('founderos:activity-refresh', { detail: payload }))
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (payload?.user_id === user.id) return
          setTyping(payload?.name ? `${payload.name} is typing…` : 'Someone is typing…')
          if (hideTimer.current) clearTimeout(hideTimer.current)
          hideTimer.current = setTimeout(() => setTyping(''), 1800)
        })
        .subscribe()

      const onTyping = (event: Event) => {
        const detail = (event as CustomEvent).detail || {}
        channel?.send({ type: 'broadcast', event: 'typing', payload: { user_id: user.id, name: detail.name || 'A teammate' } })
      }
      window.addEventListener('founderos:typing', onTyping)
      return () => window.removeEventListener('founderos:typing', onTyping)
    }

    let cleanupListener: undefined | (() => void)
    setup().then(cleanup => { cleanupListener = cleanup })
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      cleanupListener?.()
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  if (!typing) return null
  return (
    <div className="fixed bottom-24 left-1/2 z-[55] -translate-x-1/2 rounded-full px-4 py-2 text-xs font-bold fo-card dopamine-float md:bottom-6" style={{ color: 'var(--accent)' }}>
      {typing}
    </div>
  )
}
