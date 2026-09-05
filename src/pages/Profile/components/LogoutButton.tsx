import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onLogout}
      className="w-full py-4 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-red-500 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2 shadow-sm"
    >
      <LogOut size={18} /> {t('logout')}
    </button>
  );
};
