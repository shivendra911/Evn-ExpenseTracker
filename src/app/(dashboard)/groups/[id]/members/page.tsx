'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getGroup } from '@/api/endpoints/groups';
import { formatDateTime } from '@/lib/dates';
import { useAuthStore } from '@/store/auth';

export default function GroupMembersTab() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useAuthStore();

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
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
                {member.role === 'ADMIN' && (
                  <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    Admin
                  </span>
                )}
                {group.myRole === 'ADMIN' && member.userId !== user?.id && (
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
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
