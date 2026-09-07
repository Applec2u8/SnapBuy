import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';

export const useHome = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [promotedProducts, setPromotedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState(0);

  const reviews = useMemo(() => [
    {
      name: "Somsak P.",
      role: "Verified Buyer",
      comment: "Best shopping experience ever! The quality of the products is amazing and shipping was super fast.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=somsak"
    },
    {
      name: "Wipawee T.",
      role: "Fashion Enthusiast",
      comment: "I love the unique styles I find here. The customer support is also very helpful.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=wipawee"
    },
    {
      name: "Anan S.",
      role: "Tech Geek",
      comment: "Gadgets are always authentic and well-packaged. SnapBuy is my go-to.",
      rating: 4,
      avatar: "https://i.pravatar.cc/150?u=anan"
    }
  ], []);

  useEffect(() => {
    fetchProducts();
    fetchPromotedProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(name)')
        .eq('is_published', true)
        .limit(12);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(name)')
        .eq('is_published', true)
        .eq('is_promoted', true)
        .gt('promoted_until', new Date().toISOString())
        .order('promoted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPromotedProducts(data || []);
    } catch (error) {
      console.error('Error fetching promoted products:', error);
    }
  };

  const nextReview = () => setActiveReview((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setActiveReview((prev) => (prev - 1 + reviews.length) % reviews.length);

  return {
    products,
    promotedProducts,
    loading,
    reviews,
    activeReview,
    nextReview,
    prevReview
  };
};
