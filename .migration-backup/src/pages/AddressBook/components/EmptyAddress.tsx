import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyAddressProps {
  onAdd: () => void;
}

export const EmptyAddress = ({ onAdd }: EmptyAddressProps) => {
  const { t } = useTranslation();
  return (
    <div className="col-span-full py-12 sm:py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800">
       <MapPin className="mx-auto text-slate-300 mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12" />
       <p className="text-slate-500 font-bold text-sm sm:text-base">{t('no_orders')}</p>
       <button onClick={onAdd} className="mt-3 sm:mt-4 text-primary-500 font-black uppercase text-[10px] sm:text-xs tracking-widest hover:underline">{t('add_product')}</button>
    </div>
  );
};
