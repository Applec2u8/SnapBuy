import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Wallet, ArrowRight, Store, ArrowLeft, Package, Tag, Clock,
  ShoppingBag, TrendingUp, Zap, Shield, ChevronRight, RefreshCw,
  BarChart2, CalendarClock, AlertCircle, CheckCircle2, Boxes, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { TopUpModal } from '../Profile/components/TopUpModal';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Money from '../../components/ui/Money';

/* ─── Types ────────────────────────────────────────────────────── */
interface DashboardData {
  // Quota
  productLimit: number;
  categoryLimit: number;
  quotaExpiresAt: string | null;
  // Shop stats
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  // Orders
  recentOrders: any[];
  // Shops list
  shops: any[];
  // Active boosts
  activeBoosts: number;
}

/* ─── Countdown util ─────────────────────────────────────────── */
function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  useEffect(() => {
    if (!targetDate) { setTimeLeft(null); return; }
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color = 'primary' }: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
  sub?: string; color?: string;
}) => {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-500',
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-red-500/10 text-red-500',
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.primary}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white truncate">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

/* ─── Progress bar ───────────────────────────────────────────── */
const UsageBar = ({ used, max, color }: { used: number; max: number; color: string }) => {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : `bg-${color}-500`;
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, profile, shop, shops, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const countdown = useCountdown(shop?.quota_expires_at || null);

  if (!user) return <Navigate to="/login" replace />;

  const fetchDashboardData = useCallback(async () => {
    try {
      let products: any[] = [];
      let orders: any[] = [];
      let totalOrderCount = 0;
      let activeBoosts = 0;

      if (shop?.id) {
        const [prodRes, ordersRes, boostsRes] = await Promise.all([
          (async () => supabase.from('products').select('id,is_published').eq('shop_id', shop.id))(),
          (async () => supabase.from('orders').select('id,total_price,status').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(5))(),
          (async () => supabase.from('product_boosts').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('is_active', true).gt('expires_at', new Date().toISOString()))(),
        ]);
        products = prodRes?.data || [];
        orders = ordersRes?.data || [];
        totalOrderCount = ordersRes?.count || 0;
        activeBoosts = boostsRes?.count || 0;
      }

      const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total_price || 0), 0);

      setData({
        productLimit: shop?.product_limit || 0,
        categoryLimit: shop?.category_limit || 0,
        quotaExpiresAt: shop?.quota_expires_at || null,
        totalProducts: products.length,
        publishedProducts: products.filter((p: any) => p.is_published).length,
        totalOrders: totalOrderCount,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
        shops: shops || [],
        activeBoosts,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop, shops]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user) await fetchProfile(user.id);
    await fetchDashboardData();
  };

  const isQuotaExpired = shop?.quota_expires_at && new Date(shop.quota_expires_at) < new Date();
  const effectiveLimit = isQuotaExpired ? 0 : (data?.productLimit || 0);
  const usedProducts = data?.totalProducts || 0;
  const remainingSlots = Math.max(0, effectiveLimit - usedProducts);
  const quotaPct = effectiveLimit > 0 ? Math.min(100, (usedProducts / effectiveLimit) * 100) : 0;

  const orderStatusColor: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    confirmed: 'bg-blue-500/10 text-blue-600',
    shipped: 'bg-purple-500/10 text-purple-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-600',
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen bg-background pb-32 animate-fade-in text-left">

      {/* ─── Header ─── */}
      <div className="px-4 sm:px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => navigate('/profile')} className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('user_dashboard_title')}</h1>
            <p className="text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mt-0.5">{t('user_dashboard_subtitle')}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{t('user_dashboard_refresh')}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-8">

        {/* ─── Wallet Banner ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-14 -mt-14 blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/10 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none" />
          <div className="md:flex justify-between items-center gap-2 relative z-10">
            <div className="min-w-0 flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={15} className="text-slate-400 shrink-0" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('user_dashboard_available_balance')}</p>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black break-words whitespace-normal leading-tight">
                $ {(profile?.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{profile?.email}</p>
            </div>
            <button onClick={() => setShowTopUpModal(true)}
              className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap border border-white/10">
              {t('user_dashboard_top_up')} <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* ─── Account Info ─── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <Shield size={14} className="text-primary-500" /> {t('user_dashboard_account_info')}
          </h2>
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
            <StatCard icon={<Store size={18} />} label={t('user_dashboard_shops')} value={shops?.length || 0} sub={t('user_dashboard_owned_stores')} color="blue" />
            <StatCard icon={<ShoppingBag size={18} />} label={t('user_dashboard_wallet')} value={<Money amount={profile?.wallet_balance || 0} compact />} color="green" />
          </div>
        </section>

        {/* ─── Quota Section (only if has shop) ─── */}
        {shop && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Package size={14} className="text-primary-500" /> {t('user_dashboard_quota_limits')}
              </h2>
              <button onClick={() => navigate('/vendor/quota')}
                className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:underline flex items-center gap-1">
                {t('user_dashboard_manage')} <ChevronRight size={12} />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">

              {/* Expiry countdown */}
              {shop.quota_expires_at && (
                <div className={`rounded-xl p-3 flex items-center gap-3 ${isQuotaExpired ? 'bg-red-500/10 border border-red-500/20' : 'bg-primary-500/5 border border-primary-500/20'}`}>
                  {isQuotaExpired
                    ? <AlertCircle size={18} className="text-red-500 shrink-0" />
                    : <CalendarClock size={18} className="text-primary-500 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {isQuotaExpired ? t('user_dashboard_quota_expired') : t('user_dashboard_quota_expires')}
                    </p>
                    {isQuotaExpired
                      ? <p className="text-xs font-bold text-red-500">{t('user_dashboard_quota_expired_desc')}</p>
                      : countdown
                        ? <p className="text-sm font-black text-slate-800 dark:text-white">
                          {t('user_dashboard_remaining', { days: countdown.days, hours: countdown.hours, mins: countdown.minutes })}
                        </p>
                        : <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {new Date(shop.quota_expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>}
                  </div>
                </div>
              )}

              {/* Product Quota */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Boxes size={14} className="text-slate-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t('user_dashboard_product_slots')}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-800 dark:text-white">
                    {usedProducts} / {effectiveLimit}
                    <span className={`ml-2 text-[9px] font-black px-2 py-0.5 rounded-full ${remainingSlots === 0 ? 'bg-red-500/10 text-red-500' : remainingSlots <= 3 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                      {remainingSlots} {t('user_dashboard_left')}
                    </span>
                  </span>
                </div>
                <UsageBar used={usedProducts} max={effectiveLimit} color="primary" />
                <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-medium">
                  <span>{usedProducts} {t('user_dashboard_used')}</span>
                  <span>{Math.round(quotaPct)}%</span>
                </div>
              </div>

              {/* Category Quota */}
              {(data?.categoryLimit || 0) > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t('user_dashboard_category_limit')}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-800 dark:text-white">{data?.categoryLimit} {t('user_dashboard_categories')}</span>
                  </div>
                </div>
              )}

              {/* Active Boosts */}
              <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{t('user_dashboard_active_boosts')}</span>
                </div>
                <span className={`text-[11px] font-black px-3 py-1 rounded-full ${(data?.activeBoosts || 0) > 0 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {data?.activeBoosts || 0} {t('user_dashboard_active')}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ─── Shop Overview ─── */}
        {shop ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Store size={14} className="text-primary-500" /> {t('user_dashboard_shop_overview')} — {shop.name}
              </h2>
              <button onClick={() => navigate('/vendor')}
                className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:underline flex items-center gap-1">
                {t('user_dashboard_seller_center')} <ExternalLink size={11} />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={<Boxes size={18} />} label={t('user_dashboard_total_products')} value={data?.totalProducts || 0} sub={`${data?.publishedProducts || 0} ${t('user_dashboard_published_label').toLowerCase()}`} color="blue" />
                  <StatCard icon={<CheckCircle2 size={18} />} label={t('user_dashboard_published_label')} value={data?.publishedProducts || 0} sub={`${(data?.totalProducts || 0) - (data?.publishedProducts || 0)} ${t('user_dashboard_drafts')}`} color="green" />
                  <StatCard icon={<ShoppingBag size={18} />} label={t('user_dashboard_total_orders')} value={data?.totalOrders || 0} color="purple" />
                  <StatCard icon={<TrendingUp size={18} />} label={t('user_dashboard_revenue')} value={<Money amount={data?.totalRevenue || 0} compact />} color="orange" />
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <BarChart2 size={14} className="text-primary-500" /> {t('user_dashboard_recent_orders')}
                    </h3>
                    <button onClick={() => navigate('/vendor')} className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:underline flex items-center gap-1">
                      {t('user_dashboard_view_all')} <ChevronRight size={12} />
                    </button>
                  </div>
                  {(data?.recentOrders || []).length === 0 ? (
                    <div className="py-10 text-center">
                      <ShoppingBag size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-slate-400">{t('user_dashboard_no_recent_orders')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(data?.recentOrders || []).map((order: any) => (
                        <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-4">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono truncate">#{order.id.slice(0, 8)}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${orderStatusColor[order.status] || 'bg-slate-100 text-slate-500'}`}>
                            {order.status}
                          </span>
                          <p className="text-[11px] font-black text-slate-800 dark:text-white shrink-0">${(order.total_price || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          /* No shop */
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <Store size={14} className="text-primary-500" /> {t('user_dashboard_shop')}
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
              <Store size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-2">{t('user_dashboard_no_shop')}</h3>
              <p className="text-xs font-medium text-slate-500 mb-5">{t('user_dashboard_no_shop_desc')}</p>
              <button onClick={() => navigate('/become-seller')}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                {t('user_dashboard_become_seller')}
              </button>
            </div>
          </section>
        )}

        {/* ─── Multiple Shops ─── */}
        {shops && shops.length > 1 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <Boxes size={14} className="text-primary-500" /> {t('user_dashboard_all_shops')} ({shops.length})
            </h2>
            <div className="space-y-2">
              {shops.map((s: any) => {
                const sExpired = s.quota_expires_at && new Date(s.quota_expires_at) < new Date();
                const sLimit = sExpired ? 0 : (s.product_limit || 0);
                return (
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center gap-4">
                    {s.logo_url
                      ? <img src={s.logo_url} alt={s.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                      : <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                        <Store size={18} className="text-primary-500" />
                      </div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{s.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                          <Package size={10} /> {sLimit} {t('user_dashboard_product_slots').toLowerCase()}
                        </span>
                        {s.quota_expires_at && (
                          <span className={`text-[10px] font-medium flex items-center gap-1 ${sExpired ? 'text-red-500' : 'text-green-500'}`}>
                            <Clock size={10} />
                            {sExpired ? t('user_dashboard_quota_expired') : new Date(s.quota_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('user_dashboard_price')}</p>
                      <p className="text-sm font-black text-primary-500">${(s.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      <TopUpModal show={showTopUpModal} onClose={() => setShowTopUpModal(false)} />
    </div>
  );
};

export default UserDashboard;
