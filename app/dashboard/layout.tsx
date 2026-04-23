import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get current day from user_progress deeply fetching relation
  const { data: progress } = await supabase
    .from('user_progress')
    .select(`
      started_at,
      roadmap_days (
        day_number
      )
    `)
    .eq('user_id', user.id)
    .single();

  // Handle Supabase potentially returning roadmap_days as an array or object
  const rawDayData = progress?.roadmap_days;
  const dayData = Array.isArray(rawDayData) ? rawDayData[0] : rawDayData;
  const dayNumber = (dayData as any)?.day_number || 1;
  const streak = 0; // Fixed until daily task streaks are wired up

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden text-[#fafafa] font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar dayNumber={dayNumber} streak={streak} />
        <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0 scroll-smooth">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
