import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Settings2, Save, Loader2, CheckCircle2, Coins, RefreshCcw, Key, Plus, Trash2, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

interface ApiKey {
  id: string;
  provider: string;
  key_value: string;
  is_active: boolean;
  rate_limit: number | null;
  remaining_requests: number | null;
  last_used_at: string | null;
  created_at: string;
}

const ApiKeysManager: React.FC = () => {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setKeys(data || []);
    } catch (err: any) {
      toast.error('Failed to load API keys: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleAdd = async () => {
    if (!newKey.trim()) return;
    setAdding(true);
    try {
      const { data, error } = await supabase.from('api_keys').insert({ provider: 'unsplash', key_value: newKey.trim() }).select().single();
      if (error) throw error;
      setKeys([data, ...keys]);
      setNewKey('');
      toast.success('API Key added!');
    } catch (err: any) {
      toast.error('Failed to add key: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('api_keys').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setKeys(keys.map(k => k.id === id ? { ...k, is_active: !current } : k));
    } catch (err: any) {
      toast.error('Failed to toggle key status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API Key?')) return;
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
      setKeys(keys.filter(k => k.id !== id));
      toast.success('API Key deleted!');
    } catch (err: any) {
      toast.error('Failed to delete key: ' + err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-6 pt-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{t('admin_settings_api_keys')}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('admin_settings_api_keys_desc')}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            placeholder={t('admin_settings_add_key')}
            className="flex-1 sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newKey.trim()}
            className="bg-indigo-500 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t('admin_settings_add')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : keys.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          <Key size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-xs font-bold uppercase tracking-widest">{t('admin_settings_no_keys')}</p>
          <p className="text-[10px] mt-2 max-w-xs mx-auto">{t('admin_settings_no_keys_desc')}</p>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('admin_settings_total_available')}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-indigo-500">
                {keys.filter(k => k.is_active).reduce((acc, k) => acc + (k.remaining_requests ?? 50), 0)}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {keys.filter(k => k.is_active).reduce((acc, k) => acc + (k.rate_limit || 50), 0)} {t('admin_settings_requests')}
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {keys.map((k) => {
              const limit = k.rate_limit || 50;
              const remaining = k.remaining_requests ?? 50;
              const percentage = Math.round((remaining / limit) * 100);

              let resetText = t('admin_settings_never_used');
              let isCooldown = false;
              if (k.last_used_at) {
                const msPassed = Date.now() - new Date(k.last_used_at).getTime();
                if (msPassed > 60 * 60 * 1000) {
                  resetText = t('admin_settings_reset');
                } else {
                  const minsLeft = Math.ceil((60 * 60 * 1000 - msPassed) / 60000);
                  resetText = t('admin_settings_resets_in', { mins: minsLeft });
                  isCooldown = true;
                }
              }

              return (
                <div key={k.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{k.provider}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${k.is_active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : 'bg-red-100 text-red-600 dark:bg-red-500/20'}`}>
                        {k.is_active ? t('admin_settings_active') : t('admin_settings_disabled')}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-slate-900 dark:text-white mt-1.5 truncate max-w-[200px] sm:max-w-md">{k.key_value}</p>

                    {/* Usage Progress */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${remaining === 0 ? 'bg-red-500' : remaining < limit * 0.2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                        {remaining}/{limit}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isCooldown && remaining === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-slate-400'}`}>
                        {resetText}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button onClick={() => handleToggle(k.id, k.is_active)} className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title={k.is_active ? "Disable" : "Enable"}>
                      <Power size={16} />
                    </button>
                    <button onClick={() => handleDelete(k.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const SiteSettings: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');
      if (error) throw error;
      setSettings(data || []);
      const vals: Record<string, string> = {};
      (data || []).forEach((s: Setting) => { vals[s.key] = s.value; });
      setLocalValues(vals);
    } catch (err: any) {
      toast.error('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key: string) => {
    const value = localValues[key];
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      toast.error('Value must be a positive number');
      return;
    }

    setSaving(key);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value, updated_at: new Date().toISOString() } : s));
      toast.success('Setting updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const settingsMeta: Record<string, { label: string; description: string; prefix?: string; suffix?: string; icon: React.ReactNode }> = {
    token_exchange_rate_usd_per_token: {
      label: 'Token Exchange Rate',
      description: 'The cost in USD for 1 project token. Changing this affects all new purchases.',
      prefix: '$',
      suffix: '= 1 Token',
      icon: <Coins size={20} className="text-amber-500" />,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {t('admin_settings_title')}
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Global configuration for the platform
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all ${loading ? 'opacity-50' : ''}`}
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid gap-5">
          {settings.map((setting, i) => {
            const meta = settingsMeta[setting.key];
            const isDirty = localValues[setting.key] !== setting.value;

            return (
              <motion.div
                key={setting.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Icon + Label */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        {meta?.icon ?? <Settings2 size={20} className="text-slate-400" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                          {meta?.label ?? setting.key}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 max-w-sm leading-relaxed">
                          {meta?.description ?? setting.description ?? 'No description'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                          Last updated: {new Date(setting.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Input + Save */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 min-w-[180px]">
                        {meta?.prefix && (
                          <span className="text-sm font-black text-slate-400">{meta.prefix}</span>
                        )}
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={localValues[setting.key] ?? setting.value}
                          onChange={(e) => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                          className="bg-transparent border-none outline-none text-lg font-black text-slate-900 dark:text-white w-24 text-center"
                        />
                        {meta?.suffix && (
                          <span className="text-xs font-black text-slate-400 whitespace-nowrap">{meta.suffix}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSave(setting.key)}
                        disabled={saving === setting.key || !isDirty}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${isDirty
                          ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                        {saving === setting.key ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isDirty ? (
                          <Save size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {saving === setting.key ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
                      </button>
                    </div>
                  </div>
                </div>

                {isDirty && (
                  <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-500/10 border-t border-amber-100 dark:border-amber-500/20">
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                      ⚠ Unsaved changes — current live value is {meta?.prefix ?? ''}{setting.value}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}

          {settings.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Settings2 size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-xs font-bold uppercase tracking-widest">No settings found. Run the migration first.</p>
            </div>
          )}

          <ApiKeysManager />
        </div>
      )}
    </div>
  );
};
