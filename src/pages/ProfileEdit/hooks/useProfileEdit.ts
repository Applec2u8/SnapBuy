import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useProfileEdit = () => {
  const { user, profile, shop, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      const names = (profile.full_name || '').split(' ');
      setFormData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || profile.last_name || '',
        phone: profile.phone || user?.user_metadata?.phone || '',
        address: profile.address || user?.user_metadata?.address || '',
        avatarUrl: profile.avatar_url || ''
      });
    } else if (user?.user_metadata) {
      const names = (user.user_metadata.full_name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        phone: user.user_metadata.phone || '',
        address: user.user_metadata.address || '',
        avatarUrl: user.user_metadata.avatar_url || ''
      }));
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('strong-shop')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('strong-shop')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updateData: any = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        avatar_url: formData.avatarUrl,
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').update(updateData).eq('id', user.id);

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updateData.full_name,
          avatar_url: updateData.avatar_url,
          phone: formData.phone,
          address: formData.address,
          last_name: formData.lastName
        }
      });

      if (authError) throw authError;

      try {
        await supabase.from('profiles').update({
          phone: formData.phone,
          last_name: formData.lastName,
          address: formData.address
        }).eq('id', user.id);
      } catch (e) {
        // Silent fail
      }

      await fetchProfile(user.id);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    uploading,
    formData,
    setFormData,
    fileInputRef,
    handleInputChange,
    handleAvatarClick,
    handleFileChange,
    handleSubmit,
    shop
  };
};
