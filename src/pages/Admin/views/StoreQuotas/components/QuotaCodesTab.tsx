import React, { useState } from 'react';
import { Search, Copy, Clock, CheckCircle, Store, Calendar, XCircle, Sparkles, Package } from 'lucide-react';
import type { Quota } from '../types';

interface QuotaCodesTabProps {
  quotas: Quota[];
  quotasLoading: boolean;
  copyToClipboard: (text: string) => void;
  setConfirm: (val: any) => void;
}

export const QuotaCodesTab: React.FC<QuotaCodesTabProps> = ({
  quotas,
  quotasLoading,
  copyToClipboard,
  setConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotas = quotas.filter(q =>
    q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.shops?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRevoke = (quota: Quota) =>
    setConfirm({
      open: true, type: 'revoke_code', targetId: quota.id,
      title: 'Revoke Quota Code',
      message: `This will revoke code "${quota.code}" and reset "${quota.shops?.name}"'s product limit to 0. The code will become available again.`,
      confirmLabel: 'Revoke'
    });

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by code or shop name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 pl-11 text-sm outline-none focus:border-primary-500 transition-colors"
        />
        <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
      </div>

      {/* ── Desktop table ─────────────────────────────────── */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                {['Code', 'Type', 'Limit', 'Categories', 'Sales %', 'Duration', 'Status', 'Used By / Date', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {quotasLoading ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500 animate-pulse">Loading...</td></tr>
              ) : filteredQuotas.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">No quota codes found.</td></tr>
              ) : filteredQuotas.map(quota => (
                <tr key={quota.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{quota.code}</span>
                      <button onClick={() => copyToClipboard(quota.code)} className="text-slate-400 hover:text-primary-500 transition-colors">
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {quota.is_special_quota ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-[9px] font-black uppercase tracking-widest">
                        <Sparkles size={10} /> Special
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                        <Package size={10} /> Normal
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-black text-slate-900 dark:text-white">{quota.product_limit}</span>
                    <span className="text-xs text-slate-500 ml-1">items</span>
                  </td>
                  <td className="p-4">
                    {(quota as any).category_limit > 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-black text-blue-600 dark:text-blue-400">
                        {(quota as any).category_limit}
                        <span className="text-xs text-slate-500 font-normal">cats</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-black text-slate-900 dark:text-white">{(quota as any).sales_percentage || 0}%</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      <Clock size={12} />
                      {quota.duration_days ? `${quota.duration_days}d` : '∞ Lifetime'}
                    </div>
                  </td>
                  <td className="p-4">
                    {quota.is_used ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase">
                        <CheckCircle size={10} /> Used
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase">
                        Available
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {quota.is_used && quota.shops ? (
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Store size={12} className="text-slate-400" /> {quota.shops.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} /> {new Date(quota.used_at!).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Not used yet</span>
                    )}
                  </td>
                  <td className="p-4">
                    {quota.is_used && (
                      <button
                        onClick={() => handleRevoke(quota)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-red-200 dark:border-red-500/30"
                      >
                        <XCircle size={12} /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards ──────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {quotasLoading ? (
          <div className="py-8 text-center text-slate-500 text-sm animate-pulse">Loading...</div>
        ) : filteredQuotas.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">No quota codes found.</div>
        ) : filteredQuotas.map(quota => (
          <div
            key={quota.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 space-y-2"
          >
            {/* Row 1: code + status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg truncate">
                  {quota.code}
                </span>
                <button onClick={() => copyToClipboard(quota.code)} className="text-slate-400 hover:text-primary-500 transition-colors shrink-0">
                  <Copy size={13} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {quota.is_special_quota ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-[9px] font-black uppercase">
                    <Sparkles size={9} /> Special
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase">
                    <Package size={9} /> Normal
                  </span>
                )}
                {quota.is_used ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase">
                    <CheckCircle size={9} /> Used
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase">
                    Available
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: stats inline */}
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {quota.product_limit} <span className="font-normal text-slate-400">items</span>
              </span>
              {(quota as any).category_limit > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {(quota as any).category_limit} <span className="font-normal text-slate-400">cats</span>
                  </span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{(quota as any).sales_percentage || 0}%</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400">
                <Clock size={10} />
                {quota.duration_days ? `${quota.duration_days}d` : '∞ Lifetime'}
              </span>
            </div>

            {/* Row 3: shop + date + revoke (only if used) */}
            {quota.is_used && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-500 min-w-0">
                  {quota.shops && (
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 truncate">
                      <Store size={11} className="text-slate-400 shrink-0" /> {quota.shops.name}
                    </span>
                  )}
                  {quota.used_at && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar size={10} /> {new Date(quota.used_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRevoke(quota)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-red-200 dark:border-red-500/30 shrink-0"
                >
                  <XCircle size={10} /> Revoke
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
