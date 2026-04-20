import Link from 'next/link';
import { Home, CheckSquare, Users, TrendingUp } from 'lucide-react';

export function MobileNav() {
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-[#09090b] border-t border-zinc-800 z-50 padding-safe-bottom">
      <div className="flex items-center justify-around p-3">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-indigo-400 transition-colors">
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
