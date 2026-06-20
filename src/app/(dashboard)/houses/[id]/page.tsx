'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';
import { formatCurrency } from '@/lib/money';
import { useAuthStore } from '@/store/auth';

export default function HouseOverviewTab() {
  const params = useParams();
  const houseId = params.id as string;
  const { user } = useAuthStore();

  // We reuse the existing groups balances API for now.
  // The monthly fixed costs + variable costs will feed into the group expenses API.
  const { data: balances, isLoading } = useQuery({
    queryKey: ['groupBalances', houseId],
    queryFn: () => apiGet<any>(`/api/groups/${houseId}/balances`),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  // Calculate my net balance
  let myNet = 0;
  if (user && balances?.settlementPlan) {
    for (const plan of balances.settlementPlan) {
      if (plan.fromUser.id === user.id) myNet -= plan.amountPaise;
      if (plan.toUser.id === user.id) myNet += plan.amountPaise;
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      {/* My Balance Card */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Your Net Balance
        </div>
        <div style={{
          fontSize: '2.5rem', fontWeight: 800,
          color: myNet === 0 ? 'var(--text-primary)' : myNet > 0 ? 'var(--positive)' : 'var(--negative)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {myNet === 0 ? 'Settled Up' : (myNet > 0 ? '+' : '') + formatCurrency(Math.abs(myNet))}
        </div>
        <p style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {myNet === 0 ? 'You owe nothing to the house.' : myNet > 0 ? 'The house owes you.' : 'You owe the house.'}
        </p>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <Link href={`/houses/${houseId}/expenses/new`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            + Log Expense
          </Link>
          <Link href={`/houses/${houseId}/settle`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Settle Up
          </Link>
        </div>
      </div>

      {/* House Summary Card */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>House Activity</div>
          <Link href={`/houses/${houseId}/expenses`} style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>
            View log →
          </Link>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(96,165,250,0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📅</div>
            <div>
              <div style={{ fontWeight: 500 }}>Current Month</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Variable expenses log</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link href={`/houses/${houseId}/expenses`} className="btn btn-secondary btn-sm">Open</Link>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(167,139,250,0.12)', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📝</div>
            <div>
              <div style={{ fontWeight: 500 }}>Fixed Bills</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Rent, Wifi, etc.</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link href={`/houses/${houseId}/monthly`} className="btn btn-secondary btn-sm">Open</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
