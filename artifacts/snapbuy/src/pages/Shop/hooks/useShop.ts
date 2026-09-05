import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const ITEMS_PER_PAGE = 50;

export const useShop = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(900000000);

  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState<string[] | null>(null);
  const [activeProductImageIndex, setActiveProductImageIndex] = useState(0);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, false);
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
  }, [hasMore, loadingMore, loading, page]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCategories();
    fetchShops();
    fetchRecommendedProducts();
  }, []);

  useEffect(() => {
    setPage(0);
    setProducts([]);
    setHasMore(true);
    fetchProducts(0, true);
  }, [searchTerm, selectedCategories, selectedShops, sortBy, minPrice, maxPrice]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const fetchShops = async () => {
    const { data } = await supabase
      .from('shops')
      .select('id, name, logo_url, image_url')
      .order('name');
    setShops(data || []);
  };

  const fetchRecommendedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, shops(name), categories(name)')
      .eq('is_published', true)
      .order('average_rating', { ascending: false })
      .limit(2);
    setRecommendedProducts(data || []);
  };

  const fetchProducts = async (pageIndex: number, isInitial: boolean) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      let query = supabase
        .from('products')
        .select('*, shops(name, logo_url, image_url), categories(name)', { count: 'exact' })
        .eq('is_published', true);

      if (selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories);
      }

      if (selectedShops.length > 0) {
        query = query.in('shop_id', selectedShops);
      }

      query = query.gte('price', minPrice).lte('price', maxPrice);

      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      if (searchTerm) {
        const words = searchTerm.trim().split(/\s+/).filter(w => w.length > 1);
        const chars = searchTerm.trim().replace(/\s+/g, '').slice(0, 25).split('');
        const subsequence = `%${chars.join('%')}%`;
        let orConditions = [`name.ilike.${subsequence}`];
        if (words.length > 0) {
          orConditions.push(...words.map(w => `name.ilike.%${w}%`));
        } else if (searchTerm.trim().length > 0) {
          orConditions.push(`name.ilike.%${searchTerm.trim()}%`);
        }
        query = query.or(orConditions.join(',')).limit(500);
      } else {
        const from = pageIndex * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      let finalData = data || [];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
        
        finalData = finalData.map(item => {
          const nameLower = item.name.toLowerCase();
          let score = 0;
          
          if (nameLower === searchLower) score += 1000;
          if (nameLower.includes(searchLower)) score += 500;
          
          let wordsMatched = 0;
          searchWords.forEach(word => {
            if (nameLower.includes(word)) {
              score += 100;
              wordsMatched++;
            }
          });
          if (wordsMatched === searchWords.length && searchWords.length > 1) {
            score += 300;
          }
          
          let i = 0;
          for (let j = 0; j < nameLower.length && i < searchLower.length; j++) {
            if (nameLower[j] === searchLower[i]) i++;
          }
          if (i === searchLower.length) score += 50;
          
          return { ...item, _score: score };
        })
        .filter(item => item._score > 0)
        .sort((a, b) => {
          if (sortBy === 'price_asc') return a.price - b.price;
          if (sortBy === 'price_desc') return b.price - a.price;
          if (b._score !== a._score) return b._score - a._score;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        const from = pageIndex * ITEMS_PER_PAGE;
        finalData = finalData.slice(from, from + ITEMS_PER_PAGE);
        setHasMore(from + ITEMS_PER_PAGE < (data?.length || 0));
      } else {
        const from = pageIndex * ITEMS_PER_PAGE;
        setHasMore(data && data.length === ITEMS_PER_PAGE && (count ? from + data.length < count : true));
      }

      if (isInitial) {
        setProducts(finalData);
      } else {
        setProducts(prev => {
          const newData = finalData.filter(item => !prev.some(p => p.id === item.id));
          return [...prev, ...newData];
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleShop = (id: string) => {
    setSelectedShops(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.name.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categories, catSearch]);

  return {
    products,
    recommendedProducts,
    categories,
    shops,
    loading,
    loadingMore,
    hasMore,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    selectedShops,
    setSelectedShops,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    showCatDropdown,
    setShowCatDropdown,
    catSearch,
    setCatSearch,
    isFilterExpanded,
    setIsFilterExpanded,
    showScrollTop,
    scrollToTop,
    selectedProductImages,
    setSelectedProductImages,
    activeProductImageIndex,
    setActiveProductImageIndex,
    observerTarget,
    toggleCategory,
    toggleShop,
    filteredCategories
  };
};
