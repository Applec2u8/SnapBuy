import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { LogActionParams } from './useAdminActivityLog';

// ── Types ────────────────────────────────────────────────────────────

interface UseAdminOptions {
  /** Called after every successful write action to persist an activity log. */
  logAction?: (params: LogActionParams) => Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────────────────

export const useAdmin = (options: UseAdminOptions = {}) => {
  const { logAction } = options;

  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalSales: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── All fetch functions MUST be declared before the useEffect ──────
  // (const arrow functions are NOT hoisted — TDZ applies)

  const fetchStats = async () => {
    try {
      const { count: userCount }    = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: shopCount }    = await supabase.from('shops').select('*', { count: 'exact', head: true });
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      setStats({
        totalUsers:    userCount    || 0,
        totalShops:    shopCount    || 0,
        totalProducts: productCount || 0,
        totalSales: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (params: {
    page: number;
    pageSize: number;
    search?: string;
    category?: string;
    sortBy?: string;
    shopId?: string | null;
  }) => {
    setProductsLoading(true);
    try {
      const isCategoryFilter = params.category && params.category !== 'all';
      let query = supabase
        .from('products')
        .select(
          isCategoryFilter
            ? '*, shops(name, profiles(full_name)), categories!inner(name)'
            : '*, shops(name, profiles(full_name)), categories(name)',
          { count: 'exact' }
        );

      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      if (params.shopId) {
        query = query.eq('shop_id', params.shopId);
      }

      if (isCategoryFilter && params.category) {
        query = query.eq('categories.name', params.category);
      }

      const sortMap: Record<string, { column: string; ascending: boolean }> = {
        'price-desc': { column: 'price',      ascending: false },
        'price-asc':  { column: 'price',      ascending: true  },
        'views-desc': { column: 'view_count', ascending: false },
        'oldest':     { column: 'created_at', ascending: true  },
        'newest':     { column: 'created_at', ascending: false }
      };

      const sort = sortMap[params.sortBy || 'newest'] || sortMap.newest;
      query = query.order(sort.column, { ascending: sort.ascending });

      const from = (params.page - 1) * params.pageSize;
      const to   = from + params.pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      setProducts(data || []);
      setTotalProductsCount(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const updateProductStats = async (
    productId: string,
    updates: { view_count?: number; like_count?: number; comment_count?: number },
    meta?: { productName?: string; shopName?: string; ownerName?: string; oldViews?: number; oldLikes?: number; hideToast?: boolean }
  ) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
      
      if (!meta?.hideToast) {
        toast.success('Product updated successfully');
      }

      // ── Log the action ──
      const product = products.find(p => p.id === productId);
      const name = meta?.productName || product?.name || productId;
      const shopName = meta?.shopName || product?.shops?.name || 'Unknown Shop';
      const ownerName = meta?.ownerName || product?.shops?.profiles?.full_name || 'Unknown User';

      if (logAction) {
        if (updates.view_count !== undefined) {
          const old_views = meta?.oldViews ?? product?.view_count ?? 0;
          await logAction({
            action_type: 'boost_views',
            target_type: 'product',
            target_id:   productId,
            target_name: name,
            metadata: {
              old_value: old_views,
              new_value: updates.view_count,
              amount: updates.view_count - old_views,
              shop_name: shopName,
              owner_name: ownerName
            },
          });
        }
        if (updates.like_count !== undefined) {
          const old_likes = meta?.oldLikes ?? product?.like_count ?? 0;
          await logAction({
            action_type: 'boost_likes',
            target_type: 'product',
            target_id:   productId,
            target_name: name,
            metadata: {
              old_value: old_likes,
              new_value: updates.like_count,
              amount: updates.like_count - old_likes,
              shop_name: shopName,
              owner_name: ownerName
            },
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateUserMetadata = async (userId: string, updates: any) => {
    try {
      const { error, count } = await supabase
        .from('profiles')
        .update(updates, { count: 'exact' })
        .eq('id', userId);

      if (error) throw error;

      if (count === 0) {
        toast.error('Update failed: Insufficient permissions. Make sure your account has admin role in the database.');
        return;
      }

      const user = users.find(u => u.id === userId);
      const name = user?.full_name || user?.email || userId;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      toast.success('Updated successfully');

      // ── Log the action ──
      if (logAction) {
        // Determine most descriptive action type
        let action_type: LogActionParams['action_type'] = 'update_user';
        let metadata: Record<string, unknown> = {};

        if ('role' in updates) {
          action_type = 'update_role';
          metadata = { old_value: user?.role, new_value: updates.role };
        } else if ('auto_boost_enabled' in updates) {
          action_type = 'toggle_auto_boost';
          metadata = { enabled: updates.auto_boost_enabled };
        } else if ('auto_like_boost_enabled' in updates) {
          action_type = 'toggle_auto_like_boost';
          metadata = { enabled: updates.auto_like_boost_enabled };
        } else if ('allow_credit_card' in updates) {
          action_type = 'allow_credit_card';
          metadata = { enabled: updates.allow_credit_card };
        } else {
          metadata = updates;
        }

        await logAction({
          action_type,
          target_type: 'user',
          target_id:   userId,
          target_name: name,
          metadata,
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ── useEffect AFTER all fetch functions so they are in scope ───────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchShops(),
        fetchCategories(),
        fetchProducts({ page: 1, pageSize: 20 })
      ]);
      setLoading(false);
    };
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stats,
    users,
    shops,
    categories,
    products,
    totalProductsCount,
    loading: loading && stats.totalUsers === 0,
    productsLoading,
    isRefreshing,
    fetchProducts,
    updateProductStats,
    updateUserMetadata,
    refreshData: async () => {
      setIsRefreshing(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchShops(),
          fetchCategories(),
          fetchProducts({ page: 1, pageSize: 20 })
        ]);
      } finally {
        setIsRefreshing(false);
      }
    }
  };
};
