import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrderSummaryProps {
  total: number;
  itemCount: number;
  onCheckout: () => void;
  disabled: boolean;
}

export const OrderSummary = ({ total, itemCount, onCheckout, disabled }: OrderSummaryProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl lg:sticky lg:top-24 space-y-6 text-left">
      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">{t('order_summary')}</h2>
      
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-slate-500 font-medium">{t('subtotal')} ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-bold text-slate-900 dark:text-white">${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-slate-500 font-medium">{t('shipping_fee')}</span>
          <span className="text-green-500 font-black uppercase text-xs tracking-widest">Calculated at checkout</span>
        </div>
      </div>

      <div className="flex justify-between items-end pt-2">
        <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{t('total_amount')}</span>
        <p className="text-2xl sm:text-4xl font-black text-primary-500">${total.toLocaleString()}</p>
      </div>

      <button 
        onClick={onCheckout}
        disabled={disabled}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
          disabled 
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
            : 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95'
        }`}
      >
        {t('checkout')} <ArrowRight size={20} />
      </button>

      <div className="flex items-center gap-2 justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <ShoppingBag size={14} /> Secure checkout processed by SnapBuy
      </div>
    </div>
  );
};
