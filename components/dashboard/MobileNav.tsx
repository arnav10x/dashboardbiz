import Link from 'next/link';
import { Home, CheckSquare, Users, TrendingUp, CalendarDays } from 'lucide-react';

export function MobileNav() {
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-white/[0.06] z-50">
      <div className="flex items-center justify-around p-3 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-1 text-zinc-600 hover:text-emerald-400 transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold tracking-wide">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
