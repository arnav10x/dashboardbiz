import Link from 'next/link';
import { Home, CheckSquare, Users, TrendingUp, Award, Zap } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: "Today's Tasks", href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Lead Tracker', href: '/dashboard/leads', icon: Users },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
  ];

  return (
    <div className="hidden md:flex w-60 flex-col bg-[#050505] border-r border-white/[0.06] h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2.5">
        <div className="h-7 w-7 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center">
          <Zap className="text-emerald-400 h-4 w-4" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">
          Founder<span className="text-emerald-400">OS</span>
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all group cursor-pointer">
              <item.icon className="h-4 w-4 group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <Link
          href="/dashboard/leads"
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg py-2.5 px-3 text-sm font-bold transition-all"
        >
          <Users className="h-3.5 w-3.5" />
          Add Lead
        </Link>
      </div>
    </div>
  );
}
