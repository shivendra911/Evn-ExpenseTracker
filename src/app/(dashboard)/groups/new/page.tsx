'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '@/api/endpoints/groups';
import { useToast } from '@/components/ui/Toast';

const GROUP_TYPES = [
  { value: 'FLATMATES', label: 'Flatmates', icon: '🏠' },
  { value: 'TRIP', label: 'Trip', icon: '✈️' },
  { value: 'SPORTS', label: 'Sports', icon: '⚽' },
  { value: 'OFFICE', label: 'Office', icon: '💼' },
  { value: 'FAMILY', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'OTHER', label: 'Other', icon: '👥' },
];

export default function NewGroupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('FLATMATES');

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toastSuccess('Group created successfully!');
      router.push(`/groups/${data.id}`);
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to create group');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    mutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      type: type as any,
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create New Group</h1>
        <Link href="/groups" className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Group Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Goa Trip 2024, Apartment 4B"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Group Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              {GROUP_TYPES.map((t) => (
                <div
                  key={t.value}
                  onClick={() => setType(t.value)}
                  style={{
                    padding: '12px',
                    border: `2px solid ${type === t.value ? 'var(--accent)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: type === t.value ? 'var(--bg-active)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                  <span style={{ fontWeight: type === t.value ? 600 : 500 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group for?"
              rows={3}
            />
          </div>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={mutation.isPending || !name.trim()}
            >
              {mutation.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
