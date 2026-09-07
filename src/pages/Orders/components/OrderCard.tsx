import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrderCardProps {
  order: any;
  getStatusColor: (status: string) => string;
  onPrintReceipt: (order: any) => void;
}

export const OrderCard = ({ order, getStatusColor, onPrintReceipt }: OrderCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t('order_id')}: #{order.id.slice(0, 8)}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {order.order_items.map((item: any) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
              <img src={item.products?.images?.[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{item.products?.name}</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Quantity: x{item.quantity}</p>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">${item.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-6 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">{t('total_amount')}:</span>
          <span className="text-xl font-black text-primary-500">${order.total_amount.toLocaleString()}</span>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
          <button 
            onClick={() => onPrintReceipt(order)}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 text-slate-900 dark:text-white"
          >
            <ExternalLink size={14} /> Print Receipt
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2 text-slate-900 dark:text-white">
            <ExternalLink size={14} /> {t('details')}
          </button>
          {order.status === 'delivered' && (
            <button className="w-full sm:w-auto flex-1 sm:flex-none px-6 py-2.5 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
              {t('buy_again')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
