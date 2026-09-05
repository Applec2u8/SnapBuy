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
}

export const ShopManagement: React.FC<ShopManagementProps> = ({ shops, loading, onSelectShop }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // Map: shopId -> { productCount, quota }
  const [shopExtras, setShopExtras] = useState<Record<string, { productCount: number }>>({});

  useEffect(() => {
    if (!shops || shops.length === 0) return;
    const fetchExtras = async () => {
      const shopIds = shops.map((s: any) => s.id);
      // Only need product counts; quota info is stored on the shops row itself
      const productsRes = await supabase.from('products').select('id, shop_id').in('shop_id', shopIds);
      const extras: Record<string, { productCount: number }> = {};
      shopIds.forEach((id: string) => { extras[id] = { productCount: 0 }; });
      (productsRes.data || []).forEach((p: any) => {
        if (extras[p.shop_id]) extras[p.shop_id].productCount++;
      });
      setShopExtras(extras);
    };
    fetchExtras();
  }, [shops]);

  const filteredShops = shops.filter(shop =>
    shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  if (loading) {
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
