'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { logoutUser } from '@/api/endpoints/auth';
import { Logo } from '@/components/ui/Logo';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile brand logo (hidden on desktop) */}
        <div className="md-hidden">
          <Logo className="scale-90 origin-left" />
        </div>
        <h1 className="hidden md-block" style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
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
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--accent)', color: 'var(--text-inverse)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: '0.9375rem', flexShrink: 0,
              cursor: 'pointer', transition: 'all 0.2s ease',
              border: '2px solid var(--bg-card)',
              boxShadow: '0 0 0 1px var(--border-default)'
            }}
            title="Profile settings"
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
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
