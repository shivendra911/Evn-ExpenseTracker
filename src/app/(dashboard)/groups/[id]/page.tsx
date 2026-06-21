'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGroupExpenses } from '@/api/endpoints/groupExpenses';
import { formatCurrency } from '@/lib/money';
import { formatDateTime } from '@/lib/dates';
import { useAuthStore } from '@/store/auth';

function categoryClass(cat: string) {
  return `cat-${cat.toLowerCase().replace('_', '-')}`;
}

const CATEGORY_ICONS: Record<string, string> = {
  FOOD: '🍽', GROCERIES: '🛒', UTILITIES: '💡', RENT: '🏠',
  TRANSPORT: '🚗', ENTERTAINMENT: '🎬', HEALTH: '💊',
  SHOPPING: '🛍', TRAVEL: '✈️', SPORTS: '⚽', MISC: '📌',
};

export default function GroupExpensesTab() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['groupExpenses', groupId],
    queryFn: () => getGroupExpenses(groupId),
  });

  const getMyShare = (splits: any[]) => {
    if (!user) return 0;
    return splits.find(s => s.userId === user.id)?.amountPaise || 0;
  };
  const getMyContribution = (contributors: any[]) => {
    if (!user) return 0;
    return contributors.find(c => c.userId === user.id)?.amountPaise || 0;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Expenses</h2>
        <Link href={`/groups/${groupId}/expenses/new`} className="btn btn-primary btn-sm">+ Add</Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="card empty-state" style={{ padding: 48 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <h3 className="empty-state-title">No expenses yet</h3>
          <p className="empty-state-description">Start splitting bills with your group members.</p>
          <Link href={`/groups/${groupId}/expenses/new`} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
            Add First Expense
          </Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {data?.items.map((expense, idx) => {
            const myShare = getMyShare(expense.splits);
            const myContrib = getMyContribution(expense.contributors);
            const isSettlement = expense.title.startsWith('Settlement:');

            return (
              <div
                key={expense.id}
                className="row-hover flex items-center gap-3 p-4 border-b border-[var(--border-default)] last:border-0"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-lg ${isSettlement ? 'bg-[var(--positive-bg)]' : 'bg-[var(--bg-secondary)]'}`}>
                  {isSettlement ? '💸' : (CATEGORY_ICONS[expense.category] || '🧾')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate mb-0.5">{expense.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                    <span className="shrink-0">{formatDateTime(expense.date)}</span>
                    <span className="shrink-0">•</span>
                    <span className="truncate">by {expense.createdByName}</span>
                  </div>
                </div>

                {/* Badges (Hidden on mobile) */}
                {!isSettlement && (
                  <span className={`badge ${categoryClass(expense.category)} hidden sm:inline-flex shrink-0`}>
                    {expense.category.replace('_', ' ')}
                  </span>
                )}

                {/* Amounts */}
                <div className="text-right shrink-0 ml-2">
                  <div className="font-bold tabular-nums text-gray-900">{formatCurrency(expense.totalPaise)}</div>
                  <div className="text-xs mt-1 flex flex-col items-end">
                    {myContrib > 0 && <span className="text-green-600">+{formatCurrency(myContrib)} paid</span>}
                    {myShare > 0 && <span className="text-red-600">−{formatCurrency(myShare)} share</span>}
                    {myContrib === 0 && myShare === 0 && <span className="text-gray-400">not involved</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
