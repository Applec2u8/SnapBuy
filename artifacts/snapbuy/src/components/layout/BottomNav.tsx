import { Home, ShoppingBag, Settings, ShoppingCart, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { useUnreadCount } from '../../hooks/useUnreadCount';

const BottomNav = () => {
  const { t } = useTranslation();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const unreadCount = useUnreadCount();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-[100] px-2 py-5 flex justify-around items-center shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
      <NavLink
        to="/"
        className={({ isActive }) => `flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${isActive ? 'text-primary-500 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Home size={22} />
        <span className="text-[9px] font-black uppercase tracking-tight">{t('nav_home')}</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) => `flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${isActive ? 'text-primary-500 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <ShoppingBag size={22} />
        <span className="text-[9px] font-black uppercase tracking-tight">{t('nav_shop')}</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `flex flex-col items-center gap-1.5 min-w-[64px] transition-all relative ${isActive ? 'text-primary-500 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-tight">{t('nav_cart')}</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) => `flex flex-col items-center gap-1.5 min-w-[64px] transition-all relative ${isActive ? 'text-primary-500 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="relative">
          <MessageCircle size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-black uppercase tracking-tight">{t('messages', 'Messages')}</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${isActive ? 'text-primary-500 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Settings size={22} />
        <span className="text-[9px] font-black uppercase tracking-tight">{t('settings', 'Settings')}</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
