'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';
import { Search, FolderTree, Users } from 'lucide-react';
import { timeAgo } from '@/lib/dates';
import { GroupMembersModal } from './GroupMembersModal';

export default function AdminGroupsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['adminGroups', { search, page }],
    queryFn: () => apiGet(`/api/admin/groups?search=${encodeURIComponent(search)}&page=${page}&limit=20`),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Group Management</h1>
          <p className="text-gray-400">Monitor all active groups and houses.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search groups..."
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
                <th className="px-6 py-4">Group Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Invite Code</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Expenses</th>
                <th className="px-6 py-4">Created</th>
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
                    No groups found matching "{search}"
                  </td>
                </tr>
              ) : (
                data?.items?.map((group: any) => (
                  <tr key={group.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                          <FolderTree size={16} className="text-gray-400" />
                        </div>
                        <div className="font-medium text-white">{group.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-medium">
                        {group.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs tracking-wider bg-gray-800 px-2 py-1 rounded text-gray-300">
                        {group.inviteCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedGroup(group)}
                        className="flex items-center gap-2 text-white hover:text-indigo-400 transition-colors"
                      >
                        <Users size={16} className="text-gray-500" />
                        {group._count?.members || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{group._count?.expenses || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {timeAgo(group.createdAt)}
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

      {selectedGroup && (
        <GroupMembersModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
    </div>
  );
}
