'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/api/client';
import { Search, Trash2, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { timeAgo } from '@/lib/dates';
import { UserAnalyticsModal } from './UserAnalyticsModal';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<any>({
    queryKey: ['adminUsers', { search, page }],
    queryFn: () => apiGet(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/users/${id}`),
    onSuccess: () => {
      toastSuccess('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to delete user');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to permanently delete the user ${name}? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">View and manage all registered users.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to page 1 on search
            }}
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-xs uppercase text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">ID / Handle</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4">Groups</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found matching "{search}"
                  </td>
                </tr>
              ) : (
                data?.items?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            {user.name}
                            {user.isAdmin && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">ADMIN</span>
                            )}
                          </div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{user.uniqueId ? `#${user.uniqueId}` : '—'}</div>
                      <div className="text-gray-500 text-xs">{user.handle ? `@${user.handle}` : 'No handle'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isEmailVerified ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-gray-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{user._count?.groupMembers || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {timeAgo(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="View Detailed Analytics"
                      >
                        <Activity size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={user.email === 'promtengineering5@gmail.com' || deleteMutation.isPending}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.email === 'promtengineering5@gmail.com' ? 'Cannot delete Super Admin' : 'Delete User'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{data.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserAnalyticsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
