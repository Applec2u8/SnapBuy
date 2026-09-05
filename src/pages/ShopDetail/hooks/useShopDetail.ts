import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 50;

export const useShopDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const observerTarget = useRef(null);

  useEffect(() => {
    if (id) {
      fetchShopData();
      incrementViewCount();
      checkIfFollowing();
    }
  }, [id, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading]);

  const incrementViewCount = async () => {
    try {
      const { data: currentShop } = await supabase
        .from('shops')
        .select('view_count')
        .eq('id', id)
        .single();
      
      await supabase
        .from('shops')
        .update({ view_count: (currentShop?.view_count || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', id)
        .eq('is_published', true);
      
      setTotalItems(count || 0);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1);

      if (productsError) throw productsError;
      setProducts(productsData || []);
      setHasMore((productsData || []).length < (count || 0));

      const { count: followingCount } = await supabase
        .from('shop_followers')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', id);
      
      setFollowersCount(followingCount || 0);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const from = nextPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(products.length + data.length < totalItems);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const checkIfFollowing = async () => {
    if (!user || !id) return;
    try {
      const { data, error } = await supabase
        .from('shop_followers')
        .select('*')
        .eq('shop_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please login to follow shops');
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('shop_followers')
          .delete()
          .eq('shop_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success('Unfollowed shop');
      } else {
        const { error } = await supabase
          .from('shop_followers')
          .insert([{ shop_id: id, user_id: user.id }]);
        
        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Following shop!');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    shop,
    products,
    loading,
    loadingMore,
    isFollowing,
    followersCount,
    totalItems,
    hasMore,
    observerTarget,
    handleFollow
  };
};
