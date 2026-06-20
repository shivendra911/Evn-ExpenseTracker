'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getGroupBalances, createSettlement } from '@/api/endpoints/settlements';
import { formatCurrency } from '@/lib/money';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';

export default function GroupBalancesTab() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [settlingPlan, setSettlingPlan] = useState<{ from: string; to: string; amount: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['groupBalances', groupId],
    queryFn: () => getGroupBalances(groupId),
  });

  const settleMutation = useMutation({
    mutationFn: (data: { fromUserId: string; toUserId: string; amountPaise: number }) => 
      createSettlement(groupId, { ...data, note: 'Settled via SplitWise', date: new Date().toISOString() }),
    onSuccess: () => {
      toastSuccess('Settlement recorded successfully!');
      setIsModalOpen(false);
      setSettlingPlan(null);
      queryClient.invalidateQueries({ queryKey: ['groupBalances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', groupId] });
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to record settlement');
    },
  });

  const handleSettle = (plan: any) => {
    setSettlingPlan({ from: plan.fromUser.id, to: plan.toUser.id, amount: plan.amountPaise });
    setIsModalOpen(true);
  };

  const confirmSettlement = () => {
    if (!settlingPlan) return;
    settleMutation.mutate({
      fromUserId: settlingPlan.from,
      toUserId: settlingPlan.to,
      amountPaise: settlingPlan.amount,
    });
  };

  if (isLoading) {
    return <div className="skeleton" style={{ height: 200 }} />;
  }

  const { balances, settlementPlan } = data || { balances: [], settlementPlan: [] };
  
  // A user gets back money if balance > 0, owes money if balance < 0
  const myBalance = balances.find((b: any) => b.user.id === user?.id)?.balancePaise || 0;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Your Balance</h2>
        <div className="card" style={{ padding: 24, background: myBalance === 0 ? 'var(--bg-card)' : myBalance > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: myBalance > 0 ? 'var(--positive)' : myBalance < 0 ? 'var(--negative)' : 'inherit' }}>
            {myBalance > 0 ? '+' : ''}{formatCurrency(myBalance)}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            {myBalance > 0 ? 'You get back overall' : myBalance < 0 ? 'You owe overall' : 'You are settled up!'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 16 }}>Group Balances</h3>
          {balances.length === 0 ? (
            <p className="empty-state-description">No balances to show</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {balances.map((b: any) => (
                <div key={b.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {b.user.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{b.user.id === user?.id ? 'You' : b.user.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: b.balancePaise > 0 ? 'var(--positive)' : b.balancePaise < 0 ? 'var(--negative)' : 'inherit' }}>
                    {b.balancePaise > 0 ? '+' : ''}{formatCurrency(b.balancePaise)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: 16 }}>How to settle up</h3>
          {settlementPlan.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <p>Everyone is settled up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {settlementPlan.map((plan: any, i: number) => {
                const isMe = plan.fromUser.id === user?.id || plan.toUser.id === user?.id;
                
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: isMe ? 'var(--bg-active)' : 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>{plan.fromUser.id === user?.id ? 'You' : plan.fromUser.name}</span>
                      <span style={{ fontSize: '1.25rem' }}>➡️</span>
                      <span style={{ fontWeight: 500 }}>{plan.toUser.id === user?.id ? 'You' : plan.toUser.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{formatCurrency(plan.amountPaise)}</span>
                      {isMe && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleSettle(plan)}>
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Confirm Settlement</h3>
            <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
              Are you sure you want to record this payment? This will update the balances for everyone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSettlement} disabled={settleMutation.isPending}>
                {settleMutation.isPending ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
