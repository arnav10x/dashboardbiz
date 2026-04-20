import Link from 'next/link';
import { Home, CheckSquare, Users, TrendingUp, Award, Target } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Today\'s Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Lead Tracker', href: '/dashboard/leads', icon: Users },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-[#09090b] border-r border-zinc-800 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <Target className="text-indigo-500 h-6 w-6" />
        <span className="text-white font-bold text-lg tracking-tight">Founder OS</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-colors group cursor-pointer">
              <item.icon className="h-5 w-5 group-hover:text-indigo-400 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
         <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2 px-3 text-sm font-medium transition-colors">
            Quick Add Lead
         </button>
      </div>
    </div>
  );
}
