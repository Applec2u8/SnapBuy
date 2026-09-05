import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Sparkles, Loader2, KeyRound,
  Package, TrendingUp, ShoppingCart, History,
  Gift, Zap, Tag, Timer, AlertTriangle, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { computeHasActiveSpecialQuota } from '../../utils/quotaHelpers';

import BuyQuotaModal from './BuyQuotaModal';
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

// ─── Main Component ───────────────────────────────────────────────
const VendorQuota = ({ setShowImportModal, canShowImportButton = false }: { setShowImportModal?: (show: boolean) => void; canShowImportButton?: boolean }) => {
  const { t } = useTranslation();
  const { profile, shop: storeShop, fetchShop } = useAuthStore();
  const [shop, setShop] = useState<any>(storeShop || null);
  const [productCount, setProductCount] = useState(0);
  const [loadingShop, setLoadingShop] = useState(true);
  const [history, setHistory] = useState<QuotaHistoryItem[]>([]);
  const [redeemedCodes, setRedeemedCodes] = useState<RedeemedQuotaCode[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Free Category Selection State
  const [freeCategoriesForm, setFreeCategoriesForm] = useState<string[]>([]);
  const [submittingFree, setSubmittingFree] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const walletBalance = profile?.wallet_balance || 0;
  const countdown = useCountdown(shop?.quota_expires_at || null);
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
      // Only refresh global auth store if we don't already have it locally,
      // otherwise this can cause repeated refresh loops.
      if (!storeShop?.id && freshShop?.id) {
        fetchShop(freshShop.id);
      }

      if (freshShop) {
        // Fetch product count, owned categories, and all categories in parallel
        const [countRes, shopCatsRes, allCatsRes] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', freshShop.id),
          supabase.from('shop_categories').select('category_id').eq('shop_id', freshShop.id),
          supabase.from('categories').select('*').order('name'),
        ]);
        setProductCount(countRes.count || 0);
        setShopCats(normalizeCategoryIds((shopCatsRes.data || []).map((sc: any) => sc.category_id)));
        setAllCats(allCatsRes.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching shop:', err);
      // Fallback: keep storeShop if DB query fails
      if (storeShop) setShop(storeShop);
    } finally {
      setLoadingShop(false);
    }
  }, [profile, storeShop, fetchShop]);

  const fetchAppliedQuotas = useCallback(async () => {
    if (!shop) {
      setRedeemedCodes([]);
      setHistory([]);
      setHistoryError(null);
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const [historyRes, codesRes] = await Promise.all([
        supabase
          .from('quota_history')
          .select('*')
          .eq('shop_id', shop.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('store_quotas')
          .select('code, product_limit, category_limit, duration_days, is_special_quota, sales_percentage, used_at')
          .eq('used_by_shop_id', shop.id)
          .order('used_at', { ascending: false }),
      ]);
      if (historyRes.error) throw historyRes.error;
      setHistory(historyRes.data || []);
      setRedeemedCodes(codesRes.data || []);
    } catch (err: any) {
      console.error('Error fetching applied quotas:', err);
      setHistoryError(err?.message || 'Unable to load quota history.');
      setHistory([]);
      setRedeemedCodes([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [shop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFreeModal) setShowFreeModal(false);
        if (showBuyModal) setShowBuyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFreeModal, showBuyModal]);

  useEffect(() => { fetchShopData(); }, [fetchShopData]);
  useEffect(() => {
    if (!loadingShop) {
      if (shop) {
        fetchAppliedQuotas();
      } else {
        setLoadingHistory(false);
      }
    }
  }, [fetchAppliedQuotas, loadingShop, shop]);

  const redeemedCodeMap = useMemo(
    () => Object.fromEntries(redeemedCodes.map(code => [code.code, code])),
    [redeemedCodes]
  );


  const combinedHistory = useMemo(() => {
    const existingCodeSources = new Set(
      history.filter(item => item.type === 'code_redeem' && item.source).map(item => item.source)
    );

    const extraCodeHistory = redeemedCodes
      .filter(code => code.used_at && !existingCodeSources.has(code.code))
      .map((code) => ({
        id: `code-${code.code}`,
        type: 'code_redeem' as const,
        amount: code.product_limit,
        category_amount: code.category_limit,
        duration_days: code.duration_days,
        source: code.code,
        cost: 0,
        created_at: code.used_at || new Date().toISOString(),
      }));

    return [...history, ...extraCodeHistory].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [history, redeemedCodes]);

  const hasHistory = combinedHistory.length > 0;
  const hasActiveSpecialQuota = computeHasActiveSpecialQuota(shop);
  const isExpired = !!shop?.quota_expires_at && new Date(shop.quota_expires_at) < new Date();
  const limit = isExpired ? 0 : (shop?.product_limit || 0);
  const used = productCount;
  const remaining = Math.max(0, limit - used);
  const usagePercent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isLow = remaining > 0 && remaining < 10;
  const isFull = limit > 0 && remaining === 0;
  const isLifetime = !shop?.quota_expires_at && limit > 0;
  const showImportButton = !!setShowImportModal && !!canShowImportButton;
  const effectiveCategoryLimit = Math.min(shop?.category_limit || 0, allCats.length);

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
            onSuccess={() => { fetchShopData(); fetchAppliedQuotas(); }}
          />
        )}
      </AnimatePresence>

      {/* ── Main Status Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_quota_title')}</h2>
                {hasActiveSpecialQuota ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} /> Special Quota Active
                  </span>
                ) : limit > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest">
                    <Package size={12} /> Normal Quota
                  </span>
                ) : null}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor usage, expiry, and manage your product limits</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowFreeModal(true)}
                className="self-start flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
              >
                <Tag size={14} /> Categories ({shopCats.length}/{effectiveCategoryLimit})
              </button>
              <button
                onClick={() => setShowBuyModal(true)}
                className="self-start flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
              >
                <Sparkles size={14} /> {t('vendor_quota_upgrade')}
              </button>
              {showImportButton && (
                <button
                  onClick={() => setShowImportModal!(true)}
                  className="self-start flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-500/25"
                >
                  <UploadCloud size={14} /> Import Products
                </button>
              )}
            </div>
          </div>

          {hasActiveSpecialQuota && (
            <div className="mb-5 rounded-2xl border border-primary-200 dark:border-primary-500/30 bg-primary-50/70 dark:bg-primary-500/10 px-4 py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
                <UploadCloud size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Special Quota — Import Products unlocked</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose how many products to import and which categories to unlock — within your quota limits above.
                </p>
              </div>
            </div>
          )}

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
              <div
                className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-primary-500'}`}
                style={{ width: `${usagePercent}%` }}
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

        {/* Special quota expiry */}
        {hasActiveSpecialQuota && shop?.special_quota_expires_at && (
          <div className="px-6 md:px-8 py-3 border-t border-slate-100 dark:border-slate-800 bg-primary-50/40 dark:bg-primary-500/5">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400">
              Special quota import access expires{' '}
              {new Date(shop.special_quota_expires_at).toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
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
            ) : historyError ? (
              <div className="py-12 text-center text-rose-400 space-y-2">
                <AlertTriangle size={28} className="mx-auto opacity-70" />
                <p className="text-sm font-bold">Unable to load quota history</p>
                <p className="text-xs text-slate-400">{historyError}</p>
                <button
                  onClick={fetchAppliedQuotas}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest"
                >Retry</button>
              </div>
            ) : !hasHistory ? (
              <div className="py-12 text-center text-slate-400">
                <TrendingUp size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">No quota history yet</p>
                <p className="text-xs mt-1">History will appear after you purchase or redeem a quota</p>
              </div>
            ) : combinedHistory.map((item) => {
              const t = typeLabel[item.type] || typeLabel.admin_set;
              const redeemed = item.type === 'code_redeem' && item.source ? redeemedCodeMap[item.source] : null;
              const quotaType = item.type === 'purchase' || item.type === 'admin_set'
                ? 'Normal'
                : redeemed?.is_special_quota
                  ? 'Special'
                  : 'Normal';
              const isSpecialItem = quotaType === 'Special';
              return (
                <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${t.color}`}>
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {item.type === 'purchase' ? `Purchased: ${item.source || 'Package'}` :
                            item.type === 'code_redeem' ? `Code Redeemed: ${item.source || '—'}` :
                              'Admin Adjustment'}
                        </p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${isSpecialItem
                            ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                          {quotaType}
                        </span>
                      </div>
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
              <span className="text-sm font-black text-blue-500">{shopCats.length} / {effectiveCategoryLimit}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: effectiveCategoryLimit > 0 ? `${(shopCats.length / effectiveCategoryLimit) * 100}%` : '0%' }}
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
                    <p className="text-[10px] text-slate-500 font-bold">You can unlock {Math.max(0, effectiveCategoryLimit - shopCats.length)} more categories for free.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh] space-y-2">
                <button
                  onClick={() => {
                    const maxAllowed = Math.max(0, effectiveCategoryLimit - shopCats.length);
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
                          disabled={isOwned || (!isSelected && freeCategoriesForm.length >= Math.max(0, effectiveCategoryLimit - shopCats.length))}
                          checked={isOwned || isSelected}
                          onChange={() => {
                            if (isOwned) return;
                            if (!isSelected && freeCategoriesForm.length >= Math.max(0, effectiveCategoryLimit - shopCats.length)) {
                              toast.error(`You can only unlock up to ${effectiveCategoryLimit} categories with your current quota.`);
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
