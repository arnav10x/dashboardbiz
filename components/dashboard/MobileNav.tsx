import Link from 'next/link';
import { Home, CheckSquare, Users, TrendingUp, BrainCircuit } from 'lucide-react';

export function MobileNav() {
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Advisor', href: '/dashboard/copilot', icon: BrainCircuit },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full backdrop-blur-xl border-t z-50 transition-colors duration-200"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-around p-3 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-1 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[9px] font-semibold tracking-wide">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
