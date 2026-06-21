'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getPersonalStats } from '@/api/endpoints/personalExpenses';
import { apiGet } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { formatCurrency } from '@/lib/money';
import { Avatar } from '@/components/ui/Avatar';
import type { GroupResponse } from '@/shared/types';

const SVGIcons = {
  Wallet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  Activity: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  TrendingUp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
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
      return Promise.all(
        groups.map(async (g) => {
          try {
            const bal = await apiGet<any>(`/api/groups/${g.id}/balances`);
            return { ...bal, name: g.name, id: g.id };
          } catch {
            return { balances: [], settlementPlan: [], name: g.name, id: g.id };
          }
        })
      );
    },
    enabled: !!groups && groups.length > 0,
  });

  let totalOwed = 0;
  let totalOwe = 0;
  const pendingSettlements: any[] = [];

  if (groupBalances && user) {
    for (const group of groupBalances) {
      for (const plan of (group.settlementPlan || [])) {
        if (plan.fromUser?.id === user.id) {
          totalOwe += plan.amountPaise;
          pendingSettlements.push({ ...plan, groupName: group.name });
        }
        if (plan.toUser?.id === user.id) {
          totalOwed += plan.amountPaise;
        }
      }
    }
  }

  const netBalance = totalOwed - totalOwe;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header section */}
      <div className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-heading mb-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-gray-500">
            Here's your financial overview for {new Date().toLocaleString('default', { month: 'long' })}.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* You Owe */}
        <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm hover:border-red-200 transition-colors">
          <div className="text-sm font-medium text-red-600/80 mb-2 flex items-center gap-2">
            <span>💸</span> You owe
          </div>
          <div className="text-3xl font-bold text-red-600 tabular-nums">
            {formatCurrency(totalOwe)}
          </div>
        </div>

        {/* You're Owed */}
        <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm hover:border-green-200 transition-colors">
          <div className="text-sm font-medium text-green-600/80 mb-2 flex items-center gap-2">
            <span>🟢</span> You're owed
          </div>
          <div className="text-3xl font-bold text-green-600 tabular-nums">
            {formatCurrency(totalOwed)}
          </div>
        </div>

        {/* Net */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
          <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <span>⚖</span> Net
          </div>
          <div className={`text-3xl font-bold tabular-nums ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netBalance > 0 ? '+' : ''}{formatCurrency(netBalance)}
          </div>
        </div>
      </div>

      {/* Personal Spends Overall Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8 flex justify-between items-center hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => window.location.href = '/expenses'}>
        <div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="text-indigo-600">{SVGIcons.Wallet}</span> Personal Spends
          </div>
          {statsLoading ? (
            <div className="h-10 w-32 bg-gray-100 rounded animate-pulse mt-2" />
          ) : (
            <>
              <div className="text-4xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(stats?.currentMonthTotal || 0)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Across {stats?.categoryTotals?.length || 0} categories this month</p>
            </>
          )}
        </div>
        <div className="hidden sm:block text-gray-400">
          View Log →
        </div>
      </div>

      {/* Detail Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-indigo-600">{SVGIcons.Activity}</span> Top Categories
            </h3>
          </div>

          <div className="p-6 flex-1">
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : !stats?.categoryTotals?.length ? (
              <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                <span className="mb-3 opacity-50">{SVGIcons.TrendingUp}</span>
                <p>No personal expenses logged.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {stats.categoryTotals.slice(0, 4).map(cat => {
                  const max = stats.categoryTotals[0].totalPaise;
                  const pct = Math.round((cat.totalPaise / max) * 100);
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-gray-400">{getCategoryIcon(cat.category)}</span>
                          <span className="font-medium text-gray-700 capitalize">{cat.category.toLowerCase().replace('_', ' ')}</span>
                        </div>
                        <span className="font-semibold tabular-nums text-gray-900">
                          {formatCurrency(cat.totalPaise)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⚠️ Action Required
            </h3>
            <Link href="/friends" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Settle all
            </Link>
          </div>

          <div className="flex-1">
            {pendingSettlements.length === 0 ? (
              <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                <span className="text-3xl mb-3">🎉</span>
                <p className="font-medium text-gray-600">You're all settled up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingSettlements.slice(0, 5).map((plan, i) => (
                  <div key={i} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={plan.toUser?.name} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Owe <span className="font-semibold">{plan.toUser?.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">{plan.groupName}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-red-600 tabular-nums">
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
