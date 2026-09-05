import React, { useState } from 'react';
import { Search, Copy, Clock, CheckCircle, Store, Calendar, XCircle } from 'lucide-react';
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

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                {['Code', 'Limit', 'Categories', 'Sales %', 'Duration', 'Status', 'Used By / Date', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {quotasLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500 animate-pulse">Loading...</td></tr>
              ) : filteredQuotas.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500">No quota codes found.</td></tr>
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
                        onClick={() => setConfirm({
                          open: true, type: 'revoke_code', targetId: quota.id,
                          title: 'Revoke Quota Code',
                          message: `This will revoke code "${quota.code}" and reset "${quota.shops?.name}"'s product limit to 0. The code will become available again.`,
                          confirmLabel: 'Revoke'
                        })}
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
    </div>
  );
};
