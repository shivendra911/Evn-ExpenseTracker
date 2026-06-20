'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { apiGet } from '@/api/client';
import { formatCurrency } from '@/lib/money';
import { useAuthStore } from '@/store/auth';

export default function HouseSettleTab() {
  const params = useParams();
  const houseId = params.id as string;
  const { user } = useAuthStore();

  const { data: balances, isLoading } = useQuery({
    queryKey: ['groupBalances', houseId],
    queryFn: () => apiGet<any>(`/api/groups/${houseId}/balances`),
  });

  if (isLoading) {
    return <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />;
  }

  const settlementPlan = balances?.settlementPlan || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Settle Up</h2>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {settlementPlan.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>All settled up!</div>
            <div style={{ fontSize: '0.875rem' }}>No pending settlements in the house.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {settlementPlan.map((s: any, i: number) => {
              const amIPayer = s.fromUser.id === user?.id;
              const amIReceiver = s.toUser.id === user?.id;
              const isMeInvolved = amIPayer || amIReceiver;

              return (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, background: isMeInvolved ? 'var(--bg-secondary)' : 'transparent',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontWeight: 500 }}>
                      {amIPayer ? 'You' : s.fromUser.name}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>→ pays →</div>
                    <div style={{ fontWeight: 500 }}>
                      {amIReceiver ? 'You' : s.toUser.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                      {formatCurrency(s.amountPaise)}
                    </div>
                    {amIPayer && (
                      <button className="btn btn-primary btn-sm">Settle</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
