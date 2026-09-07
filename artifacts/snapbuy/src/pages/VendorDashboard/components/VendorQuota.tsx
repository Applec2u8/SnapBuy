import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Wallet, Sparkles, CheckCircle2, Loader2, KeyRound,
  Clock, Package, TrendingUp, X, ShoppingCart, History,
  Gift, Zap, Tag, CheckSquare, Timer, Calculator, AlertTriangle, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  randomPick,
  randomInt,
  normalizeCategorySlug,
  getCategoryVariantConfig,
  randomBrand,
  randomHighlights,
  randomProductTitle,
  buildPlaceholderImages
} from '../utils/dummyData';
// ─── Types ────────────────────────────────────────────────────────
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
  duration_days: number | null;
  source: string | null;
  cost: number;
  created_at: string;
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
  open, onClose, shop, walletBalance, onSuccess, onAutoImport
}: {
  open: boolean; onClose: () => void; shop: any;
  walletBalance: number; onSuccess: () => void;
  onAutoImport?: (count: number) => void;
}) => {
  const { profile, fetchProfile, fetchShop } = useAuthStore();
  const [tab, setTab] = useState<'packages' | 'custom'>('packages');

  // Package state
  const [packages, setPackages] = useState<QuotaPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open) {
      setSelectedPkg(null);
      setCustomForm({ slots: 0, days: 0, selectedCategories: [] });
      return;
    }
    const fetchData = async () => {
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
        setShopCats((shopCatsRes.data || []).map(sc => sc.category_id));
      } catch {
        toast.error('Failed to load quota data');
      } finally {
        setLoadingPkgs(false);
        setLoadingCustom(false);
      }
    };
    fetchData();
  }, [open, shop]);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !redeemCode) return;
    setRedeeming(true);
    try {
      // First, fetch the quota code details to check auto_import_count
      const { data: quotaData } = await supabase
        .from('store_quotas')
        .select('auto_import_count')
        .eq('code', redeemCode.trim())
        .eq('is_used', false)
        .single();

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
        // Trigger auto-import if quota code has auto_import_count set
        const importCount = quotaData?.auto_import_count || 0;
        if (importCount > 0 && onAutoImport) {
          onAutoImport(importCount);
        }
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


// ─── Main Component ───────────────────────────────────────────────
const VendorQuota = ({ setShowImportModal }: { setShowImportModal?: (show: boolean) => void }) => {
  const { t } = useTranslation();
  const { profile, shop: storeShop } = useAuthStore();
  const [shop, setShop] = useState<any>(storeShop || null);
  const [productCount, setProductCount] = useState(0);
  const [loadingShop, setLoadingShop] = useState(true);
  const [history, setHistory] = useState<QuotaHistoryItem[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Free Category Selection State
  const [freeCategoriesForm, setFreeCategoriesForm] = useState<string[]>([]);
  const [submittingFree, setSubmittingFree] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Auto-Import State (triggered after redeem)
  const [autoImportState, setAutoImportState] = useState<{ count: number; selectedCats: string[]; generating: boolean } | null>(null);
  const [pendingAutoImport, setPendingAutoImport] = useState<number>(0);

  const walletBalance = profile?.wallet_balance || 0;
  const countdown = useCountdown(shop?.quota_expires_at || null);

  // Keep local shop in sync with store (in case shop updates after mount)
  useEffect(() => {
    if (storeShop) setShop(storeShop);
  }, [storeShop]);

  const fetchShopData = useCallback(async () => {
    // Get shopId from storeShop (most reliable) or fall back to querying by profile
    const shopId = storeShop?.id;
    if (!shopId && !profile) {
      setLoadingShop(false);
      return;
    }
    try {
      let freshShop: any = null;

      if (shopId) {
        // Fetch fresh shop data by ID (avoids owner_id RLS quirks)
        const { data } = await supabase.from('shops').select('*').eq('id', shopId).single();
        freshShop = data || storeShop;
      } else if (profile) {
        const { data, error } = await supabase.from('shops').select('*').eq('owner_id', profile.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        freshShop = data || null;
      }

      setShop(freshShop);

      if (freshShop) {
        // Fetch product count, owned categories, and all categories in parallel
        const [countRes, shopCatsRes, allCatsRes] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', freshShop.id),
          supabase.from('shop_categories').select('category_id').eq('shop_id', freshShop.id),
          supabase.from('categories').select('*').order('name'),
        ]);
        setProductCount(countRes.count || 0);
        setShopCats((shopCatsRes.data || []).map((sc: any) => sc.category_id));
        setAllCats(allCatsRes.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching shop:', err);
      // Fallback: keep storeShop if DB query fails
      if (storeShop) setShop(storeShop);
    } finally {
      setLoadingShop(false);
    }
  }, [profile, storeShop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFreeModal) {
          setShowFreeModal(false);
          if (pendingAutoImport > 0) {
            setAutoImportState({ count: pendingAutoImport, selectedCats: [], generating: false });
            setPendingAutoImport(0);
          }
        }
        if (showBuyModal) setShowBuyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFreeModal, showBuyModal, pendingAutoImport]);

  // When pendingAutoImport is set and fetchShopData completes, evaluate if we need the free modal first
  useEffect(() => {
    if (pendingAutoImport > 0 && !loadingShop && shop) {
      const maxAllowed = Math.max(0, (shop?.category_limit || 0) - shopCats.length);
      if (maxAllowed > 0 && allCats.length > shopCats.length) {
        setShowFreeModal(true);
      } else {
        setAutoImportState({ count: pendingAutoImport, selectedCats: [], generating: false });
        setPendingAutoImport(0);
      }
    }
  }, [pendingAutoImport, loadingShop, shop, shopCats, allCats]);

  const fetchHistory = useCallback(async () => {
    if (!shop) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('quota_history')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [shop]);

  useEffect(() => { fetchShopData(); }, [fetchShopData]);
  useEffect(() => {
    if (!loadingShop) {
      if (shop) {
        fetchHistory();
      } else {
        setLoadingHistory(false);
      }
    }
  }, [fetchHistory, loadingShop, shop]);

  if (loadingShop) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  // No shop found — user hasn't created a store yet
  if (!shop) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="p-4 bg-primary-500/10 rounded-2xl">
            <Package size={32} className="text-primary-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Store Found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              You need to create a store before you can manage quota. Please set up your store first in the Settings tab.
            </p>
          </div>
        </div>

        {/* Still show the redeem code card even without a shop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={16} className="text-blue-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Free Code</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed flex-1">
              Have a promotional quota code? Create your store first, then come back here to redeem it.
            </p>
            <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-not-allowed">
              <KeyRound size={14} /> Create Store First
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = shop?.quota_expires_at && new Date(shop.quota_expires_at) < new Date();
  const limit = isExpired ? 0 : (shop?.product_limit || 0);
  const used = productCount;
  const remaining = Math.max(0, limit - used);
  const usagePercent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isLifetime = limit > 0 && !shop?.quota_expires_at;
  const isLow = remaining > 0 && remaining < 10;
  const isFull = limit > 0 && remaining === 0;

  const typeLabel: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    purchase: { label: 'Purchased', color: 'bg-primary-100 dark:bg-primary-500/20', icon: <ShoppingCart size={13} className="text-primary-500" /> },
    code_redeem: { label: 'Code Redeemed', color: 'bg-blue-100 dark:bg-blue-500/20', icon: <Gift size={13} className="text-blue-500" /> },
    admin_set: { label: 'Admin Set', color: 'bg-purple-100 dark:bg-purple-500/20', icon: <Zap size={13} className="text-purple-500" /> },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Buy Modal */}
      <AnimatePresence>
        {showBuyModal && (
          <BuyQuotaModal
            open={showBuyModal}
            onClose={() => setShowBuyModal(false)}
            shop={shop}
            walletBalance={walletBalance}
            onSuccess={() => { fetchShopData(); fetchHistory(); }}
            onAutoImport={(count) => {
              // After redeem with auto_import_count, re-fetch categories
              fetchShopData().then(() => {
                // If they have unused category slots, show free modal first
                // Need to use the latest data, so fetch it directly again or rely on the state update?
                // `fetchShopData` sets `shop` and `shopCats`, but React state won't be updated immediately here.
                // We'll queue it using a trick: set a special pending state.
                setPendingAutoImport(count);
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Auto-Import Prompt Modal ── */}
      {autoImportState && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden" style={{ maxHeight: 'min(90vh, 680px)' }}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-r from-primary-500/10 to-transparent flex-shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Import Product Ready!</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your quota code includes <span className="font-black text-primary-500">{autoImportState.count} products</span> to import. Select categories to continue.</p>
                </div>
              </div>
            </div>

            {/* Category selector */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select from your unlocked categories:
                  {autoImportState.selectedCats.length > 0 && (
                    <span className="ml-2 bg-primary-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      {autoImportState.selectedCats.length} selected
                    </span>
                  )}
                </p>
                <button
                  onClick={() => {
                    const all = shopCats;
                    setAutoImportState(s => s ? ({ ...s, selectedCats: s.selectedCats.length === all.length ? [] : all }) : s);
                  }}
                  className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest"
                >
                  {autoImportState.selectedCats.length === shopCats.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {shopCats.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
                  <p className="text-sm text-slate-500 font-medium">No unlocked categories found.</p>
                  <p className="text-xs text-slate-400 mt-1">Please unlock categories first via Manage Categories.</p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {allCats.filter(c => shopCats.includes(c.id)).map(cat => {
                    const selected = autoImportState.selectedCats.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setAutoImportState(s => s ? ({
                          ...s,
                          selectedCats: selected
                            ? s.selectedCats.filter(id => id !== cat.id)
                            : [...s.selectedCats, cat.id]
                        }) : s)}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${selected
                            ? 'bg-primary-50/60 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/30'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-slate-500'
                          }`}
                      >
                        <input
                          type="checkbox" checked={selected} readOnly
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-500 pointer-events-none flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                          {cat.description && <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/80 px-6 py-4 flex-shrink-0">
              {autoImportState.selectedCats.length > 0 && (
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  Will import <span className="font-black text-slate-900 dark:text-white">{autoImportState.count}</span> products spread across <span className="font-black text-slate-900 dark:text-white">{autoImportState.selectedCats.length}</span> categor{autoImportState.selectedCats.length > 1 ? 'ies' : 'y'}.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setAutoImportState(null)}
                  className="w-28 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Skip
                </button>
                <button
                  disabled={autoImportState.selectedCats.length === 0 || autoImportState.generating}
                  onClick={async () => {
                    if (!shop || !autoImportState || autoImportState.selectedCats.length === 0) return;
                    setAutoImportState(s => s ? ({ ...s, generating: true }) : s);
                    try {
                      // Generate products spread across selected categories
                      const selectedCategories = allCats.filter(c => autoImportState.selectedCats.includes(c.id));
                      const perCategory = Math.max(1, Math.floor(autoImportState.count / selectedCategories.length));
                      const productsToInsert: any[] = [];

                      for (const category of selectedCategories) {
                        for (let i = 0; i < perCategory; i++) {
                          const variantConfig = getCategoryVariantConfig(category);
                          const imageUrls = await buildPlaceholderImages(category, 7);
                          const variantCount = randomInt(2, 4);
                          const variants = Array.from({ length: variantCount }, (_, variantIndex) => ({
                            name: variantConfig.variantName,
                            value: randomPick(variantConfig.values),
                            price_override: variantIndex === 0 ? 0 : randomInt(0, 200),
                            stock_quantity: randomInt(5, 30),
                            image_url: imageUrls[variantIndex % imageUrls.length],
                            sku: `${normalizeCategorySlug(category)}-${Date.now()}-${variantIndex + 1}-${Math.random().toString(36).slice(2, 8)}`
                          }));

                          const price = randomInt(490, 4490);
                          productsToInsert.push({
                            shop_id: shop.id,
                            category_id: category.id,
                            name: randomProductTitle(category),
                            description: `สินค้ารุ่นสุ่มสำหรับหมวด ${category.name}`,
                            price,
                            compare_at_price: price + randomInt(100, 450),
                            stock_quantity: variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
                            images: imageUrls,
                            is_published: true,
                            brand: randomBrand(),
                            highlights: randomHighlights(),
                            variants
                          });
                        }
                      }

                      const { data: insertedProducts, error: productError } = await supabase
                        .from('products')
                        .insert(productsToInsert.map(({ variants, ...product }) => product))
                        .select('id');

                      if (productError || !insertedProducts) throw productError || new Error('Failed to create products.');

                      const variantRows = productsToInsert.flatMap((product, index) => {
                        const productId = insertedProducts[index]?.id;
                        if (!productId) return [];
                        return product.variants.map((variant: any) => ({
                          product_id: productId,
                          name: variant.name,
                          value: variant.value,
                          price_override: variant.price_override,
                          stock_quantity: variant.stock_quantity,
                          image_url: variant.image_url,
                          sku: variant.sku
                        }));
                      });

                      if (variantRows.length > 0) {
                        const { error: variantError } = await supabase.from('product_variants').insert(variantRows);
                        if (variantError) throw variantError;
                      }

                      toast.success(`⚡ Imported ${productsToInsert.length} products successfully!`);
                      setAutoImportState(null);
                      fetchShopData();
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to import products.');
                      setAutoImportState(s => s ? ({ ...s, generating: false }) : s);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {autoImportState.generating ? (
                    <><Loader2 size={16} className="animate-spin" /> Importing...</>
                  ) : (
                    <><Zap size={16} /> Import {autoImportState.count} Products{autoImportState.selectedCats.length > 0 ? ` → ${autoImportState.selectedCats.length} cats` : ''}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Status Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_quota_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor usage, expiry, and manage your product limits</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowFreeModal(true)}
                className="self-start flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
              >
                <Tag size={14} /> Categories ({shopCats.length}/{shop?.category_limit || 0})
              </button>
              <button
                onClick={() => setShowBuyModal(true)}
                className="self-start flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
              >
                <Sparkles size={14} /> {t('vendor_quota_upgrade')}
              </button>
              {setShowImportModal && remaining > 0 && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="self-start flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg"
                >
                  <UploadCloud size={14} /> Import Products
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('vendor_quota_limit')}</p>
              <p className="text-2xl font-black text-primary-500">{limit.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('vendor_quota_slots')}</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('vendor_quota_used')}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{used.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t('vendor_quota_products')}</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('vendor_quota_available')}</p>
              <p className={`text-2xl font-black ${isFull ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-green-500'}`}>
                {remaining.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">slots left</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Bonus</p>
              <p className="text-2xl font-black text-amber-500">+{shop?.sales_percentage || 0}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">extra revenue on sales</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              {limit === 0 ? (
                <p className="text-sm font-black text-red-500 mt-2">No Quota</p>
              ) : isExpired ? (
                <p className="text-sm font-black text-red-500 mt-2">{t('vendor_quota_expired')}</p>
              ) : isFull ? (
                <p className="text-sm font-black text-red-500 mt-2">Quota Full</p>
              ) : isLow ? (
                <p className="text-sm font-black text-amber-500 mt-2">Running Low</p>
              ) : isLifetime ? (
                <p className="text-sm font-black text-blue-500 mt-2">Lifetime</p>
              ) : (
                <p className="text-sm font-black text-green-500 mt-2">Active</p>
              )}
            </div>
          </div>

          {/* Usage Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              <span>Usage</span>
              <span>{usagePercent.toFixed(1)}% ({used}/{limit})</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-primary-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {shop?.quota_expires_at && !isExpired && countdown && (
          <div className="px-6 md:px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Timer size={14} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {t('vendor_quota_expires')} {new Date(shop.quota_expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-end gap-4">
              {[
                { val: countdown.days, label: 'Days' },
                { val: countdown.hours, label: 'Hours' },
                { val: countdown.minutes, label: 'Min' },
                { val: countdown.seconds, label: 'Sec' },
              ].map(({ val, label }, idx) => (
                <React.Fragment key={label}>
                  {idx > 0 && <span className="text-xl font-black text-slate-300 dark:text-slate-600 mb-2">:</span>}
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none min-w-[2.5rem]">
                      {String(val).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Expired Warning */}
        {isExpired && (
          <div className="px-6 md:px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-500/5">
            <p className="text-sm font-black text-red-500">
              ⚠ Your quota expired on {new Date(shop.quota_expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.
              Buy a new package to re-activate your store listing.
            </p>
          </div>
        )}

        {/* No quota warning */}
        {limit === 0 && (
          <div className="px-6 md:px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-500/5">
            <p className="text-sm font-black text-red-500">
              ⚠ Your store has no product quota. You cannot list any products until you purchase or redeem a quota.
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom Grid: History + Redeem ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quota History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Quota History</h3>
            <span className="ml-auto text-[10px] text-slate-400">Last 20 events</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <TrendingUp size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">No quota history yet</p>
                <p className="text-xs mt-1">History will appear after you purchase or redeem a quota</p>
              </div>
            ) : history.map((item) => {
              const t = typeLabel[item.type] || typeLabel.admin_set;
              return (
                <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${t.color}`}>
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {item.type === 'purchase' ? `Purchased: ${item.source || 'Package'}` :
                          item.type === 'code_redeem' ? `Code Redeemed: ${item.source || '—'}` :
                            'Admin Adjustment'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex gap-2 flex-wrap">
                        <span>{new Date(item.created_at).toLocaleString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}</span>
                        {item.duration_days != null && (
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                        )}
                        {item.duration_days != null ? (
                          <span>{item.duration_days}d validity</span>
                        ) : item.amount > 0 && item.type !== 'admin_set' ? (
                          <><span className="text-slate-300 dark:text-slate-600">·</span><span>Lifetime</span></>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-black text-green-500">+{item.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{item.cost > 0 ? `$${item.cost.toFixed(2)}` : 'Free'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redeem Free Code — now moved into BuyQuotaModal footer */}

        {/* Manage Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-blue-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Manage Categories</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
            Skipped category selection earlier? Click below to choose which product categories your store can sell in.
          </p>

          {/* Category status summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unlocked</span>
              <span className="text-sm font-black text-blue-500">{shopCats.length} / {shop?.category_limit || 0}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: (shop?.category_limit || 0) > 0 ? `${(shopCats.length / shop.category_limit) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {allCats.slice(0, 6).map(cat => (
                <span
                  key={cat.id}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${shopCats.includes(cat.id)
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 line-through'
                    }`}
                >
                  {cat.name}
                </span>
              ))}
              {allCats.length > 6 && (
                <span className="text-[10px] font-bold text-slate-400">+{allCats.length - 6} more</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowFreeModal(true)}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Tag size={15} /> Unlock / Manage Categories
          </button>
        </div>
      </div>

      {/* FREE CATEGORY SELECT MODAL */}
      <AnimatePresence>
        {showFreeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowFreeModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Unlock Free Categories</h3>
                    <p className="text-[10px] text-slate-500 font-bold">You can unlock {Math.max(0, (shop?.category_limit || 0) - shopCats.length)} more categories for free.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh] space-y-2">
                <button
                  onClick={() => {
                    const maxAllowed = Math.max(0, (shop?.category_limit || 0) - shopCats.length);
                    const unowned = allCats.filter(c => !shopCats.includes(c.id)).map(c => c.id);

                    if (freeCategoriesForm.length > 0) {
                      // Deselect all
                      setFreeCategoriesForm([]);
                    } else {
                      // Select up to the maximum allowed
                      setFreeCategoriesForm(unowned.slice(0, maxAllowed));
                    }
                  }}
                  className="w-full text-center text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-500/10 py-2 rounded-lg hover:bg-blue-100 mb-2 transition-colors"
                >
                  {freeCategoriesForm.length > 0 ? 'Deselect All' : 'Select Max Allowed'}
                </button>

                {allCats.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 my-4">No categories found.</p>
                ) : allCats.map(cat => {
                  const isOwned = shopCats.includes(cat.id);
                  const isSelected = freeCategoriesForm.includes(cat.id);
                  return (
                    <label key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isOwned ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60' : isSelected ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={isOwned || (!isSelected && freeCategoriesForm.length >= Math.max(0, (shop?.category_limit || 0) - shopCats.length))}
                          checked={isOwned || isSelected}
                          onChange={() => {
                            if (isOwned) return;
                            if (!isSelected && freeCategoriesForm.length >= Math.max(0, (shop?.category_limit || 0) - shopCats.length)) {
                              toast.error(`You can only unlock up to ${shop?.category_limit} categories with your current quota.`);
                              return;
                            }
                            setFreeCategoriesForm(prev =>
                              prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                            );
                          }}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                      </div>
                      {isOwned && <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Owned</span>}
                    </label>
                  );
                })}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900">
                <button
                  onClick={() => {
                    toast.warning("You skipped category selection. You can unlock them later.", {
                      duration: 5000,
                      icon: <AlertTriangle size={16} className="text-amber-500" />
                    });
                    setShowFreeModal(false);
                    setFreeCategoriesForm([]);

                    if (pendingAutoImport > 0) {
                      setAutoImportState({ count: pendingAutoImport, selectedCats: [], generating: false });
                      setPendingAutoImport(0);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  onClick={async () => {
                    if (freeCategoriesForm.length === 0) {
                      toast.error("Please select at least one category, or skip.");
                      return;
                    }
                    setSubmittingFree(true);
                    try {
                      const inserts = freeCategoriesForm.map(catId => ({
                        shop_id: shop.id,
                        category_id: catId
                      }));
                      const { error } = await supabase.from('shop_categories').insert(inserts);
                      if (error) throw error;
                      toast.success(`🎉 Unlocked ${freeCategoriesForm.length} categories!`);
                      setShowFreeModal(false);
                      setFreeCategoriesForm([]);
                      // If we are chaining from auto-import, trigger it now
                      if (pendingAutoImport > 0) {
                        // Pass the freshly unlocked categories into the selected array to save them a click
                        setAutoImportState({ count: pendingAutoImport, selectedCats: freeCategoriesForm, generating: false });
                        setPendingAutoImport(0);
                      }
                      fetchShopData();
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to unlock categories.');
                    } finally {
                      setSubmittingFree(false);
                    }
                  }}
                  disabled={submittingFree || freeCategoriesForm.length === 0}
                  className="px-8 py-2.5 bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {submittingFree ? <Loader2 size={14} className="animate-spin" /> : 'Unlock Selected'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VendorQuota;
