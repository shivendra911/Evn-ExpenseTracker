'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { logoutUser } from '@/api/endpoints/auth';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Home',
  '/expenses': 'Expenses',
  '/groups': 'Groups',
  '/houses': 'Houses',
  '/friends': 'Friends',
  '/activity': 'Analytics',
  '/profile': 'Profile',
};

const QuickActions = [
  { label: 'Expense', href: '/expenses/new', icon: '💸' },
  { label: 'Group', href: '/groups/new', icon: '👥' },
  { label: 'House', href: '/houses/new', icon: '🏡' },
  { label: 'Friend', href: '/friends', icon: '👤' }, // Could link to a specific add friend modal/page
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const isAdmin = user?.email === 'promtengineering5@gmail.com' || user?.isAdmin;

  // Find the closest matching route title
  let title = 'Evn';
  for (const [route, routeTitle] of Object.entries(ROUTE_TITLES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      title = routeTitle;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-default)]">
      <div className="flex items-center gap-4">
        {/* Mobile brand logo (hidden on desktop) */}
        <div className="md:hidden block">
          <Logo className="scale-90 origin-left" />
        </div>
        <h1 className="hidden md:block text-title m-0">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Quick Actions (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3">
          {QuickActions.map(action => (
            <Link 
              key={action.label} 
              href={action.href}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>

        {/* User profile / Logout */}
        <div className="flex items-center gap-4 border-l border-[var(--border-default)] pl-4">
          {isAdmin && (
            <div
              onClick={() => router.push('/admin')}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-pointer font-bold text-xs"
              title="Admin Panel"
            >
              A
            </div>
          )}
          <div onClick={() => router.push('/profile')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar name={user?.name || 'User'} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
