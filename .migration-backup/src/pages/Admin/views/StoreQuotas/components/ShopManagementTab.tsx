import React, { useState } from 'react';
import { Search, Store, Package, XCircle, AlertTriangle, Calendar, ChevronDown, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ShopQuotaInfo } from '../types';

interface ShopManagementTabProps {
  shops: ShopQuotaInfo[];
  shopsLoading: boolean;
  setSetLimitModal: (val: any) => void;
  setNewLimit: (val: number) => void;
  setConfirm: (val: any) => void;
}

export const ShopManagementTab: React.FC<ShopManagementTabProps> = ({
  shops,
  shopsLoading,
  setSetLimitModal,
  setNewLimit,
  setConfirm,
}) => {
  const [shopSearch, setShopSearch] = useState('');

  const filteredShops = shops.filter(s =>
    (s.name || '').toLowerCase().includes(shopSearch.toLowerCase()) ||
    (s.profiles?.email || '').toLowerCase().includes(shopSearch.toLowerCase()) ||
    (s.profiles?.full_name || '').toLowerCase().includes(shopSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search shops by name or owner email..."
          value={shopSearch}
          onChange={(e) => setShopSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 pl-11 text-sm outline-none focus:border-primary-500 transition-colors"
        />
        <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                {['Shop', 'Products Used', 'Quota Limit', 'Sales %', 'Expires On', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {shopsLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 animate-pulse">Loading shops...</td></tr>
              ) : filteredShops.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No shops found.</td></tr>
              ) : filteredShops.map(shop => {
                const isExpired = shop.quota_expires_at && new Date(shop.quota_expires_at) < new Date();
                const usagePercent = shop.product_limit > 0
                  ? Math.min(100, Math.round((shop.product_count / shop.product_limit) * 100))
                  : 0;
                const isAtLimit = shop.product_limit > 0 && shop.product_count >= shop.product_limit;

                return (
                  <tr key={shop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <Link to={`/shop/${shop.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                          <Store size={15} className="text-primary-500" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{shop.name}</div>
                          <div className="text-xs text-slate-500">{shop.profiles?.full_name || shop.profiles?.email || '—'}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Package size={13} className={isAtLimit ? 'text-red-500' : 'text-slate-400'} />
                          <span className={`font-black text-sm ${isAtLimit ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{shop.product_count}</span>
                        </div>
                      </div>
                      {shop.product_limit > 0 && (
                        <div className="mt-1.5 w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                              className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {shop.product_limit === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px] font-black uppercase">
                          <XCircle size={10} /> No Quota
                        </span>
                      ) : (
                        <span className="font-black text-slate-900 dark:text-white">
                          {shop.product_limit} <span className="text-xs font-medium text-slate-500">items</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-black text-slate-900 dark:text-white">{shop.sales_percentage || 0}%</span>
                    </td>
                    <td className="p-4">
                      {!shop.quota_expires_at ? (
                        <span className="text-xs text-slate-400 italic">Lifetime</span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px] font-black uppercase">
                          <AlertTriangle size={10} /> Expired
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-bold">
                          <Calendar size={12} />
                          {new Date(shop.quota_expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSetLimitModal({ open: true, shop }); setNewLimit(shop.product_limit); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border border-blue-200 dark:border-blue-500/30 whitespace-nowrap"
                        >
                          <ChevronDown size={11} /> Set Limit
                        </button>
                        <button
                          onClick={() => setConfirm({
                            open: true, type: 'reset_shop', targetId: shop.id,
                            title: 'Reset Shop Quota',
                            message: `Reset "${shop.name}"'s quota to 0? This will block them from adding new products. Their linked quota code will also become available again.`,
                            confirmLabel: 'Reset'
                          })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-red-200 dark:border-red-500/30 whitespace-nowrap"
                        >
                          <RotateCcw size={11} /> Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
