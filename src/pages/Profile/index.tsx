import {
  User,
  Shield,
  ShieldAlert,
  Settings,
  History,
  Bell,
  Moon,
  Sun,
  Globe,
  MapPin,
  CreditCard,
  Package,
  HelpCircle,
  Smartphone,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useProfile } from './hooks/useProfile';
import { ProfileHeader } from './components/ProfileHeader';
import { SellerCenterLink } from './components/SellerCenterLink';
import { ProfileSection } from './components/ProfileSection';
import { LogoutButton } from './components/LogoutButton';
import { SkeletonProfile } from '../../components/ui/Skeleton';

const Profile = () => {
  const {
    user,
    profile,
    signOut,
    loading,
    isDark,
    toggleTheme,
    toggleLanguage,
    t,
    i18n,
    navigate,
    shop
  } = useProfile();

  if (loading || !user) return <SkeletonProfile />;

  const sections = [
    // Admin — its own standalone group (admins only)
    ...(profile?.role === 'admin' ? [{
      title: t('admin', 'Admin'),
      items: [
        { label: t('admin_panel', 'Admin Panel'), icon: <Shield size={18} />, color: "bg-primary-500", to: '/admin' },
      ]
    }] : []),
    {
      title: t('account', 'Account'),
      items: [
        { label: t('account_settings', 'Account Settings'), icon: <Settings size={18} />, color: "bg-slate-500", to: '/account/management' },
        { label: t('my_profile', 'My Profile'), icon: <User size={18} />, color: "bg-blue-500", to: '/profile/edit' },
        { label: t('account_security', 'Account Security'), icon: <ShieldAlert size={18} />, color: "bg-indigo-500", to: '/account/security' },
        { label: t('login_sessions', 'Login Sessions'), icon: <History size={18} />, color: "bg-teal-500", to: '/account/login-history' },
      ]
    },
    {
      title: t('shopping', 'Shopping'),
      items: [
        { label: t('my_orders', 'My Orders'), icon: <Package size={18} />, color: "bg-blue-500", to: '/orders' },
        { label: t('my_addresses', 'My Addresses'), icon: <MapPin size={18} />, color: "bg-green-500", to: '/address-book' },
        { label: t('payment_methods', 'Payment Methods'), icon: <CreditCard size={18} />, color: "bg-purple-500", to: '/payment-methods' },
      ]
    },
    {
      title: t('app_settings', 'App Settings'),
      items: [
        {
          label: isDark ? t('light_mode') : t('dark_mode'),
          icon: isDark ? <Sun size={18} /> : <Moon size={18} />,
          color: "bg-yellow-500",
          onClick: toggleTheme,
          isToggle: true,
          toggleValue: isDark
        },
        {
          label: i18n.language.startsWith('th') ? 'English' : 'ไทย',
          icon: <Globe size={18} />,
          color: "bg-blue-400",
          onClick: toggleLanguage
        },
        { label: t('notifications', 'Notifications'), icon: <Bell size={18} />, color: "bg-pink-500", to: '/notifications' },
      ]
    },
    {
      title: t('support', 'Support'),
      items: [
        { label: t('help_center', 'Help Center'), icon: <HelpCircle size={18} />, color: "bg-teal-500", to: '/help' },
        { label: t('about_app', 'About SnapBuy'), icon: <Smartphone size={18} />, color: "bg-slate-400", to: '/about' },
      ]
    }
  ];

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-background dark:bg-black/20 pb-32 animate-fade-in text-left overflow-x-hidden">
      <ProfileHeader user={user} profile={profile} shop={shop} />
      <SellerCenterLink />

      {/* Dashboard Link */}
      <div className="px-4 mt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Wallet size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-black uppercase tracking-tight text-sm">My Dashboard</h3>
              <p className="text-[10px] text-primary-100 font-medium">Manage Wallet & Shop</p>
            </div>
          </div>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {sections.map((section, idx) => (
          <ProfileSection key={idx} title={section.title} items={section.items} />
        ))}

        <LogoutButton onLogout={handleLogout} />

        <div className="text-center pb-8">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">SnapBuy Version 1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
