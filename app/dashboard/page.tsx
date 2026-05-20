export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/strata/TopBar'
import { OverviewClient } from './OverviewClient'

export default async function OverviewPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: workspace }, { data: userSettings }] = await Promise.all([
    supabase.from('workspaces').select('id, name, business_type, stage, business_summary').eq('owner_id', user.id).maybeSingle(),
    supabase.from('user_settings').select('onboarding_completed, revenue_target').eq('user_id', user.id).maybeSingle(),
  ])

  // Redirect new users to onboarding if they haven't completed it
  if (!userSettings?.onboarding_completed) {
    redirect('/onboarding')
  }

  const [{ data: entries }, { data: todayTasks }] = await Promise.all([
    supabase.from('period_entries')
      .select('period_date, revenue, expenses, new_leads, leads, new_customers, customers, revenue_target')
      .eq('user_id', user.id)
      .order('period_date', { ascending: true })
      .limit(24),
    supabase.from('tasks')
      .select('id, title, is_completed, notes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const userName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Founder'
  const workspaceName = workspace?.name || 'My Workspace'
  const businessType = workspace?.business_type || 'Agency'
  const businessSummary = workspace?.business_summary || ''

  const rawEntries = (entries || []).map(e => ({
    period_date: e.period_date as string,
    revenue: Number(e.revenue) || 0,
    expenses: Number(e.expenses) || 0,
    new_leads: Number(e.new_leads) || Number(e.leads) || 0,
    new_customers: Number(e.new_customers) || Number(e.customers) || 0,
    revenue_target: Number(e.revenue_target) || Number(userSettings?.revenue_target) || 0,
  }))

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Overview"
        workspaceName={workspaceName}
        hasData={rawEntries.length > 0}
        actionLabel="Add data"
        actionHref="/dashboard/period-entry"
        showGreeting
      />
      <OverviewClient
        userName={userName}
        workspaceName={workspaceName}
        businessType={businessType}
        businessSummary={businessSummary}
        entries={rawEntries}
        todayTasks={(todayTasks || []) as { id: string; title: string; is_completed: boolean; notes?: string }[]}
      />
    </div>
  )
}
