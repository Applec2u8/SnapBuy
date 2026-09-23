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
  Ticket,
  Bot
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
import { DatabaseDashboard } from './views/Database/DatabaseDashboard.tsx';
import { BotSimulations } from './views/BotSimulations/BotSimulations.tsx';
import { ManualManagement } from './views/Manuals/ManualManagement.tsx';
import { Activity, Wallet, SlidersHorizontal, MessageCircle, Database, Book } from 'lucide-react';
import { useAdminSupportNotification } from './hooks/useAdminSupportNotification';

const ADMIN_DASHBOARD_STORAGE_PREFIX = 'admin-dashboard-state';
const adminTabKeys = ['dashboard', 'users', 'op_users', 'shops', 'products', 'payments', 'database', 'logs', 'support', 'admin_messages', 'wallets', 'site_config', 'store_quotas', 'bot_traffic', 'manuals'] as const;

type AdminTab = (typeof adminTabKeys)[number];

const getAdminPageStorageKey = (key: string) => {
  if (typeof window === 'undefined') return key;
  return `${ADMIN_DASHBOARD_STORAGE_PREFIX}:${key}:${window.location.pathname}`;
};

const Admin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window === 'undefined') return 'dashboard';

    const storedTab = sessionStorage.getItem(getAdminPageStorageKey('active-tab')) as AdminTab | null;
    // don't restore admin_messages from storage to avoid sticky highlight after refresh
    if (storedTab === 'admin_messages') return 'dashboard';
    return storedTab && adminTabKeys.includes(storedTab) ? storedTab : 'dashboard';
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedProductShopId, setSelectedProductShopId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(getAdminPageStorageKey('sidebar-open')) === 'true';
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    isRefreshing,
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // avoid persisting 'admin_messages' as the active tab so it doesn't stay highlighted after refresh
    if (activeTab === 'admin_messages') {
      // remove any stored active-tab for this path
      try { sessionStorage.removeItem(getAdminPageStorageKey('active-tab')); } catch (e) { }
    } else {
      sessionStorage.setItem(getAdminPageStorageKey('active-tab'), activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(getAdminPageStorageKey('sidebar-open'), String(isSidebarOpen));
  }, [isSidebarOpen]);



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

  const menuItems = {
    dashboard: { id: 'dashboard', label: t('admin_dashboard'), icon: LayoutDashboard },
    users: { id: 'users', label: t('admin_users'), icon: Users },
    op_users: { id: 'op_users', label: t('admin_op_users'), icon: Shield },
    shops: { id: 'shops', label: t('admin_shops'), icon: Store },
    products: { id: 'products', label: t('admin_products'), icon: Package },
    payments: { id: 'payments', label: t('admin_payments'), icon: CreditCard },
    store_quotas: { id: 'store_quotas', label: 'Store Quotas', icon: Ticket },
    wallets: { id: 'wallets', label: 'Wallet Top-up', icon: Wallet },
    logs: { id: 'logs', label: 'Activity Logs', icon: Activity },
    support: { id: 'support', label: 'Channels', icon: MessageSquare },
    admin_messages: { id: 'admin_messages', label: 'Support Messages', icon: MessageCircle },
    site_config: { id: 'site_config', label: 'Site Config', icon: SlidersHorizontal },
    database: { id: 'database', label: 'Database', icon: Database },
    bot_traffic: { id: 'bot_traffic', label: 'A/G Bots', icon: Bot },
    manuals: { id: 'manuals', label: 'User Manual', icon: Book },
  } as const;

  const groups = [
    { id: 'grp_users', label: 'Users', items: ['users', 'op_users', 'bot_traffic'], icon: Users },
    { id: 'grp_shops', label: 'Shops', items: ['shops', 'products'], icon: Store },
    { id: 'grp_payments', label: 'Payments', items: ['payments', 'wallets', 'store_quotas'], icon: CreditCard },
    { id: 'grp_support', label: 'Support', items: ['logs', 'support', 'site_config', 'manuals'], icon: Activity },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return { grp_users: false, grp_shops: false, grp_payments: false, grp_support: false };
    try {
      const raw = sessionStorage.getItem(getAdminPageStorageKey('open-groups'));
      if (raw) return JSON.parse(raw);
      const defaults: Record<string, boolean> = {};
      groups.forEach(g => {
        defaults[g.id] = g.items.includes((activeTab as string));
      });
      return defaults;
    } catch (e) {
      const defaults: Record<string, boolean> = {};
      groups.forEach(g => {
        defaults[g.id] = g.items.includes((activeTab as string));
      });
      return defaults;
    }
  });

  // persist openGroups so collapse state survives reload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(getAdminPageStorageKey('open-groups'), JSON.stringify(openGroups));
    } catch (e) { }
  }, [openGroups]);

  // auto-open the group that contains the active tab (useful on refresh/navigation)
  useEffect(() => {
    groups.forEach(g => {
      if ((g.items as string[]).includes(activeTab as string)) {
        setOpenGroups(prev => (prev[g.id] ? prev : { ...prev, [g.id]: true }));
      }
    });
  }, [activeTab]);

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

          <nav className="flex-1 space-y-3 pb-8 overflow-y-auto">
            {/* Dashboard as single top item */}
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => {
                setActiveTab('dashboard');
                setSelectedUserId(null);
                setSelectedShopId(null);
                setSelectedProductShopId(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${activeTab === 'dashboard'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-white' : 'group-hover:text-primary-500'} />
                <span className="font-black text-xs uppercase tracking-widest">{t('admin_dashboard')}</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'dashboard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
            </motion.button>

            {/* Groups */}
            {groups.map((g) => {
              const GroupIcon: any = g.icon;
              return (
                <div key={g.id} className="space-y-1">
                  <button
                    onClick={() => setOpenGroups(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                    aria-expanded={!!openGroups[g.id]}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-400 uppercase tracking-widest text-[10px] font-black hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-3">
                      <GroupIcon size={16} className="text-slate-400 group-hover:text-primary-500" />
                      {g.label}
                    </span>
                    <ChevronRight size={14} className={`${openGroups[g.id] ? 'rotate-90' : ''} transition-transform`} />
                  </button>

                  <AnimatePresence>
                    {openGroups[g.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-1 px-1"
                      >
                        {g.items.map((id) => {
                          const item = (menuItems as any)[id];
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id as any);
                                setSelectedUserId(null);
                                setSelectedShopId(null);
                                setSelectedProductShopId(null);
                                setIsSidebarOpen(false);
                                if (item.id === 'admin_messages') clearSupportUnread();
                              }}
                              className={`w-full flex items-center justify-between p-2.5 pl-6 rounded-xl transition-all group ${activeTab === item.id
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={16} className={activeTab === item.id ? 'text-white' : 'group-hover:text-primary-500'} />
                                <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                              </div>
                              <ChevronRight size={12} className={activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Highlighted separate items: Support Messages & Database */}
            <div className="space-y-2 pt-2">
              {/* Support Messages - highlighted */}
              <motion.button
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  setActiveTab('admin_messages');
                  setIsSidebarOpen(false);
                  clearSupportUnread();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${activeTab === 'admin_messages'
                  ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white shadow-lg'
                  : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className={activeTab === 'admin_messages' ? 'text-white' : 'text-primary-500'} />
                  <span className="font-black text-xs uppercase tracking-widest">Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadSupportCount > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse ${activeTab === 'admin_messages'
                      ? 'bg-white text-primary-600'
                      : 'bg-red-500 text-white'
                      }`}>
                      {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
                    </span>
                  )}
                  <ChevronRight size={14} className={activeTab === 'admin_messages' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                </div>
              </motion.button>

              {/* Database - highlighted */}
              <motion.button
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.32 }}
                onClick={() => {
                  setActiveTab('database');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${activeTab === 'database'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Database size={20} className={activeTab === 'database' ? 'text-white' : 'group-hover:text-primary-500'} />
                  <span className="font-black text-xs uppercase tracking-widest">Database</span>
                </div>
                <ChevronRight size={14} className={activeTab === 'database' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
              </motion.button>
            </div>
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
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50 flex-shrink-0 will-change-transform">
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
            <div className="relative hidden md:block z-50">
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t('admin_global_search')}
                className="bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-primary-500 rounded-2xl py-2 px-4 pl-10 text-[10px] font-bold uppercase tracking-widest outline-none transition-all w-64"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={14} />

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchOpen && searchQuery.trim() && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSearchOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      {Object.values(menuItems).filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                        <div className="max-h-64 overflow-y-auto py-2">
                          {Object.values(menuItems)
                            .filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(item => {
                              const Icon = (item as any).icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setActiveTab(item.id as any);
                                    setSearchQuery('');
                                    setIsSearchOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                                >
                                  <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                                    <Icon size={16} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.label}</p>
                                    <p className="text-[10px] text-slate-500 capitalize">{item.id.replace('_', ' ')}</p>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400">
                          <Search size={24} className="mx-auto mb-2 opacity-30" />
                          <p className="text-xs font-bold">No results found</p>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
                    onBack={() => {
                      setSelectedUserId(null);
                    }}
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
                    {activeTab === 'dashboard' && <AdminDashboard stats={stats} loading={loading || isRefreshing} onRefresh={refreshData} />}
                    {activeTab === 'users' && (
                      <UserManagement
                        users={users}
                        shops={shops}
                        loading={loading || isRefreshing}
                        onSelectUser={setSelectedUserId}
                        onRefresh={refreshData}
                      />
                    )}
                    {activeTab === 'op_users' && (
                      <OPUserManagement
                        users={users}
                        loading={loading || isRefreshing}
                        onUpdateUser={updateUserMetadata}
                        onRefresh={refreshData}
                      />
                    )}
                    {activeTab === 'shops' && <ShopManagement shops={shops} loading={loading || isRefreshing} onSelectShop={handleSelectShop} onRefresh={refreshData} />}
                    {activeTab === 'products' && (
                      <ProductManagement
                        products={products}
                        categories={categories}
                        totalItems={totalProductsCount}
                        loading={productsLoading || isRefreshing}
                        onFetch={fetchProducts}
                        onUpdate={updateProductStats}
                        shopId={selectedProductShopId}
                      />
                    )}
                    {activeTab === 'store_quotas' && <StoreQuotas />}
                    {activeTab === 'database' && <DatabaseDashboard />}
                    {activeTab === 'payments' && (
                      <PaymentManagement
                        users={users}
                        loading={loading || isRefreshing}
                        onUpdateUser={updateUserMetadata}
                        onRefresh={refreshData}
                      />
                    )}
                    {activeTab === 'logs' && <ActivityLogManagement />}
                    {activeTab === 'support' && <SupportManagement />}
                    {activeTab === 'admin_messages' && <AdminMessages />}
                    {activeTab === 'wallets' && (
                      <WalletManagement
                        users={users}
                        logAction={logAction}
                        refreshData={async () => { await refreshData(); }}
                        loading={loading || isRefreshing}
                      />
                    )}
                    {activeTab === 'site_config' && <SiteSettings />}
                    {activeTab === 'bot_traffic' && <BotSimulations />}
                    {activeTab === 'manuals' && <ManualManagement />}
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
