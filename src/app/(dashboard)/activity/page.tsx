'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiGet } from '@/api/client';
import { formatDateTime } from '@/lib/dates';
import { formatCurrency } from '@/lib/money';
import type { PaginatedResponse, PersonalExpenseResponse } from '@/shared/types';

function categoryClass(cat: string) {
  return `cat-${cat.toLowerCase().replace('_', '-')}`;
}

const GROUP_ICONS: Record<string, string> = {
  TRIP: '✈️', FLATMATES: '🏠', OFFICE: '💼', SPORTS: '⚽', FAMILY: '👨‍👩‍👧', HOUSE: '🏡', OTHER: '📌',
};

export default function ActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['personalExpenses', { limit: 10 }],
    queryFn: () => apiGet<PaginatedResponse<PersonalExpenseResponse>>('/api/personal-expenses?limit=10'),
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recent Activity</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your latest transactions</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="card empty-state" style={{ padding: 56 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <h3 className="empty-state-title">No activity yet</h3>
          <p className="empty-state-description">When you add expenses or settle up, they will appear here.</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline spine */}
          <div style={{
            position: 'absolute', top: 24, bottom: 24, left: 27,
            width: 1, background: 'var(--border-default)', zIndex: 0
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', zIndex: 1 }}>
            {data?.items.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', gap: 16, paddingBottom: idx < (data.items.length - 1) ? 20 : 0 }}>
                {/* Icon dot */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '1rem',
                }}>
                  🧾
                </div>

                {/* Content card */}
                <div className="card" style={{ flex: 1, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }} className="truncate">
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDateTime(item.date)}</span>
                        <span className={`badge ${categoryClass(item.category)}`} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--negative)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(item.amountPaise)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
