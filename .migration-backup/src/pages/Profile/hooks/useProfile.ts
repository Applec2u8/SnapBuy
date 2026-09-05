import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../../store/useThemeStore';

export const useProfile = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, shop, signOut, loading, fetchProfile } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const toggleLanguage = () => {
    const currentLang = i18n.language || 'en';
    const newLang = currentLang.startsWith('th') ? 'en' : 'th';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return {
    user,
    profile,
    shop,
    signOut,
    loading,
    theme,
    toggleTheme,
    isDark,
    toggleLanguage,
    t,
    i18n,
    navigate,
    fetchProfile
  };
};
