import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddressCardProps {
  address: any;
  onEdit: (address: any) => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AddressCard = ({
  address,
  onEdit,
  onSetDefault,
  onDelete
}: AddressCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group text-left">
      {address.is_default && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
          Default
        </div>
      )}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-500 flex-shrink-0">
          <Home size={18} className="sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{address.full_name}</h3>
          <p className="text-[10px] sm:text-xs font-medium text-primary-500 mt-0.5 sm:mt-1">{address.phone}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-2 sm:mt-3 leading-relaxed line-clamp-2">
            {address.address_line}, {address.district}, {address.city}, {address.province} {address.postal_code}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
         <button 
           onClick={() => onEdit(address)}
           className="flex-1 text-[10px] sm:text-xs font-bold py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
         >
           {t('edit')}
         </button>
         {!address.is_default && (
           <button 
            onClick={() => onSetDefault(address.id)}
            className="flex-1 text-[10px] sm:text-xs font-bold py-2 text-primary-500 hover:bg-primary-500/5 rounded-xl transition-colors border border-primary-500/10"
           >
             Default
           </button>
         )}
         <button 
          onClick={() => onDelete(address.id)}
          className="flex-1 text-[10px] sm:text-xs font-bold py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
         >
           {t('delete')}
         </button>
      </div>
    </div>
  );
};
