'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '📊' },
  { href: '/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/expenses/new', label: 'Add', icon: '➕', isPrimary: true },
  { href: '/groups', label: 'Groups', icon: '👥' },
  { href: '/activity', label: 'Activity', icon: '⚡' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-default)',
        padding: '8px 4px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                marginTop: -20, // pop out effect
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                }}
              >
                {item.icon}
              </div>
              <span style={{ fontSize: '0.6875rem', marginTop: 4, fontWeight: 500, color: 'var(--accent)' }}>
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              minWidth: 56,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '1.25rem', marginBottom: 2, opacity: isActive ? 1 : 0.7 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
