import { Shield, Camera, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  user: any;
  profile: any;
  shop?: any;
}

export const ProfileHeader = ({ user, profile }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 pt-8 pb-12 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-400/20 blur-2xl rounded-full -ml-12 -mb-12"></div>

      <div className="relative z-10 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
            {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
              <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.email?.[0].toUpperCase()
            )}
          </div>
          <button
            onClick={() => navigate('/profile/edit')}
            className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
          >
            <Camera size={12} className="text-primary-500" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1 text-left truncate">
            {profile?.full_name || user?.user_metadata?.full_name || user.email?.split('@')[0]}
          </h2>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest text-left truncate">{user.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[8px] text-white font-bold uppercase tracking-widest">
            <Shield size={8} /> Verified Member
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => navigate('/profile/edit')} className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
