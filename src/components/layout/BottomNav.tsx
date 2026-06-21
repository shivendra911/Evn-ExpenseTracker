'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Icons = {
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Expenses: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Add: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Friends: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Profile: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: Icons.Home },
  { href: '/expenses', label: 'Expenses', Icon: Icons.Expenses },
  { href: '/expenses/new', label: 'Add', Icon: Icons.Add, isPrimary: true },
  { href: '/friends', label: 'Friends', Icon: Icons.Friends },
  { href: '/groups', label: 'Groups', Icon: Icons.Friends }, // Reusing the Friends/Groups icon
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around bg-[var(--bg-card)] border-t border-[var(--border-default)] pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 px-1">
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/expenses/new' && pathname.startsWith(`${item.href}/`));

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-6 group"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 group-hover:scale-105 group-active:scale-95 transition-transform">
                <item.Icon />
              </div>
              <span className="text-[10px] mt-1 font-medium text-[var(--accent)]">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[60px] ${isActive ? 'text-[var(--accent)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
              <item.Icon />
            </span>
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
