import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
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

  // Check if user is admin (checking email for 'admin' keyword - case insensitive)
  const isAdminUser = user?.email?.toLowerCase().includes('admin');

  useEffect(() => {
    if (isOpen && product?.id) {
      fetchVariants();
      if (user?.id) {
        fetchUserAddresses();
      }
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
      
      // Auto-select first variant if available
      if (data && data.length > 0) {
        setSelectedVariant(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load variants:', err);
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
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handlePurchase = async () => {
    // Prevent admin from purchasing
    if (isAdminUser) {
      toast.error('Admin accounts cannot make purchases');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to make a purchase');
      return;
    }

    if (addresses.length === 0) {
      toast.error('Please add a shipping address first');
      return;
    }

    if (variants.length > 0 && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    if (quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    const selectedVariantData = variants.find(v => v.id === selectedVariant);
    const maxStock = selectedVariantData?.stock_quantity || product?.stock_quantity || 0;
    if (quantity > maxStock) {
      toast.error(`Only ${maxStock} units available in stock`);
      return;
    }

    setLoading(true);
    try {
      const variantData = variants.find(v => v.id === selectedVariant);
      const price = variantData?.price_override || product?.price || 0;
      const totalAmount = price * quantity;

      const orderItemsData = [
        {
          product_id: product.id,
          variant_id: selectedVariant || null,
          shop_id: product.shop_id,
          quantity: quantity,
          price: price
        }
      ];

      const defaultAddress = addresses[0];

      // Call place_order RPC function
      const { data, error } = await supabase.rpc('place_order', {
        p_user_id: user.id,
        p_total_amount: totalAmount,
        p_shipping_address_id: defaultAddress.id,
        p_items: orderItemsData
      });

      if (error) throw error;

      toast.success(`Order placed successfully! Order ID: ${data.order_id}`);
      onClose();
      setQuantity(1);
    } catch (err: any) {
      console.error('Purchase failed:', err);
      toast.error(err.message || 'Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedVariantData = variants.find(v => v.id === selectedVariant);
  const displayPrice = selectedVariantData?.price_override || product?.price || 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Order Product</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Admin Warning */}
          {isAdminUser && (
            <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-500/10 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-red-600 dark:text-red-400 font-black text-lg">⛔</div>
                <div>
                  <h4 className="font-black text-red-700 dark:text-red-400 text-sm mb-1">ADMIN ACCOUNT - PURCHASE DISABLED</h4>
                  <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                    Admin accounts cannot make purchases. Please use a regular customer account to order products.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Product Info */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-2">Product</p>
            <div className="flex gap-3">
              <img
                src={product?.images?.[0] || 'https://via.placeholder.com/80'}
                alt={product?.name}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
              />
              <div>
                <h4 className="font-black text-slate-900 dark:text-white mb-1">{product?.name}</h4>
                <p className="text-xs text-slate-500">{product?.shops?.name || 'Shop'}</p>
                <p className="text-sm font-black text-primary-500 mt-2">${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 mb-2">
                Select Variant
              </label>
              <select
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(e.target.value)}
                disabled={variantLoading}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30 transition-all disabled:opacity-50"
              >
                <option value="">Loading variants...</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} {variant.value ? `- ${variant.value}` : ''} (Stock: {variant.stock_quantity || 0})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 mb-3">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Minus size={18} />
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newQty = Math.max(1, parseInt(e.target.value) || 1);
                  const maxStock = selectedVariantData?.stock_quantity || product?.stock_quantity || 0;
                  setQuantity(Math.min(newQty, maxStock));
                }}
                className="flex-1 w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-lg font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30"
              />

              <button
                onClick={() => {
                  const maxStock = selectedVariantData?.stock_quantity || product?.stock_quantity || 0;
                  if (quantity < maxStock) {
                    setQuantity(quantity + 1);
                  }
                }}
                disabled={quantity >= (selectedVariantData?.stock_quantity || product?.stock_quantity || 0)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>
            {selectedVariantData && (
              <p className="text-xs text-slate-500 mt-2">
                Available: {selectedVariantData.stock_quantity || 0} units
              </p>
            )}
          </div>


          {/* Total */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total:</span>
              <p className="text-2xl font-black text-primary-500">
                ${(displayPrice * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || variantLoading || isAdminUser}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isAdminUser 
                ? 'bg-red-400 cursor-not-allowed opacity-60 shadow-red-500/20'
                : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 disabled:opacity-50'
            }`}
            title={isAdminUser ? 'Admin accounts cannot purchase' : 'Complete your order'}
          >
            <ShoppingCart size={16} />
            {isAdminUser ? 'Admin - Cannot Buy' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
