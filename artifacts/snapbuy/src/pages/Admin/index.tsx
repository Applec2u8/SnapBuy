import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Settings,
  ChevronRight,
  Search,
  LogOut,
  Menu,
  RefreshCcw,
  CreditCard,
  Shield,
  MessageSquare,
  Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './hooks/useAdmin';
import { useAdminActivityLog } from './hooks/useAdminActivityLog';
import { AdminDashboard } from './views/Dashboard/AdminDashboard.tsx';
import { UserManagement } from './views/Users/UserManagement.tsx';
import { ShopManagement } from './views/Shops/ShopManagement.tsx';
import { ShopDetail } from './views/Shops/ShopDetail.tsx';
import { ProductManagement } from './views/Products/ProductManagement.tsx';
import { UserDetail } from './views/Users/components/UserDetail.tsx';
import { PaymentManagement } from './views/Payments/PaymentManagement.tsx';
import { OPUserManagement } from './views/OPUsers/OPUserManagement.tsx';
import { NotificationDropdown } from './components/NotificationDropdown.tsx';
import { ActivityLogManagement } from './views/ActivityLogs/ActivityLogManagement.tsx';
import { SupportManagement } from './views/Support/SupportManagement.tsx';
import { AdminMessages } from './views/Support/AdminMessages.tsx';
import { WalletManagement } from './views/Wallets/WalletManagement.tsx';
import { SiteSettings } from './views/Settings/SiteSettings.tsx';
import { StoreQuotas } from './views/StoreQuotas/StoreQuotas.tsx';
import { Activity, Wallet, SlidersHorizontal, MessageCircle } from 'lucide-react';
import { useAdminSupportNotification } from './hooks/useAdminSupportNotification';

const Admin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'op_users' | 'shops' | 'products' | 'payments' | 'logs' | 'support' | 'admin_messages' | 'wallets' | 'site_config' | 'store_quotas'>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedProductShopId, setSelectedProductShopId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ── Activity Log ──────────────────────────────────────────────────
  const {
    logs,
    unreadCount,
    isLoading: notifLoading,
    fetchLogs,
    logAction,
    markAllRead,
  } = useAdminActivityLog();

  // ── Support Notifications ─────────────────────────────────────────
  const { unreadSupportCount, clearSupportUnread } = useAdminSupportNotification(
    () => setActiveTab('admin_messages')
  );

  // ── Admin Data ────────────────────────────────────────────────────
  const {
    stats,
    users,
    shops,
    categories,
    products,
    totalProductsCount,
    loading,
    productsLoading,
    fetchProducts,
    updateProductStats,
    updateUserMetadata,
    refreshData
  } = useAdmin({ logAction });

  // Fetch logs on mount
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Scroll to top when tab or selected user changes
  useEffect(() => {
    const contentArea = document.getElementById('admin-content-area');
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, selectedUserId]);

  const handleOpenNotif = () => {
    setIsNotifOpen(true);
    markAllRead();
    // Refresh log data when panel is opened
    fetchLogs();
  };

  const handleSelectShop = (shopId: string | null) => {
    setSelectedShopId(shopId);
    setSelectedProductShopId(null);
    setSelectedUserId(null);
  };

  const handleOpenShopProducts = (shopId: string) => {
    setSelectedShopId(null);
    setSelectedProductShopId(shopId);
    setSelectedUserId(null);
    setActiveTab('products');
  };

  const menuItems = [
    { id: 'dashboard', label: t('admin_dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('admin_users'), icon: Users },
    { id: 'op_users', label: t('admin_op_users'), icon: Shield },
    { id: 'shops', label: t('admin_shops'), icon: Store },
    { id: 'products', label: t('admin_products'), icon: Package },
    { id: 'payments', label: t('admin_payments'), icon: CreditCard },
    { id: 'store_quotas', label: 'Store Quotas', icon: Ticket },
    { id: 'wallets',     label: 'Wallet Top-up',       icon: Wallet },
    { id: 'logs',        label: 'Activity Logs',        icon: Activity },
    { id: 'support',     label: 'Support Channels',     icon: MessageSquare },
    { id: 'admin_messages', label: 'Support Messages', icon: MessageCircle },
    { id: 'site_config', label: 'Site Settings',        icon: SlidersHorizontal },
  ];

  return (
    <div className="h-screen bg-background dark:bg-slate-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
        className={`
          fixed inset-y-0 left-0 z-[100] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform pb-8
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-y-0
        `}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-3 mb-10 px-2 flex-shrink-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20"
            >
              <Settings size={24} />
            </motion.div>
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl">{t('admin_title')}</h1>
              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest leading-none">{t('admin_central')}</p>
            </motion.div>
          </div>

          <nav className="flex-1 space-y-1 pb-8 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (index * 0.05) }}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedUserId(null);
                    setSelectedShopId(null);
                    setSelectedProductShopId(null);
                    setIsSidebarOpen(false);
                    if (item.id === 'admin_messages') clearSupportUnread();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${activeTab === item.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-primary-500'} />
                    <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.id === 'admin_messages' && unreadSupportCount > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse ${
                        activeTab === item.id
                          ? 'bg-white text-primary-600'
                          : 'bg-red-500 text-white'
                      }`}>
                        {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
                      </span>
                    )}
                    <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                  </div>
                </motion.button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 pb-8">
            <Link to="/" className="w-full flex items-center gap-3 p-3 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors uppercase font-black text-xs tracking-widest rounded-xl">
              <LogOut size={20} />
              {t('admin_exit')}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar menu"
              className="lg:hidden p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeTab}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-2xl hidden sm:block"
              >
                {t(`admin_${activeTab}`)}
              </motion.h2>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder={t('admin_global_search')}
                className="bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-primary-500 rounded-2xl py-2 px-4 pl-10 text-[10px] font-bold uppercase tracking-widest outline-none transition-all w-64"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={14} />
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={loading}
              className={`p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all ${loading ? 'animate-spin' : 'hover:text-primary-500'}`}
              title={t('admin_refresh')}
            >
              <RefreshCcw size={20} />
            </button>

            {/* Notification Bell */}
            <NotificationDropdown
              isOpen={isNotifOpen}
              logs={logs}
              unreadCount={unreadCount}
              isLoading={notifLoading}
              onOpen={handleOpenNotif}
              onClose={() => setIsNotifOpen(false)}
              onRefresh={fetchLogs}
            />

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('admin_super_admin')}</p>
                <p className="text-[8px] font-bold text-primary-500 uppercase tracking-widest leading-none">{t('admin_status_active')}</p>
              </div>
              <div className="w-10 h-10 rounded-xl premium-gradient p-0.5 shadow-md">
                <div className="w-full h-full rounded-[10px] overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                  <Users size={20} className="text-primary-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div id="admin-content-area" className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedUserId || activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedUserId ? (
                  <UserDetail
                    userId={selectedUserId}
                    users={users}
                    onBack={() => setSelectedUserId(null)}
                    onUpdateProduct={updateProductStats}
                    onUpdateUser={updateUserMetadata}
                  />
                ) : selectedShopId ? (
                  <ShopDetail
                    shopId={selectedShopId}
                    onBack={() => handleSelectShop(null)}
                    onViewProducts={handleOpenShopProducts}
                  />
                ) : (
                  <>
                    {activeTab === 'dashboard' && <AdminDashboard stats={stats} loading={loading} />}
                    {activeTab === 'users' && (
                      <UserManagement
                        users={users}
                        shops={shops}
                        loading={loading}
                        onSelectUser={setSelectedUserId}
                      />
                    )}
                    {activeTab === 'op_users' && (
                      <OPUserManagement
                        users={users}
                        loading={loading}
                        onUpdateUser={updateUserMetadata}
                      />
                    )}
                    {activeTab === 'shops' && <ShopManagement shops={shops} loading={loading} onSelectShop={handleSelectShop} />}
                    {activeTab === 'products' && (
                      <ProductManagement
                        products={products}
                        categories={categories}
                        totalItems={totalProductsCount}
                        loading={productsLoading}
                        onFetch={fetchProducts}
                        onUpdate={updateProductStats}
                        shopId={selectedProductShopId}
                      />
                    )}
                    {activeTab === 'store_quotas' && <StoreQuotas />}
                    {activeTab === 'payments' && (
                      <PaymentManagement
                        users={users}
                        loading={loading}
                        onUpdateUser={updateUserMetadata}
                      />
                    )}
                    {activeTab === 'logs' && <ActivityLogManagement />}
                    {activeTab === 'support' && <SupportManagement />}
                    {activeTab === 'admin_messages' && <AdminMessages />}
                    {activeTab === 'wallets' && (
                      <WalletManagement
                        users={users}
                        logAction={logAction}
                        refreshData={refreshData}
                      />
                    )}
                    {activeTab === 'site_config' && <SiteSettings />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
