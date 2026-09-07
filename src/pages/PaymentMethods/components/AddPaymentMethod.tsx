import { Plus } from 'lucide-react';

interface AddPaymentMethodProps {
  onClick: () => void;
}

export const AddPaymentMethod = ({ onClick }: AddPaymentMethodProps) => {
  return (
    <div onClick={onClick} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all hover:border-primary-500/30 min-h-[200px]">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-primary-500 transition-all">
         <Plus size={24} />
      </div>
      <div>
         <h4 className="font-bold text-slate-400 group-hover:text-primary-500 transition-colors">Add Credit/Debit Card</h4>
         <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Add new card</p>
      </div>
    </div>
  );
};
