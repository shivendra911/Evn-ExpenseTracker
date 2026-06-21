'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/api/client';
import { useToast } from '@/components/ui/Toast';
import { ShieldAlert, Trash2, Save, RefreshCw } from 'lucide-react';

export default function SecurityDashboard() {
  const { toastSuccess, toastError } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<any>({});
  const [resetKey, setResetKey] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Fetch current settings
  const { data, isLoading } = useQuery<any>({
    queryKey: ['adminSettings'],
    queryFn: () => apiGet('/api/admin/settings'),
  });

  useEffect(() => {
    if (data?.config) {
      setSettings(data.config);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newConfig: any) => apiPut('/api/admin/settings', { config: newConfig }),
    onSuccess: () => {
      toastSuccess('Rate limit settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    },
    onError: (err: any) => toastError(err.message || 'Failed to update settings')
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleChange = (category: string, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleReset = async (globalWipe: boolean) => {
    if (globalWipe && !confirm('Are you sure you want to PURGE ALL rate limits? This is an emergency action.')) return;
    if (!globalWipe && !resetKey) {
      toastError('Please enter an IP or Email to reset.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await apiPost('/api/admin/rate-limits/reset', {
        key: globalWipe ? undefined : resetKey,
        globalWipe
      }) as any;
      toastSuccess(res.message || 'Rate limit cleared.');
      if (!globalWipe) setResetKey('');
    } catch (err: any) {
      toastError(err.message || 'Failed to reset limit');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const limitCategories = [
    { id: 'rl_login_ip', label: 'Login (Per IP Address)', defaultMax: 20, defaultWin: 900000 },
    { id: 'rl_login', label: 'Login (Per Email)', defaultMax: 5, defaultWin: 900000 },
    { id: 'rl_register_ip', label: 'Account Creation (Per IP)', defaultMax: 5, defaultWin: 3600000 },
    { id: 'rl_register', label: 'Account Creation (Per Email)', defaultMax: 3, defaultWin: 3600000 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldAlert className="text-red-400" /> Security & Rate Limits
        </h1>
        <p className="text-gray-400">Manage global throttling and reset blocked connections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Rate Limit Thresholds</h2>
              <button 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <Save size={16} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {limitCategories.map(cat => {
                const current = settings[cat.id] || { maxAttempts: cat.defaultMax, windowMs: cat.defaultWin };
                return (
                  <div key={cat.id} className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-800 last:border-0 last:pb-0">
                    <div className="col-span-2">
                      <h3 className="text-lg font-medium text-gray-200">{cat.label}</h3>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Max Attempts</label>
                      <input 
                        type="number" 
                        value={current.maxAttempts} 
                        onChange={(e) => handleChange(cat.id, 'maxAttempts', e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Time Window (Milliseconds)</label>
                      <input 
                        type="number" 
                        value={current.windowMs} 
                        onChange={(e) => handleChange(cat.id, 'windowMs', e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ({Math.round(current.windowMs / 60000)} minutes)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reset Tools */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Clear Rate Limits</h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Unblock specific Email or IP</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. 192.168.1.1 or user@email.com"
                    value={resetKey}
                    onChange={e => setResetKey(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <button 
                    onClick={() => handleReset(false)}
                    disabled={isResetting || !resetKey}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <RefreshCw size={18} className={isResetting ? "animate-spin" : ""} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This deletes all active blocks matching the string exactly.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                  <Trash2 size={18} /> Emergency Purge
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Wipes the entire rate limit database. Use only if a misconfiguration blocks all legitimate traffic globally.
                </p>
                <button 
                  onClick={() => handleReset(true)}
                  disabled={isResetting}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isResetting ? 'Purging...' : 'Purge All Rate Limits'}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
