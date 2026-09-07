import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  User,
  Calendar,
  ExternalLink,
  MoreVertical,
  Star,
  Package,
  BarChart2,
  Clock
} from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { Pagination } from '../../components/Pagination';

interface ShopManagementProps {
  shops: any[];
  loading: boolean;
  onSelectShop?: (shopId: string | null) => void;
  onRefresh?: () => void;
}

export const ShopManagement: React.FC<ShopManagementProps> = ({ shops, loading, onSelectShop, onRefresh }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // Map: shopId -> { productCount, quota }
  const [shopExtras, setShopExtras] = useState<Record<string, { productCount: number }>>({});

  const filteredShops = React.useMemo(() => shops.filter(shop =>
    shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [shops, searchTerm]);

  const paginatedShops = React.useMemo(() => filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ), [filteredShops, currentPage]);

  useEffect(() => {
    if (!paginatedShops || paginatedShops.length === 0) return;
    const fetchCounts = async () => {
      const extras = { ...shopExtras };
      let changed = false;
      const promises = paginatedShops.map(async (shop) => {
        // Fetch only if we don't have it yet to save queries when paginating back
        if (extras[shop.id] !== undefined) return;
        
        const { count } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('shop_id', shop.id);
          
        extras[shop.id] = { productCount: count || 0 };
        changed = true;
      });
      
      await Promise.all(promises);
      if (changed) setShopExtras(extras);
    };
    fetchCounts();
  }, [paginatedShops]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  if (loading && shops.length === 0) {
    return <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder={t('admin_search_shops')}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-2xl py-3 px-4 pl-12 text-xs font-bold uppercase tracking-widest outline-none transition-all"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary-500 transition-all shadow-sm flex-shrink-0 ${loading ? 'animate-spin text-primary-500' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        )}
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedShops.map((shop) => {
          const extras = shopExtras[shop.id] || { productCount: 0 };
          // Quota info lives on the shop row (copied from store_quotas when code was redeemed)
          const productLimit  = Number(shop.product_limit ?? 0);
          const salesPct      = Number(shop.sales_percentage ?? 0);
          const quotaExpires  = shop.quota_expires_at ?? null;
          const isExpired     = quotaExpires ? new Date(quotaExpires) < new Date() : false;
          const usagePercent  = productLimit > 0 ? Math.min(100, Math.round((extras.productCount / productLimit) * 100)) : 0;

          const isSpecialQuotaExpired = shop.special_quota_expires_at ? new Date(shop.special_quota_expires_at) < new Date() : false;
          const hasActiveSpecialQuota = Boolean(shop.has_special_quota && (!shop.special_quota_expires_at || !isSpecialQuotaExpired));
          const hasActiveNormalQuota = Boolean(productLimit > 0 && !isExpired);

          return (
            <div key={shop.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <img src={shop.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=random`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0">
                    <button type="button" onClick={() => onSelectShop?.(shop.id)} className="text-left">
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors truncate max-w-[160px]">{shop.name}</h3>
                    </button>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User size={11} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{shop.profiles?.full_name || t('admin_system')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => onSelectShop?.(shop.id)} className="p-2 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="View details">
                    <ExternalLink size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-500/20">{t('admin_active')}</span>
                {hasActiveSpecialQuota ? (
                  <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 text-[9px] font-black uppercase tracking-widest border border-violet-500/20">Special Quota</span>
                ) : hasActiveNormalQuota ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Normal Quota</span>
                ) : null}
                {salesPct > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 text-[9px] font-black uppercase tracking-widest border border-primary-500/20">{salesPct}% Bonus</span>
                )}
                {isExpired && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">Quota Expired</span>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3 text-center">
                  <div className="flex justify-center mb-1"><Package size={13} className="text-slate-400" /></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{extras.productCount}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">Products</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3 text-center">
                  <div className="flex justify-center mb-1"><BarChart2 size={13} className="text-slate-400" /></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{productLimit > 0 ? `${extras.productCount}/${productLimit}` : '—'}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">Quota</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-3 text-center">
                  <div className="flex justify-center mb-1"><Star size={13} className="text-amber-500" /></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{shop.rating || '5.0'}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">Rating</p>
                </div>
              </div>

              {/* Quota Usage Bar */}
              {productLimit > 0 && (
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    <span>Slot Usage</span>
                    <span>{usagePercent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{new Date(shop.created_at).toLocaleDateString()}</span>
                </div>
                {quotaExpires && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className={isExpired ? 'text-rose-400' : 'text-slate-400'} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${ isExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                      {isExpired ? 'Expired' : `Exp. ${new Date(quotaExpires).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredShops.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
