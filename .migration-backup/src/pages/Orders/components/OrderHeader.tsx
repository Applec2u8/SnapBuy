import { useTranslation } from 'react-i18next';

interface OrderHeaderProps {
  count: number;
}

export const OrderHeader = ({ count }: OrderHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-end text-left">
      <div>
        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight">{t('my_purchase')}</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Track and manage your orders</p>
      </div>
      <div className="bg-primary-500/10 text-primary-500 px-3 py-1 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest">
         Total {count}
      </div>
    </div>
  );
};
