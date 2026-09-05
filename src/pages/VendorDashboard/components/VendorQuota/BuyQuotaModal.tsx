import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Wallet, Sparkles, CheckCircle2, Loader2, KeyRound,
  Clock, Package, X, ShoppingCart,
  Gift, Tag, CheckSquare, Calculator, AlertTriangle, ChevronRight, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { computeHasActiveSpecialQuota } from '../../utils/quotaHelpers';

const normalizeCategoryIds = (ids: any[]) => Array.from(new Set(ids.filter(Boolean))) as string[];

interface QuotaPackage {
  id: string;
  name: string;
  product_limit: number;
  duration_days: number | null;
  price: number;
  badge: string | null;
  sort_order: number;
  category_limit: number;
}

interface QuotaHistoryItem {
  id: string;
  type: 'purchase' | 'code_redeem' | 'admin_set';
  amount: number;
  category_amount?: number;
  duration_days: number | null;
  source: string | null;
  cost: number;
  created_at: string;
}

interface RedeemedQuotaCode {
  code: string;
  product_limit: number;
  category_limit: number;
  duration_days: number | null;
  is_special_quota: boolean;
  sales_percentage: number;
  used_at: string | null;
}

// ─── Countdown Hook ───────────────────────────────────────────────
const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; minutes: number; seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) { setTimeLeft(null); return; }

    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// ─── Buy Quota Modal ──────────────────────────────────────────────

const BuyQuotaModal = ({
  open, onClose, shop, walletBalance, onSuccess
}: {
  open: boolean; onClose: () => void; shop: any;
  walletBalance: number; onSuccess: () => void;
}) => {
  const { profile, fetchProfile, fetchShop } = useAuthStore();
  const [tab, setTab] = useState<'packages' | 'custom'>('packages');

  // Package state
  const [packages, setPackages] = useState<QuotaPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [quotaLoadError, setQuotaLoadError] = useState<string | null>(null);

  // Custom builder state
  const [categories, setCategories] = useState<any[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);
  const [settings, setSettings] = useState({ price_per_slot: 0, price_per_day: 0, base_category_price: 0 });
  const [loadingCustom, setLoadingCustom] = useState(true);

  const [customForm, setCustomForm] = useState({
    slots: 0,
    days: 0,
    selectedCategories: [] as string[]
  });
  const [categorySearch, setCategorySearch] = useState('');

  const [buying, setBuying] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [showRedeemInput, setShowRedeemInput] = useState(false);

  const loadQuotaModalData = useCallback(async () => {
    setQuotaLoadError(null);
    setLoadingPkgs(true);
    setLoadingCustom(true);
    try {
      // Fetch packages
      const { data: pkgs } = await supabase.from('quota_packages').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      setPackages(pkgs || []);

      // Fetch custom data
      const [catsRes, settingsRes, shopCatsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('quota_settings').select('*').eq('id', 1).single(),
        supabase.from('shop_categories').select('category_id').eq('shop_id', shop?.id || '')
      ]);

      setCategories(catsRes.data || []);
      if (settingsRes.data) {
        setSettings({
          price_per_slot: settingsRes.data.price_per_slot,
          price_per_day: settingsRes.data.price_per_day,
          base_category_price: settingsRes.data.base_category_price
        });
      }
      setShopCats(normalizeCategoryIds((shopCatsRes.data || []).map(sc => sc.category_id)));
    } catch (err: any) {
      console.error('Failed to load quota data:', err);
      setQuotaLoadError(err?.message || 'Failed to load quota data.');
      toast.error('Failed to load quota data');
    } finally {
      setLoadingPkgs(false);
      setLoadingCustom(false);
    }
  }, [shop]);

  useEffect(() => {
    if (!open) {
      setSelectedPkg(null);
      setCustomForm({ slots: 0, days: 0, selectedCategories: [] });
      setQuotaLoadError(null);
      return;
    }
    loadQuotaModalData();
  }, [open, loadQuotaModalData]);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !redeemCode) return;
    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc('redeem_store_quota', {
        p_quota_code: redeemCode.trim(),
        p_shop_id: shop.id,
      });
      if (error) throw error;
      if (data?.success) {
        toast.success('🎟️ Quota code redeemed successfully!');
        setRedeemCode('');
        setShowRedeemInput(false);
        fetchShop(shop.id);
        onSuccess();
        onClose();
      } else {
        throw new Error(data?.message || 'Failed to redeem.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid or already used code.');
    } finally {
      setRedeeming(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBuyPackage = async () => {
    if (!shop || !selectedPkg || !profile) return;
    const pkg = packages.find(p => p.id === selectedPkg);
    if (!pkg) return;

    if (walletBalance < pkg.price) {
      toast.error('Insufficient wallet balance. Please top up your wallet first.');
      return;
    }

    setBuying(true);
    try {
      const { error } = await supabase.rpc('buy_quota_package', {
        p_shop_id: shop.id,
        p_package_id: pkg.id,
      });
      if (error) throw error;
      toast.success(`🎉 ${pkg.name} package activated!`);
      fetchProfile(profile.id);
      fetchShop(shop.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to buy quota');
    } finally {
      setBuying(false);
    }
  };

  const handleBuyCustom = async () => {
    if (!shop || !profile) return;

    const cost = (customForm.slots * settings.price_per_slot) +
      (customForm.days * settings.price_per_day) +
      (customForm.selectedCategories.length * settings.base_category_price);

    if (cost === 0) {
      toast.error('Please select at least one upgrade (slots, days, or categories).');
      return;
    }

    if (walletBalance < cost) {
      toast.error('Insufficient wallet balance.');
      return;
    }

    setBuying(true);
    try {
      const { error } = await supabase.rpc('buy_custom_quota', {
        p_shop_id: shop.id,
        p_limit_amount: customForm.slots,
        p_duration_days: customForm.days,
        p_category_ids: customForm.selectedCategories,
        p_cost_amount: cost,
      });
      if (error) throw error;
      toast.success(`🎉 Custom quota activated!`);
      fetchProfile(profile.id);
      fetchShop(shop.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to buy quota');
    } finally {
      setBuying(false);
    }
  };

  const toggleCategory = (id: string) => {
    setCustomForm(prev => {
      if (prev.selectedCategories.includes(id)) {
        return { ...prev, selectedCategories: prev.selectedCategories.filter(c => c !== id) };
      } else {
        return { ...prev, selectedCategories: [...prev.selectedCategories, id] };
      }
    });
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const unownedCategories = categories.filter(c => !shopCats.includes(c.id));
  const isAllSelected = unownedCategories.length > 0 && customForm.selectedCategories.length === unownedCategories.length;

  const toggleAllCategories = () => {
    if (isAllSelected) {
      setCustomForm(prev => ({ ...prev, selectedCategories: [] }));
    } else {
      setCustomForm(prev => ({ ...prev, selectedCategories: unownedCategories.map(c => c.id) }));
    }
  };

  if (!open) return null;

  const pkgObj = packages.find(p => p.id === selectedPkg);
  const customCost = (customForm.slots * settings.price_per_slot) +
    (customForm.days * settings.price_per_day) +
    (customForm.selectedCategories.length * settings.base_category_price);

  const currentCost = tab === 'packages' ? (pkgObj?.price || 0) : customCost;
  const hasEnough = walletBalance >= currentCost;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Buy Quota</h3>
              <p className="text-xs text-slate-500">Upgrade your store limit and unlock categories</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setTab('packages')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'packages' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Packages</button>
              <button onClick={() => setTab('custom')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'custom' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Custom</button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <Wallet size={14} className="text-primary-500" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">${walletBalance.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900">

          {tab === 'packages' && (
            loadingPkgs ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
            ) : quotaLoadError ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <AlertTriangle size={28} className="mx-auto opacity-70" />
                <p className="text-sm font-bold">Unable to load quota packages</p>
                <p className="text-xs text-slate-400">{quotaLoadError}</p>
                <button
                  onClick={loadQuotaModalData}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest"
                >Retry</button>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Package size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">No packages available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPkg(p.id)}
                    className={`relative rounded-2xl cursor-pointer overflow-hidden flex flex-col transition-all bg-white dark:bg-slate-900 ${selectedPkg === p.id
                      ? 'ring-2 ring-primary-500 shadow-lg'
                      : 'border border-slate-200 dark:border-slate-800 hover:border-primary-400/50 hover:shadow-md'
                      }`}
                  >
                    {p.badge ? (
                      <div className={`text-center py-1.5 text-[10px] font-black uppercase tracking-widest ${selectedPkg === p.id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                        {p.badge}
                      </div>
                    ) : <div className="h-1.5 bg-slate-50 dark:bg-slate-800" />}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-base font-black text-slate-900 dark:text-white">{p.name}</h4>
                        {selectedPkg === p.id && <CheckCircle2 size={18} className="text-primary-500 flex-shrink-0" />}
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                        ${p.price.toFixed(2)}
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Package size={13} className="text-primary-500 flex-shrink-0" />
                          <span className="font-bold">{p.product_limit.toLocaleString()} Product Slots</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Tag size={13} className="text-blue-500 flex-shrink-0" />
                          <span className="font-bold">{(p.category_limit || 0).toLocaleString()} Categories</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Clock size={13} className="text-amber-500 flex-shrink-0" />
                          <span className="font-bold">{p.duration_days ? `${p.duration_days} Days` : 'Lifetime'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'custom' && (
            loadingCustom ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
            ) : quotaLoadError ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <AlertTriangle size={28} className="mx-auto opacity-70" />
                <p className="text-sm font-bold">Unable to load quota details</p>
                <p className="text-xs text-slate-400">{quotaLoadError}</p>
                <button
                  onClick={loadQuotaModalData}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest"
                >Retry</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Inputs */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between mb-3">
                      <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} className="text-primary-500" /> Additional Slots
                      </label>
                      <span className="text-xs font-bold text-slate-500">${settings.price_per_slot}/slot</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input type="range" min="0" max="1000" step="10" value={customForm.slots} onChange={(e) => setCustomForm(f => ({ ...f, slots: parseInt(e.target.value) }))} className="flex-1 accent-primary-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      <input type="number" min="0" value={customForm.slots} onChange={(e) => setCustomForm(f => ({ ...f, slots: parseInt(e.target.value) || 0 }))} className="w-20 text-center bg-slate-100 dark:bg-slate-800 rounded-xl py-2 font-black text-slate-900 dark:text-white outline-none border border-transparent focus:border-primary-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between mb-3">
                      <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" /> Extend Duration (Days)
                      </label>
                      <span className="text-xs font-bold text-slate-500">${settings.price_per_day}/day</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input type="range" min="0" max="365" step="30" value={customForm.days} onChange={(e) => setCustomForm(f => ({ ...f, days: parseInt(e.target.value) }))} className="flex-1 accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      <input type="number" min="0" value={customForm.days} onChange={(e) => setCustomForm(f => ({ ...f, days: parseInt(e.target.value) || 0 }))} className="w-20 text-center bg-slate-100 dark:bg-slate-800 rounded-xl py-2 font-black text-slate-900 dark:text-white outline-none border border-transparent focus:border-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[400px]">
                  <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <CheckSquare size={14} className="text-blue-500" /> Unlock Categories
                    </label>
                    <span className="text-xs font-bold text-slate-500">${settings.base_category_price}/each</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 gap-2 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      onClick={toggleAllCategories}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                    >
                      {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                    {filteredCategories.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-bold">No categories found</div>
                    ) : (
                      filteredCategories.map(cat => {
                        const isOwned = shopCats.includes(cat.id);
                        const isSelected = customForm.selectedCategories.includes(cat.id);
                        return (
                          <label key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isOwned ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-60' : isSelected ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                disabled={isOwned}
                                checked={isOwned || isSelected}
                                onChange={() => !isOwned && toggleCategory(cat.id)}
                                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                {cat.icon_url ? (
                                  <img src={cat.icon_url} alt={cat.name} className="w-5 h-5 object-contain" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">{cat.name.charAt(0)}</div>
                                )}
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                              </div>
                            </div>
                            {isOwned && <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Owned</span>}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
          {/* Free Code Collapse */}
          {showRedeemInput && (
            <div className="px-6 pt-4 pb-0">
              <form onSubmit={handleRedeemCode} className="flex gap-2 items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest shrink-0 hidden md:flex">
                  <KeyRound size={12} /> Free Code
                </div>
                <input
                  autoFocus
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="Q-XXXX-XXXX"
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-red-400 rounded-xl py-2 px-3 text-xs font-black text-slate-900 dark:text-white outline-none uppercase tracking-wider placeholder:font-normal placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={redeeming || !redeemCode.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 shrink-0"
                >
                  {redeeming ? <Loader2 size={12} className="animate-spin" /> : <><Gift size={12} /> Redeem</>}
                </button>
                <button type="button" onClick={() => { setShowRedeemInput(false); setRedeemCode(''); }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={14} />
                </button>
              </form>
            </div>
          )}
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Total Cost */}
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calculator size={10} /> Total Cost
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">${currentCost.toFixed(2)}</p>
                {!hasEnough && currentCost > 0 && (
                  <p className="text-xs font-bold text-red-500 mt-1">⚠ Need ${(currentCost - walletBalance).toFixed(2)} more</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Have a free code? */}
              <button
                type="button"
                onClick={() => setShowRedeemInput(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 ${redeemCode.trim() ? 'bg-red-500 text-white border border-red-500 hover:bg-red-600 dark:border-red-500/80 dark:hover:bg-red-600' : 'text-red-500 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
              >
                <KeyRound size={11} /> {redeemCode.trim() ? 'มันมากเลย กระเป๋าฟรี' : 'Free Code?'}
              </button>
              <button
                onClick={tab === 'packages' ? handleBuyPackage : handleBuyCustom}
                disabled={buying || !hasEnough || currentCost === 0 || (tab === 'packages' && !selectedPkg)}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                {buying ? <Loader2 className="animate-spin" size={16} /> : <><ShoppingCart size={16} /> Pay ${currentCost.toFixed(2)}</>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


export default BuyQuotaModal;