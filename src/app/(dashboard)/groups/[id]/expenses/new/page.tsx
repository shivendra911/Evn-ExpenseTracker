'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGroup } from '@/api/endpoints/groups';
import { createGroupExpense } from '@/api/endpoints/groupExpenses';
import { EXPENSE_CATEGORIES } from '@/shared/validation';
import type { ExpenseCategory, SplitType } from '@/shared/types';
import { rupeesToPaise, formatCurrency } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';

export default function NewGroupExpensePage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuthStore();

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('MISC');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Who Paid? (For MVP, just assuming single payer for simplicity, but API supports multi)
  const [payerId, setPayerId] = useState<string>('');
  
  // Split config
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  
  const amountPaise = useMemo(() => rupeesToPaise(amountRupees), [amountRupees]);

  // Default payer to self when loaded
  if (group && user && !payerId) {
    setPayerId(user.id);
  }

  // Default all members selected
  if (group && selectedMembers.size === 0 && amountPaise > 0) {
    setSelectedMembers(new Set(group.members.map(m => m.userId)));
  }

  const toggleMember = (userId: string) => {
    const newSet = new Set(selectedMembers);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedMembers(newSet);
  };

  const mutation = useMutation({
    mutationFn: (data: any) => createGroupExpense(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupExpenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupBalances', groupId] });
      toastSuccess('Expense added successfully');
      router.push(`/groups/${groupId}`);
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to add expense');
    },
  });

  const handleNext = () => {
    if (!title || amountPaise <= 0 || !payerId) {
      toastError('Please fill all required fields');
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let splits: any[] = [];

    if (splitType === 'EQUAL') {
      if (selectedMembers.size === 0) {
        toastError('Please select at least one person to split with');
        return;
      }
      splits = Array.from(selectedMembers).map(userId => ({ userId }));
    } else if (splitType === 'EXACT') {
      let sum = 0;
      for (const [userId, amountStr] of Object.entries(exactAmounts)) {
        const amt = rupeesToPaise(amountStr || '0');
        if (amt > 0) {
          sum += amt;
          splits.push({ userId, amountPaise: amt });
        }
      }
      
      if (sum !== amountPaise) {
        toastError(`Total split amount (${formatCurrency(sum)}) must exactly equal the expense amount (${formatCurrency(amountPaise)})`);
        return;
      }
      if (splits.length === 0) {
        toastError('Please enter at least one amount');
        return;
      }
    }

    mutation.mutate({
      title,
      description: description || null,
      totalPaise: amountPaise,
      category,
      splitType,
      date: new Date(date).toISOString(),
      contributors: [{ userId: payerId, amountPaise }],
      splits,
    });
  };

  if (isLoading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Add Group Expense</h1>
        <Link href={`/groups/${groupId}`} className="btn btn-secondary">Cancel</Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 24 }}>Expense Details</h2>
            
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner at Absolute Barbecue"
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label>Who paid?</label>
              <select value={payerId} onChange={(e) => setPayerId(e.target.value)}>
                {group?.members.map(m => (
                  <option key={m.userId} value={m.userId}>
                    {m.userId === user?.id ? 'You' : m.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-lg" onClick={handleNext}>
                Next: Split options ➡️
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 24 }}>Split Options</h2>
            
            <div style={{ background: 'var(--bg-hover)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Paid by {group?.members.find(m => m.userId === payerId)?.name === user?.name ? 'You' : group?.members.find(m => m.userId === payerId)?.name}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(amountPaise)}</div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button 
                className={`btn ${splitType === 'EQUAL' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setSplitType('EQUAL')}
                style={{ flex: 1 }}
              >
                Split Equally
              </button>
              <button 
                className={`btn ${splitType === 'EXACT' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setSplitType('EXACT')}
                style={{ flex: 1 }}
              >
                Go Dutch (Exact Amounts)
              </button>
            </div>

            {splitType === 'EQUAL' && (
              <div className="form-group">
                <label>Split between ({selectedMembers.size} selected)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  {group?.members.map(m => {
                    const isSelected = selectedMembers.has(m.userId);
                    const splitAmount = amountPaise / (selectedMembers.size || 1);
                    return (
                      <div
                        key={m.userId}
                        onClick={() => toggleMember(m.userId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--bg-active)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 24, height: 24, 
                            borderRadius: 4, 
                            background: isSelected ? 'var(--accent)' : 'var(--bg-hover)',
                            border: isSelected ? 'none' : '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSelected ? 'var(--text-inverse)' : 'transparent',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}>
                            {isSelected && '✓'}
                          </div>
                          <span style={{ fontWeight: 500 }}>{m.userId === user?.id ? 'You' : m.name}</span>
                        </div>
                        {isSelected && (
                          <span style={{ fontWeight: 600 }}>{formatCurrency(Math.round(splitAmount))}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {splitType === 'EXACT' && (
              <div className="form-group">
                <label>Enter amounts for each person</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  {group?.members.map(m => {
                    return (
                      <div
                        key={m.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{m.userId === user?.id ? 'You' : m.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>₹</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00"
                            value={exactAmounts[m.userId] || ''}
                            onChange={e => setExactAmounts(prev => ({ ...prev, [m.userId]: e.target.value }))}
                            style={{ width: 100, textAlign: 'right', padding: '6px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ marginTop: 16, textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>
                  {(() => {
                    const sum = Object.values(exactAmounts).reduce((acc, val) => acc + rupeesToPaise(val || '0'), 0);
                    const diff = amountPaise - sum;
                    if (diff === 0) return <span style={{ color: '#22c55e' }}>Amounts match total exactly ✓</span>;
                    if (diff > 0) return <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(diff)} remaining</span>;
                    return <span style={{ color: '#ef4444' }}>Exceeded by {formatCurrency(Math.abs(diff))}</span>;
                  })()}
                </div>
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ⬅️ Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
