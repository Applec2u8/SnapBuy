import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { shop } = useAuthStore();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [relatedPage, setRelatedPage] = useState(0);
  const [loadingMoreRelated, setLoadingMoreRelated] = useState(false);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  const [relatedCategoryIds, setRelatedCategoryIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedReviewImages, setSelectedReviewImages] = useState<string[] | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [activeReviewImageIndex, setActiveReviewImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, shops(*), product_variants(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
      setActiveImage(data.images[0]);

      if (data.category_id) {
        fetchRelatedProducts(data.category_id);
      }

      // Increment view count via RPC
      await supabase.rpc('increment_view_count', { product_id_input: id });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const reviewsData = data || [];
      
      if (reviewsData.length > 0) {
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
          
        if (profilesData) {
          const profileMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
          reviewsData.forEach(r => {
            r.profiles = profileMap[r.user_id] || null;
          });
        }
      }
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, pageNum = 0, isInitial = true) => {
    try {
      if (isInitial) {
        setRelatedPage(0);
        setRelatedProducts([]);
      } else {
        setLoadingMoreRelated(true);
      }

      let catIds = relatedCategoryIds;

      // 1. If initial, find 3 relevant categories
      if (isInitial) {
        const { data: allCats } = await supabase.from('categories').select('id, name').order('name');
        if (allCats && allCats.length > 0) {
          const currentIdx = allCats.findIndex(c => c.id === categoryId);
          const selected = [];
          if (currentIdx !== -1) {
            selected.push(allCats[currentIdx].id);
            // Pick next two (wrap around)
            selected.push(allCats[(currentIdx + 1) % allCats.length].id);
            selected.push(allCats[(currentIdx + 2) % allCats.length].id);
          } else {
            selected.push(categoryId);
            if (allCats[0]) selected.push(allCats[0].id);
            if (allCats[1]) selected.push(allCats[1].id);
          }
          catIds = selected;
          setRelatedCategoryIds(selected);
        } else {
          catIds = [categoryId];
          setRelatedCategoryIds(catIds);
        }
      }

      // 2. Fetch products from each category
      // We want ~20 total per "load more" action. 3 categories -> ~7 each.
      const itemsPerCat = 7;
      const from = pageNum * itemsPerCat;
      const to = from + itemsPerCat - 1;

      const productPromises = catIds.map(cid => 
        supabase
          .from('products')
          .select('*, shops(name)')
          .eq('category_id', cid)
          .neq('id', id)
          .eq('is_published', true)
          .range(from, to)
          .order('created_at', { ascending: false })
      );

      const results = await Promise.all(productPromises);
      
      // 3. Interleave results
      const interleaved: any[] = [];
      const maxLength = Math.max(...results.map(r => r.data?.length || 0));
      
      for (let i = 0; i < maxLength; i++) {
        results.forEach(r => {
          if (r.data && r.data[i]) {
            interleaved.push(r.data[i]);
          }
        });
      }

      if (isInitial) {
        setRelatedProducts(interleaved.slice(0, 20));
      } else {
        setRelatedProducts(prev => {
          const combined = [...prev, ...interleaved];
          // Remove duplicates if any (though range should handle it)
          return Array.from(new Map(combined.map(p => [p.id, p])).values());
        });
      }

      // If we got fewer than expected, there might be no more
      const totalFetched = results.reduce((acc, r) => acc + (r.data?.length || 0), 0);
      setHasMoreRelated(totalFetched >= (catIds.length * itemsPerCat) - 2); // Small buffer for slight variations

    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoadingMoreRelated(false);
    }
  };

  const handleLoadMoreRelated = () => {
    if (!product || loadingMoreRelated || !hasMoreRelated) return;
    const nextPage = relatedPage + 1;
    setRelatedPage(nextPage);
    fetchRelatedProducts(product.category_id, nextPage, false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Please login to leave a review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      let imageUrls: string[] = [];

      if (reviewFiles.length > 0) {
        for (const file of reviewFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `reviews/${user.id}/${Math.random()}.${fileExt}`;

          if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            await new Promise((resolve, reject) => {
              video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 31) {
                  toast.error('Video must be under 30 seconds');
                  reject(new Error('Video too long'));
                }
                resolve(null);
              };
            });
          }

          const { error: uploadError } = await supabase.storage
            .from('strong-shop')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('strong-shop')
              .getPublicUrl(fileName);
            imageUrls.push(publicUrl);
          }
        }
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment,
          images: imageUrls
        });

      if (error) throw error;

      toast.success('Thank you for your review!');
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewFiles([]);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = (variant: any, silent = false) => {
    if (!product) return;

    if (product.shop_id === shop?.id) {
      toast.error('You cannot add your own product to cart');
      return;
    }

    const finalPrice = variant?.price_override ? parseFloat(variant.price_override) : parseFloat(product.price);
    const finalImage = variant?.image_url || product.images[0];
    const variantName = variant ? `${variant.name}: ${variant.value}` : '';

    addItem({
      id: product.id,
      shop_id: product.shop_id,
      name: product.name,
      price: finalPrice,
      image: finalImage,
      quantity: quantity,
      variant: variantName ? {
        id: variant.id,
        name: variantName
      } : undefined
    });

    if (!silent) {
      toast.success(`Added ${quantity}x ${variantName || product.name} to cart!`);
    }
  };

  const handleBuyNow = (variant: any) => {
    if (product?.shop_id === shop?.id) {
      toast.error('You cannot purchase your own product');
      return;
    }
    if (!product) return;
    
    const finalPrice = variant?.price_override ? parseFloat(variant.price_override) : parseFloat(product.price);
    const finalImage = variant?.image_url || product.images[0];
    const variantName = variant ? `${variant.name}: ${variant.value}` : '';

    const buyNowItem = {
      id: product.id,
      shop_id: product.shop_id,
      name: product.name,
      price: finalPrice,
      image: finalImage,
      quantity: quantity,
      variant: variantName ? {
        id: variant.id,
        name: variantName
      } : undefined
    };

    navigate('/checkout', { state: { buyNowItem } });
  };

  return {
    product,
    loading,
    quantity,
    setQuantity,
    selectedVariant,
    setSelectedVariant,
    activeImage,
    setActiveImage,
    reviews,
    relatedProducts,
    relatedPage,
    loadingMoreRelated,
    hasMoreRelated,
    handleLoadMoreRelated,
    activeTab,
    setActiveTab,
    showReviewModal,
    setShowReviewModal,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewFiles,
    setReviewFiles,
    submittingReview,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    selectedReviewImages,
    setSelectedReviewImages,
    activeReviewImageIndex,
    setActiveReviewImageIndex,
    showVariantModal,
    setShowVariantModal,
    handleReviewSubmit,
    handleAddToCart,
    handleBuyNow,
    isOwnProduct: product?.shop_id === shop?.id
  };
};
