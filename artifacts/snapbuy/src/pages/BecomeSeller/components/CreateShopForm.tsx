import { Store, Loader2, ArrowRight, Ticket, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreateShopFormProps {
  loading: boolean;
  shopName: string;
  setShopName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  handleCreateShop: (e: React.FormEvent) => void;
  shopsCount: number;
  quotaCode: string;
  setQuotaCode: (code: string) => void;
}

export const CreateShopForm = ({
  loading,
  shopName,
  setShopName,
  description,
  setDescription,
  handleCreateShop,
  shopsCount,
  quotaCode,
  setQuotaCode
}: CreateShopFormProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full"></div>
      <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
        <Store className="text-primary-500" /> {t('shop_details', 'Shop Details')}
      </h2>
      
      <form onSubmit={handleCreateShop} className="space-y-8 text-left">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 focus:border-primary-500 transition-all outline-none font-bold text-sm"
            placeholder="e.g. Awesome Tech Store"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 focus:border-primary-500 transition-all outline-none min-h-[120px] font-medium text-sm"
            placeholder="Tell customers about your shop..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <Ticket size={11} />
            Free Quota Code
            <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
          </label>
          <div className="relative">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={quotaCode}
              onChange={(e) => setQuotaCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 focus:border-primary-500 transition-all outline-none font-bold text-sm uppercase tracking-widest"
              placeholder="Q-XXXX-XXXX"
              maxLength={12}
            />
          </div>
          <div className="flex items-start gap-1.5 px-1 pt-1">
            <Info size={11} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              If you have a quota code, enter it here to activate product listing immediately. You can also redeem it later in Shop Settings.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white py-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              {shopsCount > 0 ? 'Create Another Shop' : 'Create My Shop'} <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
