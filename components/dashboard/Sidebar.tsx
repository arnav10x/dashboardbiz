import Link from 'next/link';
import { Home, CheckSquare, Users, TrendingUp, Award, Zap } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: "Today's Tasks", href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Lead Tracker', href: '/dashboard/leads', icon: Users },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
];

export function Sidebar() {
  return (
    <div className="hidden md:flex w-16 flex-col items-center bg-[#050505] border-r border-white/[0.06] h-screen sticky top-0 py-4 flex-shrink-0">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8">
        <div className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
          <Zap className="h-4.5 w-4.5 text-emerald-400" />
        </div>
      </Link>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="relative group">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-all">
              <item.icon className="h-5 w-5" />
            </div>
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d0d0d] border border-white/[0.08] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-xl">
              {item.name}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
