'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { EXPENSE_CATEGORIES } from '@/shared/validation';

export default function NewHouseExpensePage() {
  const router = useRouter();
  const params = useParams();
  const houseId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<string>('GROCERIES');
  
  // Custom manual unchecking
  const [uncheckedMemberIds, setUncheckedMemberIds] = useState<Set<string>>(new Set());

  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ['houseMembers', houseId],
    queryFn: () => apiGet<any[]>(`/api/houses/${houseId}/members`),
  });

  const activeMembers = useMemo(() => members?.filter(m => m.isActive) || [], [members]);

  // Determine who is included based on defaults and manual unchecks
  const includedMemberIds = useMemo(() => {
    return activeMembers.filter(m => {
      // If manually unchecked, ignore
      if (uncheckedMemberIds.has(m.userId)) return false;
      // If default is false for this category, they are not included (unless they are the payer, but usually we respect the default)
      // Actually if default is false, we should put them in uncheckedMemberIds initially?
      // No, let's compute it dynamically:
      const defaults = m.houseDefaults || {};
      const isDefaultParticipating = defaults[category] !== false;
      return isDefaultParticipating;
    }).map(m => m.userId);
  }, [activeMembers, category, uncheckedMemberIds]);

  const toggleMember = (userId: string) => {
    setUncheckedMemberIds(prev => {
      const next = new Set(prev);
      if (includedMemberIds.includes(userId)) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiPost(`/api/groups/${houseId}/expenses`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', houseId] });
      queryClient.invalidateQueries({ queryKey: ['groupBalances', houseId] });
      toastSuccess('Expense logged');
      router.push(`/houses/${houseId}/expenses`);
    },
    onError: (error: any) => {
      toastError(error.message || 'Failed to add expense');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!title || !amount || amount <= 0 || includedMemberIds.length === 0 || !user) return;

    const amountPaise = Math.round(amount * 100);

    const data = {
      title,
      totalPaise: amountPaise,
      category,
      date: new Date().toISOString(),
      splitType: 'EQUAL',
      contributors: [
        { userId: user.id, amountPaise } // Assumes the current user paid the whole amount
      ],
      splits: includedMemberIds.map(userId => ({ userId })) // EQUAL split will calculate exact amounts on backend
    };

    createMutation.mutate(data);
  };

  if (isMembersLoading) {
    return <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Log Variable Expense</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Groceries, food, shared supplies, etc.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                style={{ fontSize: '1.25rem', padding: '12px 16px' }}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={e => {
                setCategory(e.target.value);
                setUncheckedMemberIds(new Set()); // Reset manual checks on category change
              }}>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>What was it for?</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Milk & Bread, Swiggy order..."
              required
              maxLength={200}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ margin: 0 }}>Who is splitting this?</label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {includedMemberIds.length} members
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeMembers.map(member => {
                const isIncluded = includedMemberIds.includes(member.userId);
                
                return (
                  <label 
                    key={member.userId}
                    className="row-hover"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, 
                      padding: '10px 12px', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      background: isIncluded ? 'var(--bg-secondary)' : 'transparent',
                      opacity: isIncluded ? 1 : 0.6
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isIncluded}
                      onChange={() => toggleMember(member.userId)}
                      style={{ width: 18, height: 18 }}
                    />
                    <img 
                      src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                      alt={member.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-primary)' }}
                    />
                    <span style={{ fontWeight: 500 }}>{member.name}</span>
                    {member.userId === user?.id && <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>(You paid)</span>}
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || !amountStr || createMutation.isPending || includedMemberIds.length === 0}
            >
              {createMutation.isPending ? 'Logging...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
