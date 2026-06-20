'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getPersonalStats } from '@/api/endpoints/personalExpenses';
import { apiGet } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { formatCurrency } from '@/lib/money';
import type { GroupResponse } from '@/shared/types';

// Simple single-weight line icons (Lucide-inspired)
const SVGIcons = {
  Wallet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  Activity: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  TrendingUp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  Users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Food: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Rent: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Misc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

function getCategoryIcon(cat: string) {
  if (cat === 'FOOD' || cat === 'GROCERIES') return SVGIcons.Food;
  if (cat === 'RENT' || cat === 'UTILITIES') return SVGIcons.Rent;
  return SVGIcons.Misc;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['personalStats'],
    queryFn: () => getPersonalStats(),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiGet<GroupResponse[]>('/api/groups'),
  });

  const { data: groupBalances } = useQuery({
    queryKey: ['allGroupBalances', groups?.map(g => g.id)],
    queryFn: async () => {
      if (!groups || groups.length === 0) return [];
      const results = await Promise.all(
        groups.map(async (g) => {
          try {
            const bal = await apiGet<any>(`/api/groups/${g.id}/balances`);
            return { ...bal, name: g.name, id: g.id };
          } catch {
            return { balances: [], settlementPlan: [], name: g.name, id: g.id };
          }
        })
      );
      return results;
    },
    enabled: !!groups && groups.length > 0,
  });

  const netGroupBalance = (() => {
    if (!groupBalances || !user) return null;
    let net = 0;
    for (const group of groupBalances) {
      for (const plan of (group.settlementPlan || [])) {
        if (plan.fromUser?.id === user.id) net -= plan.amountPaise;
        if (plan.toUser?.id === user.id) net += plan.amountPaise;
      }
    }
    return net;
  })();

  const pendingSettlements = (() => {
    if (!groupBalances || !user) return [];
    const items: any[] = [];
    for (const group of groupBalances) {
      for (const plan of (group.settlementPlan || [])) {
        if (plan.fromUser?.id === user.id) {
          items.push({ ...plan, groupName: group.name });
        }
      }
    }
    return items;
  })();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header section */}
      <div style={{ marginBottom: 40, marginTop: 16 }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Here's your financial overview for {new Date().toLocaleString('default', { month: 'long' })}.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        
        {/* Net Shared Balance */}
        <div className="card row-hover" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shared Balance
            </div>
            <div style={{ color: 'var(--accent)', opacity: 0.8 }}>
              {SVGIcons.Users}
            </div>
          </div>
          
          {netGroupBalance === null ? (
            <div className="skeleton" style={{ height: 44, width: 140, borderRadius: 6 }} />
          ) : (
            <div>
              <div style={{
                fontSize: '2.25rem', 
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: netGroupBalance === 0 ? 'var(--text-primary)' : netGroupBalance > 0 ? 'var(--positive)' : 'var(--negative)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {netGroupBalance > 0 ? '+' : ''}{formatCurrency(Math.abs(netGroupBalance))}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {netGroupBalance > 0 ? 'Overall owed to you' : netGroupBalance < 0 ? 'Overall you owe others' : 'You are completely settled'}
              </p>
            </div>
          )}
        </div>

        {/* Personal Spend */}
        <div className="card row-hover" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Personal Spends
            </div>
            <div style={{ color: 'var(--accent)', opacity: 0.8 }}>
              {SVGIcons.Wallet}
            </div>
          </div>
          
          {statsLoading ? (
            <div className="skeleton" style={{ height: 44, width: 140, borderRadius: 6 }} />
          ) : (
            <div>
              <div style={{ 
                fontSize: '2.25rem', 
                fontWeight: 600, 
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--text-primary)'
              }}>
                {formatCurrency(stats?.currentMonthTotal || 0)}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Across {stats?.categoryTotals?.length || 0} categories this month
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        
        {/* Top Categories */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)' }}>{SVGIcons.Activity}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Top Categories</h3>
            </div>
            <Link href="/expenses" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View log
            </Link>
          </div>

          <div style={{ padding: 24 }}>
            {statsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 32, borderRadius: 4 }} />)}
              </div>
            ) : !stats?.categoryTotals?.length ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: 12, opacity: 0.5 }}>{SVGIcons.TrendingUp}</div>
                <p style={{ fontSize: '0.9375rem' }}>No personal expenses logged.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {stats.categoryTotals.slice(0, 4).map(cat => {
                  const max = stats.categoryTotals[0].totalPaise;
                  const pct = Math.round((cat.totalPaise / max) * 100);
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{getCategoryIcon(cat.category)}</span>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{cat.category.replace('_', ' ')}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(cat.totalPaise)}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Action Required</h3>
            <Link href="/friends" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Settle all
            </Link>
          </div>

          <div style={{ padding: 0 }}>
            {pendingSettlements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.5 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <p style={{ fontSize: '0.9375rem' }}>You're all settled up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pendingSettlements.slice(0, 5).map((plan, i) => (
                  <div key={i} className="row-hover" style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '16px 24px', borderBottom: '1px solid var(--border-default)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        You owe <span style={{ fontWeight: 600 }}>{plan.toUser?.name}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{plan.groupName}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--negative)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(plan.amountPaise)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
