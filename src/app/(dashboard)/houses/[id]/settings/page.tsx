'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiDelete } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';

export default function HouseSettingsTab() {
  const params = useParams();
  const router = useRouter();
  const houseId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  const { data: house, isLoading } = useQuery({
    queryKey: ['group', houseId],
    queryFn: () => apiGet<any>(`/api/groups/${houseId}`),
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (house) {
      setName(house.name);
      setDescription(house.description || '');
    }
  }, [house]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiPut(`/api/groups/${houseId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', houseId] });
      toastSuccess('Settings updated');
    },
    onError: (e: any) => toastError(e.message)
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/groups/${houseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toastSuccess('House deleted');
      router.push('/houses');
    },
    onError: (e: any) => toastError(e.message)
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateMutation.mutate({ name: name.trim(), description: description.trim(), type: 'HOUSE' });
  };

  if (isLoading) {
    return <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />;
  }

  const amIHead = house?.myRole === 'HEAD' || house?.myRole === 'ADMIN';

  if (!amIHead) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Only the House admin can change settings.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>House Settings</h2>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>General</h3>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>House Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Address or Note</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending || !name.trim()}>
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 24, border: '1px solid var(--negative)', background: 'var(--negative-bg)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--negative)' }}>Danger Zone</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Deleting this house will permanently remove all expenses, settlements, and member data. This action cannot be undone.
        </p>

        {!showConfirmDelete ? (
          <button 
            className="btn btn-secondary" 
            style={{ color: 'var(--negative)' }}
            onClick={() => setShowConfirmDelete(true)}
          >
            Delete House
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
