'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPersonalExpense } from '@/api/endpoints/personalExpenses';
import { EXPENSE_CATEGORIES } from '@/shared/validation';
import type { ExpenseCategory } from '@/shared/types';
import { rupeesToPaise } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';

export default function NewExpensePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('MISC');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const mutation = useMutation({
    mutationFn: createPersonalExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalExpenses'] });
      toastSuccess('Expense added successfully');
      router.push('/expenses');
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to add expense');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !amountRupees || !category || !date) return;

    const amountPaise = rupeesToPaise(amountRupees);
    if (amountPaise <= 0 || isNaN(amountPaise)) {
      toastError('Please enter a valid positive amount');
      return;
    }

    mutation.mutate({
      title,
      description: description || null,
      amountPaise,
      category,
      date: new Date(date).toISOString(),
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Add Personal Expense</h1>
        <Link href="/expenses" className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grocery shopping, Uber ride"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              required
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Notes (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details like what items were bought..."
              rows={3}
            />
          </div>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
