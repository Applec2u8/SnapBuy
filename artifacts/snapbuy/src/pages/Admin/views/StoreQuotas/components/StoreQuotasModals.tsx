import React from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
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
  autoImportCount: number;
  setAutoImportCount: (val: number) => void;
  creating: boolean;
}

export const GenerateCodeModal: React.FC<GenerateCodeModalProps> = ({
  isOpen, onClose, handleCreate, limit, setLimit, durationDays, setDurationDays,
  codeCategLimit, setCodeCategLimit, totalCategories, salesPercentage, setSalesPercentage,
  autoImportCount, setAutoImportCount, creating
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Generate Quota Code</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Product Limit</label>
              <input
                type="number" min="1" required value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
              />
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
                <span className="text-[10px] font-bold text-slate-400">Max available: <span className="text-primary-500">{totalCategories}</span></span>
              </div>
              <input
                type="number" min="0" max={totalCategories} value={codeCategLimit}
                onChange={(e) => setCodeCategLimit(Math.min(parseInt(e.target.value) || 0, totalCategories))}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1.5">Number of categories this shop can unlock (0 = none, max {totalCategories}).</p>
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
            <div className="rounded-2xl border-2 border-dashed border-primary-200 dark:border-primary-500/30 bg-primary-50/50 dark:bg-primary-500/5 p-4">
              <label className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>⚡</span> Auto-Import Products (optional)
              </label>
              <input
                type="number" min="0" max={limit} value={autoImportCount}
                onChange={(e) => setAutoImportCount(Math.min(limit, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-500/30 focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {autoImportCount > 0
                  ? `After redeeming, vendor will be prompted to select categories — then ${autoImportCount} products will auto-generate across their selections.`
                  : 'Set to 0 to disable. When > 0, vendor must select categories after redeeming and products will auto-generate.'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
