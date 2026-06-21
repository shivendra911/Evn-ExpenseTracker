'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiGet, apiPost, apiPatch } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/money';
import { Avatar } from '@/components/ui/Avatar';
import type { GroupResponse } from '@/shared/types';

interface FriendBalance {
  userId: string;
  name: string;
  email: string;
  handle: string | null;
  avatarUrl: string | null;
  netPaise: number; // positive = they owe you, negative = you owe them
  groups: string[];
}

function computeFriendBalances(groups: any[]): FriendBalance[] {
  const friendMap = new Map<string, FriendBalance>();

  for (const group of groups) {
    if (!group.balances) continue;

    for (const bal of group.balances) {
      if (!bal.user) continue;

      if (!friendMap.has(bal.user.id)) {
        friendMap.set(bal.user.id, {
          userId: bal.user.id,
          name: bal.user.name,
          email: '',
          handle: bal.user.handle,
          avatarUrl: bal.user.avatarUrl,
          netPaise: 0,
          groups: [],
        });
      }
    }

    if (group.settlementPlan) {
      for (const plan of group.settlementPlan) {
        if (plan.fromUser && plan.toUser) {
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
  const [searchQuery, setSearchQuery] = useState('');

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => apiGet<{ incoming: any[]; outgoing: any[] }>('/api/friends/requests'),
  });

  const addFriendMutation = useMutation({
    mutationFn: (identifier: string) => apiPost('/api/friends/requests', { identifier }),
    onSuccess: () => {
      toastSuccess('Friend request sent!');
      setAddFriendInput('');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (e: any) => toastError(e.message),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPT' | 'DECLINE' }) => apiPatch(`/api/friends/requests/${id}`, { action }),
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

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiGet<GroupResponse[]>('/api/groups'),
  });

  const { data: groupBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['allGroupBalances', groups?.map(g => g.id)],
    queryFn: async () => {
      if (!groups || groups.length === 0) return [];
      return Promise.all(
        groups.map(async (g) => {
          try {
            const bal = await apiGet<any>(`/api/groups/${g.id}/balances`);
            return { ...bal, name: g.name, id: g.id };
          } catch {
            return { balances: [], settlementPlan: [], name: g.name, id: g.id };
          }
        })
      );
    },
    enabled: !!groups && groups.length > 0,
  });

  const isLoading = groupsLoading || balancesLoading;
  const friends = groupBalances ? computeFriendBalances(groupBalances).filter(f => f.userId !== user?.id) : [];
  
  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (f.handle && f.handle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalOwed = friends.reduce((sum, f) => f.netPaise > 0 ? sum + f.netPaise : sum, 0);
  const totalOwe = friends.reduce((sum, f) => f.netPaise < 0 ? sum + Math.abs(f.netPaise) : sum, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-heading m-0">Friends</h1>
        <button className="btn btn-primary bg-indigo-600 hover:bg-indigo-700">+ Add Friend</button>
      </div>

      {/* Add Friend Input Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
            <input
              type="text"
              placeholder="Enter ID (e.g. AB12CD) or @handle to add..."
              value={addFriendInput}
              onChange={(e) => setAddFriendInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary sm:w-auto w-full"
            disabled={addFriendMutation.isPending || !addFriendInput.trim()}
          >
            {addFriendMutation.isPending ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>

      {/* Pending Requests */}
      {!requestsLoading && requests?.incoming && requests.incoming.length > 0 && (
        <div className="mb-8">
          <h3 className="text-subtitle mb-4 text-gray-700">Pending Requests ({requests.incoming.length})</h3>
          <div className="grid gap-4">
            {requests.incoming.map((req: any) => (
              <div key={req.id} className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={req.fromUser.name} size="md" />
                  <div>
                    <div className="font-semibold">{req.fromUser.name}</div>
                    <div className="text-xs text-gray-500">
                      {req.fromUser.handle ? `@${req.fromUser.handle}` : `#${req.fromUser.uniqueId}`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'DECLINE' })}
                    disabled={respondMutation.isPending}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'ACCEPT' })}
                    disabled={respondMutation.isPending}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
          <div className="text-sm font-medium text-red-600/80 mb-1">You owe</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOwe)}</div>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
          <div className="text-sm font-medium text-green-600/80 mb-1">You get</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalOwed)}</div>
        </div>
      </div>

      <h3 className="text-title mb-4">Recent Friends</h3>
      
      {/* Search Friends */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Friends List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-lg font-medium text-gray-800">No friends found</p>
          <p className="text-sm mt-1">Try searching for someone else or add a new friend.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredFriends.map((friend) => (
            <div key={friend.userId} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={friend.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{friend.name}</div>
                  {friend.handle && <div className="text-sm text-gray-500 truncate">@{friend.handle}</div>}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div>
                  {friend.netPaise === 0 ? (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                      <span>Settled</span> <span className="text-green-500">✓</span>
                    </div>
                  ) : friend.netPaise > 0 ? (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <span>Gets</span> <span>{formatCurrency(friend.netPaise)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                      <span>Owes</span> <span>{formatCurrency(Math.abs(friend.netPaise))}</span>
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/friends/${friend.userId}`}
                  className="text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
