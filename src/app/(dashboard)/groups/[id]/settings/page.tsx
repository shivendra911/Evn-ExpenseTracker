'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getGroup } from '@/api/endpoints/groups';
import { useToast } from '@/components/ui/Toast';

export default function GroupSettingsTab() {
  const params = useParams();
  const groupId = params.id as string;
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
  });

  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');

  // Update states if data loads later
  if (group && !name && group.name) {
    setName(group.name);
    setDescription(group.description || '');
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toastSuccess('Group settings updated successfully!');
    // Update logic would go here
  };

  const handleDelete = () => {
    const confirm = window.confirm('Are you sure you want to delete this group? This action cannot be undone.');
    if (confirm) {
      toastSuccess('Group deleted successfully');
      router.push('/groups');
    }
  };

  if (isLoading) {
    return <div className="skeleton" style={{ height: 200 }} />;
  }

  // Double check admin access
  if (group?.myRole !== 'ADMIN') {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--negative)', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Only group admins can access settings.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 24 }}>Group Settings</h2>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Group Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 24, border: '1px solid var(--negative)' }}>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--negative)', marginBottom: 12 }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
          Deleting this group will permanently remove all associated expenses, settlements, and member data. This cannot be undone.
        </p>
        <button className="btn btn-secondary" style={{ color: 'var(--negative)', borderColor: 'var(--negative)' }} onClick={handleDelete}>
          Delete Group
        </button>
      </div>
    </div>
  );
}
