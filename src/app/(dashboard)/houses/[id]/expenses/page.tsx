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

export default function HouseExpensesTab() {
  const params = useParams();
  const houseId = params.id as string;
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['groupExpenses', houseId],
    queryFn: () => getGroupExpenses(houseId),
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
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Variable Expenses</h2>
        <Link href={`/houses/${houseId}/expenses/new`} className="btn btn-primary btn-sm">+ Log Expense</Link>
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
          <p className="empty-state-description">Log shared house expenses like groceries.</p>
          <Link href={`/houses/${houseId}/expenses/new`} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
            Log First Expense
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
                className="row-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: idx < (data.items.length - 1) ? '1px solid var(--border-default)' : 'none',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 'var(--radius-md)',
                  background: isSettlement ? 'var(--positive-bg)' : 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>
                  {isSettlement ? '💸' : (CATEGORY_ICONS[expense.category] || '🧾')}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: 3 }} className="truncate">{expense.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{formatDateTime(expense.date)}</span>
                    <span>•</span>
                    <span>by {expense.createdByName}</span>
                  </div>
                </div>

                {/* Badges */}
                {!isSettlement && (
                  <span className={`badge ${categoryClass(expense.category)}`} style={{ flexShrink: 0 }}>
                    {expense.category.replace('_', ' ')}
                  </span>
                )}

                {/* Amounts */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(expense.totalPaise)}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                    {myContrib > 0 && <span style={{ color: 'var(--positive)' }}>+{formatCurrency(myContrib)} paid</span>}
                    {myShare > 0 && <span style={{ color: 'var(--negative)', marginLeft: myContrib > 0 ? 6 : 0 }}>−{formatCurrency(myShare)} share</span>}
                    {myContrib === 0 && myShare === 0 && <span style={{ color: 'var(--text-muted)' }}>not involved</span>}
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
