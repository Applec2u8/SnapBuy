import { Camera, ShieldCheck, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AvatarSectionProps {
  uploading: boolean;
  avatarUrl: string;
  firstName: string;
  email: string;
  handleAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AvatarSection = ({
  uploading,
  avatarUrl,
  firstName,
  email,
  handleAvatarClick,
  fileInputRef,
  handleFileChange
}: AvatarSectionProps) => {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 text-left">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        <div className="relative group">
          <div className="w-40 h-40 rounded-[48px] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02]">
            {uploading ? (
              <Loader2 className="animate-spin text-primary-500" size={40} />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-black text-primary-500">
                {firstName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="absolute bottom-2 right-2 p-4 bg-primary-500 text-white rounded-[24px] shadow-xl hover:scale-110 transition-transform border-4 border-white dark:border-slate-900 disabled:opacity-50"
          >
            <Camera size={20} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className="mt-8 text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {firstName}
          </h2>
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">{t('profile_verified_member')}</p>
        </div>

        <div className="w-full mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck size={16} className="text-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile_active_account')}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('profile_member_since')}</span>
          </div>
        </div>
      </div>

      <div className="bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 rounded-[28px] p-6 flex gap-4 items-start">
        <div className="p-2 bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-500/20 flex-shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mb-1">{t('profile_security_note')}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
            {t('profile_security_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};
