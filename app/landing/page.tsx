import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strata — The performance OS built for serious founders',
  description: 'Track your P&L, manage your pipeline, and get AI-coached from $0 to your first clients — all in one ruthlessly focused dashboard.',
}

export default async function LandingRoute() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <LandingPage isLoggedIn={!!user} />
}
