'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiGet } from '@/api/client';
import type { GroupResponse } from '@/shared/types';
import { formatCurrency } from '@/lib/money';

export default function HousesPage() {
  const { data: allGroups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiGet<GroupResponse[]>('/api/groups'),
  });

  const houses = allGroups?.filter(g => g.type === 'HOUSE') || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Houses</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your shared living expenses</p>
        </div>
        <Link href="/houses/new" className="btn btn-primary">+ Create House</Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : houses.length === 0 ? (
        <div className="card empty-state" style={{ padding: 64 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h3 className="empty-state-title">No houses yet</h3>
          <p className="empty-state-description" style={{ maxWidth: 300, margin: '0 auto' }}>
            Create a house to manage rent, groceries, and shared bills with your flatmates.
          </p>
          <Link href="/houses/new" className="btn btn-primary" style={{ marginTop: 24 }}>Create House</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {houses.map((house) => (
            <Link key={house.id} href={`/houses/${house.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card card-hover" style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 4 }}>{house.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <span>{house.memberCount} members</span>
                    </div>
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.375rem', flexShrink: 0,
                  }}>
                    🏡
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your balance</span>
                  {/* For v1, we won't load the live balance here unless we make a separate call. We'll show a placeholder that can be hooked up to group balances. */}
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent)' }}>View dashboard →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
