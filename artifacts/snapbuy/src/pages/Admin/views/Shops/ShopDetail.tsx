import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Building2, CalendarDays, CircleDollarSign, Download, ExternalLink,
  Gift, MapPin, Package, RefreshCw, ShieldCheck, Star, TrendingUp, User,
  Wallet, X, Filter, Clock, BarChart2, Percent
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';

interface ShopDetailProps {
  shopId: string;
  onBack: () => void;
  onViewProducts?: (shopId: string) => void;
}

interface ShopRecord {
  id: string;
  name?: string;
  logo_url?: string;
  image_url?: string;
  address?: string;
  description?: string;
  rating?: number;
  sales_percentage?: number;
  sale_balance?: number;
  bonus_balance?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface ProductSummary {
  id: string;
  name?: string;
  price?: number;
  view_count?: number;
  like_count?: number;
  is_published?: boolean;
  created_at?: string;
}

interface ShopTransaction {
  id: string;
  type: 'sale' | 'bonus' | 'withdrawal';
  amount: number;
  note?: string | null;
  created_at?: string;
}

interface StoreQuotaRecord {
  id: string;
  product_limit?: number;
  sales_percentage?: number;
  quota_expires_at?: string;
  code?: string;
  category_limit?: number;
  duration_days?: number;
  is_used?: boolean;
  used_at?: string;
  created_by?: string;
  created_at?: string;
}

const TX_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  sale:       { label: 'Sale',       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  bonus:      { label: 'Bonus',      color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  withdrawal: { label: 'Withdrawal', color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
};

export const ShopDetail: React.FC<ShopDetailProps> = ({ shopId, onBack, onViewProducts }) => {
  const [shop, setShop] = useState<ShopRecord | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [transactions, setTransactions] = useState<ShopTransaction[]>([]);
  const [walletTotals, setWalletTotals] = useState({ sale: 0, bonus: 0, withdrawal: 0, total: 0 });
  const [ownerProfile, setOwnerProfile] = useState<any | null>(null);
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [fullTransactions, setFullTransactions] = useState<ShopTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFilterType, setTxFilterType] = useState<'all' | 'sale' | 'bonus' | 'withdrawal'>('all');
  const [txDateFrom, setTxDateFrom] = useState<string>('');
  const [txDateTo, setTxDateTo] = useState<string>('');
  const [quota, setQuota] = useState<StoreQuotaRecord | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<ProductSummary[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();

        if (shopError) throw shopError;
        setShop(shopData);

        try {
          if (shopData?.owner_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url')
              .eq('id', shopData.owner_id)
              .single();
            setOwnerProfile(profileData || null);
          }
        } catch (e) {
          console.warn('Failed to load owner profile', e);
        }

        const [productsRes, txRes, quotaHistoryRes] = await Promise.all([
          supabase
            .from('products')
            .select('id, name, price, view_count, like_count, is_published, created_at')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('shop_wallet_transactions')
            .select('id, type, amount, note, created_at')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('store_quotas')
            .select('id, code, duration_days, used_at, created_at')
            .eq('used_by_shop_id', shopId)
            .order('used_at', { ascending: false })
            .limit(1)
        ]);

        if (productsRes.error) throw productsRes.error;
        if (txRes.error) throw txRes.error;

        setProducts(productsRes.data || []);
        setTransactions(txRes.data || []);
        // quota info lives on the shop row — store_quotas only holds redeem history
        setQuota(quotaHistoryRes.data?.[0] || null);

        try {
          const { data: allTx } = await supabase
            .from('shop_wallet_transactions')
            .select('type, amount')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
            .limit(1000);

          const sale = (allTx || []).filter((t: any) => t.type === 'sale').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
          const bonus = (allTx || []).filter((t: any) => t.type === 'bonus').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
          const withdrawal = (allTx || []).filter((t: any) => t.type === 'withdrawal').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
          const total = sale + bonus - withdrawal;
          setWalletTotals({ sale, bonus, withdrawal, total });
        } catch (e) {
          console.warn('Failed to compute wallet totals:', e);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Unable to load shop details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  const openTransactions = async (page = 1) => {
    setIsTxOpen(true);
    setTxLoading(true);
    try {
      const perPage = 50;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('shop_wallet_transactions')
        .select('id, type, amount, note, created_at', { count: 'exact' })
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (txFilterType && txFilterType !== 'all') query = query.eq('type', txFilterType);
      if (txDateFrom) query = query.gte('created_at', new Date(txDateFrom).toISOString());
      if (txDateTo) query = query.lte('created_at', new Date(txDateTo).toISOString());

      const { data, error } = await query.range(from, to);
      if (error) throw error;
      setFullTransactions(data || []);
    } catch (err) {
      console.error('Failed to load full transactions', err);
    } finally {
      setTxLoading(false);
    }
  };

  const downloadTransactionsCSV = async () => {
    try {
      let query = supabase
        .from('shop_wallet_transactions')
        .select('id, type, amount, note, created_at')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(5000);
      if (txFilterType && txFilterType !== 'all') query = query.eq('type', txFilterType);
      if (txDateFrom) query = query.gte('created_at', new Date(txDateFrom).toISOString());
      if (txDateTo) query = query.lte('created_at', new Date(txDateTo).toISOString());
      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      const header = ['id', 'type', 'amount', 'note', 'created_at'];
      const csv = [header.join(',')].concat(rows.map((r: any) => [r.id, r.type, r.amount, `"${(r.note||'').toString().replace(/"/g,'""')}"`, r.created_at].join(','))).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop_${shopId}_transactions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV', err);
    }
  };

  const loadCatalogProducts = async () => {
    if (catalogProducts.length > 0) {
      return;
    }
    setCatalogLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, view_count, like_count, is_published, created_at')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCatalogProducts(data || []);
    } catch (err) {
      console.error('Failed to load shop catalog', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const summary = useMemo(() => {
    // Use shop.sale_balance / shop.bonus_balance as the authoritative NET current balance.
    // walletTotals computed from transactions is GROSS (before withdrawals) — only use as fallback.
    const saleBalance   = Number(shop?.sale_balance  ?? walletTotals.sale   ?? 0);
    const bonusBalance  = Number(shop?.bonus_balance ?? walletTotals.bonus  ?? 0);
    const totalBalance  = saleBalance + bonusBalance;
    const grossSales    = walletTotals.sale;
    const totalWithdraw = walletTotals.withdrawal;
    const publishedCount = products.filter((p) => p.is_published).length;
    const totalViews = products.reduce((sum, p) => sum + Number(p.view_count || 0), 0);
    const totalLikes = products.reduce((sum, p) => sum + Number(p.like_count || 0), 0);
    return { saleBalance, bonusBalance, totalBalance, grossSales, totalWithdraw, publishedCount, totalViews, totalLikes };
  }, [products, shop, walletTotals]);

  // Quota info is stored on the shop row (copied during redeem)
  const salesPct       = Number(shop?.sales_percentage ?? 0);
  const productLimit   = Number(shop?.product_limit ?? 0);
  const categoryLimit  = Number(shop?.category_limit ?? 0);
  const quotaExpiresAt = shop?.quota_expires_at ?? null;
  const slotUsage = productLimit > 0 ? Math.min(100, Math.round((products.length / productLimit) * 100)) : 0;
  const isExpired = quotaExpiresAt ? new Date(quotaExpiresAt) < new Date() : false;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors text-sm font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 p-6 text-sm text-rose-600 dark:text-rose-400">
          {error || 'This shop could not be loaded.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-500 hover:border-primary-500/30 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Shop Details</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{shop.name || 'Unnamed Shop'}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (onViewProducts) {
                onViewProducts(shop.id);
                return;
              }
              if (!showCatalog) {
                setShowCatalog(true);
                loadCatalogProducts();
              }
            }}
            className="group inline-flex items-center gap-2.5 rounded-2xl border-2 border-primary-500 px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/70 hover:scale-105 relative overflow-hidden"
          >
            {/* Animated glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-white/10 to-primary-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-2.5">
              <Package size={16} className="group-hover:scale-110 transition-transform" />
              <span>สินค้า</span>
              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black">
                🛒
              </div>
            </div>
          </button>
          <Link to={`/shop/${shop.id}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-primary-500 hover:border-primary-500/30 transition-all">
            <ExternalLink size={13} /> Open Store
          </Link>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-primary-500 hover:border-primary-500/30 transition-all">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Top Row: Shop Profile + Wallet ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">

        {/* Shop Profile Card */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex gap-5 items-start mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-md">
              <img src={shop.logo_url || shop.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name || 'Shop')}&background=random`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-500/20">Active</span>
                {salesPct > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[9px] font-black uppercase tracking-widest border border-primary-500/20">{salesPct}% Sales Bonus</span>
                )}
                {isExpired && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">Quota Expired</span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{shop.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{shop.description || 'No description provided for this shop.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <User size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Owner</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{ownerProfile?.full_name || (shop as any).profiles?.full_name || 'System Owner'}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{ownerProfile?.email || 'No email'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <MapPin size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Address</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{shop.address || 'Global Store'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <CalendarDays size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Created</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">{shop.created_at ? new Date(shop.created_at).toLocaleDateString() : '—'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
              <div className="flex items-center gap-1.5 text-amber-400 mb-2">
                <Star size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Rating</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">{shop.rating || '5.0'}</p>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="rounded-[2rem] bg-gradient-to-br from-primary-500 via-violet-500 to-indigo-600 p-6 text-white shadow-xl shadow-primary-500/25 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, white 0%, transparent 60%)' }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/70">
                <Wallet size={15} />
                <span className="text-[10px] font-black uppercase tracking-widest">Shop Wallet</span>
              </div>
              <span className="text-[9px] bg-white/15 px-2 py-1 rounded-full border border-white/20 font-black uppercase tracking-widest">Net Balance</span>
            </div>
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-black mb-1">Current Balance</p>
            <p className="text-4xl font-black mb-5">{summary.totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-2xl bg-white/15 p-3.5 border border-white/10">
                <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1">Sales Balance</p>
                <p className="text-lg font-black">{summary.saleBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3.5 border border-white/10">
                <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1">Bonus Balance</p>
                <p className="text-lg font-black">{summary.bonusBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
            </div>
            {summary.totalWithdraw > 0 && (
              <div className="rounded-2xl bg-rose-500/25 border border-rose-400/30 px-3.5 py-2 mb-3 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-widest text-white/70">Total Withdrawn</p>
                <p className="text-sm font-black text-rose-200">-{summary.totalWithdraw.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
            )}
            <button onClick={() => openTransactions(1)} className="w-full rounded-2xl bg-white/20 hover:bg-white/30 border border-white/20 py-2 text-[10px] font-black uppercase tracking-widest transition-all">
              View All Transactions
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Products', value: products.length, sub: `${summary.publishedCount} published`, iconColor: 'text-blue-400' },
          { icon: TrendingUp, label: 'Total Views', value: summary.totalViews.toLocaleString(), sub: 'All time', iconColor: 'text-emerald-400' },
          { icon: Gift, label: 'Likes', value: summary.totalLikes.toLocaleString(), sub: 'All time', iconColor: 'text-rose-400' },
          { icon: CircleDollarSign, label: 'Quota Slots', value: productLimit > 0 ? `${products.length}/${productLimit}` : '—', sub: productLimit > 0 ? `${slotUsage}% used` : 'No quota set', iconColor: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className={`flex items-center gap-2 ${stat.iconColor} mb-3`}>
              <stat.icon size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>
            {stat.label === 'Quota Slots' && productLimit > 0 && (
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${slotUsage >= 90 ? 'bg-rose-500' : slotUsage >= 70 ? 'bg-amber-500' : 'bg-primary-500'}`}
                  style={{ width: `${slotUsage}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Quota & Performance ──────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={15} className="text-primary-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Store Quota & Performance</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
            <div className="flex items-center gap-1.5 text-violet-400 mb-2"><Percent size={12}/><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sales Share</span></div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{salesPct}%</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
            <div className="flex items-center gap-1.5 text-blue-400 mb-2"><BarChart2 size={12}/><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Product Limit</span></div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{productLimit > 0 ? productLimit : '—'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-2"><ShieldCheck size={12}/><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Categories</span></div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{categoryLimit > 0 ? categoryLimit : '—'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
            <div className={`flex items-center gap-1.5 mb-2 ${isExpired ? 'text-rose-400' : 'text-amber-400'}`}><Clock size={12}/><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quota Expiry</span></div>
            <p className={`text-sm font-black ${isExpired ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              {quotaExpiresAt ? new Date(quotaExpiresAt).toLocaleDateString() : 'No Expiry'}
            </p>
            {isExpired && <p className="text-[9px] text-rose-400 font-bold mt-0.5">Expired</p>}
          </div>
        </div>
        {quota && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 text-[10px]">
            <span className="text-slate-400">Last Redeem Code: <span className="font-black text-slate-700 dark:text-slate-300 font-mono">{quota.code || '—'}</span></span>
            <span className="text-slate-400">Duration: <span className="font-black text-slate-700 dark:text-slate-300">{quota.duration_days ?? '—'} days</span></span>
            {quota.used_at && <span className="text-slate-400">Activated: <span className="font-black text-slate-700 dark:text-slate-300">{new Date(quota.used_at).toLocaleDateString()}</span></span>}
          </div>
        )}
      </div>

      {/* ─── Products + Transactions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">

        {/* Recent Products or Full Product Catalog */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary-500 mb-0.5">{showCatalog ? 'Product Catalog' : 'Recent Products'}</p>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{showCatalog ? 'รายการสินค้าทั้งหมดของร้านนี้' : 'Latest items in this shop'}</h3>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{showCatalog ? `${catalogProducts.length} items` : `${products.length} items`}</span>
          </div>
          <div className="space-y-2">
            {showCatalog ? (
              catalogLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : catalogProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-xs text-slate-400 text-center">No products found for this shop.</div>
              ) : (
                catalogProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">{product.name || 'Unnamed Product'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-bold uppercase ${product.is_published ? 'text-emerald-500' : 'text-slate-400'}`}>{product.is_published ? 'Published' : 'Draft'}</span>
                        <span className="text-slate-300 dark:text-slate-600 text-[9px]">•</span>
                        <span className="text-[9px] text-slate-400">{product.view_count || 0} views</span>
                        <span className="text-slate-300 dark:text-slate-600 text-[9px]">•</span>
                        <span className="text-[9px] text-slate-400">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-white ml-4 flex-shrink-0">{Number(product.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                  </div>
                ))
              )
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-xs text-slate-400 text-center">No products found.</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{product.name || 'Unnamed Product'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase ${product.is_published ? 'text-emerald-500' : 'text-slate-400'}`}>{product.is_published ? 'Published' : 'Draft'}</span>
                      <span className="text-slate-300 dark:text-slate-600 text-[9px]">•</span>
                      <span className="text-[9px] text-slate-400">{product.view_count || 0} views</span>
                      <span className="text-slate-300 dark:text-slate-600 text-[9px]">•</span>
                      <span className="text-[9px] text-slate-400">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white ml-4 flex-shrink-0">{Number(product.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wallet Activity */}
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary-500 mb-0.5">Wallet Activity</p>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent movement</h3>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openTransactions(1)} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">View All</button>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">Live</span>
            </div>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-xs text-slate-400 text-center">No wallet activity yet.</div>
            ) : transactions.map((tx) => {
              const meta = TX_TYPE_META[tx.type] || TX_TYPE_META['sale'];
              return (
                <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>{meta.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{tx.note || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`text-sm font-black ${meta.color}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}{Number(tx.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Full Transaction Slide-over ─────────────────────────────── */}
      {isTxOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsTxOpen(false)} />
          <div className="relative z-10 ml-auto w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Wallet Transactions</h3>
                <button onClick={() => setIsTxOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400">Filter and export transactions for this shop.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <select value={txFilterType} onChange={(e) => setTxFilterType(e.target.value as any)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500">
                  <option value="all">All Types</option>
                  <option value="sale">Sales</option>
                  <option value="bonus">Bonus</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>
                <input type="date" value={txDateFrom} onChange={(e) => setTxDateFrom(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500" />
                <input type="date" value={txDateTo} onChange={(e) => setTxDateTo(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500" />
                <button onClick={() => openTransactions(1)} className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-600 transition-colors">
                  <Filter size={12} /> Apply
                </button>
                <button onClick={downloadTransactionsCSV} className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {txLoading ? (
                <div className="py-12 text-center text-sm text-slate-400 animate-pulse">Loading transactions...</div>
              ) : fullTransactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No transactions found.</div>
              ) : fullTransactions.map((t) => {
                const meta = TX_TYPE_META[t.type] || TX_TYPE_META['sale'];
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[300px]">{t.note || '—'}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className={`text-sm font-black ${meta.color}`}>{t.type === 'withdrawal' ? '-' : '+'}{Number(t.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
