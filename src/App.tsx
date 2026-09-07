import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home/index';
import ProductDetail from './pages/ProductDetail/index';
import Cart from './pages/Cart/index';
import Checkout from './pages/Checkout/index';
import Profile from './pages/Profile/index';
import Orders from './pages/Orders/index';
import Login from './pages/Login/index';
import Register from './pages/Register/index';
import BecomeSeller from './pages/BecomeSeller/index';
import VendorDashboard from './pages/VendorDashboard/index';
import PromoteProduct from './pages/PromoteProduct/index';
import UserDashboard from './pages/UserDashboard/index';
import ShopDetail from './pages/ShopDetail/index';
import AddressBook from './pages/AddressBook/index';
import PaymentMethods from './pages/PaymentMethods/index';
import Shop from './pages/Shop/index';
import ScrollToTop from './components/ScrollToTop';
import './i18n';
import { Toaster, toast } from 'sonner';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import { recordLoginSession, recordLogout } from './lib/sessionService';
import { useThemeStore } from './store/useThemeStore';
import ProfileEdit from './pages/ProfileEdit/index';
import OrderSuccess from './pages/OrderSuccess/index';
import Admin from './pages/Admin';
import UserMessages from './pages/Messages/index';
import AccountManagement from './pages/AccountManagement/index';
import AccountSecurity from './pages/AccountSecurity/index';
import LoginHistory from './pages/LoginHistory/index';

import { MotionConfig } from 'framer-motion';

function App() {
  const { setUser, fetchProfile, setLoading, user, profile, loading } = useAuthStore();
  const { theme, reduceMotion } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // console.log("Initial session:", session, "Error:", error);
      if (error) {
        toast.error("Auth Error: " + error.message);
      }
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth event:', event, 'Session:', session);
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);

        // Record session on actual new logins OR when restoring an existing session
        // (INITIAL_SESSION fires on page refresh with active session — dedup via sessionStorage)
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          const alreadyRecorded = sessionStorage.getItem('snapbuy_session_db_id');
          if (!alreadyRecorded) {
            recordLoginSession(session.user.id, session.access_token ?? null);
          }
        }
      } else {
        // Record logout before clearing state
        const prevUser = useAuthStore.getState().user;
        if (prevUser && event === 'SIGNED_OUT') {
          recordLogout(prevUser.id);
        }
        setUser(null);
        setLoading(false);
      }
    });

    // Check for hash errors
    if (window.location.hash && window.location.hash.includes('error_description')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = params.get('error_description');
      if (errorDesc) {
        toast.error("Google Auth Error: " + errorDesc.replace(/\+/g, ' '));
      }
    }

    setMounted(true);
    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile, setLoading]);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme class to html element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, mounted]);

  // Loading indicator for auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing SnapBuy...</p>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/become-seller" element={<BecomeSeller />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            user ? <UserDashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/vendor/dashboard" element={
            user ? <VendorDashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/vendor/promote/:id" element={
            user ? <PromoteProduct /> : <Navigate to="/login" replace />
          } />
          <Route path="/admin/*" element={
            user && profile?.role === "admin" ? <Admin /> : <Navigate to="/" replace />
          } />

          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/shop/:id" element={<ShopDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/messages" element={user ? <UserMessages /> : <Navigate to="/login" replace />} />
          <Route path="/account/management" element={user ? <AccountManagement /> : <Navigate to="/login" replace />} />
          <Route path="/account/security" element={user ? <AccountSecurity /> : <Navigate to="/login" replace />} />
          <Route path="/account/login-history" element={user ? <LoginHistory /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
