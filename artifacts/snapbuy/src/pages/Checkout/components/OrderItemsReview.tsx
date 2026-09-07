import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrderItemsReviewProps {
  items: any[];
}

export const OrderItemsReview = ({ items }: OrderItemsReviewProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <ClipboardList size={16} className="text-primary-500" />
        </div>
        <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white">
          {t('review_items')}
          <span className="ml-2 text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full font-black">{items.length}</span>
        </h2>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {items.map((item) => (
          <div key={`${item.id}-${item.variant?.id}`} className="px-5 sm:px-6 py-4 flex gap-4">
            {/* Image */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
              <img src={item.image} className="w-full h-full object-cover" alt="" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight leading-snug line-clamp-2">
                  {item.name}
                </h3>
                {item.variant && (
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                    Variant: {item.variant.name}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                    Qty: {item.quantity}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-black text-primary-500">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
