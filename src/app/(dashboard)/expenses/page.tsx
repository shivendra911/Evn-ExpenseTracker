'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getPersonalExpenses } from '@/api/endpoints/personalExpenses';
import { formatCurrency } from '@/lib/money';
import { formatDateTime } from '@/lib/dates';

function categoryClass(cat: string) {
  return `cat-${cat.toLowerCase().replace('_', '-')}`;
}

function categoryIcon(cat: string) {
  const map: Record<string, string> = {
    FOOD: '🍽', GROCERIES: '🛒', UTILITIES: '💡', RENT: '🏠',
    TRANSPORT: '🚗', ENTERTAINMENT: '🎬', HEALTH: '💊',
    SHOPPING: '🛍', TRAVEL: '✈️', SPORTS: '⚽', MISC: '📌',
  };
  return map[cat] || '📌';
}

export default function ExpensesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['personalExpenses'],
    queryFn: () => getPersonalExpenses({ limit: 50 }),
  });

  const total = data?.items.reduce((s, e) => s + e.amountPaise, 0) || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Expenses</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track your personal spending</p>
        </div>
        <Link href="/expenses/new" className="btn btn-primary">+ Add Expense</Link>
      </div>

      {/* Total banner */}
      {!isLoading && (data?.items.length || 0) > 0 && (
        <div className="card" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {data?.items.length} expense{data?.items.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(total)}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 68, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--negative)' }}>
          Failed to load expenses. Please try again later.
        </div>
      ) : data?.items.length === 0 ? (
        <div className="card empty-state" style={{ padding: 56 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
          </svg>
          <h3 className="empty-state-title">No expenses yet</h3>
          <p className="empty-state-description">Add your first personal expense to start tracking.</p>
          <Link href="/expenses/new" className="btn btn-primary" style={{ marginTop: 16 }}>Add Expense</Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {data?.items.map((expense, idx) => (
            <div
              key={expense.id}
              className="row-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 20px',
                borderBottom: idx < (data.items.length - 1) ? '1px solid var(--border-default)' : 'none',
              }}
            >
              {/* Category icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>
                {categoryIcon(expense.category)}
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, marginBottom: 3 }} className="truncate">{expense.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDateTime(expense.date)}</div>
              </div>

              {/* Category badge */}
              <span className={`badge ${categoryClass(expense.category)}`} style={{ flexShrink: 0 }}>
                {expense.category.replace('_', ' ')}
              </span>

              {/* Amount */}
              <div style={{ fontWeight: 700, fontSize: '1rem', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(expense.amountPaise)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
