import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ClipboardList,
  Clock,
  ExternalLink,
  Circle,
  Tag,
  CheckCircle2,
  Lock,
  Wallet
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

const VendorOverview = () => {
  const { t } = useTranslation();
  const { shop } = useAuthStore();
  const [stats, setStats] = useState({
    revenue: 0,
    pendingRevenue: 0,
    itemsSold: 0,
    ordersCount: 0,
    productCount: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      await supabase.rpc('process_auto_deliveries');
      // 1. Fetch Stats & Revenue
      const { data: salesData, error: salesError } = await supabase
        .from('order_items')
        .select(`
          price,
          quantity,
          products!inner (shop_id),
          orders!inner (created_at, status)
        `)
        .eq('products.shop_id', shop.id);

      if (salesError) throw salesError;

      const revenue = salesData?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
      const pendingRevenue = salesData?.reduce((acc, item: any) => {
        const status = item.orders?.status;
        if (status === 'pending' || status === 'processing' || status === 'shipped') {
          return acc + (item.price * item.quantity);
        }
        return acc;
      }, 0) || 0;
      const itemsSold = salesData?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

      // 2. Fetch Unique Orders
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_items!inner(shop_id)', { count: 'exact', head: true })
        .eq('order_items.shop_id', shop.id);

      if (ordersError) throw ordersError;

      // 3. Fetch Total Products
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shop.id);

      if (productError) throw productError;

      // 4. Fetch Recent Orders for Activity Feed
      const { data: recent, error: recentError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items!inner(shop_id)
        `)
        .eq('order_items.shop_id', shop.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentOrders(recent || []);

      // 5. Fetch Categories
      const { data: allCategories } = await supabase.from('categories').select('*').order('name');
      setAllCats(allCategories || []);

      const { data: shopCategories } = await supabase.from('shop_categories').select('category_id').eq('shop_id', shop.id);
      setShopCats((shopCategories || []).map(sc => sc.category_id));

      // 6. Generate Real Chart Data (Last 7 days)
      const chartDataMap: Record<string, number> = {};
      const now = new Date();

      // Initialize last 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        chartDataMap[dayStr] = 0;
      }

      salesData?.forEach((item: any) => {
        if (!item.orders?.created_at) return;
        const orderDate = new Date(item.orders.created_at);

        // Calculate difference in days (ignoring time of day for grouping)
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.floor((todayDay.getTime() - orderDay.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 6 && diffDays >= 0) {
          const dayStr = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (chartDataMap[dayStr] !== undefined) {
            chartDataMap[dayStr] += (item.price * item.quantity);
          }
        }
      });

      const actualChart = Object.keys(chartDataMap).map(key => ({
        name: key,
        sales: chartDataMap[key]
      }));
      setChartData(actualChart);

      setStats({
        revenue,
        pendingRevenue,
        itemsSold,
        ordersCount: ordersCount || 0,
        productCount: productCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (shop) {
      fetchDashboardData();
    }
  }, [shop]);

  const walletBalance = Number(shop?.sale_balance || 0) + Number(shop?.bonus_balance || 0);

  const statCards = [
    {
      label: 'GROSS SALES',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: <DollarSign size={20} />,
      trend: '+12.5%',
      isUp: true,
      color: 'bg-green-500'
    },
    {
      label: 'WALLET BALANCE',
      value: `$${walletBalance.toLocaleString()}`,
      icon: <Wallet size={20} />,
      trend: 'READY',
      isUp: true,
      color: 'bg-primary-500'
    },
    {
      label: 'PENDING REVENUE',
      value: `$${stats.pendingRevenue.toLocaleString()}`,
      icon: <Clock size={20} />,
      trend: 'HOLD',
      isUp: false,
      color: 'bg-orange-500'
    },
    {
      label: t('vendor_items_sold'),
      value: stats.itemsSold.toLocaleString(),
      icon: <ShoppingBag size={20} />,
      trend: '+8.2%',
      isUp: true,
      color: 'bg-purple-500'
    },
    {
      label: t('vendor_total_orders'),
      value: stats.ordersCount.toString(),
      icon: <ClipboardList size={20} />,
      trend: '+5.1%',
      isUp: true,
      color: 'bg-blue-500'
    },
    {
      label: t('products'),
      value: stats.productCount.toString(),
      icon: <Package size={20} />,
      trend: '0%',
      isUp: true,
      color: 'bg-indigo-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-primary-500" size={32} />
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 pb-10"
    >

      {/* Header & Refresh */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Overview</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your shop statistics</p>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          disabled={loading || isRefreshing}
          className={`p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary-500 transition-all shadow-sm`}
          title="Refresh Data"
        >
          <svg className={isRefreshing ? 'animate-spin text-primary-500' : ''} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        </button>
      </div>

      {/* Stat Grid — Financial cards top row, stat cards bottom row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className={`bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden text-left ${idx === 0 || idx === 1 ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
              <div className={`p-2 sm:p-3 rounded-2xl ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${card.isUp ? 'text-green-500' : 'text-orange-500'}`}>
                {card.trend}
                {card.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
        {/* CHART SECTION */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] min-w-0 flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Circle size={8} className="fill-red-500 text-red-500" />
                </motion.div>
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_sales_performance')}</h4>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Monitoring</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary-500 bg-primary-500/5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-500/10 w-fit">
              <TrendingUp size={14} /> +24% growth
            </div>
          </div>

          <div className="flex-1 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  hide={true}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* RECENT ACTIVITY FEED */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-w-0"
        >
          <h4 className="text-sm font-black uppercase tracking-tight mb-8">{t('vendor_recent_orders')}</h4>

          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence mode="popLayout">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    className="flex gap-4 items-center group cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight truncate">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <span className="text-[10px] font-black text-primary-500 whitespace-nowrap">${order.total_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          order.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                          {order.status}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                          <Clock size={10} /> {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-50">
                  <ClipboardList size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t('vendor_no_activity')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 group flex-shrink-0"
          >
            {t('vendor_manage_all_orders')} <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* QUOTA & CATEGORIES STATUS */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 text-left mt-4">
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <Tag size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Unlocked Categories</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{shopCats.length} Categories Available</p>
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Quota Limit</span>
              <span className="text-xl font-black text-primary-500">{shop.product_limit.toLocaleString()} Slots</span>
              {shop.quota_expires_at && (
                <span className={`text-[10px] font-bold ${new Date(shop.quota_expires_at) < new Date() ? 'text-red-500' : 'text-amber-500'}`}>
                  Expires: {new Date(shop.quota_expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allCats.length === 0 ? (
              <div className="col-span-full text-center py-6 text-slate-400 text-xs font-bold">ไม่พบหมวดหมู่</div>
            ) : allCats.map(cat => {
              const isUnlocked = shopCats.includes(cat.id);
              return (
                <div key={cat.id} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60 grayscale'}`}>
                  {cat.icon_url ? (
                    <img src={cat.icon_url} alt={cat.name} className="w-8 h-8 object-contain mb-2" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 mb-2">{cat.name.charAt(0)}</div>
                  )}
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-center">{cat.name}</span>
                  <div className="mt-2">
                    {isUnlocked ? <CheckCircle2 size={14} className="text-blue-500" /> : <Lock size={14} className="text-slate-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default VendorOverview;
