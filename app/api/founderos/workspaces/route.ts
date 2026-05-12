import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { workspaceId } = await req.json().catch(() => ({}))
  if (!workspaceId) return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })
  const { data: workspace } = await supabase.from('workspaces').select('owner_id').eq('id', workspaceId).maybeSingle()
  if (!workspace || workspace.owner_id !== user.id) return NextResponse.json({ error: 'Only the owner can delete this workspace' }, { status: 403 })
  await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId)
  await supabase.from('team_members').delete().eq('workspace_id', workspaceId)
  const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
