'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/api/client';

export default function ProfilePage() {
  const { user: authUser, clearAuth } = useAuthStore();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiGet<any>('/api/users/me'),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [handle, setHandle] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setUpiId(userProfile.upiId || '');
      setHandle(userProfile.handle || '');
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; upiId?: string; handle?: string; preferences?: any }) => apiPut('/api/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toastSuccess('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (e: any) => toastError(e.message)
  });

  const updatePreference = (key: string, value: any) => {
    const currentPrefs = userProfile?.preferences || {};
    const newPrefs = { ...currentPrefs, [key]: value };
    updateProfileMutation.mutate({ preferences: newPrefs });
  };

  const handleLogout = async () => {
    try {
      clearAuth();
      toastSuccess('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toastError('Failed to logout');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfileMutation.mutate({ name: name.trim(), upiId: upiId.trim() });
    if (handle !== displayUser.handle) {
      apiPut('/api/users/profile', { handle: handle.trim() }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }).catch((e: any) => toastError(e.message));
    }
  };

  if (isLoading || !authUser) {
    return <div className="skeleton" style={{ height: 400, maxWidth: 540, margin: '0 auto', borderRadius: 'var(--radius-lg)' }} />;
  }

  const displayUser = userProfile || authUser;

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="card" style={{ padding: '32px 24px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          fontWeight: 600,
          fontSize: '2rem',
          margin: '0 auto 24px'
        }}>
          {displayUser.name.charAt(0).toUpperCase()}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ maxWidth: 320, margin: '0 auto 24px', textAlign: 'left' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>
            
            <div className="form-group">
              <label>UPI ID (Optional)</label>
              <input 
                type="text" 
                value={upiId} 
                onChange={(e) => setUpiId(e.target.value)} 
                placeholder="username@bank"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Makes it easier for friends to pay you back.
              </p>
            </div>

            <div className="form-group">
              <label>Custom Handle (Optional)</label>
              <input 
                type="text" 
                value={handle} 
                onChange={(e) => setHandle(e.target.value)} 
                placeholder="@username"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { 
                setIsEditing(false); 
                setName(displayUser.name); 
                setUpiId(displayUser.upiId || ''); 
                setHandle(displayUser.handle || '');
              }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{displayUser.name}</h2>
            {displayUser.handle && <p style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.9375rem', marginBottom: 4 }}>@{displayUser.handle}</p>}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 12 }}>{displayUser.email}</p>
            
            {displayUser.upiId && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 100, fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI:</span>
                <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{displayUser.upiId}</span>
              </div>
            )}
            
            {displayUser.uniqueId && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-hover)', padding: '4px 12px', borderRadius: 100, fontSize: '0.8125rem', marginTop: 8, cursor: 'pointer' }}
                   onClick={() => {
                     navigator.clipboard.writeText(displayUser.uniqueId);
                     toastSuccess('ID copied to clipboard');
                   }}>
                <span style={{ color: 'var(--text-muted)' }}>ID:</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>#{displayUser.uniqueId}</span>
                <span style={{ color: 'var(--accent)', marginLeft: 4 }}>[copy]</span>
              </div>
            )}
          </div>
        )}

        {!isEditing && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button className="btn btn-secondary" style={{ color: 'var(--negative)', borderColor: 'var(--border-default)' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, marginTop: 32, paddingLeft: 4 }}>
        Preferences
      </h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Default Currency</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Used for personal expenses</div>
          </div>
          <select 
            className="btn btn-secondary btn-sm" 
            value={displayUser.preferences?.currency || 'INR'} 
            onChange={(e) => updatePreference('currency', e.target.value)}
            style={{ width: 'auto', paddingRight: 32 }}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Email Notifications</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Updates when someone adds an expense</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
            <input 
              type="checkbox" 
              checked={displayUser.preferences?.emailNotifications ?? true} 
              onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: (displayUser.preferences?.emailNotifications ?? true) ? 'var(--accent)' : 'var(--border-default)', 
              borderRadius: 24, transition: '.4s'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3,
                backgroundColor: 'white', borderRadius: '50%', transition: '.4s', 
                transform: (displayUser.preferences?.emailNotifications ?? true) ? 'translateX(20px)' : 'translateX(0px)'
              }}></span>
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Weekly Digest</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Summary of your balances</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
            <input 
              type="checkbox" 
              checked={displayUser.preferences?.weeklyDigest ?? false} 
              onChange={(e) => updatePreference('weeklyDigest', e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: (displayUser.preferences?.weeklyDigest ?? false) ? 'var(--accent)' : 'var(--border-default)', 
              borderRadius: 24, transition: '.4s'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3,
                backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                transform: (displayUser.preferences?.weeklyDigest ?? false) ? 'translateX(20px)' : 'translateX(0px)'
              }}></span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
