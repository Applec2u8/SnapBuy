import { Link } from 'react-router-dom';
import { Star, Eye, Loader2 } from 'lucide-react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';

interface ProductGridProps {
  products: any[];
  viewMode: 'grid' | 'list';
  loadingMore: boolean;
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
}

export const ProductGrid = ({
  products,
  viewMode,
  loadingMore,
  hasMore,
  observerTarget
}: ProductGridProps) => {
  return (
    <div className="space-y-6 pb-20 text-left">
      <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5" : "space-y-3"}>
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 ${viewMode === 'list' ? 'flex items-center gap-4 p-2' : 'p-2 sm:p-2.5'}`}
          >
            <div className={`${viewMode === 'list' ? 'w-32 h-32' : 'aspect-[4/5]'} rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative flex-shrink-0`}>
                <ImageWithFallback
                  src={product.images?.[0]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                  if (product.condition === 'used' || product.status === 'resell' || product.is_resell) {
                    return (
                      <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                        Resell
                      </div>
                    );
                  }
                  if (product.discount_price || product.discount_percentage || product.price < 500) {
                    return (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                        Discounted
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>

            <div className={`flex-1 min-w-0 ${viewMode === 'list' ? 'space-y-1.5 pr-1' : 'p-2.5 space-y-1'}`}>
              <p className="text-[7px] font-black text-primary-500 uppercase tracking-widest truncate">
                {product.shops?.name} <span className="text-slate-300 mx-1">•</span> {product.categories?.name}
              </p>
              <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-[11px] sm:text-sm uppercase tracking-tight">{product.name}</h3>
              <div className="flex flex-wrap justify-between items-center mt-2 gap-x-2 gap-y-1">
                <p className="text-sm sm:text-base font-black text-primary-500">${product.price.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1 bg-yellow-400/5 text-yellow-500 px-1 py-0.5 rounded-md">
                    <Star size={8} className={product.average_rating > 0 ? "fill-yellow-400" : ""} />
                    <span className="text-[8px] font-black">{product.average_rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-[7px] text-slate-400">({product.ratings_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-400/5 text-slate-400 px-1 py-0.5 rounded-md">
                    <Eye size={8} />
                    <span className="text-[8px] font-black">{product.view_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div ref={observerTarget} className="flex justify-center pt-10 pb-20">
        {loadingMore && <Loader2 className="animate-spin text-primary-500" size={32} />}
        {!hasMore && products.length > 0 && (
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">End of Catalog</p>
        )}
      </div>
    </div>
  );
};
