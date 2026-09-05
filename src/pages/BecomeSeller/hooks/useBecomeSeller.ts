import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useBecomeSeller = () => {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, shops } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [quotaCode, setQuotaCode] = useState('');

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          name: shopName,
          description: description,
          product_limit: 0,
        })
        .select('id')
        .single();

      if (shopError) throw shopError;

      if (profile?.role !== 'admin') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'vendor' })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Redeem quota code if provided
      if (quotaCode.trim()) {
        const { error: quotaError } = await supabase.rpc('redeem_store_quota', {
          p_quota_code: quotaCode.trim().toUpperCase(),
          p_shop_id: shopData.id,
        });
        if (quotaError) {
          // Shop created but code invalid — warn but don't block
          await fetchProfile(user.id);
          toast.warning(`Shop created! But quota code is invalid: ${quotaError.message}`);
          navigate('/vendor/dashboard');
          return;
        }
        toast.success('Shop created and quota activated successfully!');
      } else {
        toast.success('Congratulations! Your new shop is now live. Redeem a quota code in Settings to start listing products.');
      }

      await fetchProfile(user.id);
      navigate('/vendor/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    shops,
    loading,
    shopName,
    setShopName,
    description,
    setDescription,
    quotaCode,
    setQuotaCode,
    handleCreateShop
  };
};
