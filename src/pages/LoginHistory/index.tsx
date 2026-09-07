import { ArrowLeft, Smartphone, LogOut, Loader2, Globe, Clock, Trash2, ShieldCheck, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../Security/hooks/useSecurity';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '../../lib/sessionService';

const LoginHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessions, revoking, loadingSessions, handleRevokeOthers, handleRevokeSingle } = useSecurity();

  // Format last security check from current session login time (first session = most recent)
  const lastSecurityCheck = sessions.length > 0
    ? new Date(sessions[0].logged_in_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

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
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">{t('login_history_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('login_history_subtitle')}</p>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('login_history_active_sessions')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('login_history_devices_using')}</p>
            </div>
          </div>
          <button
            onClick={handleRevokeOthers}
            disabled={revoking || sessions.filter(s => !s.current).length === 0}
            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {revoking ? <Loader2 className="animate-spin" size={12} /> : <LogOut size={12} />}
            {t('login_history_logout_others')}
          </button>
        </div>

        {/* Sessions list */}
        <div className="space-y-4">
          {/* Loading skeleton */}
          {loadingSessions && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 animate-pulse"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="h-2 w-48 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingSessions && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Wifi size={40} className="mb-4 opacity-30" />
              <p className="text-sm font-bold uppercase tracking-widest">No active sessions found</p>
              <p className="text-[10px] mt-1 text-slate-400">Log in again to see your devices here</p>
            </div>
          )}

          {/* Real sessions */}
          {!loadingSessions && sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                session.current
                  ? 'bg-primary-500/5 border-primary-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl ${session.current ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 shadow-sm'}`}>
                  {session.device_name.toLowerCase().includes('iphone') || session.device_name.toLowerCase().includes('android')
                    ? <Smartphone size={20} />
                    : <Globe size={20} />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{session.device_name}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-[7px] font-black uppercase tracking-widest rounded-full">
                        {t('login_history_current')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Globe size={10} /> {session.browser}
                    </span>
                    <span className="text-slate-200 dark:text-slate-700">•</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {session.lastActiveLabel}
                    </span>
                    {session.ip_address && (
                      <>
                        <span className="text-slate-200 dark:text-slate-700">•</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Wifi size={10} /> {session.ip_address}
                        </span>
                      </>
                    )}
                  </div>
                  {/* Login timestamp */}
                  <p className="text-[8px] text-slate-300 dark:text-slate-600 mt-0.5 uppercase tracking-widest">
                    Logged in: {new Date(session.logged_in_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleRevokeSingle(session.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
                  title="Revoke Access"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} />
            {lastSecurityCheck
              ? `${t('login_history_last_security')} ${lastSecurityCheck}`
              : t('login_history_last_security')
            }
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginHistory;
