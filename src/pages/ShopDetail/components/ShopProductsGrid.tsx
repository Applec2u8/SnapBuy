import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';

interface ShopProductsGridProps {
  products: any[];
  loadingMore: boolean;
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
}

export const ShopProductsGrid = ({
  products,
  loadingMore,
  hasMore,
  observerTarget
}: ShopProductsGridProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-10 text-left">
      <div className="flex items-center justify-between">
         <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Shop Inventory</h2>
         <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-8 hidden sm:block" />
         <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Latest Arrivals
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/product/${product.id}`}
            className="group bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all hover:-translate-y-2 flex flex-col h-full"
          >
            <div className="aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
              <ImageWithFallback
                src={product.images?.[0]}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                containerClassName="w-full h-full"
                alt={product.name}
              />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                 <div className="p-2 sm:p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-primary-500 shadow-xl">
                    <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
                 </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 flex flex-col flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 leading-tight uppercase mb-auto">
                {product.name}
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm sm:text-lg font-black text-primary-500">${product.price.toLocaleString()}</p>
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-black text-slate-400">
                  {product.stock_quantity > 0 ? 'IN' : 'OUT'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="py-20 flex flex-col items-center gap-4">
           <Loader2 className="animate-spin text-primary-500" size={32} />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading More Products</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
         <div className="py-20 text-center">
            <div className="h-px bg-slate-100 dark:bg-slate-800 w-20 mx-auto mb-6" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">You've reached the end</p>
         </div>
      )}

      {!loadingMore && products.length === 0 && (
        <div className="py-40 text-center space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-xl">
             <ShoppingBag size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('no_orders')}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This shop hasn't posted any products yet</p>
          </div>
        </div>
      )}
    </div>
  );
};
