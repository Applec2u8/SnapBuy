import { Store, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/useAuthStore';

export const SellerCenterLink = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { shop } = useAuthStore();
  
  return (
    <div className="px-4 -mt-6 relative z-20 space-y-3">
      <button
        onClick={() => navigate('/vendor/dashboard')}
        className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-xl border border-slate-200 dark:border-slate-800 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 shadow-sm overflow-hidden">
            {shop?.logo_url ? (
              <img src={shop.logo_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <Store size={24} className="text-primary-500" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {shop?.name || t('seller_center')}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {shop ? 'Manage your storefront' : 'Start earning today'}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
      </button>

      {shop && (
        <Link
          to={`/shop/${shop.id}`}
          target="_blank"
          className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-500 transition-all group"
        >
          <ExternalLink size={14} className="text-primary-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">{t('vendor_view_shop')}</span>
        </Link>
      )}
    </div>
  );
};
