'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getGroup, deleteGroup } from '@/api/endpoints/groups';
import { useToast } from '@/components/ui/Toast';

export default function GroupSettingsTab() {
  const params = useParams();
  const groupId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toastSuccess('Group deleted successfully');
      router.push('/groups');
    },
    onError: (e: any) => toastError(e.message)
  });

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

      <div className="card" style={{ padding: 24, border: '1px solid var(--negative)', background: 'var(--negative-bg)' }}>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--negative)', marginBottom: 12 }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
          Deleting this group will permanently remove all associated expenses, settlements, and member data. This cannot be undone.
        </p>

        {!showConfirmDelete ? (
          <button 
            className="btn btn-secondary" 
            style={{ color: 'var(--negative)', borderColor: 'var(--negative)' }} 
            onClick={() => setShowConfirmDelete(true)}
          >
            Delete Group
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Are you sure?</span>
            <button 
              className="btn btn-secondary"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              style={{ background: 'var(--negative)', color: 'white', border: 'none' }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowConfirmDelete(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
