import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const useCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchProfile } = useAuthStore();
  const { items, removeItem } = useCartStore();

  const buyNowItem = location.state?.buyNowItem;
  const stateItems = location.state?.checkoutItems;
  const checkoutItems = buyNowItem ? [buyNowItem] : (stateItems || items);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wallet');
  const [printReceipt, setPrintReceipt] = useState(false);
  const [shippingDays, setShippingDays] = useState(3);

  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    address_line: '',
    is_default: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
      if (data && data.length > 0) {
        setSelectedAddress(data[0].id);
      } else {
        setShowAddAddress(true);
      }

      // Fetch shipping days setting
      const { data: settings } = await supabase.from('quota_settings').select('shipping_days').eq('id', 1).single();
      if (settings?.shipping_days) setShippingDays(settings.shipping_days);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert([{ ...newAddress, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Address saved successfully!');
      setAddresses([...addresses, data]);
      setSelectedAddress(data.id);
      setShowAddAddress(false);
      setNewAddress({
        full_name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        postal_code: '',
        address_line: '',
        is_default: false
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const calculateSubtotal = () => checkoutItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const shippingFee = 45;
  const total = calculateSubtotal() + shippingFee;

  const [checkoutErrors, setCheckoutErrors] = useState({ address: false, payment: false });

  const handlePlaceOrder = async () => {
    let hasError = false;
    const newErrors = { address: false, payment: false };

    if (!selectedAddress && (!showAddAddress || !newAddress.full_name || !newAddress.phone || !newAddress.province || !newAddress.city || !newAddress.district || !newAddress.postal_code || !newAddress.address_line)) {
      toast.error('Please select a shipping address or fill all address fields');
      newErrors.address = true;
      hasError = true;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      newErrors.payment = true;
      hasError = true;
    }

    setCheckoutErrors(newErrors);

    if (hasError) return;


    setProcessing(true);
    try {
      const orderItemsData = checkoutItems.map((item: any) => ({
        product_id: item.id,
        variant_id: item.variant?.id || null,
        shop_id: item.shop_id,
        quantity: item.quantity,
        price: item.price
      }));

      if (selectedPaymentMethod === 'wallet') {
        const { error: walletError } = await supabase.rpc('pay_with_wallet', {
          p_amount: total
        });
        if (walletError) throw walletError;
      }

      const { error: rpcError } = await supabase.rpc('place_order', {
        p_user_id: user?.id,
        p_total_amount: total,
        p_shipping_address_id: selectedAddress,
        p_items: orderItemsData
      });

      if (rpcError) {
        // NOTE: In a real app we might want to refund the wallet here if place_order fails.
        // For now, throw the error so user can see it.
        throw rpcError;
      }

      for (const item of items) {
        try {
          await supabase.rpc('decrement_stock', {
            p_variant_id: item.variant?.id,
            p_product_id: item.id,
            p_quantity: item.quantity
          });
        } catch (err: any) {
          console.error("Stock update failed:", err);
          if (item.variant?.id) {
            const { data: v } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant.id).single();
            if (v) await supabase.from('product_variants').update({ stock_quantity: Math.max(0, v.stock_quantity - item.quantity) }).eq('id', item.variant.id);
          }
        }
      }

      toast.success('Order placed successfully!');
      if (!buyNowItem) {
        checkoutItems.forEach((item: any) => removeItem(item.id, item.variant?.id));
      }
      // Refresh profile so wallet balance is up-to-date in UI
      if (user?.id) await fetchProfile(user.id);

      const orderId = `SNB-${Date.now().toString(36).toUpperCase()}`;
      const selectedAddressData = addresses.find((a: any) => a.id === selectedAddress);

      navigate('/order-success', {
        state: {
          autoPrint: printReceipt,
          orderData: {
            orderId,
            items: checkoutItems,
            subtotal: calculateSubtotal(),
            shippingFee,
            total,
            address: selectedAddressData,
            paymentMethod: selectedPaymentMethod,
            userEmail: user?.email,
            shopId: checkoutItems[0]?.shop_id || null,
            createdAt: new Date().toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          }
        }
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return {
    user,
    items,
    addresses,
    selectedAddress,
    setSelectedAddress,
    showAddAddress,
    setShowAddAddress,
    loading,
    processing,
    newAddress,
    setNewAddress,
    handleAddAddress,
    calculateSubtotal,
    shippingFee,
    total,
    handlePlaceOrder,
    checkoutItems,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    checkoutErrors,
    printReceipt,
    setPrintReceipt,
    shippingDays
  };
};
