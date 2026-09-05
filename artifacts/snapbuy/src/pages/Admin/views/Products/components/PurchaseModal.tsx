import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { toast } from 'sonner';

interface PurchaseModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ product, isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  const isAdminUser = user?.email?.toLowerCase().includes('admin');

  useEffect(() => {
    if (isOpen && product?.id) {
      fetchVariants();
      if (user?.id) fetchUserAddresses();
    }
  }, [isOpen, product?.id, user?.id]);

  const fetchVariants = async () => {
    setVariantLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVariants(data || []);
      if (data && data.length > 0) setSelectedVariant(data[0].id);
    } catch {
      toast.error('Failed to load product variants');
    } finally {
      setVariantLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .limit(1);
      if (error) throw error;
      setAddresses(data || []);
    } catch {
      // silent
    }
  };

  const handlePurchase = async () => {
    if (isAdminUser) { toast.error('Admin accounts cannot make purchases'); return; }
    if (!user?.id) { toast.error('Please log in to make a purchase'); return; }
    if (addresses.length === 0) { toast.error('Please add a shipping address first'); return; }
    if (variants.length > 0 && !selectedVariant) { toast.error('Please select a variant'); return; }
    if (quantity < 1) { toast.error('Please select a valid quantity'); return; }

    const selectedVariantData = variants.find(v => v.id === selectedVariant);
    const maxStock = selectedVariantData?.stock_quantity || product?.stock_quantity || 0;
    if (quantity > maxStock) { toast.error(`Only ${maxStock} units available in stock`); return; }

    setLoading(true);
    try {
      const variantData = variants.find(v => v.id === selectedVariant);
      const price = variantData?.price_override || product?.price || 0;
      const { data, error } = await supabase.rpc('place_order', {
        p_user_id: user.id,
        p_total_amount: price * quantity,
        p_shipping_address_id: addresses[0].id,
        p_items: [{ product_id: product.id, variant_id: selectedVariant || null, shop_id: product.shop_id, quantity, price }]
      });
      if (error) throw error;
      toast.success(`Order placed! Order ID: ${data.order_id}`);
      onClose();
      setQuantity(1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedVariantData = variants.find(v => v.id === selectedVariant);
  const displayPrice = selectedVariantData?.price_override || product?.price || 0;
  const maxStock = selectedVariantData?.stock_quantity || product?.stock_quantity || 0;
  const total = displayPrice * quantity;

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-sm mx-0 sm:mx-4 rounded-t-[2rem] sm:rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 sm:pt-5">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Order Product</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{product?.shops?.name || 'Shop'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">

          {/* Admin Warning */}
          {isAdminUser && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Admin — Purchase Disabled</p>
                <p className="text-[10px] text-red-500/80 mt-0.5">Use a regular customer account to place orders.</p>
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <img
              src={product?.images?.[0] || 'https://via.placeholder.com/80'}
              alt={product?.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight line-clamp-2">{product?.name}</h4>
              <p className="text-lg font-black text-primary-500 mt-1">${fmt(displayPrice)}</p>
            </div>
            {maxStock > 0 && (
              <div className="shrink-0 text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stock</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">{maxStock}</p>
              </div>
            )}
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Select Variant</p>
              {variants.length <= 4 ? (
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v.id); setQuantity(1); }}
                      disabled={variantLoading || (v.stock_quantity || 0) === 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
                        selectedVariant === v.id
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/25'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-400'
                      }`}
                    >
                      {v.name}{v.value ? ` · ${v.value}` : ''}
                      {(v.stock_quantity || 0) === 0 && <span className="ml-1 opacity-60">(out)</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={selectedVariant || ''}
                  onChange={(e) => { setSelectedVariant(e.target.value); setQuantity(1); }}
                  disabled={variantLoading}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30 transition-all disabled:opacity-50"
                >
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}{v.value ? ` · ${v.value}` : ''} — {v.stock_quantity || 0} in stock
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Quantity</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 shrink-0"
              >
                <Minus size={14} />
              </button>
              <div className="flex-1 flex items-center justify-center h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-base font-black text-slate-900 dark:text-white">{quantity}</span>
              </div>
              <button
                onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                disabled={quantity >= maxStock}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Total + CTA */}
          <div className="rounded-2xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 p-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</p>
              <p className="text-xl font-black text-primary-500">${fmt(total)}</p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={loading || variantLoading || isAdminUser}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all disabled:opacity-50 ${
                isAdminUser ? 'bg-red-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 active:scale-95'
              }`}
            >
              {loading
                ? <Package size={15} className="animate-pulse" />
                : <ShoppingCart size={15} />
              }
              {isAdminUser ? 'Blocked' : 'Buy Now'}
            </button>
          </div>

          {/* Cancel link */}
          <button
            onClick={onClose}
            className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
