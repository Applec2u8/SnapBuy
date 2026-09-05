import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative h-[460px] sm:h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden group shadow-2xl border border-slate-200 dark:border-slate-700">
      {/* Background overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
      <img
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        alt="Hero"
      />

      {/* Floating accent blob */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] z-10 pointer-events-none" />

      <div className="relative z-20 h-full flex flex-col justify-end sm:justify-center px-6 sm:px-14 pb-10 sm:pb-0 max-w-3xl space-y-5">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit"
        >
          <Sparkles size={10} className="text-yellow-400" />
          {t('trending')} Summer Collection
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-6xl font-black text-white leading-tight uppercase tracking-tighter"
        >
          Unleash Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 italic">
            Style
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-300 text-[11px] sm:text-base max-w-md font-medium leading-relaxed"
        >
          Curated premium products from global brands and local artisans. Experience the future of retail.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 pt-1"
        >
          <Link
            to="/shop"
            className="inline-flex bg-primary-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30 items-center gap-2 text-[10px] sm:text-xs hover:-translate-y-0.5 active:scale-95"
          >
            <ShoppingBag size={14} /> Shop Now <ArrowRight size={14} />
          </Link>
          <Link
            to="/shop"
            className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-white/20 transition-all items-center gap-2 text-[10px] sm:text-xs"
          >
            <Play size={12} className="fill-white" /> Browse Shops
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex gap-6 pt-2"
        >
          {[
            { value: '10K+', label: 'Products' },
            { value: '500+', label: 'Shops' },
            { value: '50K+', label: 'Happy Buyers' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-base sm:text-xl font-black text-white">{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
