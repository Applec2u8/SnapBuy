import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BarChart3, ShieldAlert, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { logAdminAction } from '../../../../lib/auditLog';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import type { Quota, ShopQuotaInfo, QuotaPackage } from './types';
import { QuotaCodesTab } from './components/QuotaCodesTab';
import { ShopManagementTab } from './components/ShopManagementTab';
import { PackagesTab } from './components/PackagesTab';
import { CustomPricingTab } from './components/CustomPricingTab';
import { ConfirmModal, GenerateCodeModal, SetLimitModal, PackageModal } from './components/StoreQuotasModals';

type ActiveTab = 'codes' | 'shops' | 'packages' | 'settings';

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const StoreQuotas = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('codes');

  // â”€â”€ Codes tab state â”€â”€
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [quotasLoading, setQuotasLoading] = useState(true);
  // searchTerm moved to QuotaCodesTab
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(100);
  const [durationDays, setDurationDays] = useState<number | ''>(30);
  const [codeCategLimit, setCodeCategLimit] = useState(0);
  const [salesPercentage, setSalesPercentage] = useState(0);
  const [isSpecialQuota, setIsSpecialQuota] = useState(false);
  const [creating, setCreating] = useState(false);

  // â”€â”€ Shops tab state â”€â”€
  const [shops, setShops] = useState<ShopQuotaInfo[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  // shopSearch moved to ShopManagementTab

  // â”€â”€ Confirm modal â”€â”€
  const [confirm, setConfirm] = useState<{
    open: boolean; type: 'revoke_code' | 'reset_shop' | 'set_limit' | 'delete_package'; targetId: string;
    title: string; message: string; confirmLabel: string;
    extraData?: any;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // â”€â”€ Set limit modal â”€â”€
  const [setLimitModal, setSetLimitModal] = useState<{ open: boolean; shop: ShopQuotaInfo | null }>({ open: false, shop: null });
  const [newLimit, setNewLimit] = useState(0);
  const [settingLimit, setSettingLimit] = useState(false);

  // â”€â”€ Packages tab state â”€â”€
  const [packages, setPackages] = useState<QuotaPackage[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [pkgModal, setPkgModal] = useState<{ open: boolean; pkg: QuotaPackage | null }>({ open: false, pkg: null });
  const [pkgForm, setPkgForm] = useState({ name: '', product_limit: 100, duration_days: 30 as number | '', price: 10, badge: '', sort_order: 0, category_limit: 1 });
  const [savingPkg, setSavingPkg] = useState(false);

  // â”€â”€ Global ESC Key handler â”€â”€
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirm) setConfirm(null);
        else if (isModalOpen) setIsModalOpen(false);
        else if (setLimitModal.open) setSetLimitModal({ open: false, shop: null });
        else if (pkgModal.open) setPkgModal({ open: false, pkg: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirm, isModalOpen, setLimitModal.open, pkgModal.open]);

  // â”€â”€ Settings tab state â”€â”€
  const [quotaSettings, setQuotaSettings] = useState({ price_per_slot: 0.1, price_per_day: 0.5, base_category_price: 5.0, shipping_days: 3 });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // â”€â”€â”€ Fetch Quota Codes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchQuotas = useCallback(async () => {
    setQuotasLoading(true);
    try {
      const [quotasRes, catCountRes] = await Promise.all([
        supabase
          .from('store_quotas')
          .select('*, shops ( id, name ), profiles ( full_name )')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);
      if (quotasRes.error) throw quotasRes.error;
      setQuotas(quotasRes.data || []);
      setTotalCategories(catCountRes.count || 0);
    } catch {
      toast.error('Failed to load quota codes');
    } finally {
      setQuotasLoading(false);
    }
  }, []);

  // â”€â”€â”€ Fetch Shops with quota info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchShops = useCallback(async () => {
    setShopsLoading(true);
    try {
      // Step 1: fetch shops
      const { data: shopData, error } = await supabase
        .from('shops')
        .select('id, name, product_limit, sales_percentage, quota_expires_at, owner_id')
        .order('name');
      if (error) throw error;
      if (!shopData || shopData.length === 0) { setShops([]); return; }

      // Step 2: fetch profiles for all owner_ids
      const ownerIds = [...new Set(shopData.map((s: any) => s.owner_id))];
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ownerIds);
      const profileMap: Record<string, any> = {};
      (profileData || []).forEach((p: any) => { profileMap[p.id] = p; });

      // Step 3: fetch product counts for all shops in parallel
      const counts = await Promise.all(
        shopData.map(async (s: any) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', s.id);
          return { id: s.id, count: count || 0 };
        })
      );
      const countMap: Record<string, number> = {};
      counts.forEach(c => { countMap[c.id] = c.count; });

      setShops(shopData.map((s: any) => ({
        ...s,
        profiles: profileMap[s.owner_id] || null,
        product_count: countMap[s.id] || 0,
      })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shops');
    } finally {
      setShopsLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuotas(); }, [fetchQuotas]);
  useEffect(() => { if (activeTab === 'shops') fetchShops(); }, [activeTab, fetchShops]);
  useEffect(() => { if (activeTab === 'packages') fetchPackages(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'settings') fetchSettings(); }, [activeTab]);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const { data, error } = await supabase.from('quota_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setQuotaSettings({
          price_per_slot: data.price_per_slot,
          price_per_day: data.price_per_day,
          base_category_price: data.base_category_price,
          shipping_days: data.shipping_days ?? 3
        });
      }
    } catch { toast.error('Failed to load quota settings'); }
    finally { setLoadingSettings(false); }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { error } = await supabase.from('quota_settings').upsert({ id: 1, ...quotaSettings });
      if (error) throw error;
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  // â”€â”€â”€ Generate Code â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'Q-';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');
      const { data: qData, error } = await supabase.from('store_quotas').insert({
        code: generateCode(), product_limit: limit,
        duration_days: durationDays === '' ? null : durationDays,
        created_by: user.id,
        category_limit: codeCategLimit,
        sales_percentage: salesPercentage,
        is_special_quota: isSpecialQuota,
      }).select('code').single();
      if (error) throw error;

      // Log this activity so it appears in the System Logs
      await logAdminAction('generate_quota', 'quota', undefined, `Quota: ${qData?.code}`);

      toast.success('Quota code generated!');
      setIsModalOpen(false);
      setCodeCategLimit(0);
      setSalesPercentage(0);
      setIsSpecialQuota(false);
      fetchQuotas();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate code');
    } finally {
      setCreating(false);
    }
  };

  // â”€â”€â”€ Revoke Code (mark as unused, unlink shop) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleRevokeCode = async (quotaId: string) => {
    setConfirmLoading(true);
    try {
      // 1. Get quota info to know which shop to reset
      const quota = quotas.find(q => q.id === quotaId);
      if (!quota) throw new Error('Quota not found');

      // 2. Reset the shop's fields
      if (quota.used_by_shop_id) {
        const shopUpdate: Record<string, any> = {
          product_limit: 0,
          category_limit: 0,
          sales_percentage: 0,
          quota_expires_at: null,
        };

        // If it's a special quota, also clear the special quota fields
        if (quota.is_special_quota) {
          shopUpdate.has_special_quota = false;
          shopUpdate.special_quota_expires_at = null;

          // Remove all unlocked categories from the shop
          const { error: catErr } = await supabase
            .from('shop_categories')
            .delete()
            .eq('shop_id', quota.used_by_shop_id);
          if (catErr) throw catErr;
        }

        const { error: shopErr } = await supabase
          .from('shops')
          .update(shopUpdate)
          .eq('id', quota.used_by_shop_id);
        if (shopErr) throw shopErr;
      }

      // 3. Reset the quota code back to unused
      const { error } = await supabase.from('store_quotas')
        .update({ is_used: false, used_by_shop_id: null, used_at: null })
        .eq('id', quotaId);
      if (error) throw error;

      toast.success(
        quota.is_special_quota
          ? 'Special quota revoked — shop limit, special access & categories have been reset'
          : 'Quota code revoked and shop limit reset to 0'
      );
      setConfirm(null);
      fetchQuotas();
      if (activeTab === 'shops') fetchShops();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke code');
    } finally {
      setConfirmLoading(false);
    }
  };

  // â”€â”€â”€ Reset Shop Quota â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleResetShopQuota = async (shopId: string) => {
    setConfirmLoading(true);
    try {
      const { error } = await supabase.from('shops')
        .update({ product_limit: 0, category_limit: 0, sales_percentage: 0, quota_expires_at: null })
        .eq('id', shopId);
      if (error) throw error;

      // Also unlink any quota code
      await supabase.from('store_quotas')
        .update({ is_used: false, used_by_shop_id: null, used_at: null })
        .eq('used_by_shop_id', shopId);

      toast.success('Shop quota reset to 0');
      setConfirm(null);
      fetchShops();
      if (activeTab === 'codes') fetchQuotas();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset quota');
    } finally {
      setConfirmLoading(false);
    }
  };

  // â”€â”€â”€ Manual Set Limit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setLimitModal.shop) return;
    setSettingLimit(true);
    try {
      const { error } = await supabase.from('shops')
        .update({ product_limit: newLimit })
        .eq('id', setLimitModal.shop.id);
      if (error) throw error;
      toast.success(`Limit updated to ${newLimit} for ${setLimitModal.shop.name}`);
      setSetLimitModal({ open: false, shop: null });
      fetchShops();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update limit');
    } finally {
      setSettingLimit(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // â”€â”€â”€ Fetch Packages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchPackages = useCallback(async () => {
    setPackagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('quota_packages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setPackages(data || []);

      const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      setTotalCategories(count || 0);
    } catch { toast.error('Failed to load packages'); }
    finally { setPackagesLoading(false); }
  }, []);

  const openAddPkg = () => {
    setPkgForm({ name: '', product_limit: 100, duration_days: 30, price: 10, badge: '', sort_order: packages.length + 1, category_limit: 1 });
    setPkgModal({ open: true, pkg: null });
  };

  const openEditPkg = (pkg: QuotaPackage) => {
    setPkgForm({
      name: pkg.name,
      product_limit: pkg.product_limit,
      duration_days: pkg.duration_days ?? '',
      price: pkg.price,
      badge: pkg.badge || '',
      sort_order: pkg.sort_order,
      category_limit: pkg.category_limit || 0,
    });
    setPkgModal({ open: true, pkg });
  };

  const handleSavePkg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPkg(true);
    try {
      const payload = {
        name: pkgForm.name,
        product_limit: pkgForm.product_limit,
        duration_days: pkgForm.duration_days === '' ? null : Number(pkgForm.duration_days),
        price: pkgForm.price,
        badge: pkgForm.badge || null,
        sort_order: pkgForm.sort_order,
        category_limit: pkgForm.category_limit,
      };
      if (pkgModal.pkg) {
        const { error } = await supabase.from('quota_packages').update(payload).eq('id', pkgModal.pkg.id);
        if (error) throw error;
        toast.success('Package updated!');
      } else {
        const { error } = await supabase.from('quota_packages').insert(payload);
        if (error) throw error;
        toast.success('Package created!');
      }
      setPkgModal({ open: false, pkg: null });
      fetchPackages();
    } catch (err: any) { toast.error(err.message || 'Failed to save package'); }
    finally { setSavingPkg(false); }
  };

  const handleTogglePkg = async (pkg: QuotaPackage) => {
    try {
      const { error } = await supabase.from('quota_packages').update({ is_active: !pkg.is_active }).eq('id', pkg.id);
      if (error) throw error;
      toast.success(`Package ${!pkg.is_active ? 'activated' : 'deactivated'}`);
      fetchPackages();
    } catch (err: any) { toast.error(err.message || 'Failed to toggle'); }
  };

  const handleDeletePkg = async (id: string) => {
    setConfirmLoading(true);
    try {
      const { error } = await supabase.from('quota_packages').delete().eq('id', id);
      if (error) throw error;
      toast.success('Package deleted successfully!');
      
      await logAdminAction('delete_quota_package', 'quota', id);
      
      setConfirm(null);
      fetchPackages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete package');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Filtering logic moved to components

  // ─── Refresh All Data ─────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchQuotas(),
        fetchShops(),
        fetchPackages(),
        fetchSettings(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchQuotas, fetchShops, fetchPackages, fetchSettings]);

  // â”€â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const usedCount = quotas.filter(q => q.is_used).length;
  const unusedCount = quotas.filter(q => !q.is_used).length;
  const expiredShops = shops.filter(s => s.quota_expires_at && new Date(s.quota_expires_at) < new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Store Quotas</h2>
          <p className="text-xs text-slate-500 font-medium">Generate codes, track usage, and manage per-shop limits.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            disabled={refreshing}
            title="Refresh all data"
            className={`flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${refreshing ? 'animate-pulse' : ''}`}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus size={16} /> Generate Code
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Codes', value: quotas.length, icon: BarChart3, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'In Use', value: usedCount, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Available', value: unusedCount, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Expired Shops', value: expiredShops, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${stat.bg}`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar mb-6 pb-2">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: 'codes', label: 'Quota Codes' },
          { id: 'shops', label: 'Shop Management' },
          { id: 'packages', label: 'Packages' },
          { id: 'settings', label: 'Custom Pricing' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      {/* ── TAB: Quota Codes ── */}
      {activeTab === 'codes' && (
        <QuotaCodesTab
          quotas={quotas}
          quotasLoading={quotasLoading}
          copyToClipboard={copyToClipboard}
          setConfirm={setConfirm}
        />
      )}

      {/* ── TAB: Shop Management ── */}
      {activeTab === 'shops' && (
        <ShopManagementTab
          shops={shops}
          shopsLoading={shopsLoading}
          setSetLimitModal={setSetLimitModal}
          setNewLimit={setNewLimit}
          setConfirm={setConfirm}
        />
      )}

      {/* ── TAB: Packages ── */}
      {activeTab === 'packages' && (
        <PackagesTab
          packages={packages}
          packagesLoading={packagesLoading}
          openAddPkg={openAddPkg}
          openEditPkg={openEditPkg}
          handleTogglePkg={handleTogglePkg}
          setConfirm={setConfirm}
        />
      )}

      {/* ── TAB: Settings ── */}
      {activeTab === 'settings' && (
        <CustomPricingTab
          quotaSettings={quotaSettings}
          setQuotaSettings={setQuotaSettings}
          savingSettings={savingSettings}
          loadingSettings={loadingSettings}
          handleSaveSettings={handleSaveSettings}
        />
      )}

      {/* ── Generate Code Modal ── */}
      <GenerateCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleCreate={handleCreate}
        limit={limit}
        setLimit={setLimit}
        durationDays={durationDays}
        setDurationDays={setDurationDays}
        codeCategLimit={codeCategLimit}
        setCodeCategLimit={setCodeCategLimit}
        totalCategories={totalCategories}
        salesPercentage={salesPercentage}
        setSalesPercentage={setSalesPercentage}
        isSpecialQuota={isSpecialQuota}
        setIsSpecialQuota={setIsSpecialQuota}
        creating={creating}
      />

      {/* ── Set Limit Modal ── */}
      <SetLimitModal
        open={setLimitModal.open}
        shop={setLimitModal.shop}
        onClose={() => setSetLimitModal({ open: false, shop: null })}
        handleSetLimit={handleSetLimit}
        newLimit={newLimit}
        setNewLimit={setNewLimit}
        settingLimit={settingLimit}
      />

      {/* ── Package Modal (Add/Edit) ── */}
      <PackageModal
        open={pkgModal.open}
        pkg={pkgModal.pkg}
        onClose={() => setPkgModal({ open: false, pkg: null })}
        handleSavePkg={handleSavePkg}
        pkgForm={pkgForm}
        setPkgForm={setPkgForm}
        totalCategories={totalCategories}
        savingPkg={savingPkg}
      />

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={!!confirm?.open}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmLabel={confirm?.confirmLabel || 'Confirm'}
        danger
        loading={confirmLoading}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.type === 'revoke_code') handleRevokeCode(confirm.targetId);
          if (confirm.type === 'reset_shop') handleResetShopQuota(confirm.targetId);
          if (confirm.type === 'delete_package') handleDeletePkg(confirm.targetId);
        }}
      />
    </div>
  );
};
