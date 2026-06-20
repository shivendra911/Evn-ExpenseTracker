'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';
import { X, Activity, User, LogIn, Receipt, FolderTree, ArrowUpRight } from 'lucide-react';
import { timeAgo } from '@/lib/dates';

interface UserAnalyticsModalProps {
  userId: string;
  onClose: () => void;
}

export function UserAnalyticsModal({ userId, onClose }: UserAnalyticsModalProps) {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['adminUserAnalytics', userId],
    queryFn: () => apiGet(`/api/admin/users/${userId}/analytics`),
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-indigo-400" size={20} />
            User Analytics
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">Failed to load user analytics</div>
          ) : (
            <div className="space-y-8">
              
              {/* Top Profile Section */}
              <div className="flex items-center gap-4 bg-gray-800/30 p-4 rounded-xl border border-gray-800/50">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-700">
                  {data?.user?.avatarUrl ? (
                    <img src={data.user.avatarUrl} alt={data.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-gray-400" size={32} />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white leading-none mb-1">{data?.user?.name}</h3>
                  <p className="text-gray-400">{data?.user?.email}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm text-gray-500">Joined</div>
                  <div className="text-white font-medium">{new Date(data?.user?.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">Engagement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 shadow-sm hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                        <LogIn size={18} className="text-blue-400" />
                      </div>
                      <div className="text-gray-400 text-sm font-medium">Total Logins</div>
                    </div>
                    <div className="text-3xl font-bold text-white pl-1">{data?.user?.loginCount || 0}</div>
                  </div>
                  
                  <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 shadow-sm hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                        <Activity size={18} className="text-indigo-400" />
                      </div>
                      <div className="text-gray-400 text-sm font-medium">Last Active</div>
                    </div>
                    <div className="text-2xl font-bold text-white pl-1 pt-1">
                      {data?.user?.lastActiveAt ? timeAgo(data.user.lastActiveAt) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Usage Stats */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">Platform Usage</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 shadow-sm hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                        <FolderTree size={18} className="text-green-400" />
                      </div>
                      <div className="text-gray-400 text-sm font-medium">Active Groups</div>
                    </div>
                    <div className="text-3xl font-bold text-white pl-1">{data?.stats?.activeGroups || 0}</div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 shadow-sm hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                        <Receipt size={18} className="text-purple-400" />
                      </div>
                      <div className="text-gray-400 text-sm font-medium">Expenses Created</div>
                    </div>
                    <div className="text-3xl font-bold text-white pl-1">{data?.stats?.groupExpensesCreated || 0}</div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 shadow-sm hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                        <ArrowUpRight size={18} className="text-yellow-400" />
                      </div>
                      <div className="text-gray-400 text-sm font-medium">Contributions</div>
                    </div>
                    <div className="text-3xl font-bold text-white pl-1">₹{((data?.stats?.totalContributionPaise || 0) / 100).toFixed(2)}</div>
                  </div>

                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">Recent Activity Logs</h4>
                <div className="bg-gray-800 border border-gray-700/50 rounded-xl overflow-hidden shadow-sm">
                  {(!data?.recentActivity || data.recentActivity.length === 0) ? (
                    <div className="p-6 text-center text-gray-500">No recent activity found.</div>
                  ) : (
                    <div className="divide-y divide-gray-800">
                      {data.recentActivity.map((log: any) => (
                        <div key={log.id} className="p-4 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5 border border-gray-700">
                            {log.action.includes('LOGIN') ? <LogIn size={14} className="text-blue-400" /> : <Activity size={14} className="text-gray-400" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{log.action}</div>
                            <div className="text-xs text-gray-500 mt-1 font-mono break-all">{JSON.stringify(log.metadata)}</div>
                          </div>
                          <div className="ml-auto text-xs text-gray-500 whitespace-nowrap">
                            {timeAgo(log.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
