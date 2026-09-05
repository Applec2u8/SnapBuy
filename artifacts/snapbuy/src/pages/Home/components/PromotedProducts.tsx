import { Link } from 'react-router-dom';
import { TrendingUp, Star, Flame, ArrowRight, Zap } from 'lucide-react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';
import { motion } from 'framer-motion';

interface PromotedProductsProps {
  products: any[];
}

export const PromotedProducts = ({ products }: PromotedProductsProps) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="text-[8px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-4 h-px bg-yellow-500" />
            <Flame size={10} className="text-yellow-500" />
            Editor's Pick
          </div>
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={24} className="text-yellow-500" />
            Promoted Products
          </h2>
        </div>
        <Link
          to="/shop"
          className="group flex items-center gap-1.5 text-yellow-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:underline"
        >
          View All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Horizontal scroll strip */}
      <div className="relative">
        {/* Glow edge fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background dark:from-black/50 to-transparent z-10 pointer-events-none" />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="snap-start flex-shrink-0 w-44 sm:w-56"
            >
              <Link
                to={`/product/${product.id}`}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-yellow-200 dark:border-yellow-500/20 p-2 sm:p-2.5 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
              >
                {/* Promoted Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-lg">
                  <Zap size={8} className="fill-slate-900" />
                  {product.promote_type === 'likes' ? 'Trending' : 'Hot Pick'}
                </div>

                {/* Image */}
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                  <ImageWithFallback
                    src={product.images?.[0]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    alt={product.name}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="p-1.5 sm:p-2 space-y-1 flex-1 flex flex-col">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">{product.shops?.name}</p>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate text-[11px] sm:text-sm uppercase tracking-tight flex-1">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center pt-0.5">
                    <p className="text-sm sm:text-base font-black text-primary-500">
                      ${product.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-md">
                      <Star size={9} className={product.average_rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                      <span className="text-[8px] font-black text-yellow-500">{product.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
