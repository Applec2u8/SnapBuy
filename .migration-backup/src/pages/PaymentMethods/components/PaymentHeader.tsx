import { useTranslation } from 'react-i18next';

export const PaymentHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-end mb-8 sm:mb-12 text-left">
      <div>
        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight">{t('payment_methods')}</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage how you pay for your orders</p>
      </div>
    </div>
  );
};
