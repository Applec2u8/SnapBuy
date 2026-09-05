import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const EmptyCart = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-8 animate-fade-in">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 relative"
      >
        <ShoppingBag size={56} className="relative z-10" />
        <div className="absolute inset-0 bg-primary-500/5 rounded-full animate-pulse" />
      </motion.div>
      
      <div className="space-y-3 max-w-sm">
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
          {t('no_orders', 'Your cart is empty')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Looks like you haven't added anything to your cart yet. Let's find something amazing for you!
        </p>
      </div>

      <Link 
        to="/shop" 
        className="group flex items-center gap-3 px-10 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
      >
        {t('start_shopping', 'Explore Shop')}
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};
