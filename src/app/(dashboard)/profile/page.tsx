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
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-3xl shrink-0">
            {displayUser.name.charAt(0).toUpperCase()}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSave} className="flex-1 w-full max-w-sm mx-auto sm:mx-0 text-left">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    placeholder="username@bank"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Makes it easier for friends to pay you back.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Handle (Optional)</label>
                  <input 
                    type="text" 
                    value={handle} 
                    onChange={(e) => setHandle(e.target.value)} 
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2 justify-center sm:justify-start">
                  <button type="submit" className="btn btn-primary" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { 
                    setIsEditing(false); 
                    setName(displayUser.name); 
                    setUpiId(displayUser.upiId || ''); 
                    setHandle(displayUser.handle || '');
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{displayUser.name}</h2>
                {displayUser.handle && <p className="text-[var(--accent)] font-medium mb-1">@{displayUser.handle}</p>}
                <p className="text-gray-500 mb-4">{displayUser.email}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {displayUser.upiId && (
                    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-sm">
                      <span className="text-gray-500">UPI:</span>
                      <span className="font-medium font-mono text-gray-900">{displayUser.upiId}</span>
                    </div>
                  )}
                  
                  {displayUser.uniqueId && (
                    <div 
                      className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(displayUser.uniqueId);
                        toastSuccess('ID copied to clipboard');
                      }}
                    >
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium font-mono text-gray-900">#{displayUser.uniqueId}</span>
                      <span className="text-[var(--accent)] text-xs ml-1">[copy]</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-col flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                <button className="btn btn-secondary w-full sm:w-auto flex-1" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
                <button className="btn btn-secondary w-full sm:w-auto flex-1 text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 px-1">
        Preferences
      </h3>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        
        <div className="flex justify-between items-center p-4 sm:p-5">
          <div>
            <div className="font-medium text-gray-900">Default Currency</div>
            <div className="text-sm text-gray-500 mt-0.5">Used for personal expenses</div>
          </div>
          <select 
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[var(--accent)] focus:border-[var(--accent)] block p-2 outline-none"
            value={displayUser.preferences?.currency || 'INR'} 
            onChange={(e) => updatePreference('currency', e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="flex justify-between items-center p-4 sm:p-5">
          <div className="pr-4">
            <div className="font-medium text-gray-900">Email Notifications</div>
            <div className="text-sm text-gray-500 mt-0.5">Updates when someone adds an expense</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={displayUser.preferences?.emailNotifications ?? true} 
              onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
          </label>
        </div>

        <div className="flex justify-between items-center p-4 sm:p-5">
          <div className="pr-4">
            <div className="font-medium text-gray-900">Weekly Digest</div>
            <div className="text-sm text-gray-500 mt-0.5">Summary of your balances</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={displayUser.preferences?.weeklyDigest ?? false} 
              onChange={(e) => updatePreference('weeklyDigest', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
          </label>
        </div>
        
      </div>
    </div>
  );
}
