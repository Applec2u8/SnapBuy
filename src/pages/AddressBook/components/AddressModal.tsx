import { X, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface AddressModalProps {
  show: boolean;
  onClose: () => void;
  editingAddress: any;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  processing: boolean;
}

export const AddressModal = ({
  show,
  onClose,
  editingAddress,
  formData,
  setFormData,
  handleSubmit,
  processing
}: AddressModalProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show && !processing) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, processing, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 animate-slide-up sm:animate-scale-in border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">{editingAddress ? t('edit') : t('add_product')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Phone</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Province</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">City</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">District</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Postal Code</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Address Details</label>
            <textarea required className="w-full bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white" rows={2} value={formData.address_line} onChange={e => setFormData({...formData, address_line: e.target.value})} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group py-2">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.is_default ? 'bg-primary-500 border-primary-500' : 'border-slate-300 group-hover:border-primary-500'}`}>
              {formData.is_default && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} />
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Set as default address</span>
          </label>

          <button 
            disabled={processing}
            className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
          >
            {processing ? <Loader2 className="animate-spin" /> : <MapPin size={18} />}
            {processing ? 'Saving...' : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
};
