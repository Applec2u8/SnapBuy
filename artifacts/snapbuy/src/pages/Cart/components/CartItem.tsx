import { Trash2, Minus, Plus } from 'lucide-react';
import { Checkbox } from '../../../components/ui/Checkbox';

interface CartItemProps {
  item: any;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  removeItem: (id: string, variantId?: string) => void;
  selected?: boolean;
  onSelect?: () => void;
}

export const CartItem = ({ item, updateQuantity, removeItem, selected, onSelect }: CartItemProps) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border transition-all duration-300 flex gap-4 sm:gap-6 text-left cursor-pointer ${selected
        ? 'border-primary-500 shadow-xl shadow-primary-500/10 bg-primary-500/[0.02]'
        : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
        }`}>
      {/* Checkbox Overlay */}
      <div className="absolute top-4 left-4 z-20">
        <Checkbox checked={!!selected} onChange={() => onSelect?.()} />
      </div>

      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 flex-shrink-0 relative">
        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1 ml-2">
            <h3 className="font-bold text-xs sm:text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight uppercase">{item.name}</h3>
            {item.variant && (
              <p className="text-[8px] sm:text-xs font-black text-primary-500 uppercase tracking-widest mt-1 truncate">
                {item.variant.name}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeItem(item.id, item.variant?.id);
            }}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variant?.id);
              }}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-900 dark:text-white shadow-sm"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center font-black text-xs text-slate-900 dark:text-white">{item.quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(item.id, item.quantity + 1, item.variant?.id);
              }}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-900 dark:text-white shadow-sm"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold mb-1">${item.price.toLocaleString()}</p>
            <p className="text-sm sm:text-xl font-black text-primary-500">${(item.price * item.quantity).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
