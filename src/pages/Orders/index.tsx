import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useOrders } from './hooks/useOrders';
import { OrderHeader } from './components/OrderHeader';
import { OrderCard } from './components/OrderCard';
import { EmptyOrders } from './components/EmptyOrders';
import { ReceiptModal } from '../OrderSuccess/ReceiptModal';
import { useAuthStore } from '../../store/useAuthStore';

const Orders = () => {
  const { orders, loading, getStatusColor } = useOrders();
  const { user } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="animate-spin text-primary-500" size={48} />
    </div>
  );

  const handlePrintReceipt = (order: any) => {
    // Calculate subtotal from items (sum of price * quantity)
    const calculatedSubtotal = order.order_items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity), 0
    );
    // Derive shipping fee from total (total_amount - items sum)
    const calculatedShippingFee = Math.max(0, order.total_amount - calculatedSubtotal);

    const formattedOrder = {
      orderId: `SNB-${order.id.slice(0, 8).toUpperCase()}`,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        name: item.products?.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShippingFee,
      total: order.total_amount,
      address: order.addresses || null,
      paymentMethod: 'wallet', // Defaulting to Wallet as DB doesn't store payment method
      userEmail: user?.email,
      shopId: order.order_items[0]?.products?.shop_id || null,
      createdAt: new Date(order.created_at).toLocaleString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    };
    setSelectedOrder(formattedOrder);
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-8 space-y-8 animate-fade-in pb-20">
        <OrderHeader count={orders.length} />

        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                getStatusColor={getStatusColor} 
                onPrintReceipt={handlePrintReceipt}
              />
            ))
          ) : (
            <EmptyOrders />
          )}
        </div>
      </div>

      {selectedOrder && (
        <ReceiptModal
          orderData={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
};

export default Orders;
