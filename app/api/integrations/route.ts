import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PROVIDERS = [
  'google_calendar', 'stripe', 'calcom', 'shopify', 'hubspot', 'analytics', 'zapier', 'openai', 'custom'
]

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({ integrations: data || [] })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const provider = String(body.provider || '')
  const status = String(body.status || 'requested')
  if (!PROVIDERS.includes(provider) && !provider.startsWith('custom:')) return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })

  const { data, error } = await supabase
    .from('integration_connections')
    .upsert({
      user_id: user.id,
      provider,
      status,
      metadata: body.metadata || {},
      connected_at: status === 'connected' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ integration: data })
}

export async function DELETE(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider } = await req.json().catch(() => ({}))
  if (!provider) return NextResponse.json({ error: 'Missing provider' }, { status: 400 })

  const { error } = await supabase
    .from('integration_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
