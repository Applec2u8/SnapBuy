import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Eye,
  Heart,
  MessageCircle,
  Edit3,
  Save,
  X,
  ExternalLink,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  Zap,
  Check,
  ShoppingCart,
  TrendingDown,
  Store,
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { ShopHeaderCard } from './components/ShopHeaderCard';
import { PurchaseModal } from './components/PurchaseModal';
import { supabase } from '../../../../lib/supabase';
import { logAdminAction } from '../../../../lib/auditLog';

interface ProductManagementProps {
  products: any[];
  categories: { id: string; name: string }[];
  totalItems: number;
  loading: boolean;
  shopId?: string | null;
  onUpdate: (productId: string, updates: any) => Promise<void>;
  onFetch: (params: {
    page: number;
    pageSize: number;
    search?: string;
    category?: string;
    sortBy?: string;
    shopId?: string | null;
  }) => Promise<void>;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  totalItems,
  shopId,
  onUpdate,
  onFetch
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const itemsPerPage = 20;

  // Quick Boost State
  const [quickBoostId, setQuickBoostId] = useState<string | null>(null);
  const [quickBoostValue, setQuickBoostValue] = useState(100);
  const [isSavingBoost, setIsSavingBoost] = useState(false);
  const boostConfig = { amount: 100 };

  // Local pending state — true for the debounce window so UI shows spinner immediately
  const [isFetching, setIsFetching] = useState(false);

  // Bulk Select State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Shop Details State
  const [shop, setShop] = useState<any>(null);

  // Purchase Modal State
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<any>(null);

  // Sales Count State
  const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopFilter, setSelectedShopFilter] = useState<string | null>(null);
  const [isShopFilterOpen, setIsShopFilterOpen] = useState(false);
  const [shopSearch, setShopSearch] = useState('');

  // Refs for click-outside detection
  const shopFilterRef = useRef<HTMLDivElement>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const sortFilterRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shopFilterRef.current && !shopFilterRef.current.contains(e.target as Node) &&
        categoryFilterRef.current && !categoryFilterRef.current.contains(e.target as Node) &&
        sortFilterRef.current && !sortFilterRef.current.contains(e.target as Node)
      ) {
        setIsShopFilterOpen(false);
        setIsCategoryOpen(false);
        setIsSortOpen(false);
      } else {
        if (shopFilterRef.current && !shopFilterRef.current.contains(e.target as Node)) {
          setIsShopFilterOpen(false);
        }
        if (categoryFilterRef.current && !categoryFilterRef.current.contains(e.target as Node)) {
          setIsCategoryOpen(false);
        }
        if (sortFilterRef.current && !sortFilterRef.current.contains(e.target as Node)) {
          setIsSortOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all shops
  useEffect(() => {
    const loadShops = async () => {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('id, name, logo_url')
          .order('name');

        if (error) throw error;
        // console.log('✅ Shops loaded:', data);
        setShops(data || []);
      } catch (err) {
        console.error('❌ Failed to fetch shops:', err);
      }
    };
    loadShops();
  }, []);

  // Fetch shop details when shopId is provided
  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
      fetchSalesCounts();
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error) throw error;
      setShop(data);
    } catch (err) {
      console.error('Failed to load shop details:', err);
    }
  };

  const fetchSalesCounts = async () => {
    if (!shopId || !products.length) return;

    try {
      // Get product IDs for this shop
      const productIds = products.map(p => p.id);

      // Fetch order_items for these products and sum quantities
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('product_id', productIds)
        .throwOnError();

      if (error) throw error;

      // Aggregate quantities by product
      const counts: Record<string, number> = {};
      (data || []).forEach((item: any) => {
        counts[item.product_id] = (counts[item.product_id] || 0) + (item.quantity || 0);
      });
      setSalesCounts(counts);
    } catch (err) {
      // Silently fail - this is optional data
      console.debug('Could not fetch sales counts:', err);
    }
  };

  const openPurchaseModal = (product: any) => {
    setSelectedProductForPurchase(product);
    setPurchaseModalOpen(true);
  };

  const closePurchaseModal = () => {
    setPurchaseModalOpen(false);
    setSelectedProductForPurchase(null);
  };

  // Reset page when shop filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [shopId]);

  // Trigger fetch on changes
  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => {
      onFetch({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchTerm,
        category: filterCategory,
        sortBy: sortBy,
        shopId: selectedShopFilter || shopId
      }).finally(() => setIsFetching(false));
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(timer);
      setIsFetching(false);
    };
  }, [searchTerm, currentPage, filterCategory, sortBy, selectedShopFilter, shopId]);

  // Scroll to top on page change
  React.useEffect(() => {
    const contentArea = document.getElementById('admin-content-area');
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Derive categories from all available categories, not just current paginated products
  const allCategories = useMemo(() => {
    return categories.map(c => c.name).filter(Boolean).sort();
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return allCategories.filter(cat =>
      cat.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

  const filteredShops = useMemo(() => {
    return shops.filter(shop =>
      (shop.name || '').toLowerCase().includes((shopSearch || '').toLowerCase())
    );
  }, [shops, shopSearch]);

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Views: High to Low', value: 'views-desc' },
  ];

  const visibleProducts = useMemo(() => products.filter(product => product.is_published === true), [products]);

  const startEditing = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      view_count: product.view_count || 0,
      like_count: product.like_count || 0,
      comment_count: product.comment_count || 0
    });
  };

  const handleSaveProduct = async (id: string) => {
    await onUpdate(id, editForm);
    setEditingId(null);
  };

  const boostProductNow = async (productId: string, currentViews: number) => {
    if (isSavingBoost) return;

    setIsSavingBoost(true);
    try {
      const amount = quickBoostValue;
      await onUpdate(productId, {
        view_count: currentViews + amount,
        updated_at: new Date().toISOString()
      });
      setQuickBoostId(null);
    } catch (error) {
      console.error('Boost failed:', error);
    } finally {
      setIsSavingBoost(false);
    }
  };

  useEffect(() => {
    if (!visibleProducts.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(prev => prev.filter(id => visibleProducts.some(product => product.id === id)));
  }, [visibleProducts]);

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} product(s)? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().in('id', selectedIds);
      if (error) throw error;

      await logAdminAction('delete_product', 'product', undefined, undefined, { count: selectedIds.length });

      exitSelectMode();
      onFetch({ page: currentPage, pageSize: itemsPerPage, search: searchTerm, category: filterCategory, sortBy, shopId: selectedShopFilter || shopId });
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnpublishSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Unpublish ${selectedIds.length} product(s)?`)) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').update({ is_published: false }).in('id', selectedIds);
      if (error) throw error;
      exitSelectMode();
      onFetch({ page: currentPage, pageSize: itemsPerPage, search: searchTerm, category: filterCategory, sortBy, shopId: selectedShopFilter || shopId });
    } catch (err: any) {
      alert('Failed to unpublish: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Shop Header - Show when filtered by shop */}
      {shopId && shop && (
        <ShopHeaderCard
          shop={shop}
          onBack={() => {
            // This would typically navigate back, but in this context we'd close the shop filter
            window.history.back();
          }}
        />
      )}

      {/* Unified Search & Filters Group */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder={t('admin_search_products_shops')}
            className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent focus:border-primary-500 rounded-2xl py-3.5 px-5 pl-14 pr-12 text-[10px] font-bold uppercase tracking-widest outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          {/* Refresh Button & Loading State */}
          <button
            onClick={() => onFetch({ page: currentPage, pageSize: itemsPerPage, search: searchTerm, category: filterCategory, sortBy, shopId: selectedShopFilter || shopId })}
            disabled={isFetching}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isFetching ? 'text-primary-500' : 'text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? 'animate-spin' : ''}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-30">
          {/* Shop Filter */}
          <div ref={shopFilterRef} className="relative h-[52px]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsShopFilterOpen(!isShopFilterOpen);
                setIsCategoryOpen(false);
                setIsSortOpen(false);
              }}
              className="w-full h-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 flex items-center justify-between group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <ShoppingCart size={12} className="text-primary-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {selectedShopFilter ? shops.find(s => s.id === selectedShopFilter)?.name : 'All Shops'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform pointer-events-none ${isShopFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isShopFilterOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <input
                    type="text"
                    placeholder="Search shops..."
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-xl py-2 px-3 text-[9px] font-bold uppercase tracking-widest outline-none"
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1 p-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedShopFilter(null); setIsShopFilterOpen(false); setShopSearch(''); setCurrentPage(1); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">All Shops</span>
                  </button>
                  {filteredShops.map(shop => (
                    <button
                      key={shop.id}
                      type="button"
                      onClick={() => { setSelectedShopFilter(shop.id); setIsShopFilterOpen(false); setShopSearch(''); setCurrentPage(1); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${selectedShopFilter === shop.id
                        ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={shop.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          <Store size={14} className="text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 truncate">{shop.name}</p>
                      </div>
                      {selectedShopFilter === shop.id && (
                        <Check size={14} className="text-primary-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  {filteredShops.length === 0 && (
                    <p className="py-4 text-center text-[8px] font-bold text-slate-400 uppercase">No shops found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div ref={categoryFilterRef} className="relative h-[52px]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCategoryOpen(!isCategoryOpen);
                setIsSortOpen(false);
              }}
              className="w-full h-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 flex items-center justify-between group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <Filter size={12} className="text-primary-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {filterCategory === 'all' ? t('vendor_all_categories') : filterCategory}
                </span>
              </div>
              {isFetching && filterCategory !== 'all' ? (
                <div className="w-3.5 h-3.5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin pointer-events-none" />
              ) : (
                <ChevronDown size={16} className={`text-slate-400 transition-transform pointer-events-none ${isCategoryOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <input
                    type="text"
                    placeholder={t('admin_search_categories')}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-xl py-2 px-3 text-[9px] font-bold uppercase tracking-widest outline-none"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setFilterCategory('all'); setIsCategoryOpen(false); setCategorySearch(''); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    {t('vendor_all_categories')}
                  </button>
                  {filteredCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setFilterCategory(cat); setIsCategoryOpen(false); setCategorySearch(''); setCurrentPage(1); }}
                      className="w-full px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                  {filteredCategories.length === 0 && (
                    <p className="py-4 text-center text-[8px] font-bold text-slate-400 uppercase">{t('admin_no_results')}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort Filter */}
          <div ref={sortFilterRef} className="relative h-[52px]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSortOpen(!isSortOpen);
                setIsCategoryOpen(false);
              }}
              className="w-full h-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 flex items-center justify-between group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <ArrowUpDown size={12} className="text-primary-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {sortOptions.find(o => o.value === sortBy)?.label}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform pointer-events-none ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden py-2 px-1">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSortBy(opt.value); setIsSortOpen(false); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Select Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {visibleProducts.length.toLocaleString()} published products
        </p>
        <button
          onClick={() => isSelectMode ? exitSelectMode() : setIsSelectMode(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelectMode
            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <Check size={13} strokeWidth={3} />
          {isSelectMode ? 'Cancel Select' : 'Select'}
        </button>
      </div>

      {/* Products Grid — inline skeleton while loading, stable layout throughout */}
      {isFetching && products.length === 0 ? (
        /* First-load skeleton: only the grid area, filter bar stays visible */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-1/3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/4" />
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 h-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visibleProducts.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <div key={product.id} className={`
            p-4 rounded-3xl border transition-all group relative flex flex-col justify-between
            ${isSelectMode && isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 ring-2 ring-primary-500/30' : editingId === product.id ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700'}
          `}>
                <div
                  onClick={() => {
                    if (isSelectMode) {
                      setSelectedIds(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
                    }
                  }}
                  className={isSelectMode ? 'cursor-pointer' : ''}
                >
                  {/* Top Section: Image + Info */}
                  <div className="flex gap-4 mb-4">
                    {/* Image Area */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 group/img border border-slate-200 dark:border-slate-800">
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 block cursor-pointer z-10"
                      >
                        <img src={product.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="" />
                      </a>
                      {isSelectMode && (
                        <div className="absolute top-1.5 left-1.5 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds(prev =>
                                prev.includes(product.id)
                                  ? prev.filter(id => id !== product.id)
                                  : [...prev, product.id]
                              );
                            }}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-md ${isSelected
                              ? 'bg-primary-500 border-primary-500 text-white'
                              : 'bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-transparent'
                              }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Basic Info Area */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em]">{product.shops?.name || 'Shop'}</p>
                        {product.categories?.name && (
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">• {product.categories.name}</span>
                        )}
                      </div>

                      <h5 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-2 truncate">
                        {product.name}
                      </h5>

                      <div className="flex items-center gap-3">
                        <p className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1">
                          <span className="text-slate-500 text-xs">$</span>
                          {new Intl.NumberFormat().format(product.price)}
                        </p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[7px] font-black uppercase tracking-widest">{t('admin_published')}</span>
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-slate-400">
                        <Calendar size={10} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">
                          {new Date(product.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{t('admin_views')}</p>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                            <Eye size={14} className="text-blue-500" />
                            <span className="text-xs font-black">{product.view_count || 0}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{t('admin_likes')}</p>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                            <Heart size={14} className="text-red-500" />
                            <span className="text-xs font-black">{product.like_count || 0}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{t('admin_comments')}</p>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                            <MessageCircle size={14} className="text-purple-500" />
                            <span className="text-xs font-black">{product.comment_count || 0}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Sales</p>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                            <TrendingDown size={14} className="text-emerald-500" />
                            <span className="text-xs font-black">{salesCounts[product.id] || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/50 flex-wrap">
                      {editingId === product.id ? (
                        <div className="flex flex-col gap-3 w-full animate-in zoom-in-95 duration-200">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-slate-400 uppercase">Views</p>
                              <input type="number" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-900 dark:text-white outline-none" value={editForm.view_count} onChange={(e) => setEditForm({ ...editForm, view_count: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-slate-400 uppercase">Likes</p>
                              <input type="number" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-900 dark:text-white outline-none" value={editForm.like_count} onChange={(e) => setEditForm({ ...editForm, like_count: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-slate-400 uppercase">Comments</p>
                              <input type="number" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-900 dark:text-white outline-none" value={editForm.comment_count} onChange={(e) => setEditForm({ ...editForm, comment_count: parseInt(e.target.value) })} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveProduct(product.id)} className="flex-1 py-2 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                              <Save size={12} /> {t('admin_save')}
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditing(product); }}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 rounded-xl transition-all group/btn"
                            title={t('admin_edit_values')}
                          >
                            <Edit3 size={18} className="group-hover/btn:scale-110 transition-transform" />
                          </button>

                          <a
                            href={`/product/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 rounded-xl transition-all group/btn"
                            title={t('admin_view_post')}
                          >
                            <ExternalLink size={18} className="group-hover/btn:scale-110 transition-transform" />
                          </a>

                          {quickBoostId === product.id ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                              <div className="relative">
                                <Zap size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-500" fill="currentColor" />
                                <input
                                  type="number"
                                  autoFocus
                                  className="w-20 bg-white dark:bg-slate-900 border border-primary-500/50 rounded-lg py-1 pl-6 pr-2 text-[10px] font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                                  value={quickBoostValue}
                                  onChange={(e) => setQuickBoostValue(parseInt(e.target.value) || 0)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') boostProductNow(product.id, product.view_count);
                                    if (e.key === 'Escape') setQuickBoostId(null);
                                  }}
                                />
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); boostProductNow(product.id, product.view_count); }}
                                disabled={isSavingBoost}
                                className="p-1.5 bg-primary-500 text-white rounded-lg hover:scale-110 transition-all shadow-lg shadow-primary-500/20"
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setQuickBoostId(null); }}
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg hover:text-red-500 transition-all"
                              >
                                <X size={14} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setQuickBoostId(product.id); setQuickBoostValue(boostConfig.amount); }}
                                className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 rounded-xl transition-all group/btn"
                                title={t('admin_quick_boost')}
                              >
                                <Zap size={18} className="group-hover/btn:scale-110 transition-transform" />
                              </button>

                              {/* Buy Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); openPurchaseModal(product); }}
                                className="flex items-center gap-2 p-2 text-emerald-500 bg-emerald-500/5 rounded-xl transition-all group/btn"
                                title="Make a purchase"
                              >
                                <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" /> สั่งชื้อ
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Select Mode Action Bar */}
      {isSelectMode && (
        <div className="sticky bottom-3 z-50 px-0">
          <div className="bg-slate-200 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/10 dark:border-slate-800 overflow-hidden">
            <div className="flex items-stretch divide-x divide-slate-400 dark:divide-slate-800">

              {/* Count */}
              <div className="flex flex-col items-center justify-center px-3 sm:px-4 py-2.5 min-w-[52px]">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-none mb-0.5">sel</span>
                <span className="text-base font-black text-slate-900 dark:text-white leading-none">{selectedIds.length}</span>
              </div>

              {/* Select All */}
              <button
                onClick={() => {
                  const currentIds = visibleProducts.map(p => p.id);
                  const allSelected = currentIds.length > 0 && currentIds.every(id => selectedIds.includes(id));
                  setSelectedIds(allSelected ? [] : Array.from(new Set([...selectedIds, ...currentIds])));
                }}
                className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors gap-0.5"
              >
                <Check size={13} strokeWidth={3} />
                <span className="leading-none">
                  {visibleProducts.length > 0 && visibleProducts.every(p => selectedIds.includes(p.id))
                    ? 'Desel.' : 'All'}
                </span>
              </button>

              {/* Unpublish */}
              <button
                onClick={handleUnpublishSelected}
                disabled={!selectedIds.length || isDeleting}
                className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-2.5 text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors gap-0.5 disabled:opacity-30"
              >
                <X size={13} strokeWidth={3} />
                <span className="leading-none">Unpub.</span>
              </button>

              {/* Delete */}
              <button
                onClick={handleDeleteSelected}
                disabled={!selectedIds.length || isDeleting}
                className="flex-1 flex flex-col items-center justify-center px-3 sm:px-5 py-2.5 text-[8px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-30 active:scale-95 gap-0.5"
              >
                {isDeleting
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <X size={13} strokeWidth={3} />
                }
                <span className="leading-none">Delete</span>
              </button>

            </div>
          </div>
        </div>
      )}

      <div className={`bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Purchase Modal */}
      {selectedProductForPurchase && (
        <PurchaseModal
          product={selectedProductForPurchase}
          isOpen={purchaseModalOpen}
          onClose={closePurchaseModal}
        />
      )}
    </div>
  );
};
