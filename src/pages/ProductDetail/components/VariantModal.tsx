import { X, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface VariantModalProps {
  show: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
  setSelectedVariant: (variant: any) => void;
  setActiveImage: (img: string) => void;
  onConfirm: () => void;
}

export const VariantModal = ({
  show,
  onClose,
  product,
  selectedVariant,
  setSelectedVariant,
  setActiveImage,
  onConfirm
}: VariantModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800"
          >
            <div className="p-5 pb-24 sm:p-6 sm:pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Select Edition</h2>
                  <p className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-[0.2em]">Personalize your asset</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[45vh] overflow-y-auto pr-1 -mr-1 space-y-2.5 custom-scrollbar">
                {product.product_variants?.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.image_url) setActiveImage(v.image_url);
                    }}
                    className={`w-full group relative p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${v.stock_quantity === 0 ? 'opacity-40 cursor-not-allowed grayscale' : selectedVariant?.id === v.id ? 'border-primary-500 bg-primary-500/5 shadow-md' : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 bg-slate-50/50 dark:bg-slate-900/50'}`}
                    disabled={v.stock_quantity === 0}
                  >
                    {v.image_url && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm">
                        <img src={v.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className={`font-black text-sm sm:text-base uppercase tracking-tight ${selectedVariant?.id === v.id ? 'text-primary-500' : 'text-slate-900 dark:text-white'}`}>{v.value}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">${(v.price_override ? parseFloat(v.price_override) : parseFloat(product.price)).toLocaleString()}</p>
                         <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                         <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${v.stock_quantity === 0 ? 'text-red-500' : v.stock_quantity <= 5 ? 'text-amber-500' : 'text-green-500'}`}>
                           {v.stock_quantity === 0 ? 'Out of Stock' : `${v.stock_quantity} left`}
                         </p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${selectedVariant?.id === v.id ? 'bg-primary-500 text-white shadow-md rotate-0' : 'bg-white dark:bg-slate-800 text-slate-200 -rotate-90'}`}>
                      {selectedVariant?.id === v.id ? <Check size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <button
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  onClick={onConfirm}
                  className={`w-full py-3.5 sm:py-4 rounded-xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${selectedVariant && selectedVariant.stock_quantity > 0 ? 'bg-primary-500 text-white shadow-primary-500/30 hover:scale-[1.02]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                >
                  {selectedVariant?.stock_quantity === 0 ? 'Out of Stock' : 'Confirm Choice'} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
