import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const EmptyOrders = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
        <ShoppingBag size={40} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold">{t('no_orders')}</h3>
        <p className="text-sm text-slate-500">When you buy items, they will appear here.</p>
      </div>
      <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold hover:scale-105 transition-transform">
        {t('start_shopping')}
      </button>
    </div>
  );
};
