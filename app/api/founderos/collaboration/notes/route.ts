import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function activeWorkspace(supabase: any, userId: string) {
  const { data: owned } = await supabase.from('workspaces').select('id,name').eq('owner_id', userId).maybeSingle()
  if (owned?.id) return owned
  const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', userId).eq('status', 'active').limit(1).maybeSingle()
  if (!member?.workspace_id) return null
  const { data: ws } = await supabase.from('workspaces').select('id,name').eq('id', member.workspace_id).maybeSingle()
  return ws || null
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workspace = await activeWorkspace(supabase, user.id)
  if (!workspace) return NextResponse.json({ notes: [] })
  const { data, error } = await supabase.from('collaboration_notes').select('*').eq('workspace_id', workspace.id).order('updated_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data || [], workspace })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const workspace = await activeWorkspace(supabase, user.id)
  if (!workspace) return NextResponse.json({ error: 'No active workspace' }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const title = String(body.title || 'Untitled note').slice(0, 120)
  const content = String(body.content || '').slice(0, 8000)
  const payload = { workspace_id: workspace.id, user_id: user.id, title, content, updated_at: new Date().toISOString() }
  const { data, error } = body.id
    ? await supabase.from('collaboration_notes').update(payload).eq('id', body.id).select('*').single()
    : await supabase.from('collaboration_notes').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  try { await supabase.from('activity_events').insert({ user_id: user.id, workspace_id: workspace.id, type: 'note_updated', title: `Updated note: ${title}`, metadata: { note_id: data.id } }) } catch {}
  return NextResponse.json({ note: data })
}
