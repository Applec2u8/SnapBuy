import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';

interface RelatedProductsProps {
  relatedProducts: any[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export const RelatedProducts = ({ 
  relatedProducts, 
  onLoadMore, 
  hasMore, 
  loading 
}: RelatedProductsProps) => {
  const { t } = useTranslation();

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-10 sm:mt-16 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[8px] font-black text-primary-500 uppercase tracking-[0.2em]">Discovery</p>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">{t('related_products')}</h2>
        </div>
        <Link to="/shop" className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-1 group">
          Explore Shop <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {relatedProducts.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="group space-y-2.5">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-500">
              <ImageWithFallback src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" containerClassName="w-full h-full" alt={p.name} />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-1.5 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-md text-[6px] font-black uppercase tracking-widest shadow-sm">
                  Asset
                </span>
              </div>
            </div>
            <div className="space-y-0.5 px-1">
              <p className="text-[6px] font-black text-primary-500 uppercase tracking-widest truncate">{p.shops?.name}</p>
              <h3 className="font-bold text-[10px] text-slate-900 dark:text-white truncate uppercase tracking-tight">{p.name}</h3>
              <p className="font-black text-xs text-slate-900 dark:text-white">${parseFloat(p.price).toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="group flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl hover:shadow-primary-500/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin text-primary-500" />
            ) : (
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
            )}
            {loading ? 'Analyzing Data...' : 'Explore More Assets'}
          </button>
        </div>
      )}
    </div>
  );
};
