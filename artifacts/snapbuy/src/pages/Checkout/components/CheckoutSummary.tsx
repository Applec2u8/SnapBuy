import { Loader2, ShieldCheck, Tag, Truck, Receipt, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CheckoutSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  processing: boolean;
  onPlaceOrder: () => void;
  disabled: boolean;
  itemCount?: number;
  printReceipt: boolean;
  setPrintReceipt: (v: boolean) => void;
  shippingDays?: number;
}

export const CheckoutSummary = ({
  subtotal,
  shippingFee,
  total,
  processing,
  onPlaceOrder,
  disabled,
  itemCount = 0,
  printReceipt,
  setPrintReceipt,
  shippingDays = 3,
}: CheckoutSummaryProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl lg:sticky lg:top-24 overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Receipt size={18} className="text-primary-500" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {t('order_summary')}
            </h2>
            {itemCount > 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex flex-col items-center justify-center">
            <Truck size={14} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Standard Delivery
            </p>
            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
              {t('will_arrive_in')} {shippingDays} {t('days')}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="px-6 py-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Tag size={14} />
            <span className="font-medium">{t('subtotal')}</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            ${subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={14} />
            <span className="font-medium">{t('shipping_fee')}</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            ${shippingFee.toLocaleString()}
          </span>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

        {/* Total */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              {t('total_amount')}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">VAT Included</p>
          </div>
          <div className="text-right">
            <p className="text-3xl sm:text-4xl font-black text-primary-500 leading-none">
              ${total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 space-y-4">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${printReceipt ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
            {printReceipt && <Check size={14} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
            Print Receipt / ออกใบเสร็จ
          </span>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={printReceipt} 
            onChange={(e) => setPrintReceipt(e.target.checked)} 
          />
        </label>

        <button
          disabled={disabled}
          onClick={onPlaceOrder}
          className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
        >
          {processing
            ? <><Loader2 className="animate-spin" size={18} /> Processing...</>
            : <><ShieldCheck size={18} /> {t('place_order')}</>
          }
        </button>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <ShieldCheck size={12} className="text-green-500" />
          100% Safe &amp; Secure Payment
        </div>

        {/* Accepted payments label */}
        <div className="flex items-center gap-2 justify-center opacity-40 pt-1">
          {['VISA', 'MC', 'COD'].map(label => (
            <span key={label} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
