import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  loading: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export const LoginForm = ({
  loading,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleGoogleLogin
}: LoginFormProps) => {
  const { t } = useTranslation();
  return (
    <form onSubmit={handleLogin} className="space-y-6 text-left">
      <div className="space-y-4">
        <div className="space-y-1.5 group">
          <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-primary-500 transition-colors">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary/80 dark:bg-slate-800 text-foreground border border-border rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold shadow-sm"
              placeholder="name@example.com"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-500 transition-colors" size={20} />
          </div>
        </div>

        <div className="space-y-1.5 group">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest group-focus-within:text-primary-500 transition-colors">Password</label>
            <button type="button" className="text-[10px] font-bold text-primary-500 hover:underline">Forgot password?</button>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary/80 dark:bg-slate-800 text-foreground border border-border rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold shadow-sm"
              placeholder="••••••••"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-500 transition-colors" size={20} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group transition-all"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : (
          <>
            {t('login')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">or</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>
    </form>
  );
};
