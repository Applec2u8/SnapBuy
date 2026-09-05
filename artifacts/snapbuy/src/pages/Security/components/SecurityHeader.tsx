import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SecurityHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 text-left">
       <button 
         onClick={() => navigate('/profile')}
         className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-500 transition-all active:scale-95"
       >
          <ArrowLeft size={20} />
       </button>
       <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Security Settings</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage your account access & protection</p>
       </div>
    </div>
  );
};
