import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Loader2, 
  Camera,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const VendorSettings = () => {
  const { t } = useTranslation();
  const { shop, user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  


  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    contact_info: '',
  });

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || '',
        description: shop.description || '',
        location: shop.location || '',
        phone: shop.phone || '',
        contact_info: shop.contact_info || '',
      });
    }
  }, [shop]);



  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    
    setLoading(true);
    try {
      // Prepare update object - only include fields that might exist
      const updateData: any = {
        name: formData.name,
        description: formData.description,
      };

      // Add extra fields only if they are supported/intended
      // Note: If these columns don't exist yet, Supabase will return a 400 error.
      // The user MUST run the SQL migrations provided.
      updateData.location = formData.location;
      updateData.phone = formData.phone;
      updateData.contact_info = formData.contact_info;

      const { error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', shop.id);

      if (error) {
        if (error.message.includes('column') && error.message.includes('not found')) {
          throw new Error('Please run the SQL migration in Supabase Dashboard to add missing columns (location, phone, contact_info).');
        }
        throw error;
      }
      
      toast.success(t('vendor_settings_updated'));
      if (user) await fetchProfile(user.id);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !shop || !user) return;

    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/shop_${type}_${Math.random()}.${fileExt}`;
      const filePath = `shop-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('strong-shop')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('strong-shop')
        .getPublicUrl(filePath);

      const updateData = type === 'logo' ? { logo_url: publicUrl } : { banner_url: publicUrl };
      
      const { error: updateError } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', shop.id);

      if (updateError) throw updateError;

      toast.success(type === 'logo' ? t('vendor_logo_updated') : t('vendor_banner_updated'));
      if (user) await fetchProfile(user.id);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{t('shop_settings')}</h2>
          <p className="text-sm text-slate-500">{t('vendor_configure_presence')}</p>
        </div>
        {shop && (
          <Link 
            to={`/shop/${shop.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group"
          >
            <ExternalLink size={14} className="group-hover:scale-110 transition-transform" />
            {t('vendor_view_shop')}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('vendor_shop_logo')}</label>
             <div className="relative group">
                <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                   {shop?.logo_url ? (
                     <img src={shop.logo_url} className="w-full h-full object-cover" alt="Logo" />
                   ) : (
                     <Store size={48} className="text-slate-300" />
                   )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                   {uploading === 'logo' ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} disabled={!!uploading} />
                </label>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t('vendor_shop_banner')}</label>
             <div className="relative group">
                <div className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                   {shop?.banner_url ? (
                     <img src={shop.banner_url} className="w-full h-full object-cover" alt="Banner" />
                   ) : (
                     <ImageIcon size={32} className="text-slate-300" />
                   )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                   {uploading === 'banner' ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} disabled={!!uploading} />
                </label>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2">
           <form onSubmit={handleUpdateShop} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('vendor_shop_name')}</label>
                    <div className="relative">
                       <Store className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         required
                         className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 pl-12 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-sm font-bold"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('vendor_short_description')}</label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-sm min-h-[100px]"
                      placeholder={t('vendor_desc_placeholder')}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('vendor_phone_number')}</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input 
                            className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 pl-12 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-sm"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('vendor_contact_info')}</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                          <input 
                            className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 pl-12 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-sm"
                            value={formData.contact_info}
                            onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('vendor_location_address')}</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 pl-12 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none transition-all text-sm"
                         value={formData.location}
                         onChange={(e) => setFormData({...formData, location: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                   disabled={loading}
                   className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                   {loading ? t('vendor_saving') : t('vendor_save_settings')}
                 </button>
              </div>
           </form>


        </div>
      </div>
    </div>
  );
};

export default VendorSettings;
