import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import BottomNav from './BottomNav.tsx';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { theme } = useThemeStore();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isVendorPage = location.pathname.startsWith('/vendor');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isProfileEditPage = location.pathname === '/profile/edit';
  const isMessagesPage = location.pathname === '/messages';
  const isSettingsPage = location.pathname === '/settings' || location.pathname === '/security' || location.pathname === '/address-book' || location.pathname === '/payment-methods';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-clip">
      <div className={`sticky top-0 left-0 right-0 z-[70] w-full ${isVendorPage || isAdminPage ? 'hidden' : ''}`}>
        <Navbar />
      </div>
      <main className={`flex-grow flex flex-col w-full ${(isVendorPage || isAdminPage || isProfilePage || isProfileEditPage || isSettingsPage || isMessagesPage) ? 'p-0' : 'px-4 pt-6 pb-20 sm:pt-10 sm:pb-12'} ${isMessagesPage ? 'h-[calc(100vh-64px)] overflow-hidden' : ''}`}>
        {children}
      </main>
      <div className={(isVendorPage || isAdminPage || isMessagesPage) ? 'hidden' : (isProfilePage ? 'hidden sm:block' : '')}>
        <Footer />
      </div>
      {!(isVendorPage || isAdminPage || isMessagesPage) && <BottomNav />}
    </div>
  );
};

export default Layout;
