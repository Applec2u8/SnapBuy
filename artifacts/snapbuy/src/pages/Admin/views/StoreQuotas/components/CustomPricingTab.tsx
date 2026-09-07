import React from 'react';
import { Loader2 } from 'lucide-react';

interface CustomPricingTabProps {
  quotaSettings: any;
  setQuotaSettings: (val: any) => void;
  savingSettings: boolean;
  loadingSettings: boolean;
  handleSaveSettings: (e: React.FormEvent) => void;
}

export const CustomPricingTab: React.FC<CustomPricingTabProps> = ({
  quotaSettings,
  setQuotaSettings,
  savingSettings,
  loadingSettings,
  handleSaveSettings,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8">
        <div className="max-w-2xl">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Pricing Rules</h3>
          <p className="text-xs text-slate-500 mb-6">Configure the base costs that power the dynamic package generation and custom renewals.</p>

          {loadingSettings ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="animate-spin" size={16} /> Loading settings...
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Price per Product Slot ($)</label>
                  <input type="number" min="0" step="0.01" required value={quotaSettings.price_per_slot} onChange={e => setQuotaSettings((s: any) => ({ ...s, price_per_slot: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
                  <p className="text-[10px] text-slate-400 mt-1.5">Cost for adding 1 extra product slot.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Price per Day ($)</label>
                  <input type="number" min="0" step="0.01" required value={quotaSettings.price_per_day} onChange={e => setQuotaSettings((s: any) => ({ ...s, price_per_day: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
                  <p className="text-[10px] text-slate-400 mt-1.5">Cost per day to extend quota validity.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Base Category Price ($)</label>
                  <input type="number" min="0" step="0.01" required value={quotaSettings.base_category_price} onChange={e => setQuotaSettings((s: any) => ({ ...s, base_category_price: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
                  <p className="text-[10px] text-slate-400 mt-1.5">Cost to unlock 1 additional product category.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Global Order Logistics</h3>
                <p className="text-xs text-slate-500 mb-5">Configure system-wide settings for order processing and vendor payouts.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Shipping Delivery Days</label>
                    <input type="number" min="0" step="1" required value={quotaSettings.shipping_days === undefined ? '' : quotaSettings.shipping_days} onChange={e => setQuotaSettings((s: any) => ({ ...s, shipping_days: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white transition-colors" />
                    <p className="text-[10px] text-slate-400 mt-1.5">Expected number of days for product delivery (used for payout cooldown).</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button type="submit" disabled={savingSettings}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
                >
                  {savingSettings ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
