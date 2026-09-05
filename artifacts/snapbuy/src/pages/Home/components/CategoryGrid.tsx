import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: '📱', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20', ring: 'ring-blue-500/20' },
  { name: 'Fashion', icon: '👗', color: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-500/20', ring: 'ring-pink-500/20' },
  { name: 'Home', icon: '🏠', color: 'from-green-500 to-emerald-400', shadow: 'shadow-green-500/20', ring: 'ring-green-500/20' },
  { name: 'Beauty', icon: '💄', color: 'from-purple-500 to-violet-400', shadow: 'shadow-purple-500/20', ring: 'ring-purple-500/20' },
  { name: 'Sports', icon: '⚽', color: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/20', ring: 'ring-orange-500/20' },
  { name: 'Grocery', icon: '🛒', color: 'from-yellow-500 to-lime-400', shadow: 'shadow-yellow-500/20', ring: 'ring-yellow-500/20' },
  { name: 'Baby', icon: '🧸', color: 'from-cyan-500 to-sky-400', shadow: 'shadow-cyan-500/20', ring: 'ring-cyan-500/20' },
  { name: 'Books', icon: '📚', color: 'from-indigo-500 to-blue-400', shadow: 'shadow-indigo-500/20', ring: 'ring-indigo-500/20' },
];

export const CategoryGrid = () => {
  return (
    <section className="max-w-7xl mx-auto space-y-5 text-left">
      <div className="flex items-end justify-between px-1">
        <div className="space-y-0.5">
          <div className="text-[8px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-4 h-px bg-primary-500" /> Shop by Category
          </div>
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Browse Categories
          </h2>
        </div>
        <Link
          to="/shop"
          className="group flex items-center gap-1.5 text-primary-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:underline"
        >
          All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Scrollable on mobile, grid on desktop */}
      <div className="flex overflow-x-auto gap-3 sm:gap-0 pb-3 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/shop?category=${cat.name.toLowerCase()}`}
              className="group flex flex-col items-center gap-3 min-w-[76px] sm:min-w-0"
            >
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg ${cat.shadow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:ring-4 ${cat.ring}`}>
                {cat.icon}
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 text-center uppercase tracking-tighter leading-none group-hover:text-primary-500 transition-colors">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
