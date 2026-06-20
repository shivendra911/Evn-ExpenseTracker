'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/api/client';
import type { CreateGroupInput, GroupResponse } from '@/shared/types';
import { useToast } from '@/components/ui/Toast';

export default function NewHousePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: CreateGroupInput) => apiPost<GroupResponse>('/api/groups', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toastSuccess('House created successfully!');
      router.push(`/houses/${data.id}`);
    },
    onError: (error: any) => {
      toastError(error.message || 'Failed to create house');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      type: 'HOUSE',
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create a House</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Set up a new space for your flatmates</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label>House Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 221B Baker Street"
              required
              autoFocus
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Address or Note (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Rent is due on the 1st of every month."
              rows={3}
              maxLength={500}
            />
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
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create House'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
