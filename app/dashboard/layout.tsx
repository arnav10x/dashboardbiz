import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/strata/Sidebar'
import { MobileNav } from '@/components/strata/MobileNav'
import { CreateWorkspaceModal } from '@/components/strata/CreateWorkspaceModal'
import { ThemeLoader } from '@/components/strata/ThemeLoader'
import { AICoachPanel } from '@/components/strata/AICoachPanel'
import { LogoPreloader } from '@/components/strata/LogoPreloader'
import { ToastProvider } from '@/components/strata/Toast'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, business_type, stage')
    .eq('owner_id', user.id)
    .maybeSingle()

  const userName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Founder'

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <ThemeLoader />
        <LogoPreloader />
        {!workspace && <CreateWorkspaceModal />}

        <Sidebar
          userName={userName}
          userEmail={user.email || ''}
          workspaceName={workspace?.name || 'My Workspace'}
          workspaceType={workspace?.business_type || 'Agency'}
          workspaceStage={workspace?.stage || 'Early Stage'}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>

        <AICoachPanel userName={userName} />

        <MobileNav />
      </div>
    </ToastProvider>
  )
}
