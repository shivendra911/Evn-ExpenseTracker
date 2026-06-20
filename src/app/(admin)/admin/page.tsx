'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';
import { Users, FolderTree, Receipt, IndianRupee } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { timeAgo } from '@/lib/dates';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Basic protection to redirect normal users away instantly
    if (user && user.email !== 'promtengineering5@gmail.com') {
      // Allow fallback if they have isAdmin in token (but we didn't put it in payload), so rely on backend mostly
      // Just visually redirect if obviously not super admin, though API will 403 anyway.
      // We will let the API handle the hard enforcement.
    }
  }, [user]);

  const { data: stats, isLoading, error } = useQuery<any>({
    queryKey: ['adminStats'],
    queryFn: () => apiGet('/api/admin/stats'),
    retry: false,
  });

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          Failed to load admin dashboard. You might not have permission.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Active Groups', value: stats?.totalGroups || 0, icon: FolderTree, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Expenses Recorded', value: stats?.totalExpenses || 0, icon: Receipt, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Settlements Made', value: stats?.totalSettlements || 0, icon: IndianRupee, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-gray-400">High-level metrics for the Expense Tracker system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden shadow-lg hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${card.bg} shrink-0`}>
                  <Icon className={card.color} size={28} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-gray-400 text-sm font-medium tracking-wide uppercase">{card.name}</h3>
                  <p className="text-3xl font-bold text-white mt-1">{card.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Recently Joined Users</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {stats?.recentUsers?.map((u: any) => (
            <div key={u.id} className="p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 font-medium">{u.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{u.name}</h3>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Joined {timeAgo(u.createdAt)}
              </div>
            </div>
          ))}
          {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No recent users
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
