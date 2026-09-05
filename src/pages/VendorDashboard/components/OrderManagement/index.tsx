import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MoreVertical, 
  Clock, 
  Loader2,
  User,
  ShoppingBag,
  Filter as FilterIcon
} from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { CountdownTimer } from '../../../../components/ui/CountdownTimer';

const OrderManagement = () => {
  const { t } = useTranslation();
  const { shop } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      await supabase.rpc('process_auto_deliveries');
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          order_id,
          variant_id,
          orders (
            id,
            status,
            created_at,
            expected_delivery_date,
            total_amount,
            profiles (
              full_name
            )
          ),
          products (
            name,
            images,
            shop_id
          ),
          product_variants (
            name,
            value,
            image_url
          )
        `)
        .eq('shop_id', shop.id)
        .eq('guarantee_paid', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (shop) {
      fetchOrders();
    }
  }, [shop]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'processing': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'shipped': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.orders?.status === filter;
    const matchesSearch = 
      order.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orders?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orders?.id?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, orders.length]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(() => {
      document.getElementById('order-management-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered'];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-primary-500" size={32} />
    </div>
  );

  return (
    <div id="order-management-top" className="space-y-6 animate-fade-in pb-20 text-left scroll-mt-24 lg:scroll-mt-32">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-full text-left">
            <input 
              type="text" 
              placeholder={t('search_orders', 'Search orders, customers...')} 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-slate-400" size={20} />
          </div>
          <button
            onClick={() => fetchOrders()}
            disabled={loading || isRefreshing}
            className={`p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-primary-500 transition-all shadow-sm flex-shrink-0`}
            title="Refresh Data"
          >
            <svg className={isRefreshing ? 'animate-spin text-primary-500' : ''} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
        
        <div className="w-full">
          {/* MOBILE DROPDOWN */}
          <div className="sm:hidden relative w-full">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <FilterIcon className="text-slate-400" size={16} />
                {t(filter, filter)}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform text-slate-400 ${isDropdownOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-[100] overflow-hidden animate-slide-down">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilter(s);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-4 text-xs font-black uppercase tracking-widest transition-colors border-b last:border-b-0 border-slate-200 dark:border-slate-700/50 ${filter === s ? 'bg-primary-500/10 text-primary-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    {t(s, s)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DESKTOP TABS */}
          <div className="hidden sm:inline-flex items-center gap-2 bg-secondary/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-2 text-slate-400">
              <FilterIcon size={16} />
            </div>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === s ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {t(s, s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-8 py-5">Product Info</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm">
                          {/* Use Variant Image if available, fallback to product main image */}
                          <img src={order.product_variants?.image_url || order.products?.images?.[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate max-w-[200px]">{order.products?.name}</p>
                          {/* Show Variant Name & Value */}
                          {order.product_variants && (
                            <div className="flex items-center gap-1 mt-0.5">
                               <div className="bg-primary-500/10 text-primary-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                                  {order.product_variants.name}: {order.product_variants.value}
                               </div>
                            </div>
                          )}
                          <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">ID: #{order.orders?.id?.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                             <User size={14} />
                          </div>
                          <span className="text-xs font-bold">{order.orders?.profiles?.full_name || 'Anonymous'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">
                      ${(order.price * order.quantity).toLocaleString()}
                      <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase">x{order.quantity} units</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-start gap-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.orders?.status)}`}>
                          <Clock size={12} />
                          {order.orders?.status}
                        </div>
                        {order.orders?.status === 'pending' && (
                          <div className="mt-2 w-full max-w-[200px] p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-500 text-center shadow-sm">
                            <span className="text-[9px] font-black uppercase tracking-widest">Waiting for Guarantee</span>
                          </div>
                        )}
                        {order.orders?.status !== 'delivered' && order.orders?.status !== 'pending' && order.orders?.expected_delivery_date && (
                          <div className="mt-2 w-full max-w-[200px]">
                            <CountdownTimer targetDate={order.orders.expected_delivery_date} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden group text-left flex flex-col gap-4">
                {/* Status & ID */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 -mx-5 -mt-5 px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.orders?.status)}`}>
                    <Clock size={12} />
                    {order.orders?.status}
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">#{order.orders?.id?.slice(0, 8)}</span>
                </div>

                {/* Product Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm">
                    <img src={order.product_variants?.image_url || order.products?.images?.[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">{order.products?.name}</h4>
                    {order.product_variants && (
                       <p className="inline-block px-2 py-0.5 bg-primary-500/10 text-primary-600 rounded-md text-[9px] font-black uppercase mt-2">
                          {order.product_variants.name}: {order.product_variants.value}
                       </p>
                    )}
                  </div>
                </div>

                {/* Price & Customer Info in a distinct box */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <div>
                     <p className="text-xs text-slate-500 font-bold mb-0.5">Total Amount</p>
                     <p className="text-lg font-black text-slate-900 dark:text-white leading-none">${(order.price * order.quantity).toLocaleString()}</p>
                     <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Qty: {order.quantity} × ${order.price}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Customer</p>
                     <div className="flex items-center gap-1.5 justify-end">
                       <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                         <User size={10} />
                       </div>
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{order.orders?.profiles?.full_name || 'Anonymous'}</p>
                     </div>
                   </div>
                </div>

                {/* Cooldown Timer */}
                {order.orders?.status === 'pending' && (
                  <div className="w-full p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-500 text-center shadow-sm">
                    <span className="text-[9px] font-black uppercase tracking-widest">Waiting for Guarantee</span>
                  </div>
                )}
                {order.orders?.status !== 'delivered' && order.orders?.status !== 'pending' && order.orders?.expected_delivery_date && (
                  <div className="w-full">
                    <CountdownTimer targetDate={order.orders.expected_delivery_date} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 sm:p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mt-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    handlePageChange(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:border-primary-500 transition-colors shadow-sm"
                >
                  {[10, 20, 50, 100].map(limit => (
                    <option key={limit} value={limit}>{limit}</option>
                  ))}
                </select>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entries</span>
              </div>
              <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} / {filteredOrders.length}
              </span>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
              <span className="hidden sm:inline-block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
              </span>
              <div className="flex items-center p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-between">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                >
                  Prev
                </button>
                <div className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-500 text-xs font-black whitespace-nowrap shadow-inner border border-primary-500/10">
                  {currentPage} / {totalPages || 1}
                </div>
                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">No orders found</h3>
            <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
