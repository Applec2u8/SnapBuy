import { Smartphone, LogOut, Loader2, Globe, Clock, Trash2 } from 'lucide-react';

interface LoginSessionsProps {
  sessions: any[];
  revoking: boolean;
  handleRevokeOthers: () => void;
  handleRevokeSingle: (id: number) => void;
}

export const LoginSessions = ({
  sessions,
  revoking,
  handleRevokeOthers,
  handleRevokeSingle
}: LoginSessionsProps) => {
  return (
    <div className="lg:col-span-7 space-y-6 text-left">
       <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                   <Smartphone size={24} />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Login Sessions</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active devices using your account</p>
                </div>
             </div>
             <button 
               onClick={handleRevokeOthers}
               disabled={revoking}
               className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
             >
                {revoking ? <Loader2 className="animate-spin" size={12} /> : <LogOut size={12} />}
                Log Out Others
             </button>
          </div>

          <div className="space-y-4">
             {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${session.current ? 'bg-primary-500/5 border-primary-500/20' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'}`}
                >
                   <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl ${session.current ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 shadow-sm'}`}>
                         {session.device.includes('iPhone') || session.device.includes('Mobile') ? <Smartphone size={20} /> : <Globe size={20} />}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{session.device}</p>
                            {session.current && (
                               <span className="px-2 py-0.5 bg-green-500 text-white text-[7px] font-black uppercase tracking-widest rounded-full">Current</span>
                            )}
                         </div>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 text-slate-400">
                               <Globe size={10} /> {session.browser}
                            </span>
                            <span className="text-slate-200 dark:text-slate-700">•</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 text-slate-400">
                               <Clock size={10} /> {session.lastActive}
                            </span>
                         </div>
                      </div>
                   </div>
                   {!session.current && (
                      <button 
                        onClick={() => handleRevokeSingle(session.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Revoke Access"
                      >
                         <Trash2 size={18} />
                      </button>
                   )}
                </div>
             ))}
          </div>

          <div className="pt-4 flex justify-center">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-slate-400">
                <Clock size={12} /> Last Full Security Check: Today at 01:48 AM
             </p>
          </div>
       </div>
    </div>
  );
};
