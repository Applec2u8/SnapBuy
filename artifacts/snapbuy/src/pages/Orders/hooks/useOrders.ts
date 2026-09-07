import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useOrders = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          shipping_address_id,
          order_items (
            id,
            quantity,
            price,
            products (
              name,
              images,
              shop_id
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch addresses manually to avoid schema relationship errors
      const { data: addressData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id);

      const mappedOrders = (data || []).map((order: any) => ({
        ...order,
        addresses: addressData?.find(a => a.id === order.shipping_address_id) || null
      }));

      setOrders(mappedOrders);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'shipped': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return {
    orders,
    loading,
    getStatusColor,
    navigate
  };
};
