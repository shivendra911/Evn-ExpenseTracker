'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost, apiPatch } from '@/api/client';
import { formatCurrency } from '@/lib/money';
import { formatDateTime } from '@/lib/dates';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';

export default function FriendProfilePage() {
  const params = useParams();
  const friendId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['friendProfile', friendId],
    queryFn: () => apiGet<any>(`/api/friends/${friendId}`),
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['friendActivity', friendId],
    queryFn: () => apiGet<any>(`/api/friends/${friendId}/activity`),
  });

  const isLoading = profileLoading || activityLoading;

  if (isLoading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 400, marginTop: 24, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (!profileData?.friend) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Friend not found</h3>
      </div>
    );
  }

  const { friend, sharedGroups } = profileData;
  const { activity, netBalancePaise } = activityData || { activity: [], netBalancePaise: 0 };

  const handleSettleUp = async () => {
    if (!settleAmount || isNaN(Number(settleAmount)) || Number(settleAmount) <= 0) return;
    if (!sharedGroups || sharedGroups.length === 0) return toastError('No shared groups found');

    try {
      setIsSubmitting(true);
      await apiPost(`/api/friends/${friendId}/settlements`, {
        amountPaise: Math.round(Number(settleAmount) * 100),
        groupId: sharedGroups[0].id
      });
      setShowSettleModal(false);
      setSettleAmount('');
      queryClient.invalidateQueries({ queryKey: ['friendActivity', friendId] });
      queryClient.invalidateQueries({ queryKey: ['allGroupBalances'] });
      toastSuccess('Payment recorded! Waiting for friend to accept.');
    } catch (err: any) {
      toastError(err.message || 'Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusAction = async (settlementId: string, status: 'ACCEPTED' | 'DISPUTED') => {
    try {
      await apiPatch(`/api/settlements/${settlementId}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ['friendActivity', friendId] });
      queryClient.invalidateQueries({ queryKey: ['friendProfile', friendId] });
      queryClient.invalidateQueries({ queryKey: ['allGroupBalances'] });
      toastSuccess(status === 'ACCEPTED' ? 'Payment accepted!' : 'Payment disputed.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Profile Card */}
      <div className="card" style={{ padding: '40px 32px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Link href="/friends" style={{ position: 'absolute', top: 16, left: 16, textDecoration: 'none' }}>
          <div className="btn btn-ghost btn-sm" style={{ padding: '6px 12px' }}>
            ← Back
          </div>
        </Link>
        
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFF', fontWeight: 700, fontSize: '2.5rem',
          margin: '0 auto 16px'
        }}>
          {friend.name.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem' }}>{friend.name}</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{friend.email}</p>

        <div style={{ marginTop: 24, padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            Overall Balance
          </div>
          {netBalancePaise === 0 ? (
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>Settled up</div>
          ) : netBalancePaise > 0 ? (
            <>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--positive)' }}>
                {formatCurrency(netBalancePaise)}
              </div>
              <div style={{ color: 'var(--positive)', fontWeight: 500 }}>They owe you</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--negative)' }}>
                {formatCurrency(Math.abs(netBalancePaise))}
              </div>
              <div style={{ color: 'var(--negative)', fontWeight: 500, marginBottom: 16 }}>You owe them</div>
              <button 
                className="btn" 
                style={{ 
                  width: '100%', 
                  padding: '14px 0', 
                  fontSize: '1rem',
                  background: 'var(--positive)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(74, 222, 128, 0.39)'
                }}
                onClick={() => {
                  setSettleAmount((Math.abs(netBalancePaise) / 100).toString());
                  setShowSettleModal(true);
                }}
              >
                Settle Up / Pay
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settle Modal */}
      {showSettleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ padding: 32, width: '90%', maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>Settle Up with {friend.name}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Record a payment you made outside of the app (e.g. UPI, Cash).</p>
            
            <div className="form-group" style={{ marginTop: 24 }}>
              <label>Amount (₹)</label>
              <input
                type="number"
                value={settleAmount}
                onChange={e => setSettleAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setShowSettleModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={handleSettleUp}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History (GPay style) */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Transaction History</h2>
        
        {activity.length === 0 ? (
          <div className="card empty-state" style={{ padding: 48 }}>
            <span className="empty-state-icon">💸</span>
            <p className="empty-state-description">No shared expenses yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activity.map((item: any) => {
              const isSettlement = item.type === 'SETTLEMENT';
              const impactPos = item.netImpactPaise > 0;
              const impactNeg = item.netImpactPaise < 0;
              
              return (
                <div key={item.id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: isSettlement ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {isSettlement ? '🤝' : '🧾'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                          {item.title}
                          {isSettlement && item.status === 'PENDING' && (
                            <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: '#FFF', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>
                              PENDING
                            </span>
                          )}
                          {isSettlement && item.status === 'DISPUTED' && (
                            <span style={{ fontSize: '0.75rem', background: 'var(--negative)', color: '#FFF', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>
                              DISPUTED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {formatDateTime(item.date)} • {item.groupName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: impactPos ? 'var(--positive)' : impactNeg ? 'var(--negative)' : 'inherit' }}>
                          {impactPos ? '+' : impactNeg ? '-' : ''}{formatCurrency(item.impactAmount)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons if this is a pending settlement and I'm the receiver (impactPos is false and it's them paying me, wait... item.title === 'They paid you') */}
                    {isSettlement && item.status === 'PENDING' && item.title === 'They paid you' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                          onClick={() => handleStatusAction(item.settlementId, 'ACCEPTED')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                          onClick={() => handleStatusAction(item.settlementId, 'DISPUTED')}
                        >
                          Dispute
                        </button>
                      </div>
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
