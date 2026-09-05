import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  uploading: boolean;
  userEmail: string;
}

export const ProfileForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  loading,
  uploading,
  userEmail
}: ProfileFormProps) => {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-8 space-y-6 text-left">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 lg:p-12 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary-500 transition-colors">{t('profile_first_name')}</label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder={t('profile_first_name')}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary-500 transition-colors">{t('profile_last_name')}</label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder={t('profile_last_name')}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-2 opacity-60 grayscale group cursor-not-allowed">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('profile_email_locked')}</label>
            <div className="relative">
              <input
                type="email"
                value={userEmail || ''}
                readOnly
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary-500 transition-colors">{t('profile_phone')}</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                placeholder={t('profile_phone_placeholder')}
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary-500 transition-colors">{t('profile_address')}</label>
            <div className="relative">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 pl-12 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[160px] leading-relaxed"
                placeholder={t('profile_address_placeholder')}
              />
              <MapPin className="absolute left-4 top-7 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="w-full py-6 bg-primary-500 hover:bg-primary-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={20} /> {t('profile_save_changes')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
