import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';
import { motion } from 'framer-motion';

interface FeaturedProductsProps {
  products: any[];
}

export const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-0.5">
          <div className="text-[8px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-4 h-px bg-primary-500" /> Hot This Week
          </div>
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            {t('featured_products')}
          </h2>
        </div>
        <Link
          to="/shop"
          className="group flex items-center gap-1.5 text-primary-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:underline"
        >
          {t('view_all')} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/product/${product.id}`}
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                <ImageWithFallback
                  src={product.images?.[0]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  alt={product.name}
                />
                
                {/* Status Badge */}
                {(() => {
                  if (product.is_promoted) {
                    return (
                      <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                        <Star size={8} className="fill-white" /> Recommended
                      </div>
                    );
                  }
                  // Check if product is marked as used / resell
                  if (product.condition === 'used' || product.status === 'resell' || product.is_resell) {
                    return (
                      <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                        Resell
                      </div>
                    );
                  }
                  // Check if discounted
                  if (product.discount_price || product.discount_percentage || product.price < 500) {
                    return (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                        Discounted
                      </div>
                    );
                  }
                  return null;
                })()}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow">
                    <ShoppingBag size={10} /> Quick View
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-2 sm:p-3 space-y-1.5 flex-1 flex flex-col">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">{product.shops?.name}</p>
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-[11px] sm:text-sm uppercase tracking-tight flex-1">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center pt-0.5">
                  <p className="text-sm sm:text-base font-black text-primary-500">
                    ${product.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-md">
                    <Star size={9} className={product.average_rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                    <span className="text-[8px] font-black text-yellow-500">{product.average_rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-[7px] text-slate-400">({product.ratings_count || 0})</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-center pt-4">
        <Link
          to="/shop"
          className="group flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all shadow-sm hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5"
        >
          View All Products <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
