import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { AICoachSidebar } from '@/components/dashboard/AICoachSidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: progress } = await supabase
    .from('user_progress')
    .select('roadmap_days(day_number)')
    .eq('user_id', user.id)
    .single();

  const rawDayData = progress?.roadmap_days;
  const dayData = Array.isArray(rawDayData) ? rawDayData[0] : rawDayData;
  const dayNumber = (dayData as any)?.day_number || 1;

  const userName = (user.user_metadata?.full_name as string) || user.email || '';

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-emerald-500/20 transition-colors duration-200" style={{ background: 'var(--app-bg)', color: 'var(--text-primary)' }}>
      {/* Sidebar with labels and sections */}
      <Sidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} dayNumber={dayNumber} />
        <main className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Right AI coach panel */}
      <AICoachSidebar />

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
