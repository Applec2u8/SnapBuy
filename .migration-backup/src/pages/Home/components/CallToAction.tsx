import { Link } from 'react-router-dom';
import { ArrowRight, Store, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const CallToAction = () => {
  return (
    <section className="max-w-7xl mx-auto pb-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* Become a Seller */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-600 to-primary-500 p-8 sm:p-10 text-left shadow-2xl shadow-primary-500/20 border border-primary-400/30 flex flex-col gap-4"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 bottom-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />

        <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
          <Store size={22} className="text-white" />
        </div>

        <div className="relative z-10 space-y-2 flex-1">
          <p className="text-[9px] font-black text-primary-200 uppercase tracking-widest">For Vendors</p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">
            Open Your<br />Own Shop
          </h2>
          <p className="text-primary-100 text-[11px] sm:text-xs font-medium leading-relaxed">
            Join thousands of sellers. List products, manage orders, and grow your brand — all in one place.
          </p>
        </div>

        <Link
          to="/become-seller"
          className="relative z-10 inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-50 transition-all shadow-lg w-fit hover:-translate-y-0.5"
        >
          Start Selling <ArrowRight size={13} />
        </Link>
      </motion.div>

      {/* Join SnapBuy */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 text-left shadow-2xl border border-slate-700/50 flex flex-col gap-4"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
          <UserPlus size={22} className="text-primary-400" />
        </div>

        <div className="relative z-10 space-y-2 flex-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">For Shoppers</p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">
            Join SnapBuy<br />Today
          </h2>
          <p className="text-slate-400 text-[11px] sm:text-xs font-medium leading-relaxed">
            Sign up for free and unlock exclusive deals, early access to flash sales, and personalised picks.
          </p>
        </div>

        <Link
          to="/register"
          className="relative z-10 inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 w-fit hover:-translate-y-0.5"
        >
          Get Started <ArrowRight size={13} />
        </Link>
      </motion.div>
    </section>
  );
};
