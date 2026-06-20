'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/client';
import { formatCurrency } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';
import { EXPENSE_CATEGORIES } from '@/shared/validation';

export default function HouseMonthlyTab() {
  const params = useParams();
  const houseId = params.id as string;
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuthStore();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: monthStatus, isLoading: isLoadingMonth } = useQuery({
    queryKey: ['houseMonthly', houseId, currentMonth, currentYear],
    queryFn: () => apiGet<any>(`/api/houses/${houseId}/monthly?month=${currentMonth}&year=${currentYear}`),
  });

  const { data: fixedCosts, isLoading: isLoadingCosts } = useQuery({
    queryKey: ['houseFixedCosts', houseId],
    queryFn: () => apiGet<any[]>(`/api/houses/${houseId}/fixed-costs`),
  });

  const { data: members } = useQuery({
    queryKey: ['houseMembers', houseId],
    queryFn: () => apiGet<any[]>(`/api/houses/${houseId}/members`),
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmountStr, setNewAmountStr] = useState('');
  const [newCategory, setNewCategory] = useState('RENT');

  const myMember = members?.find(m => m.userId === user?.id);
  const amIHead = myMember?.role === 'HEAD' || myMember?.role === 'ADMIN';

  const isClosed = monthStatus?.isClosed;

  const createCostMutation = useMutation({
    mutationFn: (data: any) => apiPost(`/api/houses/${houseId}/fixed-costs`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseFixedCosts', houseId] });
      toastSuccess('Fixed cost added');
      setIsAdding(false);
      setNewTitle('');
      setNewAmountStr('');
    },
    onError: (e: any) => toastError(e.message)
  });

  const deleteCostMutation = useMutation({
    mutationFn: (costId: string) => apiDelete(`/api/houses/${houseId}/fixed-costs/${costId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseFixedCosts', houseId] });
      toastSuccess('Fixed cost removed');
    },
    onError: (e: any) => toastError(e.message)
  });

  const toggleCostMutation = useMutation({
    mutationFn: ({ costId, isActive }: { costId: string, isActive: boolean }) => 
      apiPatch(`/api/houses/${houseId}/fixed-costs/${costId}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseFixedCosts', houseId] });
    },
    onError: (e: any) => toastError(e.message)
  });

  const finalizeMonthMutation = useMutation({
    mutationFn: () => apiPost(`/api/houses/${houseId}/monthly`, { month: currentMonth, year: currentYear }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseMonthly', houseId] });
      queryClient.invalidateQueries({ queryKey: ['groupBalances', houseId] });
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', houseId] });
      toastSuccess('Month finalized successfully!');
    },
    onError: (e: any) => toastError(e.message)
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmountStr) return;
    const amountPaise = Math.round(parseFloat(newAmountStr) * 100);
    createCostMutation.mutate({ title: newTitle, amountPaise, category: newCategory });
  };

  if (isLoadingMonth || isLoadingCosts) {
    return <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />;
  }

  const activeCosts = fixedCosts?.filter(c => c.isActive) || [];
  const totalFixedPaise = activeCosts.reduce((sum, c) => sum + c.amountPaise, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Month Close-Out</h2>
        {amIHead && !isClosed && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            + Add Fixed Cost
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 350px' }}>
        {/* Left Column: Fixed Costs List */}
        <div>
          {isClosed && (
            <div className="card" style={{ padding: 16, background: 'var(--positive-bg)', border: '1px solid var(--positive)', color: 'var(--positive)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.25rem' }}>✅</span>
              <div>
                <div style={{ fontWeight: 600 }}>This month is finalized.</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Fixed costs have been posted to the ledger.</div>
              </div>
            </div>
          )}

          {isAdding && (
            <div className="card" style={{ padding: 20, marginBottom: 20, background: 'var(--bg-secondary)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9375rem' }}>New Fixed Cost</h4>
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Name</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. WiFi Bill" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Amount (₹)</label>
                  <input type="number" step="1" value={newAmountStr} onChange={e => setNewAmountStr(e.target.value)} placeholder="1000" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                    <option value="RENT">Rent</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="MISC">Misc</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={createCostMutation.isPending}>Add</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
              </form>
            </div>
          )}

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--border-default)' }}>
              Recurring Fixed Costs
            </div>
            {fixedCosts?.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                No fixed costs setup yet.
              </div>
            ) : (
              fixedCosts?.map(cost => (
                <div key={cost.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: cost.isActive ? 1 : 0.5 }}>
                  <div>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {cost.title}
                      {!cost.isActive && <span className="badge badge-neutral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>PAUSED</span>}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{cost.category} • Split equally</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(cost.amountPaise)}</div>
                    
                    {amIHead && !isClosed && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleCostMutation.mutate({ costId: cost.id, isActive: !cost.isActive })}
                        >
                          {cost.isActive ? 'Pause' : 'Resume'}
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => deleteCostMutation.mutate(cost.id)}
                          style={{ color: 'var(--negative)' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Month Summary */}
        <div className="card" style={{ padding: 24, height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 20px 0' }}>
            {new Date().toLocaleString('default', { month: 'long' })} Summary
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fixed Costs Total</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(totalFixedPaise)}</span>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-default)', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontWeight: 600 }}>Grand Total</span>
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(totalFixedPaise)}</span>
          </div>

          {amIHead ? (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => finalizeMonthMutation.mutate()}
              disabled={isClosed || activeCosts.length === 0 || finalizeMonthMutation.isPending}
            >
              {isClosed ? 'Month Finalized' : finalizeMonthMutation.isPending ? 'Processing...' : 'Finalize Month'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
              Only house admins can finalize the month.
            </div>
          )}
          {!isClosed && activeCosts.length > 0 && amIHead && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
              This will add {formatCurrency(totalFixedPaise)} to the shared ledger and split it among all active members.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
