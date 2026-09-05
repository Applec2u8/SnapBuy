import React from 'react';
import { Plus, Sparkles, Clock, Edit2, ToggleLeft, ToggleRight, XCircle } from 'lucide-react';
import type { QuotaPackage } from '../types';

interface PackagesTabProps {
  packages: QuotaPackage[];
  packagesLoading: boolean;
  openAddPkg: () => void;
  openEditPkg: (pkg: QuotaPackage) => void;
  handleTogglePkg: (pkg: QuotaPackage) => void;
  setConfirm: (val: any) => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  packages,
  packagesLoading,
  openAddPkg,
  openEditPkg,
  handleTogglePkg,
  setConfirm,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Configure the packages available to store owners when they want to buy quota.</p>
        <button
          onClick={openAddPkg}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={16} /> New Package
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                {['Order', 'Name', 'Slots', 'Categories', 'Duration', 'Price', 'Badge', 'Status', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {packagesLoading ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500 animate-pulse">Loading...</td></tr>
              ) : packages.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">No packages yet. Create one!</td></tr>
              ) : packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 text-xs font-bold text-slate-500">{pkg.sort_order}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                        <Sparkles size={13} className="text-amber-500" />
                      </div>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-slate-900 dark:text-white">{pkg.product_limit.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 ml-1">slots</span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-slate-900 dark:text-white">{pkg.category_limit}</span>
                    <span className="text-xs text-slate-500 ml-1">cats</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      <Clock size={12} />
                      {pkg.duration_days ? `${pkg.duration_days}d` : '∞ Lifetime'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-slate-900 dark:text-white">${pkg.price.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    {pkg.badge ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase">
                        {pkg.badge}
                      </span>
                    ) : <span className="text-slate-400 text-xs italic">None</span>}
                  </td>
                  <td className="p-4">
                    {pkg.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase">Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase">Inactive</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditPkg(pkg)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border border-blue-200 dark:border-blue-500/30"
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => handleTogglePkg(pkg)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border whitespace-nowrap ${
                          pkg.is_active
                            ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                            : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 border-green-200 dark:border-green-500/30'
                        }`}
                      >
                        {pkg.is_active ? <><ToggleLeft size={11} /> Deactivate</> : <><ToggleRight size={11} /> Activate</>}
                      </button>
                      <button
                        onClick={() => setConfirm({
                          open: true, type: 'delete_package', targetId: pkg.id,
                          title: 'Delete Package',
                          message: `Are you sure you want to delete the package "${pkg.name}"? This action cannot be undone.`,
                          confirmLabel: 'Delete'
                        })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-red-200 dark:border-red-500/30 whitespace-nowrap"
                      >
                        <XCircle size={11} /> Delete
                      </button>
                    </div>
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
