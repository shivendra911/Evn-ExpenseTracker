'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { logoutUser } from '@/api/endpoints/auth';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/expenses': 'My Expenses',
  '/groups': 'Groups',
  '/houses': 'Houses',
  '/friends': 'Friends',
  '/activity': 'Activity',
  '/profile': 'Profile',
};

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

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile brand logo (hidden on desktop) */}
        <div className="md-hidden" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="var(--accent)" strokeWidth="2.5" />
            <path d="M16 3 A 13 13 0 0 1 16 29 Z" fill="var(--accent)" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* User profile / Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isAdmin && (
            <div
              onClick={() => router.push('/admin')}
              className="md-hidden row-hover"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem'
              }}
              title="Admin Panel"
            >
              A
            </div>
          )}
          <div
            onClick={() => router.push('/profile')}
            className="row-hover"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-secondary)', padding: '4px 4px 4px 12px',
              borderRadius: 30, border: '1px solid var(--border-default)',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            title="Profile settings"
          >
            <div className="hidden md-block" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </div>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent)', color: 'var(--text-inverse)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '0.875rem', flexShrink: 0
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hidden { display: none; }
        @media (min-width: 768px) {
          .md-block { display: block !important; }
          .md-hidden { display: none !important; }
        }
      `}</style>
    </header>
  );
}
