import { Link } from 'react-router-dom';
import { Star, Eye, Plus, Minus, ShoppingCart, ChevronRight, Store, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductInfoProps {
  product: any;
  selectedVariant: any;
  quantity: number;
  setQuantity: (q: number) => void;
  handleAddToCart: (variant: any) => void;
  handleBuyNow: (variant: any) => void;
  reviewsCount: number;
  setShowVariantModal: (show: boolean) => void;
  isOwnProduct?: boolean;
}

export const ProductInfo = ({
  product,
  selectedVariant,
  quantity,
  setQuantity,
  handleAddToCart,
  handleBuyNow,
  reviewsCount,
  setShowVariantModal,
  isOwnProduct
}: ProductInfoProps) => {
  useTranslation();

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.category_id && (
              <span className="px-2 py-0.5 bg-primary-500/10 backdrop-blur-md border border-primary-500/20 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary-500">
                Digital Asset
              </span>
            )}
            <span className="px-2 py-0.5 bg-green-500/10 backdrop-blur-md border border-green-500/20 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-green-500">
              Instant Delivery
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight drop-shadow-sm">{product.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 group cursor-help">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < (product.average_rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-700"} />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{product.average_rating || '5.0'}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">({reviewsCount} Reviews)</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Eye size={14} />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{product.view_count || 0} Views</span>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative p-5 sm:p-6 bg-white dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-xl transition-all">
          {selectedVariant ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-[0.3em]">{selectedVariant.name}</p>
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedVariant.value}</p>
                </div>
                <button 
                  onClick={() => setShowVariantModal(true)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] sm:text-xs font-black text-slate-400 hover:text-primary-500 uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700"
                >
                  Change
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    ${(selectedVariant.price_override ? parseFloat(selectedVariant.price_override) : parseFloat(product.price)).toLocaleString()}
                  </p>
                  {selectedVariant.price_override && parseFloat(selectedVariant.price_override) < parseFloat(product.price) && (
                    <p className="text-sm sm:text-base font-bold text-slate-400 line-through decoration-primary-500/50">${parseFloat(product.price).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-[0.3em]">Starting Price</p>
                <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  ${parseFloat(product.price).toLocaleString()}
                </p>
              </div>
              {product.product_variants?.length > 0 && (
                <button 
                  onClick={() => setShowVariantModal(true)}
                  className="w-full py-4 bg-primary-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                >
                  <Plus size={16} /> Choose Edition
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isOwnProduct && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Your Shop Account</p>
            <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400/80 leading-relaxed mt-0.5">
              This product belongs to your shop. You cannot purchase or add your own items to the cart.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-1">
        {/* Quantity Selector */}
        {(() => {
          const maxStock = selectedVariant
            ? (selectedVariant.stock_quantity ?? 999)
            : (product.stock_quantity ?? 999);
          const isOutOfStock = maxStock === 0;
          const isAtMax = quantity >= maxStock;

          return (
            <>
              <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 backdrop-blur-sm">
                <div className="ml-1 space-y-0.5">
                  <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                  {isOutOfStock ? (
                    <span className="text-[10px] sm:text-xs font-black text-red-500 uppercase tracking-wider">Out of Stock</span>
                  ) : (
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isAtMax ? 'text-amber-500' : 'text-green-500'}`}>
                      {maxStock} Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-all text-slate-400 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 sm:w-10 text-center font-black text-sm sm:text-base text-slate-900 dark:text-white">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={isOutOfStock || isAtMax}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-all text-slate-400 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => selectedVariant || !product.product_variants?.length ? handleAddToCart(selectedVariant) : setShowVariantModal(true)} 
                  className="flex-1 py-4 rounded-xl border font-black uppercase text-xs sm:text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button 
                  onClick={() => selectedVariant || !product.product_variants?.length ? handleBuyNow(selectedVariant) : setShowVariantModal(true)} 
                  className="flex-[1.4] py-4 rounded-xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  Instant Purchase <ChevronRight size={20} />
                </button>
              </div>
            </>
          );
        })()}
      </div>

      <Link to={`/shop/${product.shops?.id}`} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary-500/10 transition-colors" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform border border-white dark:border-slate-700">
            <Store size={18} />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight uppercase">{product.shops?.name}</h4>
            <p className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
              Verified Partner
            </p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all relative z-10">
           <ChevronRight size={14} />
        </div>
      </Link>
    </div>
  );
};
