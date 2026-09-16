import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ArrowLeft, Building2, CalendarDays, CircleDollarSign, Download, ExternalLink,
  Gift, MapPin, Package, RefreshCw, ShieldCheck, Star, TrendingUp, User,
  Wallet, X, Filter, Clock, BarChart2, Percent, Tag, LayoutDashboard,
  ShoppingBag, Plus, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Modals
import ImportProductJsonModal from '../../../VendorDashboard/components/ImportProductJsonModal';
import AddProductModal from '../../../VendorDashboard/components/AddProductModal';

// Tab Views
import { ShopDashboardTab } from './components/ShopDashboardTab';
import { ShopQuotaTab } from './components/ShopQuotaTab';
import { ShopGuaranteeTab } from './components/ShopGuaranteeTab';
import { ShopProductsTab } from './components/ShopProductsTab';
import { ShopOrdersTab } from './components/ShopOrdersTab';
import { ShopWalletTab } from './components/ShopWalletTab';

interface ShopDetailProps {
  shopId: string;
  onBack: () => void;
  onViewProducts?: (shopId: string) => void;
}

export type ShopTabKey = 'dashboard' | 'quota' | 'guarantee' | 'products' | 'orders' | 'wallet';

export const ShopDetail: React.FC<ShopDetailProps> = ({ shopId, onBack, onViewProducts }) => {
  const [activeTab, setActiveTab] = useState<ShopTabKey>('dashboard');
  const [shop, setShop] = useState<any | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Operational metrics & data
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletTotals, setWalletTotals] = useState({ sale: 0, bonus: 0, withdrawal: 0, total: 0 });
  const [quotaHistory, setQuotaHistory] = useState<any[]>([]);
  const [importJobs, setImportJobs] = useState<any[]>([]);
  const [shippingCount, setShippingCount] = useState(0);
  const [guaranteeCount, setGuaranteeCount] = useState(0);
  const [totalProductCount, setTotalProductCount] = useState(0);
  const [publishedProductCount, setPublishedProductCount] = useState(0);
  const [hiddenProductCount, setHiddenProductCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalViewsCount, setTotalViewsCount] = useState(0);
  const [totalLikesCount, setTotalLikesCount] = useState(0);

  // Categories & Orders
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);
  const [pendingShipmentsDetails, setPendingShipmentsDetails] = useState<any[]>([]);
  const [pendingGuaranteeItems, setPendingGuaranteeItems] = useState<any[]>([]);
  const [paidGuaranteeItems, setPaidGuaranteeItems] = useState<any[]>([]);

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [freeCategoriesForm, setFreeCategoriesForm] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [generateCount, setGenerateCount] = useState<number>(1);
  const [generationErrors, setGenerationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    variants: [] as any[]
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch shop record
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // 2. Fetch owner profile
      if (shopData?.owner_id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', shopData.owner_id)
            .single();
          setOwnerProfile(profileData || null);
        } catch (e) {
          console.warn('Failed to load owner profile', e);
        }
      }

      // 3. Parallel fetch all related resources
      const [
        productsRes,
        txRes,
        quotaHistoryRes,
        jobsRes,
        categoriesRes,
        orderItemsRes,
        pendingGuaranteeRes,
        paidGuaranteeRes,
        allCatsRes,
        productCountRes,
        publishedCountRes,
        hiddenCountRes,
        outOfStockRes,
        viewsRes,
        likesRes,
        walletTxRes
      ] = await Promise.all([
        supabase.from('products').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(10),
        supabase.from('shop_wallet_transactions').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(10),
        supabase.from('store_quotas').select('*').eq('used_by_shop_id', shopId).order('used_at', { ascending: false }).limit(20),
        supabase.from('generation_jobs').select('*').eq('shop_id', shopId).in('status', ['running', 'paused']).order('created_at', { ascending: false }),
        supabase.from('shop_categories').select('category_id').eq('shop_id', shopId),
        supabase.from('order_items').select(`
          id, quantity, price, order_id, variant_id, guarantee_paid, created_at,
          orders ( id, status, created_at, expected_delivery_date, total_amount, shipping_address_id, profiles(full_name), user_addresses!orders_shipping_address_id_fkey(full_name, phone, address_line, district, city, province, postal_code) ),
          products ( id, name, images, shop_id ),
          product_variants ( id, name, value, image_url )
        `).eq('shop_id', shopId).eq('guarantee_paid', true).order('created_at', { ascending: false }),
        supabase.from('order_items').select(`
          id, quantity, price, created_at, guarantee_paid,
          orders ( id, user_id, status, expected_delivery_date, shipping_address_id, profiles(full_name), user_addresses!orders_shipping_address_id_fkey(full_name, phone, address_line, district, city, province, postal_code) ),
          products ( name, images ),
          product_variants ( name, value, image_url )
        `).eq('shop_id', shopId).eq('guarantee_paid', false).order('created_at', { ascending: false }),
        supabase.from('order_items').select(`
          id, quantity, price, created_at, guarantee_paid, guarantee_paid_at,
          orders ( id, user_id, status, expected_delivery_date, shipping_address_id, profiles(full_name), user_addresses!orders_shipping_address_id_fkey(full_name, phone, address_line, district, city, province, postal_code) ),
          products ( name, images ),
          product_variants ( name, value, image_url )
        `).eq('shop_id', shopId).eq('guarantee_paid', true).order('guarantee_paid_at', { ascending: false }).limit(50),
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_published', true).gt('stock_quantity', 0),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_published', false),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).lte('stock_quantity', 0),
        supabase.from('products').select('view_count').eq('shop_id', shopId),
        supabase.from('products').select('like_count').eq('shop_id', shopId),
        supabase.from('shop_wallet_transactions').select('type, amount').eq('shop_id', shopId).limit(2000)
      ]);

      setProducts(productsRes.data || []);
      setTransactions(txRes.data || []);
      setQuotaHistory(quotaHistoryRes.data || []);
      setImportJobs(jobsRes.data || []);

      const shopCatsArray = (categoriesRes.data || []).map((c: any) => c.category_id);
      setShopCats(shopCatsArray);
      setAllCategories(allCatsRes.data || []);

      setTotalProductCount(productCountRes.count || 0);
      setPublishedProductCount(publishedCountRes.count || 0);
      setHiddenProductCount(hiddenCountRes.count || 0);
      setOutOfStockCount(outOfStockRes.count || 0);

      const totalViews = (viewsRes.data || []).reduce((sum: number, p: any) => sum + Number(p.view_count || 0), 0);
      const totalLikes = (likesRes.data || []).reduce((sum: number, p: any) => sum + Number(p.like_count || 0), 0);
      setTotalViewsCount(totalViews);
      setTotalLikesCount(totalLikes);

      const allOrders = orderItemsRes.data || [];
      setPendingShipmentsDetails(allOrders);
      const shippingItems = allOrders.filter((item: any) =>
        ['processing', 'pending', 'shipped'].includes(item.orders?.status || item.status)
      );
      setShippingCount(shippingItems.length);

      setPendingGuaranteeItems(pendingGuaranteeRes.data || []);
      setPaidGuaranteeItems(paidGuaranteeRes.data || []);
      setGuaranteeCount(pendingGuaranteeRes.data?.length || 0);

      // Compute wallet totals
      const allTx = walletTxRes.data || [];
      const sale = allTx.filter((t: any) => t.type === 'sale').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
      const bonus = allTx.filter((t: any) => t.type === 'bonus').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
      const withdrawal = allTx.filter((t: any) => t.type === 'withdrawal').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
      const total = sale + bonus - withdrawal;
      setWalletTotals({ sale, bonus, withdrawal, total });

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลร้านค้าได้');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Generate / Import
  const handleGenerate = async () => {
    if (!shop) return;
    const effectiveProductLimit = shop.product_limit || 0;
    const availableSlots = Math.max(0, effectiveProductLimit - totalProductCount);

    if (availableSlots <= 0) {
      setGenerationErrors(['ไม่มีโควต้าคงเหลือสำหรับร้านค้านี้']);
      return;
    }

    const totalToGenerate = generateCount * selectedCategoryIds.length;
    if (totalToGenerate > availableSlots) {
      setGenerationErrors([`ไม่สามารถสร้าง ${totalToGenerate} ชิ้นได้ โควต้าคงเหลือเพียง ${availableSlots} ชิ้น`]);
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setGenerationErrors(['กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวด']);
      return;
    }

    setIsGenerating(true);
    try {
      const { error: jobError } = await supabase.from('generation_jobs').insert({
        shop_id: shop.id,
        target_count: totalToGenerate,
        completed_count: 0,
        category_ids: selectedCategoryIds,
        status: 'running'
      });

      if (jobError) throw jobError;

      toast.success('เริ่มงานสร้างและนำเข้าสินค้าในพื้นหลังเรียบร้อยแล้ว!');
      setShowImportModal(false);
      setSelectedCategoryIds([]);
      setGenerateCount(1);
      fetchData();
    } catch (error: any) {
      setGenerationErrors([error.message || 'เกิดข้อผิดพลาดในการเริ่มงานนำเข้า']);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Add Product
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    if (shop.product_limit && totalProductCount >= shop.product_limit) {
      toast.error('โควต้าของร้านนี้เต็มแล้ว กรุณาขยายโควต้าก่อน');
      return;
    }

    setUploading(true);
    try {
      const imageUrls: string[] = [];
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${shop.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('strong-shop')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('strong-shop')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      const { variants: _variants, ...productFields } = newProduct;

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          ...productFields,
          shop_id: shop.id,
          images: imageUrls,
          price: parseFloat(newProduct.price) || 0,
          stock_quantity: parseInt(newProduct.stock_quantity, 10) || 0,
          is_published: true
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Insert variants if any
      if (newProduct.variants && newProduct.variants.length > 0) {
        const variantInserts = newProduct.variants.map((v: any) => ({
          product_id: product.id,
          name: v.name,
          value: v.value,
          price_override: v.price_override ? parseFloat(v.price_override) : null,
          stock_quantity: v.stock_quantity ? parseInt(v.stock_quantity, 10) : 0,
          image_url: imageUrls[0] || null
        }));

        await supabase.from('product_variants').insert(variantInserts);
      }

      toast.success('เพิ่มสินค้าใหม่เรียบร้อยแล้ว!');
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        variants: []
      });
      setSelectedFiles([]);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถเพิ่มสินค้าได้: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Quota & operational computed calculations
  const productLimit = Number(shop?.product_limit ?? 0);
  const categoryLimit = Number(shop?.category_limit ?? 0);
  const slotUsage = productLimit > 0 ? Math.min(100, Math.round((totalProductCount / productLimit) * 100)) : 0;
  const isExpired = shop?.quota_expires_at ? new Date(shop.quota_expires_at) < new Date() : false;
  const isSpecialQuotaExpired = shop?.special_quota_expires_at ? new Date(shop.special_quota_expires_at) < new Date() : false;
  const hasActiveSpecialQuota = Boolean(shop?.has_special_quota && (!shop?.special_quota_expires_at || !isSpecialQuotaExpired));
  const hasActiveNormalQuota = Boolean(productLimit > 0 && !isExpired);

  let quotaStatusText = 'No Active Quota';
  let quotaStatusColor = 'text-slate-500 bg-slate-100 dark:bg-slate-800/50';
  if (hasActiveSpecialQuota) {
    quotaStatusText = 'Special Quota';
    quotaStatusColor = 'text-violet-500 bg-violet-500/10 border border-violet-500/20';
  } else if (hasActiveNormalQuota) {
    quotaStatusText = 'Normal Quota';
    quotaStatusColor = 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
  }

  const totalImportTarget = importJobs.reduce((acc, job) => acc + (job.target_count || 0), 0);
  const totalImportCompleted = importJobs.reduce((acc, job) => acc + (job.completed_count || 0), 0);
  const isImporting = importJobs.length > 0;
  const hasPausedJob = importJobs.some(job => job.status === 'paused');

  const summary = useMemo(() => {
    const saleBalance = Number(shop?.sale_balance ?? walletTotals.sale ?? 0);
    const bonusBalance = Number(shop?.bonus_balance ?? walletTotals.bonus ?? 0);
    const totalBalance = saleBalance + bonusBalance;
    const grossSales = walletTotals.sale;
    const totalWithdraw = walletTotals.withdrawal;
    return {
      saleBalance,
      bonusBalance,
      totalBalance,
      grossSales,
      totalWithdraw,
      publishedCount: publishedProductCount,
      totalViews: totalViewsCount,
      totalLikes: totalLikesCount,
    };
  }, [shop, walletTotals, publishedProductCount, totalViewsCount, totalLikesCount]);

  if (loading && !shop) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="space-y-6 text-left">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> กลับหน้ารายชื่อร้านค้า
        </button>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 p-6 text-sm text-rose-600 dark:text-rose-400 font-bold">
          {error || 'ไม่พบข้อมูลร้านค้านี้'}
        </div>
      </div>
    );
  }

  // Define the 6 main tabs exactly as requested
  const tabs = [
    {
      key: 'dashboard' as ShopTabKey,
      label: 'แดชบอร์ด (Dashboard)',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      key: 'quota' as ShopTabKey,
      label: 'โควต้า (Quota)',
      icon: CircleDollarSign,
      badge: productLimit > 0 ? `${totalProductCount}/${productLimit}` : null,
      badgeColor: slotUsage >= 90 ? 'bg-rose-500 text-white' : 'bg-violet-500/10 text-violet-500',
    },
    {
      key: 'guarantee' as ShopTabKey,
      label: 'Guarantee Payments',
      icon: ShieldCheck,
      badge: guaranteeCount > 0 ? `${guaranteeCount}` : 'ดูอย่างเดียว',
      badgeColor: guaranteeCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
    },
    {
      key: 'products' as ShopTabKey,
      label: 'สินค้า (Products)',
      icon: Package,
      badge: `${totalProductCount}`,
      badgeColor: 'bg-primary-500/10 text-primary-500',
    },
    {
      key: 'orders' as ShopTabKey,
      label: 'คำสั่งซื้อ (Orders)',
      icon: ShoppingBag,
      badge: shippingCount > 0 ? `${shippingCount} ส่ง` : `${pendingShipmentsDetails.length}`,
      badgeColor: shippingCount > 0 ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
    },
    {
      key: 'wallet' as ShopTabKey,
      label: 'My Wallet',
      icon: Wallet,
      badge: 'ดูอย่างเดียว',
      badgeColor: 'bg-emerald-500/10 text-emerald-500',
    },
  ];

  const filteredCategories = allCategories.filter((c: any) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* ─── Top Shop Header ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm"
            title="กลับ"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-sm">
              <img
                src={shop.logo_url || shop.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name || 'Shop')}&background=random`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {shop.name || 'Unnamed Shop'}
                </h2>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${quotaStatusColor}`}>
                  {quotaStatusText}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                เจ้าของ: <span className="font-bold text-slate-700 dark:text-slate-300">{ownerProfile?.full_name || 'System'}</span>
                {shop.sales_percentage ? ` • โบนัส ${shop.sales_percentage}%` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick open products button */}
          <button
            onClick={() => setActiveTab('products')}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary-500 bg-primary-500 hover:bg-primary-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary-500/30 hover:scale-105 transition-all"
          >
            <Package size={14} />
            <span>สินค้า</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">🛒</span>
          </button>

          <Link
            to={`/shop/${shop.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm"
          >
            <ExternalLink size={13} />
            <span>Open Store</span>
          </Link>

          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Modern Tab Navigation Bar ────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Tab Content ──────────────────────────────────────── */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* 1. Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <ShopDashboardTab
                shop={shop}
                ownerProfile={ownerProfile}
                summary={summary}
                operational={{
                  isImporting,
                  hasPausedJob,
                  totalImportCompleted,
                  totalImportTarget,
                  shippingCount,
                  guaranteeCount,
                  unlockedCategoriesCount: shopCats.length,
                  quotaStatusText,
                  quotaStatusColor,
                  productLimit,
                  totalProductCount,
                  publishedProductCount,
                  hiddenProductCount,
                  outOfStockCount,
                  slotUsage,
                  isExpired,
                  hasActiveSpecialQuota,
                  hasActiveNormalQuota,
                }}
                recentOrders={pendingShipmentsDetails}
                recentTransactions={transactions}
                onTabChange={(tab) => setActiveTab(tab as ShopTabKey)}
                onOpenImportModal={() => setShowImportModal(true)}
                onOpenFreeModal={() => setShowFreeModal(true)}
              />
            )}

            {/* 2. Quota Tab */}
            {activeTab === 'quota' && (
              <ShopQuotaTab
                shop={shop}
                totalProductCount={totalProductCount}
                shopCats={shopCats}
                allCategories={allCategories}
                quotaHistory={quotaHistory}
                onOpenUnlockModal={() => setShowFreeModal(true)}
                onOpenImportModal={() => setShowImportModal(true)}
                onRefresh={fetchData}
              />
            )}

            {/* 3. Guarantee Payments Tab (ดูอย่างเดียว) */}
            {activeTab === 'guarantee' && (
              <ShopGuaranteeTab
                shop={shop}
                pendingItems={pendingGuaranteeItems}
                paidItems={paidGuaranteeItems}
                loading={loading}
                onRefresh={fetchData}
              />
            )}

            {/* 4. Products Tab (Public / Hidden / หมด Stock) */}
            {activeTab === 'products' && (
              <ShopProductsTab
                shopId={shop.id}
                shop={shop}
                categories={allCategories}
                onOpenImportModal={() => setShowImportModal(true)}
                onOpenAddProductModal={() => setShowAddModal(true)}
                onRefreshShopStats={fetchData}
              />
            )}

            {/* 5. Orders Tab (กำลังจัดส่ง / จัดส่งแล้ว / ทั้งหมด) */}
            {activeTab === 'orders' && (
              <ShopOrdersTab
                shopId={shop.id}
                shop={shop}
                onRefreshShopStats={fetchData}
              />
            )}

            {/* 6. My Wallet Tab (ดูอย่างเดียว) */}
            {activeTab === 'wallet' && (
              <ShopWalletTab
                shopId={shop.id}
                shop={shop}
                walletTotals={walletTotals}
                onRefresh={fetchData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── IMPORT PRODUCT MODAL ──────────────────────────────────── */}
      <ImportProductJsonModal
        show={showImportModal}
        setShow={setShowImportModal}
        categories={allCategories}
        shopCats={shopCats}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        generateCount={generateCount}
        setGenerateCount={setGenerateCount}
        generationErrors={generationErrors}
        isGenerating={isGenerating}
        handleGenerate={handleGenerate}
        availableSlots={Math.max(0, (shop?.product_limit || 0) - totalProductCount)}
      />

      {/* ─── ADD PRODUCT MODAL ─────────────────────────────────────── */}
      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProductSubmit}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        showCategoryDropdown={showCategoryDropdown}
        setShowCategoryDropdown={setShowCategoryDropdown}
        categories={allCategories}
        shopCats={shopCats}
        filteredCategories={filteredCategories}
        selectedFiles={selectedFiles}
        handleFileChange={handleFileChange}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        shop={shop}
      />

      {/* ─── FREE CATEGORY SELECT MODAL ────────────────────────────── */}
      <AnimatePresence>
        {showFreeModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setShowFreeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      ปลดล็อกหมวดหมู่ฟรี (Unlock Categories)
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      คุณสามารถปลดล็อกได้อีก {Math.max(0, (shop?.category_limit || 0) - shopCats.length)} หมวดหมู่
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFreeModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh] space-y-2 text-left">
                <button
                  onClick={() => {
                    const maxAllowed = Math.max(0, (shop?.category_limit || 0) - shopCats.length);
                    const unowned = allCategories.filter(c => !shopCats.includes(c.id)).map(c => c.id);

                    if (freeCategoriesForm.length > 0) {
                      setFreeCategoriesForm([]);
                    } else {
                      setFreeCategoriesForm(unowned.slice(0, maxAllowed));
                    }
                  }}
                  className="w-full text-center text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-500/10 py-2.5 rounded-xl hover:bg-blue-100 mb-2 transition-colors"
                >
                  {freeCategoriesForm.length > 0 ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกเต็มจำนวนโควต้าที่มี'}
                </button>

                {allCategories.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 my-4">ไม่พบหมวดหมู่ในระบบ</p>
                ) : (
                  allCategories.map(cat => {
                    const isOwned = shopCats.includes(cat.id);
                    const isSelected = freeCategoriesForm.includes(cat.id);
                    const effectiveCategoryLimit = shop?.category_limit || 0;
                    const canSelect = isSelected || freeCategoriesForm.length < Math.max(0, effectiveCategoryLimit - shopCats.length);

                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-colors ${
                          isOwned
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60'
                            : isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            disabled={isOwned || (!isSelected && !canSelect)}
                            checked={isOwned || isSelected}
                            onChange={() => {
                              if (isOwned) return;
                              if (!isSelected && !canSelect) {
                                toast.error(`คุณสามารถปลดล็อกได้สูงสุด ${effectiveCategoryLimit} หมวดหมู่`);
                                return;
                              }
                              setFreeCategoriesForm(prev =>
                                prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                              );
                            }}
                            className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                          />
                          <span className={`text-xs font-bold ${isOwned ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {cat.name}
                          </span>
                        </div>
                        {isOwned && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                            ปลดล็อกแล้ว
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => {
                    setShowFreeModal(false);
                    setFreeCategoriesForm([]);
                  }}
                  className="px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={freeCategoriesForm.length === 0}
                  onClick={async () => {
                    if (freeCategoriesForm.length === 0) return;
                    try {
                      const inserts = freeCategoriesForm.map(catId => ({
                        shop_id: shop.id,
                        category_id: catId
                      }));
                      const { error } = await supabase.from('shop_categories').insert(inserts);
                      if (error) throw error;
                      toast.success('ปลดล็อกหมวดหมู่สินค้าเรียบร้อยแล้ว!');
                      setShowFreeModal(false);
                      setFreeCategoriesForm([]);
                      fetchData();
                    } catch (err: any) {
                      toast.error('เกิดข้อผิดพลาดในการปลดล็อก: ' + err.message);
                    }
                  }}
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  ยืนยันการปลดล็อก ({freeCategoriesForm.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ShopDetail;
