import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  ChevronLeft,
  Store,
  X,
  ChevronDown,
  Plus,
  MessageSquare,
  Zap,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../lib/supabase';

interface VendorSidebarProps {
  shop: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const VendorSidebar = ({ 
  shop, 
  isOpen, 
  setIsOpen, 
  activeTab, 
  setActiveTab 
}: VendorSidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, shops, setShop } = useAuthStore();
  const [showShopSwitcher, setShowShopSwitcher] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingGuaranteeCount, setPendingGuaranteeCount] = useState(0);
  
  useEffect(() => {
    if (!shop || !user) return;

    // Initial count
    const fetchUnread = async () => {
      try {
        const { data: convs, error: convsError } = await supabase
          .from('conversations')
          .select('id')
          .eq('shop_id', shop.id);

        if (convsError) throw convsError;

        if (convs && convs.length > 0) {
          const convIds = convs.map(c => c.id);
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .neq('sender_id', user.id)
            .eq('is_read', false)
            .eq('is_deleted', false);

          if (countError) throw countError;
          setUnreadCount(count || 0);
        } else {
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Error fetching vendor unread count:', err);
      }
    };

    fetchUnread();

    // Real-time subscription to messages table modifications
    const channelName = `vendor-unread-messages-${shop.id}-${Math.random().toString(36).substring(7)}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [shop, user]);

  useEffect(() => {
    if (!shop) return;

    const fetchPendingGuarantees = async () => {
      try {
        const { count, error } = await supabase
          .from('order_items')
          .select('id', { count: 'exact', head: true })
          .eq('shop_id', shop.id)
          .eq('guarantee_paid', false);

        if (error) throw error;
        setPendingGuaranteeCount(count || 0);
      } catch (err) {
        console.error('Error fetching pending guarantee count:', err);
      }
    };

    fetchPendingGuarantees();

    const channelName = `vendor-pending-guarantee-${shop.id}-${Math.random().toString(36).substring(7)}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `shop_id=eq.${shop.id}`
        },
        () => {
          fetchPendingGuarantees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [shop]);

  const menuItems = [
    { id: 'overview', label: t('dashboard_overview'), icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: t('inventory'), icon: <Package size={20} /> },
    { id: 'guarantee', label: 'Guarantee', icon: <ShieldCheck size={20} />, badge: pendingGuaranteeCount > 0 ? pendingGuaranteeCount : null },
    { id: 'orders', label: t('sales_orders'), icon: <ShoppingBag size={20} /> },
    { id: 'messages', label: t('messages'), icon: <MessageSquare size={20} />, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'settings', label: t('shop_settings'), icon: <Settings size={20} /> },
  ];

  const boostItem = { id: 'bulk-promote', label: 'Bulk Boost', icon: <Zap size={20} /> };
  const quotaItem = { id: 'quota', label: 'Store Quota', icon: <Zap size={20} /> };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[30] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
        className={`
          fixed inset-y-0 left-0 z-[100] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 flex-shrink-0 print:hidden pb-8 will-change-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full text-left">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20"
              >
                <ShoppingBag className="text-white" size={18} />
              </motion.div>
              <span className="text-xl font-black tracking-tighter text-primary-500 italic">SnapBuy</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden p-3 hover:bg-secondary rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Shop Switcher Profile */}
          <div className="p-6 relative">
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => setShowShopSwitcher(!showShopSwitcher)}
              className="bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl p-4 border border-primary-500/10 cursor-pointer hover:bg-primary-500/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                   {shop?.logo_url ? <img src={shop.logo_url} className="w-full h-full object-cover" /> : <Store size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mb-1">{t('my_shop')}</p>
                  <p className="font-bold text-sm truncate">{shop?.name}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showShopSwitcher ? 'rotate-180' : ''}`} />
              </div>
            </motion.div>

            {/* Shop Switcher Dropdown */}
            <AnimatePresence>
              {showShopSwitcher && (
                <motion.div 
                  initial={{ y: 10, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 10, opacity: 0, scale: 0.95 }}
                  className="absolute left-6 right-6 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto py-2">
                    {shops.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setShop(s);
                          setShowShopSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left ${shop?.id === s.id ? 'bg-primary-500/5' : ''}`}
                      >
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {s.logo_url ? <img src={s.logo_url} className="w-full h-full object-cover" /> : <Store size={14} className="text-slate-400" />}
                        </div>
                        <span className={`text-xs font-bold truncate ${shop?.id === s.id ? 'text-primary-500' : 'text-slate-600 dark:text-slate-300'}`}>{s.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                     <button 
                      onClick={() => navigate('/become-seller')}
                      className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:bg-primary-500/5 rounded-xl transition-colors"
                     >
                       <Plus size={14} /> {t('add_shop', 'Add New Shop')}
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-2 py-2 pb-8 overflow-y-auto">
            {menuItems.map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + (idx * 0.05) }}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); 
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-colors relative
                  ${activeTab === item.id 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-white dark:border-slate-900 shadow-sm">
                    {item.badge}
                  </span>
                )}
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </motion.button>
            ))}

            {/* Divider */}
            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            {/* Shop Wallet Button */}
            <button
              onClick={() => { setActiveTab('wallet'); setIsOpen(false); }}
              className={`
                w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group
                ${activeTab === 'wallet'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 font-black'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-bold border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${activeTab === 'wallet' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                  <Wallet size={20} />
                </div>
                <span className="text-sm tracking-tight">Shop Wallet</span>
              </div>
              {activeTab === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            {/* Quota Button */}
            <button
              onClick={() => { setActiveTab(quotaItem.id); setIsOpen(false); }}
              className={`
                w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group
                ${activeTab === quotaItem.id 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 font-black' 
                  : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 font-bold border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${activeTab === quotaItem.id ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-500/20'}`}>
                  {quotaItem.icon}
                </div>
                <span className="text-sm tracking-tight">{quotaItem.label}</span>
              </div>
              {activeTab === quotaItem.id && <motion.div layoutId="activeTabIndicator" className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            {/* Bulk Boost Button */}
            <button
              onClick={() => { setActiveTab(boostItem.id); setIsOpen(false); }}
              className={`
                w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group
                ${activeTab === boostItem.id 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 font-black' 
                  : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-bold'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${activeTab === boostItem.id ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
                  {boostItem.icon}
                </div>
                <span className="text-sm tracking-tight">{boostItem.label}</span>
              </div>
              {!activeTab && <div className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest">New</div>}
            </button>
          </nav>

          {/* Sidebar Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 border-t border-slate-200 dark:border-slate-800"
          >
            <Link 
              to="/" 
              aria-label="Go to home"
              className="w-full flex items-center gap-2 px-3 py-3 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-widest group rounded-xl"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> <span className="truncate">{t('home')}</span>
            </Link>
          </motion.div>
        </div>
      </aside>
    </>
  );
};

export default VendorSidebar;
