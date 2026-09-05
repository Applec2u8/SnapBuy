import { useAuthStore } from '../../store/useAuthStore';
import { Shield, Key, Mail, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../Security/hooks/useSecurity';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import OTPPasswordModal from './components/OTPPasswordModal';

const AccountSecurity = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { loading, handlePasswordReset } = useSecurity();
  const [showOTPModal, setShowOTPModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary/50 dark:bg-slate-800 flex items-center justify-center hover:bg-secondary dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">{t('account_security_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('account_security_subtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Protection */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('account_security_protection')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('account_security_update_creds')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowOTPModal(true)}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-500/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Key size={18} /></div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('account_security_change_password')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t('account_security_reset_link')}</p>
                </div>
              </div>
              {loading ? <Loader2 className="animate-spin text-primary-500" size={16} /> : <CheckCircle2 className="text-slate-200 group-hover:text-primary-500 transition-colors" size={16} />}
            </button>

            <button
              onClick={() => toast.info('Email update coming soon!')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-500/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl"><Mail size={18} /></div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('account_security_update_email')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t('account_security_current_email')} {user?.email}</p>
                </div>
              </div>
              <CheckCircle2 className="text-slate-200 group-hover:text-primary-500 transition-colors" size={16} />
            </button>
          </div>

          <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-[24px] flex gap-4 items-start">
            <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
            <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold leading-relaxed">
              {t('account_security_2fa_note')}
            </p>
          </div>
        </section>
      </div>

      {showOTPModal && user?.email && (
        <OTPPasswordModal
          email={user.email}
          userName={user.user_metadata?.full_name || user.email.split('@')[0]}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
};

export default AccountSecurity;
