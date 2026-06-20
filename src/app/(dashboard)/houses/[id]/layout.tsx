'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getGroup } from '@/api/endpoints/groups';

export default function HouseDetailLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const houseId = params.id as string;

  const { data: house, isLoading, error } = useQuery({
    queryKey: ['group', houseId],
    queryFn: () => getGroup(houseId),
  });

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 120, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (error || !house || house.type !== 'HOUSE') {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--negative)', marginBottom: 8 }}>House Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          This house doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/houses" className="btn btn-primary">Back to Houses</Link>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', href: `/houses/${houseId}` },
    { name: 'Expenses', href: `/houses/${houseId}/expenses` },
    { name: 'Monthly', href: `/houses/${houseId}/monthly` },
    { name: 'Members', href: `/houses/${houseId}/members` },
    { name: 'Settle', href: `/houses/${houseId}/settle` },
  ];

  if (house.myRole === 'ADMIN' || house.myRole === 'HEAD') {
    tabs.push({ name: 'Settings', href: `/houses/${houseId}/settings` });
  }

  const isExactPath = (href: string) => {
    if (href === `/houses/${houseId}` && pathname === `/houses/${houseId}`) return true;
    if (href !== `/houses/${houseId}` && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div>
      {/* House Header */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{house.name}</h1>
              <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '1rem' }}>🏡</span> HOUSE
              </span>
            </div>
            {house.description && (
              <p style={{ color: 'var(--text-secondary)' }}>{house.description}</p>
            )}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Invite Code
            </div>
            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '6px 12px', 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'var(--accent)'
            }}>
              {house.inviteCode}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginTop: 24, borderBottom: '1px solid var(--border-default)', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const active = isExactPath(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                style={{
                  padding: '12px 4px',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}
