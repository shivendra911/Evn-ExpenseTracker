'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';

const HOUSE_CATEGORIES = [
  'GROCERIES', 'FOOD', 'UTILITIES', 'MISC'
];

export default function HouseMembersTab() {
  const params = useParams();
  const houseId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { data: members, isLoading } = useQuery({
    queryKey: ['houseMembers', houseId],
    queryFn: () => apiGet<any[]>(`/api/houses/${houseId}/members`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ memberId, data }: { memberId: string, data: any }) => 
      apiPatch(`/api/houses/${houseId}/members/${memberId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseMembers', houseId] });
      toastSuccess('Updated successfully');
    },
    onError: (error: any) => {
      toastError(error.message || 'Failed to update');
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-md)' }} />)}
      </div>
    );
  }

  const myMember = members?.find(m => m.userId === user?.id);
  const amIHead = myMember?.role === 'HEAD' || myMember?.role === 'ADMIN';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>House Members</h2>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {members?.map(member => {
          const isSelf = member.userId === user?.id;
          const canEdit = isSelf || amIHead;
          const defaults = member.houseDefaults || {};

          return (
            <div key={member.id} className="card" style={{ padding: 20, opacity: member.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <img 
                    src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                    alt={member.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-secondary)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '1.0625rem' }}>{member.name} {isSelf && '(You)'}</span>
                      {member.role === 'HEAD' && <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>HEAD</span>}
                      {member.role === 'ADMIN' && <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>ADMIN</span>}
                      {!member.isActive && <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '0.65rem', color: 'var(--negative)' }}>MOVED OUT</span>}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{member.email}</div>
                  </div>
                </div>

                {canEdit && (
                  <button 
                    onClick={() => updateMutation.mutate({ memberId: member.id, data: { isActive: !member.isActive } })}
                    className="btn btn-secondary btn-sm"
                  >
                    {member.isActive ? 'Mark as Moved Out' : 'Mark as Active'}
                  </button>
                )}
              </div>

              {/* Participation Defaults */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Default Participation (checked automatically in new bills)
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {HOUSE_CATEGORIES.map(cat => {
                    // default true if not strictly false
                    const isParticipating = defaults[cat] !== false; 
                    return (
                      <label 
                        key={cat} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: 6, 
                          fontSize: '0.875rem', 
                          cursor: canEdit && member.isActive ? 'pointer' : 'not-allowed',
                          opacity: member.isActive ? 1 : 0.5
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isParticipating}
                          disabled={!canEdit || !member.isActive}
                          onChange={(e) => {
                            const newDefaults = { ...defaults, [cat]: e.target.checked };
                            updateMutation.mutate({ memberId: member.id, data: { houseDefaults: newDefaults } });
                          }}
                        />
                        {cat.toLowerCase()}
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
