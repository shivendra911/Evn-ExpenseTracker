'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getGroup, removeGroupMember, updateGroupMemberRole } from '@/api/endpoints/groups';
import { formatDateTime } from '@/lib/dates';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';

export default function GroupMembersTab() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeGroupMember(groupId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toastSuccess('Member removed successfully');
    },
    onError: (e: any) => toastError(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string, role: string }) => updateGroupMemberRole(groupId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toastSuccess('Role updated successfully');
    },
    onError: (e: any) => toastError(e.message),
  });

  if (isLoading) {
    return <div className="skeleton" style={{ height: 200 }} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.25rem' }}>Group Members ({group?.members?.length || 0})</h2>
        {group?.myRole === 'ADMIN' && (
          <button className="btn btn-secondary" onClick={() => {
            navigator.clipboard.writeText(group.inviteCode);
            alert('Invite code copied to clipboard!');
          }}>
            Copy Invite Code
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {group?.members?.map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: member.userId === user?.id ? 'var(--bg-active)' : 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                    {member.name} {member.userId === user?.id && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(You)</span>}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Joined {formatDateTime(member.joinedAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {member.role === 'ADMIN' ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      Admin
                    </span>
                    {group.myRole === 'ADMIN' && member.userId !== user?.id && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => roleMutation.mutate({ memberId: member.id, role: 'MEMBER' })}
                        disabled={roleMutation.isPending}
                      >
                        Demote
                      </button>
                    )}
                  </div>
                ) : (
                  group.myRole === 'ADMIN' && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                      onClick={() => roleMutation.mutate({ memberId: member.id, role: 'ADMIN' })}
                      disabled={roleMutation.isPending}
                    >
                      Make Admin
                    </button>
                  )
                )}
                
                {group.myRole === 'ADMIN' && member.userId !== user?.id && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--negative)', borderColor: 'var(--negative)' }}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this member?')) {
                        removeMutation.mutate(member.id);
                      }
                    }}
                    disabled={removeMutation.isPending}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
