'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getGroups, joinGroup } from '@/api/endpoints/groups';
import { useToast } from '@/components/ui/Toast';

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();
  const [inviteCode, setInviteCode] = useState('');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const joinMutation = useMutation({
    mutationFn: joinGroup,
    onSuccess: (data) => {
      toastSuccess(`Joined group ${data.name}!`);
      setInviteCode('');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to join group');
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinMutation.mutate({ inviteCode: inviteCode.trim().toUpperCase() });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your shared expenses</p>
        </div>
        <Link href="/groups/new" className="btn btn-primary">
          + Create Group
        </Link>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Join an existing group</h3>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter invite code (e.g. AB12CD)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            style={{ maxWidth: 300 }}
            required
          />
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={joinMutation.isPending || !inviteCode.trim()}
          >
            {joinMutation.isPending ? 'Joining...' : 'Join Group'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: 180 }} />
          ))
        ) : groups?.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '48px 0' }}>
            <span className="empty-state-icon">👥</span>
            <h3 className="empty-state-title">No groups yet</h3>
            <p className="empty-state-description">
              Create a new group to start splitting expenses with friends, or join an existing one using an invite code.
            </p>
          </div>
        ) : (
          groups?.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="card"
              style={{ padding: 24, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{group.name}</h3>
                  <span className="badge badge-neutral">{group.type}</span>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.375rem',
                }}>
                  {group.type === 'TRIP' ? '✈️' : group.type === 'FLATMATES' ? '🏠' : group.type === 'HOUSE' ? '🏡' : group.type === 'OFFICE' ? '💼' : group.type === 'SPORTS' ? '⚽' : group.type === 'FAMILY' ? '👨‍👩‍👧' : '👥'}
                </div>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24, flex: 1 }}>
                {group.description || 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)', paddingTop: 16 }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                </span>
                {group.myRole === 'ADMIN' && (
                  <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    Admin
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
