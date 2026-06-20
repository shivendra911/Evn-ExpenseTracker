'use client';

import { X, Users, User, Shield } from 'lucide-react';
import { timeAgo } from '@/lib/dates';

interface GroupMembersModalProps {
  group: any;
  onClose: () => void;
}

export function GroupMembersModal({ group, onClose }: GroupMembersModalProps) {
  if (!group) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={20} />
            {group.name} Members
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-800">
              {group.members && group.members.length > 0 ? (
                group.members.map((member: any) => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-700">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {member.user.name}
                          {member.role === 'ADMIN' && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                              <Shield size={10} />
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.user.email} {member.user.handle ? `• @${member.user.handle}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-400 capitalize">{member.role}</div>
                      <div className="text-[10px] text-gray-500">Joined {timeAgo(member.joinedAt)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No members found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
