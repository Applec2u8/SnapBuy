import { useTranslation } from 'react-i18next';
import { Store } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useLogin } from './hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import { useAuthStore } from '../../store/useAuthStore';

const Login = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleGoogleLogin
  } = useLogin();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background py-12 px-4 transition-colors duration-300">
      <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-8 animate-slide-up border border-border">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary-500/20 mb-4">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">{t('login')}</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Welcome back to SnapBuy</p>
        </div>

        <LoginForm 
          loading={loading}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          handleGoogleLogin={handleGoogleLogin}
        />

        <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 hover:underline">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
