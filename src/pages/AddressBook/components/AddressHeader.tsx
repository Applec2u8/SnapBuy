import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddressHeaderProps {
  onAdd: () => void;
}

export const AddressHeader = ({ onAdd }: AddressHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-end mb-6 sm:mb-8 text-left">
      <div>
        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight">{t('address_book')}</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage your shipping destinations</p>
      </div>
      <button 
        onClick={onAdd}
        className="bg-primary-500 text-white p-2.5 sm:p-3 rounded-2xl shadow-lg shadow-primary-500/20 hover:scale-110 transition-transform active:scale-95"
      >
        <Plus size={20} className="sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};
