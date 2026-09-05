import { Shield, Key, Mail, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AccountProtectionProps {
  userEmail: string;
  loading: boolean;
  handlePasswordReset: () => void;
}

export const AccountProtection = ({
  userEmail,
  loading,
  handlePasswordReset
}: AccountProtectionProps) => {
  return (
    <div className="lg:col-span-5 space-y-6 text-left">
       <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Shield size={24} />
             </div>
             <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Protection</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update your credentials</p>
             </div>
          </div>

          <div className="space-y-4">
             <button 
               onClick={handlePasswordReset}
               disabled={loading}
               className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-500/50 transition-all group text-left"
             >
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Key size={18} /></div>
                   <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Change Password</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Receive reset link via email</p>
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
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Update Email</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Current: {userEmail}</p>
                   </div>
                </div>
                <CheckCircle2 className="text-slate-200 group-hover:text-primary-500 transition-colors" size={16} />
             </button>
          </div>

          <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-[24px] flex gap-4 items-start">
             <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
             <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold leading-relaxed">
                Two-factor authentication (2FA) is recommended for high-security accounts. Contact support to enable.
             </p>
          </div>
       </div>
    </div>
  );
};
