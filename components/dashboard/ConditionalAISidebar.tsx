"use client"
import { usePathname } from 'next/navigation';
import { AICoachSidebar } from './AICoachSidebar';

export function ConditionalAISidebar() {
  const pathname = usePathname();
  // Hide the outreach AI sidebar on the dedicated copilot page
  if (pathname === '/dashboard/copilot') return null;
  return <AICoachSidebar />;
}
