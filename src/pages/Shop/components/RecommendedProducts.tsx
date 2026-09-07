import { Link } from 'react-router-dom';
import { Sparkles, Star, Eye } from 'lucide-react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';

interface RecommendedProductsProps {
  products: any[];
}

export const RecommendedProducts = ({ products }: RecommendedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="mb-8 space-y-3 text-left">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary-500" size={14} />
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Recommended for You</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map(product => (
          <Link
            key={`rec-${product.id}`}
            to={`/product/${product.id}`}
            className="flex items-center gap-4 bg-gradient-to-br from-primary-500/5 to-transparent border border-primary-500/10 rounded-2xl p-3 hover:shadow-lg transition-all group"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 relative">
              <ImageWithFallback src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" containerClassName="w-full h-full" alt={product.name} />
              {/* Status Badge */}
              {(() => {
                if (product.is_promoted) {
                  return (
                    <div className="absolute top-0.5 left-0.5 z-10 bg-yellow-500 text-white px-1 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest shadow-md">
                      Hot
                    </div>
                  );
                }
                if (product.condition === 'used' || product.status === 'resell' || product.is_resell) {
                  return (
                    <div className="absolute top-0.5 left-0.5 z-10 bg-blue-500 text-white px-1 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest shadow-md">
                      Resell
                    </div>
                  );
                }
                if (product.discount_price || product.discount_percentage || product.price < 500) {
                  return (
                    <div className="absolute top-0.5 left-0.5 z-10 bg-red-500 text-white px-1 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest shadow-md">
                      Sale
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-[10px] uppercase truncate">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-primary-500">${product.price.toLocaleString()}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={8} className={product.average_rating > 0 ? "fill-yellow-400" : ""} />
                    <span className="text-[8px] font-black">{product.average_rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Eye size={8} />
                    <span className="text-[8px] font-black">{product.view_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mt-2"></div>
    </div>
  );
};
