import { ArrowLeft, Loader2, Save, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProfileEditHeaderProps {
  loading: boolean;
  uploading: boolean;
  handleSubmit: () => void;
  shop?: any;
}

export const ProfileEditHeader = ({
  loading,
  uploading,
  handleSubmit,
  shop
}: ProfileEditHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between text-left">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex md:hidden p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-500 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('profile_edit_title')}</h1>
        {shop && (
          <Link
            to={`/shop/${shop.id}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all group"
          >
            <ExternalLink size={12} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t('vendor_view_shop')}</span>
          </Link>
        )}
      </div>
      <div className="hidden lg:block">
        <button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          {t('profile_quick_save')}
        </button>
      </div>
      <div className="lg:hidden w-10" />
    </div>
  );
};
