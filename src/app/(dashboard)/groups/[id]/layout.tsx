'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getGroup } from '@/api/endpoints/groups';

export default function GroupDetailLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const groupId = params.id as string;

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
  });

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 100, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--negative)', marginBottom: 8 }}>Group Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          This group doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/groups" className="btn btn-primary">Back to Groups</Link>
      </div>
    );
  }

  const tabs = [
    { name: 'Expenses', href: `/groups/${groupId}` },
    { name: 'Balances', href: `/groups/${groupId}/balances` },
    { name: 'Members', href: `/groups/${groupId}/members` },
  ];

  if (group.myRole === 'ADMIN') {
    tabs.push({ name: 'Settings', href: `/groups/${groupId}/settings` });
  }

  const isExactPath = (href: string) => {
    if (href === `/groups/${groupId}` && pathname === `/groups/${groupId}`) return true;
    if (href !== `/groups/${groupId}` && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div>
      {/* Group Header */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold truncate text-gray-900 leading-tight m-0">{group.name}</h1>
              <span className="badge badge-neutral shrink-0">{group.type}</span>
            </div>
            {group.description && (
              <p className="text-gray-500 text-sm break-words m-0">{group.description}</p>
            )}
          </div>
          
          <div className="sm:text-right shrink-0">
            <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              Invite Code
            </div>
            <div className="bg-[var(--bg-secondary)] px-3 py-1.5 rounded-md font-mono font-bold tracking-widest text-[var(--accent)] inline-block border border-[var(--border-default)]">
              {group.inviteCode}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, marginTop: 24, borderBottom: '1px solid var(--border-default)' }}>
          {tabs.map((tab) => {
            const active = isExactPath(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                style={{
                  padding: '12px 4px',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.2s',
                }}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}
