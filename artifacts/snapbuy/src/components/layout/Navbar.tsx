import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import logo from '../../assets/logo.png';
import logoName from '../../assets/logo-name.png';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Store,
  LogOut,
  Sun,
  Moon,
  Users,
  MapPin,
  CreditCard,
  Package,
  Shield,
  MessageCircle,
  UserCog,
  Settings,
  ShieldAlert,
  History,
  ChevronDown,
  Clock,
  Home,
  Heart,
  Wallet,
  Smartphone,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { supabase } from '../../lib/supabase';
import { GlobalChatWidget } from '../chat/GlobalChatWidget';

const RECENT_KEY = 'snapbuy_recent_searches';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, shop, signOut } = useAuthStore();
  const { items } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const unreadCount = useUnreadCount();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountExpanded, setIsAccountExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  // App pages for quick navigation
  const appPages = [
    { name: t('my_profile', 'My Profile'), path: '/profile/edit', icon: <Users size={14} /> },
    { name: t('my_orders', 'My Orders'), path: '/orders', icon: <Package size={14} /> },
    { name: t('address_book', 'Address Book'), path: '/address-book', icon: <MapPin size={14} /> },
    { name: t('payment_methods', 'Payment Methods'), path: '/payment-methods', icon: <CreditCard size={14} /> },
    { name: 'Home', path: '/', icon: <Home size={14} /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag size={14} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingBag size={14} /> },
    { name: 'Messages', path: '/messages', icon: <MessageCircle size={14} /> },
    { name: 'Wishlist', path: '/profile', icon: <Heart size={14} /> },
    { name: 'Wallet', path: '/payment-methods', icon: <Wallet size={14} /> },
    { name: 'Account Settings', path: '/account/management', icon: <Settings size={14} /> },
    { name: 'Security', path: '/account/security', icon: <ShieldAlert size={14} /> },
    { name: 'Login Sessions', path: '/account/login-history', icon: <Smartphone size={14} /> },
  ];

  const filteredPages = useMemo(
    () => searchQuery
      ? appPages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
      : [],
    [searchQuery, i18n.language]
  );

  const addRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const updated = [q, ...prev.filter(s => s !== q)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Live product search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, price, images, shops(name)')
          .eq('is_published', true)
          .ilike('name', `%${searchQuery.trim()}%`)
          .limit(4);
        setSearchResults(data || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 250);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 80);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = useMemo(() => theme === 'dark', [theme]);
  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const handleSelectRecent = (q: string) => {
    setSearchQuery(q);
    addRecentSearch(q);
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setIsSearchFocused(false);
  };

  const toggleLanguage = () => {
    const currentLang = i18n.language || 'en';
    i18n.changeLanguage(currentLang.startsWith('th') ? 'en' : 'th');
  };

  const showDropdown = isSearchFocused && (
    searchQuery.length === 0
      ? recentSearches.length > 0
      : filteredPages.length > 0 || searchResults.length > 0 || searchLoading
  );

  return (
    <nav className={`sticky top-0 left-0 right-0 z-[70] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-border shadow-sm transition-all duration-300`}>
      {/* Top Bar */}
      <div className={`hidden md:block bg-secondary/30 text-[11px] border-b border-border/50 transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0 pointer-events-none' : 'max-h-10 py-1 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-muted-foreground font-medium uppercase tracking-widest">
          <div className="flex gap-6">
            <Link to="/become-seller" className="hover:text-primary-500 transition-colors">{t('become_seller')}</Link>
            <Link to="/help" className="hover:text-primary-500 transition-colors">Help Center</Link>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-3 border-l border-border/50 pl-6">
              <button
                onClick={() => i18n.changeLanguage('th')}
                className={`transition-all rounded-sm overflow-hidden border-2 ${i18n.language.startsWith('th') ? 'border-primary-500 opacity-100 scale-110' : 'border-transparent opacity-40 hover:opacity-80'}`}
                title="ภาษาไทย"
              >
                <img src="https://flagcdn.com/w40/th.png" alt="TH" className="w-5 h-3.5 object-cover block" />
              </button>
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`transition-all rounded-sm overflow-hidden border-2 ${!i18n.language.startsWith('th') ? 'border-primary-500 opacity-100 scale-110' : 'border-transparent opacity-40 hover:opacity-80'}`}
                title="English"
              >
                <img src="https://flagcdn.com/w40/us.png" alt="EN" className="w-5 h-3.5 object-cover block" />
              </button>
            </div>
            <button onClick={toggleTheme} className="hover:text-primary-500 transition-colors border-l border-border/50 pl-6 flex items-center gap-2">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="font-bold">{isDark ? t('light_mode') : t('dark_mode')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between transition-all duration-300 gap-3 sm:gap-8 h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img src={logoName} alt="SnapBuy" className="h-10 sm:h-12 hidden sm:block transition-transform group-hover:scale-105" />
            <img src={logo} alt="SnapBuy" className="h-8 block sm:hidden transition-transform group-hover:scale-105" />
          </Link>

          {/* Search with Dropdown */}
          <div ref={searchContainerRef} className="flex-1 relative">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  className="w-full bg-secondary/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-500 rounded-xl sm:rounded-2xl py-2 px-4 sm:py-3 sm:px-6 pl-9 sm:pl-12 text-xs sm:text-sm outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  autoComplete="off"
                />
                <Search className="absolute left-3 sm:left-4 top-2 sm:top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
              </div>
            </form>

            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-150">
                <div className="p-2 space-y-0.5 max-h-96 overflow-y-auto">

                  {/* Recent Searches (when not typing) */}
                  {searchQuery.length === 0 && recentSearches.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Searches</p>
                        <button
                          onClick={() => { setRecentSearches([]); localStorage.removeItem(RECENT_KEY); }}
                          className="text-[9px] text-red-400 hover:text-red-600 font-bold uppercase"
                        >Clear</button>
                      </div>
                      {recentSearches.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectRecent(r)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors text-left"
                        >
                          <Clock size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{r}</span>
                          <ArrowRight size={12} className="ml-auto text-slate-300 flex-shrink-0" />
                        </button>
                      ))}
                    </>
                  )}

                  {/* Page Shortcuts */}
                  {filteredPages.length > 0 && (
                    <>
                      <div className="px-3 pt-2 pb-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pages</p>
                      </div>
                      {filteredPages.map((page) => (
                        <Link
                          key={page.path}
                          to={page.path}
                          onClick={() => { setIsSearchFocused(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <span className="text-primary-500">{page.icon}</span>
                          <span>{page.name}</span>
                          <ArrowRight size={12} className="ml-auto text-slate-300" />
                        </Link>
                      ))}
                    </>
                  )}

                  {/* Live Product Results */}
                  {searchQuery.length >= 2 && (
                    <>
                      {searchLoading ? (
                        <div className="px-3 py-4 text-center">
                          <div className="w-4 h-4 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <div className="px-3 pt-2 pb-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Products</p>
                          </div>
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={() => { addRecentSearch(searchQuery); setIsSearchFocused(false); setSearchQuery(''); }}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                              <img
                                src={product.images?.[0] || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=?'}
                                alt={product.name}
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">${product.price?.toLocaleString()}</p>
                              </div>
                              <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                            </Link>
                          ))}
                        </>
                      ) : null}

                      {/* Search all button */}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={() => { addRecentSearch(searchQuery); navigate(`/shop?search=${encodeURIComponent(searchQuery)}`); setIsSearchFocused(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl transition-colors text-left font-bold"
                        >
                          <Search size={14} />
                          Search products for "{searchQuery}"
                          <ArrowRight size={12} className="ml-auto" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-6">
            <Link to="/messages" className="relative p-2 hover:bg-secondary dark:hover:bg-slate-800 rounded-xl transition-colors group">
              <MessageCircle className="text-foreground group-hover:text-primary-500 transition-colors" size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 hover:bg-secondary dark:hover:bg-slate-800 rounded-xl transition-colors group">
              <ShoppingBag className="text-foreground group-hover:text-primary-500 transition-colors" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[8px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center">
              {user ? (
                <div className="relative group border-l border-border pl-6 h-full flex items-center cursor-pointer py-4">
                  <div className="flex flex-col items-end text-right group-hover:text-primary-500 transition-colors">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('manage_account')}</span>
                    <span className="text-sm font-bold truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
                  </div>

                  <div className="absolute top-full right-0 mt-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-[80]">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border overflow-hidden">
                      <div className="p-4 bg-secondary/30 border-b border-border">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('manage_account')}</p>
                      </div>
                      <div className="py-2">

                        {[
                          { label: t('Dashboard'), icon: <LayoutDashboard size={16} />, to: '/dashboard' }
                        ].map((link) => (
                          <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-500/5 hover:text-primary-500 transition-colors">
                            {link.icon} {link.label}
                          </Link>
                        ))}

                        <div className="flex flex-col">
                          <button
                            onClick={(e) => { e.preventDefault(); setIsAccountExpanded(!isAccountExpanded); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary-500/5 hover:text-primary-500 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <UserCog size={16} /> Account
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isAccountExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <div className={`overflow-hidden transition-all duration-300 ${isAccountExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-secondary/10 pl-4 py-1 flex flex-col">
                              <Link to="/account/management" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
                                <Settings size={14} /> Account Settings
                              </Link>
                              <Link to="/account/security" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
                                <ShieldAlert size={14} /> Security
                              </Link>
                              <Link to="/account/login-history" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
                                <History size={14} /> Login Sessions
                              </Link>
                            </div>
                          </div>
                        </div>

                        {[
                          { label: t('my_profile'), icon: <Users size={16} />, to: '/profile/edit' },
                          ...(profile?.role === 'admin' ? [{ label: 'System Admin', icon: <Shield size={16} />, to: '/admin' }] : []),
                          { label: t('my_orders'), icon: <Package size={16} />, to: '/orders' },
                          { label: t('address_book'), icon: <MapPin size={16} />, to: '/address-book' },
                          { label: t('payment_methods'), icon: <CreditCard size={16} />, to: '/payment-methods' },
                        ].map((link) => (
                          <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-500/5 hover:text-primary-500 transition-colors">
                            {link.icon} {link.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-border py-2 bg-primary-500/5">
                        <Link to="/vendor/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-primary-600 hover:bg-primary-500 hover:text-white transition-all">
                          <Store size={16} /> {t('seller_center')}
                        </Link>
                        {shop && (
                          <Link to={`/shop/${shop.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                            <ShoppingBag size={16} /> {t('my_shop')}
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-border">
                        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={16} /> {t('logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-primary-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-600 transition-all shadow-md">
                  {t('login').toUpperCase()}
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="hidden p-2 hover:bg-secondary dark:hover:bg-slate-800 rounded-xl transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-background/95 backdrop-blur-md z-40 p-4 space-y-4 animate-fade-in overflow-y-auto pb-20">
          <form onSubmit={handleSearch} className="relative">
            <input type="text" placeholder={t('search_placeholder')} className="w-full bg-secondary rounded-xl py-3 px-4 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Search className="absolute right-4 top-3 text-slate-400" size={20} />
          </form>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/vendor/dashboard" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-2xl">
              <Store className="text-primary-500" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t('seller_center')}</span>
            </Link>
            <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-secondary rounded-2xl">
              <img src={i18n.language.startsWith('th') ? "https://flagcdn.com/w40/us.png" : "https://flagcdn.com/w40/th.png"} alt="Language" className="w-6 h-4 object-cover rounded-sm shadow-sm" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{i18n.language.startsWith('th') ? 'English' : 'ไทย'}</span>
            </button>
            <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-2xl">
              {isDark ? <Sun className="text-primary-500" /> : <Moon className="text-primary-500" />}
              <span className="text-[10px] font-bold uppercase tracking-tight">{isDark ? t('light_mode') : t('dark_mode')}</span>
            </button>
            <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-2xl">
              <Package className="text-primary-500" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t('my_orders')}</span>
            </Link>
          </div>
          <div className="border-t border-border pt-4">
            {user ? (
              <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold">
                <LogOut size={20} /> {t('logout')}
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-center p-4 bg-primary-500 text-white rounded-2xl font-bold">
                {t('login')} / {t('register')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Global Chat Widget — Speed Dial FAB + Sliding Drawer */}
      <GlobalChatWidget />
    </nav>
  );
};

export default Navbar;
