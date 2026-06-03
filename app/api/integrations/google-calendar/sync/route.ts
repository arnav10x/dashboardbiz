import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncGoogleCalendarEvents } from '@/lib/google-calendar'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await syncGoogleCalendarEvents(supabase as any, user.id)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true, synced: result.synced })
}
