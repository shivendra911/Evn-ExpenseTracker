'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiGet } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/money';
import { formatDateTime } from '@/lib/dates';
import type { GroupResponse } from '@/shared/types';

interface FriendBalance {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  netPaise: number; // positive = they owe you, negative = you owe them
  groups: string[];
}

function computeFriendBalances(groups: any[]): FriendBalance[] {
  const friendMap = new Map<string, FriendBalance>();

  for (const group of groups) {
    if (!group.balances) continue;

    for (const bal of group.balances) {
      // Skip self
      if (!bal.user) continue;

      const existing = friendMap.get(bal.user.id);
      if (existing) {
        // Don't add balance here — we'll calculate from settlement plans
      } else {
        friendMap.set(bal.user.id, {
          userId: bal.user.id,
          name: bal.user.name,
          email: '',
          avatarUrl: bal.user.avatarUrl,
          netPaise: 0,
          groups: [],
        });
      }
    }

    // Use the settlement plan to figure out who owes whom
    if (group.settlementPlan) {
      for (const plan of group.settlementPlan) {
        if (plan.fromUser && plan.toUser) {
          // fromUser owes toUser
          const from = friendMap.get(plan.fromUser.id);
          const to = friendMap.get(plan.toUser.id);
          if (from) {
            from.netPaise -= plan.amountPaise;
            if (!from.groups.includes(group.name)) from.groups.push(group.name);
          }
          if (to) {
            to.netPaise += plan.amountPaise;
            if (!to.groups.includes(group.name)) to.groups.push(group.name);
          }
        }
      }
    }
  }

  return Array.from(friendMap.values()).sort((a, b) => Math.abs(b.netPaise) - Math.abs(a.netPaise));
}

export default function FriendsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [addFriendInput, setAddFriendInput] = useState('');

  // Fetch pending requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => apiGet<{ incoming: any[]; outgoing: any[] }>('/api/friends/requests'),
  });

  const addFriendMutation = useMutation({
    mutationFn: (identifier: string) => fetch('/api/friends/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to send request');
      return data;
    }),
    onSuccess: () => {
      toastSuccess('Friend request sent!');
      setAddFriendInput('');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (e: any) => toastError(e.message),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPT' | 'DECLINE' }) => fetch(`/api/friends/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to respond');
      return data;
    }),
    onSuccess: (_, variables) => {
      if (variables.action === 'ACCEPT') {
        toastSuccess('Friend request accepted!');
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        queryClient.invalidateQueries({ queryKey: ['allGroupBalances'] });
      }
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (e: any) => toastError(e.message),
  });

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendInput.trim()) return;
    addFriendMutation.mutate(addFriendInput);
  };

  // Fetch all groups first
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiGet<GroupResponse[]>('/api/groups'),
  });

  // Fetch balances for each group
  const { data: groupBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['allGroupBalances', groups?.map(g => g.id)],
    queryFn: async () => {
      if (!groups || groups.length === 0) return [];
      const results = await Promise.all(
        groups.map(async (g) => {
          try {
            const bal = await apiGet<any>(`/api/groups/${g.id}/balances`);
            return { ...bal, name: g.name, id: g.id };
          } catch {
            return { balances: [], settlementPlan: [], name: g.name, id: g.id };
          }
        })
      );
      return results;
    },
    enabled: !!groups && groups.length > 0,
  });

  const isLoading = groupsLoading || balancesLoading;
  const friends = groupBalances ? computeFriendBalances(groupBalances).filter(f => f.userId !== user?.id) : [];

  const totalOwed = friends.reduce((sum, f) => f.netPaise > 0 ? sum + f.netPaise : sum, 0);
  const totalOwe = friends.reduce((sum, f) => f.netPaise < 0 ? sum + Math.abs(f.netPaise) : sum, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Friends</h1>
          <p style={{ color: 'var(--text-secondary)' }}>People you split expenses with</p>
        </div>
      </div>

      {/* Add Friend Section */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Add a friend directly</h3>
        <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter their ID (e.g. AB12CD) or @handle"
            value={addFriendInput}
            onChange={(e) => setAddFriendInput(e.target.value)}
            style={{ maxWidth: 300 }}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={addFriendMutation.isPending || !addFriendInput.trim()}
          >
            {addFriendMutation.isPending ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>

      {/* Pending Requests */}
      {!requestsLoading && requests?.incoming && requests.incoming.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, paddingLeft: 4 }}>
            Pending Requests ({requests.incoming.length})
          </h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            {requests.incoming.map((req: any, idx: number) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: idx < requests.incoming.length - 1 ? '1px solid var(--border-default)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--border-default)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem',
                  }}>
                    {req.fromUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{req.fromUser.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {req.fromUser.handle ? `@${req.fromUser.handle}` : `#${req.fromUser.uniqueId}`} wants to be friends
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'DECLINE' })}
                    disabled={respondMutation.isPending}
                  >
                    Decline
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'ACCEPT' })}
                    disabled={respondMutation.isPending}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Requests */}
      {!requestsLoading && requests?.outgoing && requests.outgoing.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, paddingLeft: 4 }}>
            Sent Requests
          </h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            {requests.outgoing.map((req: any, idx: number) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: idx < requests.outgoing.length - 1 ? '1px solid var(--border-default)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--border-default)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem',
                    opacity: 0.7
                  }}>
                    {req.toUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ opacity: 0.7 }}>
                    <div style={{ fontWeight: 600 }}>{req.toUser.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Request sent to {req.toUser.handle ? `@${req.toUser.handle}` : `#${req.toUser.uniqueId}`}
                    </div>
                  </div>
                </div>
                <span className="badge badge-neutral">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>You are owed</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--positive)' }}>{formatCurrency(totalOwed)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>You owe</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--negative)' }}>{formatCurrency(totalOwe)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>Net balance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalOwed - totalOwe >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
            {totalOwed - totalOwe >= 0 ? '+' : ''}{formatCurrency(totalOwed - totalOwe)}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, paddingLeft: 4 }}>
        Your Friends
      </h3>

      {/* Friends List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 72 }} />)}
        </div>
      ) : friends.length === 0 ? (
        <div className="card empty-state" style={{ padding: 48 }}>
          <span className="empty-state-icon">👤</span>
          <h3 className="empty-state-title">No friends yet</h3>
          <p className="empty-state-description">
            Friends appear automatically when you join groups and split expenses with others.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {friends.map((friend, idx) => (
            <Link
              href={`/friends/${friend.userId}`}
              key={friend.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: idx < friends.length - 1 ? '1px solid var(--border-default)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', fontWeight: 700, fontSize: '1rem',
                }}>
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{friend.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {friend.groups.filter(g => !g.startsWith('Friendship: ')).length > 0 
                      ? friend.groups.filter(g => !g.startsWith('Friendship: ')).join(', ') 
                      : 'Direct Friend'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {friend.netPaise === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>settled up</span>
                ) : friend.netPaise > 0 ? (
                  <>
                    <div style={{ fontWeight: 700, color: 'var(--positive)' }}>{formatCurrency(friend.netPaise)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>owes you</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, color: 'var(--negative)' }}>{formatCurrency(Math.abs(friend.netPaise))}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>you owe</div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
