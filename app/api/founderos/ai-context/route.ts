import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildAiContext, getFounderSnapshot } from '@/lib/founderos/engine'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snapshot = await getFounderSnapshot(supabase as any, user.id)
  return NextResponse.json({ context: buildAiContext(snapshot), snapshot })
}
