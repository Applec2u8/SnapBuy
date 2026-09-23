/**
 * UserDetail — state controller / orchestrator.
 * All visual rendering is delegated to sub-components.
 * Sub-components live alongside this file:
 *   UserProfileCard  · UserRoleCard  · AutoBoostCard
 *   BoostModal       · UserProductsPanel  (→ ProductCard)
 */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../../../lib/supabase';

import type { UserProfile, ProductRecord, ShopRecord, BoostConfig, BoostOptions, EditForm } from './types';
import { UserProfileCard } from './UserProfileCard';
import { AutoBoostCard } from './AutoBoostCard';
import { BoostModal } from './BoostModal';
import { UserProductsPanel } from './UserProductsPanel';

interface UserDetailProps {
  userId: string;
  users: UserProfile[];
  onBack: () => void;
  onUpdateProduct: (productId: string, updates: Partial<ProductRecord>, meta?: any) => Promise<void>;
  onUpdateUser?: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
}

export const UserDetail: React.FC<UserDetailProps> = ({
  userId,
  users,
  onBack,
  onUpdateProduct,
  onUpdateUser,
}) => {
  const { t } = useTranslation();
  const user = users.find((u) => u.id === userId);

  // ── Data ─────────────────────────────────────────────────────────────────
  const [userShops, setUserShops] = useState<ShopRecord[]>([]);
  const userShopsRef = useRef<ShopRecord[]>([]); // always up-to-date, safe for stale closures
  const [userProducts, setUserProducts] = useState<ProductRecord[]>([]);
  const [totalUserProductsCount, setTotalUserProductsCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [unpublishedCount_state, setUnpublishedCount_state] = useState(0);
  const [loadingUserProducts, setLoadingUserProducts] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // ── UI / filter state ─────────────────────────────────────────────────────
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ view_count: 0, like_count: 0, comment_count: 0 });
  const [quickBoostId, setQuickBoostId] = useState<string | null>(null);
  const [quickBoostValue, setQuickBoostValue] = useState(0);
  const [quickBoostLikesValue, setQuickBoostLikesValue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [boostProgress, setBoostProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [boostOptions, setBoostOptions] = useState<BoostOptions>({
    percentage: 100,
    mode: 'random',
    type: 'views',
  });
  const itemsPerPage = 10;

  // ── Boost configs (saved = committed, pending = in-edit) ──────────────────
  const initViewBoost = (): BoostConfig => {
    try {
      const local = localStorage.getItem(`view_boost_${userId}`);
      if (local) return JSON.parse(local);
    } catch { /* ignore */ }
    return { isEnabled: user?.auto_boost_enabled || false, amount: user?.auto_boost_amount || 100, frequency: user?.auto_boost_frequency || 'hourly' };
  };
  const initLikeBoost = (): BoostConfig => {
    try {
      const local = localStorage.getItem(`like_boost_${userId}`);
      if (local) return JSON.parse(local);
    } catch { /* ignore */ }
    return { isEnabled: user?.auto_like_boost_enabled || false, amount: user?.auto_like_boost_amount || 100, frequency: user?.auto_like_boost_frequency || 'hourly' };
  };

  const [savedBoostConfig, setSavedBoostConfig] = useState<BoostConfig>(initViewBoost);
  const [pendingBoostConfig, setPendingBoostConfig] = useState<BoostConfig>(initViewBoost);
  const [savedLikeBoostConfig, setSavedLikeBoostConfig] = useState<BoostConfig>(initLikeBoost);
  const [pendingLikeBoostConfig, setPendingLikeBoostConfig] = useState<BoostConfig>(initLikeBoost);
  const [isSavingBoost, setIsSavingBoost] = useState(false);

  // ── Stable ref for onUpdateUser (avoids stale-closure issues) ────────────
  const onUpdateUserRef = useRef(onUpdateUser);
  useEffect(() => { onUpdateUserRef.current = onUpdateUser; });

  // ── Dirty flags ───────────────────────────────────────────────────────────
  const isAnyBoostDirty =
    JSON.stringify(pendingBoostConfig) !== JSON.stringify(savedBoostConfig) ||
    JSON.stringify(pendingLikeBoostConfig) !== JSON.stringify(savedLikeBoostConfig);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickAway = () => { setIsCategoryOpen(false); setIsSortOpen(false); setIsShopDropdownOpen(false); };
    if (isCategoryOpen || isSortOpen || isShopDropdownOpen) window.addEventListener('click', handleClickAway);
    return () => window.removeEventListener('click', handleClickAway);
  }, [isCategoryOpen, isSortOpen, isShopDropdownOpen]);

  useEffect(() => {
    supabase.from('shops').select('*').eq('owner_id', userId)
      .then(({ data }) => {
        if (data) {
          setUserShops(data);
          userShopsRef.current = data; // keep ref in sync immediately
        }
      });
    supabase.from('categories').select('*').order('name')
      .then(({ data }) => { if (data) setCategories(data); });
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(fetchUserProducts, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userShops, searchTerm, filterCategory, sortBy, currentPage, selectedShopId]);

  useEffect(() => {
    const area = document.getElementById('admin-content-area');
    if (area) area.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Background auto-boost when viewing a user profile
  useEffect(() => {
    if (!userId) return;
    const triggerBackgroundBoost = async () => {
      try {
        await supabase.rpc('process_auto_boosts', { p_user_id: userId });
        // Wait a short moment to ensure DB changes commit, then refresh products
        setTimeout(fetchUserProducts, 1000);
      } catch (err) {
        console.error('Error in background auto boost:', err);
      }
    };
    triggerBackgroundBoost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Memoised categories ───────────────────────────────────────────────────
  const allCategories = useMemo(() => categories.map((c) => c.name).filter(Boolean) as string[], [categories]);
  const filteredCategories = useMemo(
    () => allCategories.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase())),
    [allCategories, categorySearch],
  );

  // ── Data fetching ─────────────────────────────────────────────────────────
  async function fetchUserProducts() {
    // Always read from ref so stale closures (e.g. from setTimeout) get current shops
    const shops = userShopsRef.current;
    if (shops.length === 0) { setUserProducts([]); setTotalUserProductsCount(0); return; }
    setLoadingUserProducts(true);
    try {
      const shopIds = selectedShopId === 'all' ? shops.map((s) => s.id) : [selectedShopId];
      const isCategoryFilter = filterCategory !== 'all';
      let query = supabase
        .from('products')
        .select(
          isCategoryFilter
            ? '*, shops(name), categories!inner(name)'
            : '*, shops(name), categories(name)',
          { count: 'exact' }
        )
        .in('shop_id', shopIds);

      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
      if (isCategoryFilter) query = query.filter('categories.name', 'eq', filterCategory);

      const sortMap: Record<string, { column: string; ascending: boolean }> = {
        'price-desc': { column: 'price', ascending: false },
        'price-asc': { column: 'price', ascending: true },
        'views-desc': { column: 'view_count', ascending: false },
        'views-asc': { column: 'view_count', ascending: true },
        'oldest': { column: 'created_at', ascending: true },
        'newest': { column: 'created_at', ascending: false },
      };
      const sort = sortMap[sortBy] || sortMap.newest;
      query = query.order(sort.column, { ascending: sort.ascending });

      const from = (currentPage - 1) * itemsPerPage;
      const { data, error, count } = await query.range(from, from + itemsPerPage - 1);
      if (error) throw error;
      setUserProducts(data || []);
      setTotalUserProductsCount(count || 0);

      // Fetch published/unpublished counts for this shop selection (all pages)
      const shopIds2 = selectedShopId === 'all' ? shops.map((s) => s.id) : [selectedShopId];
      const { data: countData } = await supabase
        .from('products')
        .select('is_published')
        .in('shop_id', shopIds2);
      if (countData) {
        setPublishedCount(countData.filter(p => p.is_published).length);
        setUnpublishedCount_state(countData.filter(p => !p.is_published).length);
      }
    } catch (err) {
      console.error('Error fetching user products:', err);
    } finally {
      setLoadingUserProducts(false);
    }
  }

  const handleSaveBoostSettings = async () => {
    setIsSavingBoost(true);
    try {
      localStorage.setItem(`view_boost_${userId}`, JSON.stringify(pendingBoostConfig));
      localStorage.setItem(`like_boost_${userId}`, JSON.stringify(pendingLikeBoostConfig));
      await onUpdateUserRef.current?.(userId, {
        auto_boost_enabled: pendingBoostConfig.isEnabled,
        auto_boost_amount: pendingBoostConfig.amount,
        auto_boost_frequency: pendingBoostConfig.frequency,
        auto_like_boost_enabled: pendingLikeBoostConfig.isEnabled,
        auto_like_boost_amount: pendingLikeBoostConfig.amount,
        auto_like_boost_frequency: pendingLikeBoostConfig.frequency,
      });
      setSavedBoostConfig({ ...pendingBoostConfig });
      setSavedLikeBoostConfig({ ...pendingLikeBoostConfig });
      
      // Trigger the background boost immediately after saving
      await supabase.rpc('process_auto_boosts', { p_user_id: userId });
      fetchUserProducts();
    } catch (err) {
      console.warn('Failed to save boost settings:', err);
    } finally {
      setIsSavingBoost(false);
    }
  };

  const handleRevertBoostSettings = () => {
    setPendingBoostConfig({ ...savedBoostConfig });
    setPendingLikeBoostConfig({ ...savedLikeBoostConfig });
  };

  const handleToggleViewBoost = async (enabled: boolean) => {
    const newConfig = { ...pendingBoostConfig, isEnabled: enabled };
    setPendingBoostConfig(newConfig);
    setSavedBoostConfig(newConfig);
    try {
      await onUpdateUserRef.current?.(userId, { auto_boost_enabled: enabled });
      if (enabled) {
        await supabase.rpc('process_auto_boosts', { p_user_id: userId });
        fetchUserProducts();
      }
    } catch (err) {
      console.error('Error toggling view boost:', err);
    }
  };

  const handleToggleLikeBoost = async (enabled: boolean) => {
    const newConfig = { ...pendingLikeBoostConfig, isEnabled: enabled };
    setPendingLikeBoostConfig(newConfig);
    setSavedLikeBoostConfig(newConfig);
    try {
      await onUpdateUserRef.current?.(userId, { auto_like_boost_enabled: enabled });
      if (enabled) {
        await supabase.rpc('process_auto_boosts', { p_user_id: userId });
        fetchUserProducts();
      }
    } catch (err) {
      console.error('Error toggling like boost:', err);
    }
  };

  const executeBoost = async () => {
    if (!userId) return;
    setIsSavingBoost(true);
    try {
      // ── Step 1: Fetch shop IDs for THIS specific user directly from DB ──
      const shopIds = selectedShopId === 'all' ? userShops.map((s) => s.id) : [selectedShopId];
      const { data: ownerShops, error: shopsError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', userId)
        .in('id', shopIds);

      if (shopsError) throw shopsError;
      if (!ownerShops || ownerShops.length === 0) {
        setBoostProgress(null);
        return;
      }

      const ownedShopIds = ownerShops.map((s) => s.id);

      // ── Step 2: Fetch ALL products — filtered by owner's shop IDs ────────
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('id, name, is_published, view_count, like_count, created_at, shop_id')
        .in('shop_id', ownedShopIds);

      if (error) throw error;

      // Double-check: only products whose shop_id is in ownedShopIds
      const ownedProducts = (allProducts || []).filter(
        (p) => ownedShopIds.includes(p.shop_id)
      );

      const unpublishedCount = ownedProducts.filter(p => !p.is_published).length;
      // Only boost PUBLISHED products — unpublished ones are paused by the seller
      const safeProducts = ownedProducts.filter((p) => p.is_published === true);

      if (safeProducts.length === 0) {
        toast.error(`No published products to boost. ${unpublishedCount} unpublished products were skipped.`, { duration: 5000 });
        return;
      }

      let pool = [...safeProducts];
      const count = Math.ceil((pool.length * boostOptions.percentage) / 100);

      // Shuffle or sort
      if (boostOptions.mode === 'random') {
        pool = pool.sort(() => Math.random() - 0.5);
      } else {
        pool = pool.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }

      pool = pool.slice(0, count);

      const updatesMap: Record<string, { view_count?: number; like_count?: number }> = {};
      pool.forEach((p) => {
        const u: { view_count?: number; like_count?: number } = {};

        let addViews = pendingBoostConfig.amount;
        let addLikes = pendingLikeBoostConfig.amount;

        // Add realistic variation if random mode is selected
        if (boostOptions.mode === 'random') {
          addViews = Math.max(1, Math.floor(Math.random() * pendingBoostConfig.amount) + 1);
          addLikes = Math.max(1, Math.floor(Math.random() * pendingLikeBoostConfig.amount) + 1);
        }

        if (boostOptions.type !== 'likes') u.view_count = (p.view_count || 0) + addViews;
        if (boostOptions.type !== 'views') u.like_count = (p.like_count || 0) + addLikes;
        updatesMap[p.id] = u;
      });

      // ── Sequential update with real-time progress tracking ──────────────
      const total = pool.length;
      setBoostProgress({ current: 0, total });

      // Batch in groups of 5 for speed + visible progress
      const BATCH_SIZE = 5;
      for (let i = 0; i < pool.length; i += BATCH_SIZE) {
        const batch = pool.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((p) => {
          const shopName = userShops.find(s => s.id === p.shop_id)?.name || 'Unknown Shop';
          const ownerName = user?.full_name || 'Unknown User';
          return onUpdateProduct(p.id, updatesMap[p.id], {
            productName: p.name,
            shopName,
            ownerName,
            oldViews: p.view_count,
            oldLikes: p.like_count,
            hideToast: true,
          });
        }));
        setBoostProgress({ current: Math.min(i + BATCH_SIZE, total), total });
      }

      // Refresh current page's visible products to reflect new values
      const boostedIds = new Set(pool.map((p) => p.id));
      setUserProducts((prev) => prev.map((p) => boostedIds.has(p.id) ? { ...p, ...updatesMap[p.id] } : p));

      // Short delay so user sees 100% before modal closes
      await new Promise((res) => setTimeout(res, 600));
      setIsBoostModalOpen(false);

      // Summary toast
      const shopLabel = selectedShopId === 'all' ? 'all shops' : (userShops.find(s => s.id === selectedShopId)?.name || selectedShopId);
      const boostLabel = boostOptions.type === 'views'
        ? `+${pendingBoostConfig.amount} views`
        : boostOptions.type === 'likes'
          ? `+${pendingLikeBoostConfig.amount} likes`
          : `+${pendingBoostConfig.amount} views / +${pendingLikeBoostConfig.amount} likes`;
    } finally {
      setIsSavingBoost(false);
      setBoostProgress(null);
    }
  };

  const handleStartEditing = (product: ProductRecord) => {
    setEditingProductId(product.id);
    setEditForm({ view_count: product.view_count || 0, like_count: product.like_count || 0, comment_count: product.comment_count || 0 });
  };

  const handleSaveProduct = async (id: string) => {
    await onUpdateProduct(id, editForm);
    setEditingProductId(null);
  };

  const handleOpenQuickBoost = (productId: string, defaultView: number, defaultLike: number) => {
    setQuickBoostId(productId);
    setQuickBoostValue(defaultView);
    setQuickBoostLikesValue(defaultLike);
  };

  const handleConfirmQuickBoost = async (productId: string, currentViews: number, currentLikes: number) => {
    setIsSavingBoost(true);
    try {
      const updates = {
        view_count: currentViews + quickBoostValue,
        like_count: currentLikes + quickBoostLikesValue,
      };
      await onUpdateProduct(productId, updates);
      setUserProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
      setQuickBoostId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBoost(false);
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!user) return <div>User not found</div>;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-500 hover:shadow-lg transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {t('admin_user_management')}
          </h2>
          <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest leading-none mt-1">
            {t('admin_configuring')}: {user.full_name}
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          <UserProfileCard 
            user={user} 
            userShops={userShops} 
            selectedShopId={selectedShopId}
            onSelectShop={(id) => { setSelectedShopId(id); setCurrentPage(1); setIsShopDropdownOpen(false); }}
            isShopDropdownOpen={isShopDropdownOpen}
            setIsShopDropdownOpen={setIsShopDropdownOpen}
          />
          {/* <UserRoleCard user={user} isSavingRole={isSavingRole} onUpdateRole={handleUpdateRole} /> */}

          <AutoBoostCard
            pendingBoostConfig={pendingBoostConfig}
            setPendingBoostConfig={setPendingBoostConfig}
            pendingLikeBoostConfig={pendingLikeBoostConfig}
            setPendingLikeBoostConfig={setPendingLikeBoostConfig}
            isAnyBoostDirty={isAnyBoostDirty}
            isSavingBoost={isSavingBoost}
            hasProducts={userProducts.length > 0}
            onSave={handleSaveBoostSettings}
            onDiscard={handleRevertBoostSettings}
            onOpenBoostModal={() => setIsBoostModalOpen(true)}
            onToggleViewBoost={handleToggleViewBoost}
            onToggleLikeBoost={handleToggleLikeBoost}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">

          <UserProductsPanel
            products={userProducts}
            totalCount={totalUserProductsCount}
            publishedCount={publishedCount}
            unpublishedCount={unpublishedCount_state}
            loading={loadingUserProducts}
            searchTerm={searchTerm}
            filterCategory={filterCategory}
            sortBy={sortBy}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            filteredCategories={filteredCategories}
            isCategoryOpen={isCategoryOpen}
            isSortOpen={isSortOpen}
            categorySearch={categorySearch}
            editingProductId={editingProductId}
            editForm={editForm}
            quickBoostId={quickBoostId}
            quickBoostValue={quickBoostValue}
            quickBoostLikesValue={quickBoostLikesValue}
            isSavingBoost={isSavingBoost}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onFilterCategory={(cat) => { setFilterCategory(cat); setIsCategoryOpen(false); setCategorySearch(''); }}
            onSortChange={(s) => { setSortBy(s); setIsSortOpen(false); }}
            onPageChange={setCurrentPage}
            onToggleCategoryOpen={() => { setIsCategoryOpen((p) => !p); setIsSortOpen(false); }}
            onToggleSortOpen={() => { setIsSortOpen((p) => !p); setIsCategoryOpen(false); }}
            onCategorySearchChange={setCategorySearch}
            onStartEditing={handleStartEditing}
            onSaveProduct={handleSaveProduct}
            onCancelEditing={() => setEditingProductId(null)}
            onEditFormChange={setEditForm}
            onOpenQuickBoost={handleOpenQuickBoost}
            onConfirmQuickBoost={handleConfirmQuickBoost}
            onCancelQuickBoost={() => setQuickBoostId(null)}
            onQuickBoostViewChange={setQuickBoostValue}
            onQuickBoostLikeChange={setQuickBoostLikesValue}
          />
        </div>
      </div>

      {/* Boost Modal */}
      {isBoostModalOpen && (
        <BoostModal
          boostOptions={boostOptions}
          setBoostOptions={setBoostOptions}
          pendingBoostConfig={pendingBoostConfig}
          pendingLikeBoostConfig={pendingLikeBoostConfig}
          userProductsCount={totalUserProductsCount}
          isSavingBoost={isSavingBoost}
          boostProgress={boostProgress}
          onClose={() => { if (!isSavingBoost) setIsBoostModalOpen(false); }}
          onExecute={executeBoost}
        />
      )}
    </div>
  );
};
