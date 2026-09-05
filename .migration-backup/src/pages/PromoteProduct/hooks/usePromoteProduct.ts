import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';

// Package config: boost rate per minute & total duration
export const PACKAGE_CONFIG = {
  hour:  { label: '1 Hour',   minutes: 60,    cost: 1,   boostPerMin: 1, desc: 'Quick Boost' },
  day:   { label: '24 Hours', minutes: 1440,  cost: 15,  boostPerMin: 2, desc: 'Daily Exposure' },
  week:  { label: '7 Days',   minutes: 10080, cost: 80,  boostPerMin: 3, desc: 'Steady Growth', highlight: true },
  month: { label: '30 Days',  minutes: 43200, cost: 300, boostPerMin: 5, desc: 'Maximum Reach' },
} as const;

export type DurationKey = keyof typeof PACKAGE_CONFIG;

export const usePromoteProduct = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { profile, fetchProfile } = useAuthStore();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoteType, setPromoteType] = useState<'views'|'likes'>('views');
  const [duration, setDuration] = useState<DurationKey>('hour');
  const [isPromoting, setIsPromoting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!productId) {
      navigate('/vendor/dashboard');
      return;
    }
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(*)')
        .eq('id', productId)
        .single();
      if (error) throw error;
      if (!data) throw new Error('Product not found');
      
      if (data.promoted_until && new Date(data.promoted_until) > new Date()) {
        toast.error('This product is already being boosted.');
        navigate('/vendor/dashboard');
        return;
      }
      
      setProduct(data);
    } catch (error: any) {
      toast.error('Error loading product: ' + error.message);
      navigate('/vendor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getConfig = () => PACKAGE_CONFIG[duration];
  const getCost = () => getConfig().cost;
  const getBoostPerMin = () => getConfig().boostPerMin;
  const getEstimatedTotal = () => getConfig().boostPerMin * getConfig().minutes;

  const calculatePromotedUntil = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + getConfig().minutes);
    return now.toISOString();
  };

  const handleConfirm = async () => {
    if (!product || !profile) return;
    const cost = getCost();
    if (profile.wallet_balance < cost) {
      toast.error(`Insufficient balance. You need $${cost} but have $${profile.wallet_balance}.`);
      return;
    }
    setIsPromoting(true);
    try {
      const { error } = await supabase.rpc('promote_product', {
        p_product_id:       product.id,
        p_promote_type:     promoteType,
        p_token_cost:       cost,
        p_promoted_until:   calculatePromotedUntil(),
        p_boost_per_minute: getBoostPerMin()
      });
      if (error) throw error;
      toast.success(
        `Promoted! +${getBoostPerMin()} ${promoteType}/min · ~${getEstimatedTotal().toLocaleString()} total over ${getConfig().label}`
      );
      await fetchProfile(profile.id);
      navigate('/vendor/dashboard');
    } catch (error: any) {
      toast.error('Failed to promote: ' + error.message);
    } finally {
      setIsPromoting(false);
    }
  };

  return {
    product, loading,
    promoteType, setPromoteType,
    duration, setDuration,
    isPromoting,
    getCost, getBoostPerMin, getEstimatedTotal,
    handleConfirm,
    walletBalance: profile?.wallet_balance || 0,
    navigate, isSidebarOpen, setIsSidebarOpen
  };
};
