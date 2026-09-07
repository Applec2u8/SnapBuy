import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Settings2, Save, Loader2, CheckCircle2, RefreshCcw, Key, Plus, Trash2, Power, Search, Mail } from 'lucide-react';
import { logAdminAction } from '../../../../lib/auditLog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

import { useAdminPin } from '../../../../hooks/useAdminPin';

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


interface EmailJsConfig {
  id: string;
  name: string;
  service_id: string;
  template_id: string;
  public_key: string;
  is_active: boolean;
}

const EmailJsManager: React.FC = () => {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<EmailJsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', service_id: '', template_id: '', public_key: '' });
  const [saving, setSaving] = useState(false);
  const { requirePin, pinModal } = useAdminPin();

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('emailjs_configs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setConfigs(data || []);
    } catch (err: any) {
      console.warn('Failed to load EmailJS configs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSave = async () => {
    if (!formData.service_id.trim() || !formData.template_id.trim() || !formData.public_key.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const isFirst = configs.length === 0;
      const { data, error } = await supabase.from('emailjs_configs').insert({
        name: formData.name.trim() || 'New Config',
        service_id: formData.service_id.trim(),
        template_id: formData.template_id.trim(),
        public_key: formData.public_key.trim(),
        is_active: isFirst // Auto-activate if it's the only one
      }).select().single();
      
      if (error) throw error;
      setConfigs([data, ...configs]);
      setFormData({ name: '', service_id: '', template_id: '', public_key: '' });
      setShowForm(false);
      toast.success('EmailJS Config added!');
      await logAdminAction('add_emailjs_config', 'settings', data.id);
    } catch (err: any) {
      toast.error('Failed to add config: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    if (current) return; // Already active, cannot deactivate without another active
    try {
      const { error } = await supabase.from('emailjs_configs').update({ is_active: true }).eq('id', id);
      if (error) throw error;
      // Trigger in DB will set others to false, but we update local state manually
      setConfigs(configs.map(c => ({ ...c, is_active: c.id === id })));
      toast.success('Active config switched!');
      await logAdminAction('toggle_emailjs_config', 'settings', id, 'Set as active');
    } catch (err: any) {
      toast.error('Failed to switch config: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('emailjs_configs').delete().eq('id', id);
      if (error) throw error;
      setConfigs(configs.filter(c => c.id !== id));
      toast.success('Config deleted!');
      await logAdminAction('delete_emailjs_config', 'settings', id);
    } catch (err: any) {
      toast.error('Failed to delete config: ' + err.message);
    }
  };

  return (
    <>
      <AnimatePresence>
        {pinModal}
      </AnimatePresence>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-6 pt-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">EmailJS Configurations</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage OTP Email Services</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-500 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
        >
          <Plus size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Add Config</span>
        </button>
      </div>

      {showForm && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Config Name (e.g. Free Tier 1)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Service ID" value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Template ID" value={formData.template_id} onChange={e => setFormData({...formData, template_id: e.target.value})} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500" />
            <input type="text" placeholder="Public Key" value={formData.public_key} onChange={e => setFormData({...formData, public_key: e.target.value})} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
            <button onClick={() => requirePin(handleSave)} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50">Save</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : configs.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          <Mail size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-xs font-bold uppercase tracking-widest">No EmailJS Configs</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {configs.map((c) => (
            <div key={c.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${c.is_active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                    {c.is_active ? 'Active' : 'Standby'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</span>
                </div>
                <div className="flex gap-4 mt-2">
                  <p className="font-mono text-[10px] text-slate-500"><span className="font-bold">Service:</span> {c.service_id}</p>
                  <p className="font-mono text-[10px] text-slate-500"><span className="font-bold">Template:</span> {c.template_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!c.is_active && (
                  <button onClick={() => requirePin(() => handleToggleActive(c.id, c.is_active))} className="p-2 text-slate-400 hover:text-emerald-500 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors" title="Set Active">
                    <CheckCircle2 size={16} />
                  </button>
                )}
                <button onClick={() => requirePin(() => handleDelete(c.id))} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

const ApiKeysManager: React.FC = () => {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [adding, setAdding] = useState(false);
  const [keySearch, setKeySearch] = useState('');
  const { requirePin, pinModal } = useAdminPin();

  const fetchKeysAndPin = async () => {
    setLoading(true);
    try {
      const keysRes = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
      
      if (keysRes.error) throw keysRes.error;
      setKeys(keysRes.data || []);
      
    } catch (err: any) {
      console.warn('Failed to load API keys:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeysAndPin(); }, []);

  const handleAdd = async () => {
    if (!newKey.trim()) return;
    setAdding(true);
    try {
      const { data, error } = await supabase.from('api_keys').insert({ provider: 'unsplash', key_value: newKey.trim() }).select().single();
      if (error) throw error;
      setKeys([data, ...keys]);
      setNewKey('');
      toast.success('API Key added!');
      
      await logAdminAction('update_site_settings', 'settings', undefined, 'Added API Key');

      // Automatically wake up paused jobs
      try {
        await supabase
          .from('generation_jobs')
          .update({ resume_at: new Date().toISOString() })
          .eq('status', 'paused')
          .or('pause_reason.eq.api_quota_exhausted,pause_reason.is.null');

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ type: 'RESUME_CHECK' }),
          });
        }
      } catch (e) {
        console.warn('Failed to trigger auto-resume:', e);
      }
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
      
      await logAdminAction('update_site_settings', 'settings', id, `Toggled API Key: ${!current ? 'ON' : 'OFF'}`);

      // If turning on, wake up paused jobs
      if (!current) {
        try {
          await supabase
            .from('generation_jobs')
            .update({ resume_at: new Date().toISOString() })
            .eq('status', 'paused')
            .or('pause_reason.eq.api_quota_exhausted,pause_reason.is.null');

          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-products`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ type: 'RESUME_CHECK' }),
            });
          }
        } catch (e) {
          console.warn('Failed to trigger auto-resume:', e);
        }
      }
    } catch (err: any) {
      toast.error('Failed to toggle key status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
      setKeys(keys.filter(k => k.id !== id));
      toast.success('API Key deleted!');
      
      await logAdminAction('delete_api_key', 'settings', id);
    } catch (err: any) {
      toast.error('Failed to delete key: ' + err.message);
    }
  };

  return (
    <>
      <AnimatePresence>
        {pinModal}
      </AnimatePresence>

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
            onClick={() => requirePin(handleAdd)}
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
            {/* Search bar */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keySearch}
                  onChange={e => setKeySearch(e.target.value)}
                  placeholder="ค้นหา API Key..."
                  className="w-full pl-8 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {keys
              .filter(k => !keySearch.trim() || k.key_value.toLowerCase().includes(keySearch.toLowerCase()) || k.provider.toLowerCase().includes(keySearch.toLowerCase()))
              .map((k) => {
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
                    <button onClick={() => requirePin(() => handleToggle(k.id, k.is_active))} className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title={k.is_active ? "Disable" : "Enable"}>
                      <Power size={16} />
                    </button>
                    <button onClick={() => requirePin(() => handleDelete(k.id))} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {keySearch.trim() && keys.filter(k => k.key_value.toLowerCase().includes(keySearch.toLowerCase()) || k.provider.toLowerCase().includes(keySearch.toLowerCase())).length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <Search size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">ไม่พบ API Key ที่ตรงกับ &quot;{keySearch}&quot;</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </>
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
      
      // Filter out sensitive settings like the PIN so they can't be changed from the UI
      const visibleSettings = (data || []).filter((s: Setting) => s.key !== 'admin_api_pin');
      
      const defaultSettings: Setting[] = [
        { key: 'gen_price_cheap_min', value: '50', description: 'ราคาขั้นต่ำของกลุ่มสินค้าราคาถูก', updated_at: new Date().toISOString() },
        { key: 'gen_price_cheap_max', value: '490', description: 'ราคาสูงสุดของกลุ่มสินค้าราคาถูก', updated_at: new Date().toISOString() },
        { key: 'gen_price_expensive_min', value: '500', description: 'ราคาขั้นต่ำของกลุ่มสินค้าราคาแพง', updated_at: new Date().toISOString() },
        { key: 'gen_price_expensive_max', value: '4500', description: 'ราคาสูงสุดของกลุ่มสินค้าราคาแพง', updated_at: new Date().toISOString() },
        { key: 'gen_cheap_ratio', value: '50', description: 'สัดส่วนสินค้าราคาถูกที่ต้องการให้สร้าง (0-100%)', updated_at: new Date().toISOString() },
      ];

      // Merge defaults if not in DB
      const mergedSettings = [...visibleSettings];
      for (const def of defaultSettings) {
        if (!mergedSettings.find(s => s.key === def.key)) {
          mergedSettings.push(def);
        }
      }
      
      setSettings(mergedSettings);
      const vals: Record<string, string> = {};
      mergedSettings.forEach((s: Setting) => { vals[s.key] = s.value; });
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
    gen_price_cheap_min: { label: 'Cheap Range - Min Price', description: 'ราคาเริ่มต้นของสินค้าราคาถูก', prefix: '$', icon: <Settings2 size={20} className="text-slate-400" /> },
    gen_price_cheap_max: { label: 'Cheap Range - Max Price', description: 'ราคาสูงสุดของสินค้าราคาถูก', prefix: '$', icon: <Settings2 size={20} className="text-slate-400" /> },
    gen_price_expensive_min: { label: 'Expensive Range - Min Price', description: 'ราคาเริ่มต้นของสินค้าราคาแพง', prefix: '$', icon: <Settings2 size={20} className="text-slate-400" /> },
    gen_price_expensive_max: { label: 'Expensive Range - Max Price', description: 'ราคาสูงสุดของสินค้าราคาแพง', prefix: '$', icon: <Settings2 size={20} className="text-slate-400" /> },
    gen_cheap_ratio: { label: 'Cheap Product Ratio', description: 'โอกาสสุ่มได้สินค้าราคาถูก', suffix: '%', icon: <Settings2 size={20} className="text-slate-400" /> },
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

          {/* === Compact Generation Price Settings Card === */}
          {(() => {
            const genKeys = ['gen_price_cheap_min', 'gen_price_cheap_max', 'gen_price_expensive_min', 'gen_price_expensive_max', 'gen_cheap_ratio'];
            const genSettings = genKeys.map(k => settings.find(s => s.key === k)).filter(Boolean) as Setting[];
            if (genSettings.length === 0) return null;
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Settings2 size={14} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">Product Generation · Price Config</p>
                    <p className="text-[10px] text-slate-400">ตั้งค่าช่วงราคาและสัดส่วนสินค้าที่ Generate</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {genSettings.map((setting) => {
                    const meta = settingsMeta[setting.key];
                    const isDirty = localValues[setting.key] !== setting.value;
                    return (
                      <div key={setting.key} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{meta?.label ?? setting.key}</p>
                          <p className="text-[11px] text-slate-400 truncate">{meta?.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 w-28">
                          {meta?.prefix && <span className="text-xs font-bold text-slate-400">{meta.prefix}</span>}
                          <input
                            type="number" min="0" step="1"
                            value={localValues[setting.key] ?? setting.value}
                            onChange={(e) => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                            className="bg-transparent border-none outline-none text-sm font-black text-slate-900 dark:text-white w-full text-right"
                          />
                          {meta?.suffix && <span className="text-xs font-bold text-slate-400">{meta.suffix}</span>}
                        </div>
                        <button
                          onClick={() => handleSave(setting.key)}
                          disabled={saving === setting.key || !isDirty}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isDirty ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                        >
                          {saving === setting.key ? <Loader2 size={12} className="animate-spin" /> : isDirty ? <Save size={12} /> : <CheckCircle2 size={12} />}
                          {saving === setting.key ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* === Other Settings (large cards) === */}
          {settings
            .filter(s => !['token_exchange_rate_usd_per_token', 'gen_price_cheap_min', 'gen_price_cheap_max', 'gen_price_expensive_min', 'gen_price_expensive_max', 'gen_cheap_ratio'].includes(s.key))
            .map((setting, i) => {
              const meta = settingsMeta[setting.key];
              const isDirty = localValues[setting.key] !== setting.value;
              return (
                <motion.div key={setting.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          {meta?.icon ?? <Settings2 size={20} className="text-slate-400" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{meta?.label ?? setting.key}</p>
                          <p className="text-xs text-slate-500 mt-0.5 max-w-sm leading-relaxed">{meta?.description ?? setting.description ?? 'No description'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Last updated: {new Date(setting.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 min-w-[180px]">
                          {meta?.prefix && <span className="text-sm font-black text-slate-400">{meta.prefix}</span>}
                          <input type="number" min="0.01" step="0.01" value={localValues[setting.key] ?? setting.value} onChange={(e) => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.value }))} className="bg-transparent border-none outline-none text-lg font-black text-slate-900 dark:text-white w-24 text-center" />
                          {meta?.suffix && <span className="text-xs font-black text-slate-400 whitespace-nowrap">{meta.suffix}</span>}
                        </div>
                        <button onClick={() => handleSave(setting.key)} disabled={saving === setting.key || !isDirty} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${isDirty ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                          {saving === setting.key ? <Loader2 size={14} className="animate-spin" /> : isDirty ? <Save size={14} /> : <CheckCircle2 size={14} />}
                          {saving === setting.key ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isDirty && (
                    <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-500/10 border-t border-amber-100 dark:border-amber-500/20">
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">⚠ Unsaved changes — current live value is {meta?.prefix ?? ''}{setting.value}</p>
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
          <EmailJsManager />
        </div>
      )}
    </div>
  );
};
