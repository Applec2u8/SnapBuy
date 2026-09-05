import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertTriangle, Sparkles, Store } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import type { QuotaPackage, ShopQuotaInfo } from '../types';

// ─── Confirm Modal ──────────────────────────────────────────────────────────
export const ConfirmModal = ({
  open, title, message, confirmLabel = 'Confirm', danger = true,
  onConfirm, onClose, loading
}: {
  open: boolean; title: string; message: string;
  confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onClose: () => void; loading?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-xl ${danger ? 'bg-red-100 dark:bg-red-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
            <AlertTriangle size={18} className={danger ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white">{title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-colors disabled:opacity-50 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Generate Code Modal ────────────────────────────────────────────────────
interface GenerateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreate: (e: React.FormEvent) => void;
  limit: number;
  setLimit: (val: number) => void;
  durationDays: number | '';
  setDurationDays: (val: number | '') => void;
  codeCategLimit: number;
  setCodeCategLimit: (val: number) => void;
  totalCategories: number;
  salesPercentage: number;
  setSalesPercentage: (val: number) => void;
  isSpecialQuota: boolean;
  setIsSpecialQuota: (val: boolean) => void;
  creating: boolean;
}

export const GenerateCodeModal: React.FC<GenerateCodeModalProps> = ({
  isOpen, onClose, handleCreate, limit, setLimit, durationDays, setDurationDays,
  codeCategLimit, setCodeCategLimit, totalCategories, salesPercentage, setSalesPercentage,
  isSpecialQuota, setIsSpecialQuota, creating
}) => {
  const [maxProductLimit, setMaxProductLimit] = useState(50);
  const [loadingProductMax, setLoadingProductMax] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoadingProductMax(true);
      try {
        const { data } = await supabase
          .from('api_keys')
          .select('rate_limit')
          .eq('provider', 'unsplash')
          .eq('is_active', true);
        if (cancelled) return;
        const total = (data || []).reduce((acc, k) => acc + (k.rate_limit || 50), 0);
        setMaxProductLimit(Math.max(1, total));
      } catch {
        if (!cancelled) setMaxProductLimit(50);
      } finally {
        if (!cancelled) setLoadingProductMax(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-4 max-h-[min(calc(100vh-2rem),720px)] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Generate Quota Code</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Limit</label>
                <span className="text-[10px] font-bold text-slate-400">
                  Max: <span className="text-primary-500">{loadingProductMax ? '…' : maxProductLimit.toLocaleString()}</span>
                  <span className="text-slate-400 font-normal ml-1">(Unsplash API)</span>
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number" min="1" max={maxProductLimit} required value={limit}
                  onChange={(e) => setLimit(Math.min(maxProductLimit, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
                />
                <button
                  type="button"
                  disabled={loadingProductMax || maxProductLimit < 1}
                  onClick={() => setLimit(maxProductLimit)}
                  className="flex-shrink-0 px-4 py-3 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Total products the shop can list after redeeming.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors appearance-none"
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days (3 Months)</option>
                <option value={180}>180 Days (6 Months)</option>
                <option value={365}>365 Days (1 Year)</option>
                <option value="">Lifetime (No expiration)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Limit</label>
                <span className="text-[10px] font-bold text-slate-400">Max: <span className="text-primary-500">{totalCategories}</span></span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number" min="0" max={totalCategories} value={codeCategLimit}
                  onChange={(e) => setCodeCategLimit(Math.min(parseInt(e.target.value) || 0, totalCategories))}
                  className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
                />
                <button
                  type="button"
                  disabled={totalCategories < 1}
                  onClick={() => setCodeCategLimit(totalCategories)}
                  className="flex-shrink-0 px-4 py-3 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Categories this shop can unlock (0 = none, max {totalCategories}).</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sales Bonus Percentage (%)</label>
              <input
                type="number" min="0" max="100" required value={salesPercentage}
                onChange={(e) => setSalesPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1.5">Extra revenue percentage added to vendor sales (e.g., 15% bonus payout).</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-3 space-y-2.5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Quota Type</label>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Limits above set the cap — vendor imports &amp; unlocks manually in their dashboard.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSpecialQuota(false)}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                    !isSpecialQuota
                      ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-slate-300/60 dark:ring-slate-600/60'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {!isSpecialQuota && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_0_3px_rgba(100,116,139,0.25)]" />
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    !isSpecialQuota ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Store size={16} />
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Normal</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">Manual only — no Import tool.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSpecialQuota(true)}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all ${
                    isSpecialQuota
                      ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-500/10 shadow-md ring-2 ring-primary-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 hover:border-primary-200 dark:hover:border-primary-500/40'
                  }`}
                >
                  {isSpecialQuota && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25)]" />
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    isSpecialQuota ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Sparkles size={16} />
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Special</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">Unlocks Import Products tool.</p>
                </button>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {creating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : 'Generate Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Set Limit Modal ────────────────────────────────────────────────────────
interface SetLimitModalProps {
  open: boolean;
  shop: ShopQuotaInfo | null;
  onClose: () => void;
  handleSetLimit: (e: React.FormEvent) => void;
  newLimit: number;
  setNewLimit: (val: number) => void;
  settingLimit: boolean;
}

export const SetLimitModal: React.FC<SetLimitModalProps> = ({
  open, shop, onClose, handleSetLimit, newLimit, setNewLimit, settingLimit
}) => {
  if (!open || !shop) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Set Product Limit</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-5">Manually set product limit for <span className="font-bold text-slate-700 dark:text-slate-300">{shop.name}</span>. Current: <span className="font-bold">{shop.product_limit}</span></p>
        <form onSubmit={handleSetLimit} className="space-y-4">
          <input
            type="number" min="0" required value={newLimit}
            onChange={(e) => setNewLimit(parseInt(e.target.value))}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
          />
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={settingLimit}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {settingLimit ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Package Modal ──────────────────────────────────────────────────────────
interface PackageModalProps {
  open: boolean;
  pkg: QuotaPackage | null;
  onClose: () => void;
  handleSavePkg: (e: React.FormEvent) => void;
  pkgForm: any;
  setPkgForm: (val: any) => void;
  totalCategories: number;
  savingPkg: boolean;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  open, pkg, onClose, handleSavePkg, pkgForm, setPkgForm, totalCategories, savingPkg
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {pkg ? 'Edit Package' : 'New Package'}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSavePkg} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Package Name</label>
                <input required value={pkgForm.name} onChange={e => setPkgForm((f: any) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Product Slots</label>
                <input type="number" min="1" required value={pkgForm.product_limit} onChange={e => setPkgForm((f: any) => ({ ...f, product_limit: parseInt(e.target.value) }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Limit</label>
                  <span className="text-[10px] font-bold text-slate-400">Total: {totalCategories}</span>
                </div>
                <input type="number" min="0" max={totalCategories} required value={pkgForm.category_limit} onChange={e => setPkgForm((f: any) => ({ ...f, category_limit: parseInt(e.target.value) }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                <input type="number" min="0" step="0.01" required value={pkgForm.price} onChange={e => setPkgForm((f: any) => ({ ...f, price: parseFloat(e.target.value) }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Duration</label>
                <select value={pkgForm.duration_days} onChange={e => setPkgForm((f: any) => ({ ...f, duration_days: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors appearance-none">
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days</option>
                  <option value={365}>365 Days</option>
                  <option value="">Lifetime</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Sort Order</label>
                <input type="number" min="0" value={pkgForm.sort_order} onChange={e => setPkgForm((f: any) => ({ ...f, sort_order: parseInt(e.target.value) }))}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Badge Label <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                <input value={pkgForm.badge} onChange={e => setPkgForm((f: any) => ({ ...f, badge: e.target.value }))}
                  placeholder="e.g. Most Popular"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400 transition-colors" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={savingPkg}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {savingPkg ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
