import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag, Search, Clock, CheckCircle2, Truck, AlertCircle,
  User, MapPin, Phone, Calendar, ChevronLeft, ChevronRight,
  Package, DollarSign, Filter, RefreshCw, Send, Layers, Check
} from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'sonner';

interface ShopOrdersTabProps {
  shopId: string;
  shop: any;
  onRefreshShopStats?: () => void;
}

type OrderStatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

const STATUS_CONFIG: Record<
  OrderStatusFilter,
  { label: string; color: string; badgeBg: string; activeClass: string; icon: React.ComponentType<{ size: number }> }
> = {
  all: {
    label: 'ทั้งหมด (All)',
    color: 'text-primary-500',
    badgeBg: 'bg-primary-500/10 text-primary-500',
    activeClass: 'bg-white dark:bg-slate-900 text-primary-500 shadow-sm',
    icon: ShoppingBag,
  },
  pending: {
    label: 'Pending',
    color: 'text-orange-500',
    badgeBg: 'bg-orange-500/10 text-orange-500',
    activeClass: 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-500',
    activeClass: 'bg-white dark:bg-slate-900 text-blue-500 shadow-sm',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-500',
    activeClass: 'bg-white dark:bg-slate-900 text-purple-500 shadow-sm',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-500',
    activeClass: 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm',
    icon: CheckCircle2,
  },
};

export const ShopOrdersTab: React.FC<ShopOrdersTabProps> = ({
  shopId,
  shop,
  onRefreshShopStats,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Default to guarantee_paid = true to match shop user 100%
  const [guaranteeFilter, setGuaranteeFilter] = useState<'paid_only' | 'all'>('paid_only');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      try {
        await supabase.rpc('process_auto_deliveries');
      } catch (e) {
        // RPC might not exist or already processed
      }

      let query = supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          order_id,
          variant_id,
          guarantee_paid,
          created_at,
          orders (
            id,
            status,
            created_at,
            expected_delivery_date,
            total_amount,
            shipping_address_id,
            profiles (
              full_name
            ),
            user_addresses!orders_shipping_address_id_fkey (
              full_name,
              phone,
              address_line,
              district,
              city,
              province,
              postal_code
            )
          ),
          products (
            id,
            name,
            images,
            shop_id
          ),
          product_variants (
            id,
            name,
            value,
            image_url
          )
        `)
        .eq('shop_id', shopId);

      if (guaranteeFilter === 'paid_only') {
        query = query.eq('guarantee_paid', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      toast.error('ไม่สามารถโหลดรายการคำสั่งซื้อได้: ' + err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [shopId, guaranteeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, guaranteeFilter]);

  // Status counts for sub-tabs
  const counts = useMemo(() => {
    const c = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
    };
    orders.forEach((item) => {
      const orderStatus = (item.orders?.status || 'pending').toLowerCase() as keyof typeof c;
      if (c[orderStatus] !== undefined && orderStatus !== 'all') {
        c[orderStatus]++;
      }
    });
    return c;
  }, [orders]);

  // Filtered orders based on selected sub-tab & search
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const orderStatus = (item.orders?.status || 'pending').toLowerCase();

      // 1. Status Filter
      if (filter !== 'all' && orderStatus !== filter) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const orderId = (item.orders?.id || item.order_id || '').toLowerCase();
        const prodName = (item.products?.name || '').toLowerCase();
        const orderObj = Array.isArray(item.orders) ? item.orders[0] : item.orders;
        const addrObj =
          orderObj?.user_addresses ||
          (Array.isArray(orderObj?.user_addresses) ? orderObj.user_addresses[0] : null) ||
          null;
        const customerName = (
          addrObj?.full_name ||
          orderObj?.profiles?.full_name ||
          ''
        ).toLowerCase();

        return orderId.includes(q) || prodName.includes(q) || customerName.includes(q);
      }

      return true;
    });
  }, [orders, filter, searchQuery]);

  // Paginated items
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const getStatusBadge = (statusStr: string) => {
    const st = (statusStr || 'pending').toLowerCase();
    switch (st) {
      case 'pending':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'processing':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'shipped':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'delivered':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* ─── Top Guarantee Scope & Refresh Controls ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              รายการคำสั่งซื้อร้านค้า (Order Management)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {guaranteeFilter === 'paid_only'
                ? 'แสดงเฉพาะคำสั่งซื้อที่ค้ำประกันแล้ว (ตรงกับหน้า Shop User 100%)'
                : 'แสดงคำสั่งซื้อทั้งหมด (รวมรายการที่ยังไม่ชำระค้ำประกัน)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Guarantee filter toggle */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-wider">
            <button
              onClick={() => setGuaranteeFilter('paid_only')}
              className={`px-3 py-1.5 rounded-xl transition-all ${guaranteeFilter === 'paid_only'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              ตรงกับ Shop User
            </button>
            <button
              onClick={() => setGuaranteeFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${guaranteeFilter === 'all'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              ทั้งหมด (รวมยังไม่ค้ำ)
            </button>
          </div>

          <button
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-500/40 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary-500' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* ─── Sub-Tab Navigation (Matching User Page) ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs (All, Pending, Processing, Shipped, Delivered) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit flex-wrap">
          {(['all', 'pending', 'processing', 'shipped', 'delivered'] as OrderStatusFilter[]).map((st) => {
            const conf = STATUS_CONFIG[st];
            const Icon = conf.icon;
            const isActive = filter === st;
            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive
                    ? conf.activeClass
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Icon size={14} />
                <span>{conf.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${conf.badgeBg}`}>
                  {counts[st]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="ค้นหา Order ID, สินค้า หรือชื่อผู้ซื้อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl py-2 px-4 pl-9 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
          />
        </div>
      </div>

      {/* ─── Orders Table / Card View ──────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 font-bold animate-pulse">
          กำลังโหลดรายการคำสั่งซื้อ...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center text-xs text-slate-400 font-bold border-dashed">
          ไม่มีรายการคำสั่งซื้อในสถานะนี้ ({filter.toUpperCase()})
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">ข้อมูลสินค้า (Product Info)</th>
                  <th className="px-6 py-4">ลูกค้า (Customer)</th>
                  <th className="px-6 py-4">ยอดรวม (Amount)</th>
                  <th className="px-6 py-4">สถานะ (Status)</th>
                  <th className="px-6 py-4 text-right">วันเวลา / กำหนดส่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {paginatedOrders.map((item) => {
                  const orderObj = Array.isArray(item.orders) ? item.orders[0] : item.orders;
                  const status = (orderObj?.status || 'pending').toLowerCase();
                  const prodImage =
                    item.product_variants?.image_url ||
                    (Array.isArray(item.products?.images) ? item.products.images[0] : null) ||
                    '';
                  const addrObj =
                    orderObj?.user_addresses ||
                    (Array.isArray(orderObj?.user_addresses) ? orderObj.user_addresses[0] : null) ||
                    null;
                  const customerName = addrObj?.full_name || orderObj?.profiles?.full_name || 'ลูกค้าทั่วไป';
                  const phone = addrObj?.phone;
                  const fullAddress = addrObj
                    ? [addrObj.address_line, addrObj.district, addrObj.city, addrObj.province, addrObj.postal_code]
                      .filter(Boolean)
                      .join(' ')
                    : 'ไม่ระบุที่อยู่จัดส่ง';

                  const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

                  // Calculate ETA
                  let etaText = '—';
                  if (orderObj?.expected_delivery_date) {
                    const diff = new Date(orderObj.expected_delivery_date).getTime() - Date.now();
                    if (diff > 0) {
                      const days = Math.ceil(diff / (1000 * 3600 * 24));
                      etaText = `เหลืออีก ${days} วัน (${new Date(orderObj.expected_delivery_date).toLocaleDateString('th-TH')})`;
                    } else {
                      etaText = 'กำลังจัดส่งถึงปลายทาง';
                    }
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Product details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm flex items-center justify-center">
                            {prodImage ? (
                              <img src={prodImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[240px]">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.products?.name || 'สินค้า'}
                            </p>
                            {item.product_variants && (
                              <div className="mt-1">
                                <span className="bg-primary-500/10 text-primary-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                                  {item.product_variants.name}: {item.product_variants.value}
                                </span>
                              </div>
                            )}
                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                              Order #{orderObj?.id ? orderObj.id.slice(0, 8) : item.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <User size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{customerName}</p>
                            {phone && <p className="text-[10px] text-slate-400 font-mono">{phone}</p>}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-1" title={fullAddress}>
                          {fullAddress}
                        </p>
                      </td>

                      {/* Price & Quantity */}
                      <td className="px-6 py-4 font-mono">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          ${itemTotal.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          x{item.quantity} (${Number(item.price || 0).toFixed(2)})
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusBadge(
                              status
                            )}`}
                          >
                            <Clock size={12} />
                            {status}
                          </span>
                          {status === 'pending' && (
                            <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                              Waiting for Guarantee
                            </span>
                          )}
                          {(status === 'processing' || status === 'shipped') && (
                            <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                              ETA: {etaText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-right text-slate-400 font-mono text-[11px]">
                        <p className="text-slate-700 dark:text-slate-300 font-bold">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : '—'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {paginatedOrders.map((item) => {
              const orderObj = Array.isArray(item.orders) ? item.orders[0] : item.orders;
              const status = (orderObj?.status || 'pending').toLowerCase();
              const prodImage =
                item.product_variants?.image_url ||
                (Array.isArray(item.products?.images) ? item.products.images[0] : null) ||
                '';
              const addrObj =
                orderObj?.user_addresses ||
                (Array.isArray(orderObj?.user_addresses) ? orderObj.user_addresses[0] : null) ||
                null;
              const customerName = addrObj?.full_name || orderObj?.profiles?.full_name || 'ลูกค้า';
              const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusBadge(
                        status
                      )}`}
                    >
                      <Clock size={11} />
                      {status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-black">
                      #{orderObj?.id ? orderObj.id.slice(0, 8) : item.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                      {prodImage ? (
                        <img src={prodImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white line-clamp-2">
                        {item.products?.name || 'สินค้า'}
                      </p>
                      {item.product_variants && (
                        <p className="text-[9px] font-black uppercase text-primary-500 mt-1">
                          {item.product_variants.name}: {item.product_variants.value}
                        </p>
                      )}
                      <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                        ${itemTotal.toFixed(2)}{' '}
                        <span className="text-[10px] font-bold text-slate-400">(x{item.quantity})</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
                    <span>ลูกค้า: {customerName}</span>
                    <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-white dark:bg-slate-900">
              <p>
                แสดง {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredOrders.length)} จากทั้งหมด {filteredOrders.length} รายการ
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
                  หน้า {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
