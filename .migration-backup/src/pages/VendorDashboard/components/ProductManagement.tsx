import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Layers,
  Loader2,
  Check,
  Settings2,
  Star,
  Image as ImageIcon,
  TrendingUp,
  Zap,
  Flame,
  UploadCloud
} from 'lucide-react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductManagementProps {
  products: any[];
  loading?: boolean;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
  tableSearch: string;
  setTableSearch: (search: string) => void;
  tableCategoryFilter: string;
  setTableCategoryFilter: (filter: string) => void;
  tableStatusFilter?: string;
  setTableStatusFilter?: (filter: string) => void;
  tablePromoteFilter?: string;
  setTablePromoteFilter?: (filter: string) => void;
  categories: any[];
  onTogglePublish: (productId: string, currentStatus: boolean) => Promise<void> | void;
  onRefresh: () => void;
  setShowImportModal?: (show: boolean) => void;
  shopLimit?: number;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  loading: _loading,
  totalItems,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  tableSearch,
  setTableSearch,
  tableCategoryFilter,
  setTableCategoryFilter,
  tableStatusFilter,
  setTableStatusFilter,
  tablePromoteFilter,
  setTablePromoteFilter,
  categories,
  onTogglePublish,
  onRefresh,
  setShowImportModal,
  shopLimit = 0
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [variantImagePreview, setVariantImagePreview] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ public: 0, hidden: 0 });

  useEffect(() => {
    if (products.length > 0 && products[0]?.shop_id) {
      const shopId = products[0].shop_id;
      const getStats = async () => {
        const { count: pub } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_published', true);
        const { count: hid } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_published', false);
        setStats({ public: pub || 0, hidden: hid || 0 });
      };
      getStats();
    }
  }, [products]);

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editProductForm, setEditProductForm] = useState<any>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const openEditProduct = (product: any) => {
    setEditProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      compare_at_price: product.compare_at_price ?? '',
      stock_quantity: product.stock_quantity ?? '',
      category_id: product.category_id || '',
      brand: product.brand || '',
      is_published: product.is_published || false,
    });
    setEditingProduct(product);
    setActiveMenuId(null);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    try {
      const updates = {
        name: editProductForm.name,
        description: editProductForm.description,
        price: parseFloat(editProductForm.price) || 0,
        compare_at_price: editProductForm.compare_at_price ? parseFloat(editProductForm.compare_at_price) : null,
        stock_quantity: parseInt(editProductForm.stock_quantity) || 0,
        category_id: editProductForm.category_id,
        brand: editProductForm.brand,
        is_published: editProductForm.is_published,
      };

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success('Product updated successfully');
      setEditingProduct(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // State for new variant form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariantForm, setNewVariantForm] = useState({
    name: '',
    value: '',
    price_override: '',
    stock_quantity: '',
    file: null as File | null
  });
  const [creatingVariant, setCreatingVariant] = useState(false);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(() => {
      document.getElementById('product-management-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedProducts = products;


  const fetchVariants = async (productId: string) => {
    setLoadingVariants(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);
      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleExpand = (productId: string) => {
    if (expandedId === productId) {
      setExpandedId(null);
      setVariants([]);
      setShowAddForm(false);
    } else {
      setExpandedId(productId);
      fetchVariants(productId);
      setShowAddForm(false);
    }
  };

  const handleAddVariant = async (productId: string) => {
    if (!newVariantForm.name || !newVariantForm.value) {
      toast.error('Name and Value are required');
      return;
    }

    setCreatingVariant(true);
    try {
      let uploadedImageUrl = null;

      if (newVariantForm.file) {
        const fileExt = newVariantForm.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `variants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('strong-shop')
          .upload(filePath, newVariantForm.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('strong-shop')
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('product_variants')
        .insert([{
          product_id: productId,
          name: newVariantForm.name,
          value: newVariantForm.value,
          price_override: parseFloat(newVariantForm.price_override) || null,
          stock_quantity: parseInt(newVariantForm.stock_quantity) || 0,
          image_url: uploadedImageUrl
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Variant added successfully!');
      setVariants([...variants, data]);
      setShowAddForm(false);
      setNewVariantForm({ name: '', value: '', price_override: '', stock_quantity: '', file: null });
      onRefresh(); // Refresh main product stock
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreatingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);
      if (error) throw error;
      toast.success('Variant deleted');
      setVariants(variants.filter((v: any) => v.id !== variantId));
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEditing = (v: any, product: any) => {
    setEditingVariant(v.id);
    setEditForm({ ...v });
    setVariantImagePreview(v.image_url || product.images?.[0] || '');
  };

  useEffect(() => {
    return () => {
      if (variantImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(variantImagePreview);
      }
    };
  }, [variantImagePreview]);

  const handleUpdateVariant = async () => {
    if (!editingVariant) return;

    setCreatingVariant(true);
    try {
      let image_url = editForm.image_url || null;

      if (editForm.file instanceof File) {
        const fileExt = editForm.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `variants/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('strong-shop')
          .upload(filePath, editForm.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('strong-shop')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('product_variants')
        .update({
          name: editForm.name,
          value: editForm.value,
          price_override: editForm.price_override ? parseFloat(editForm.price_override) : null,
          stock_quantity: editForm.stock_quantity ? parseInt(editForm.stock_quantity) : 0,
          image_url
        })
        .eq('id', editingVariant);

      if (error) throw error;
      toast.success('Variant updated');
      setVariants(variants.map((v: any) => v.id === editingVariant ? { ...v, ...editForm, image_url } : v));
      setEditingVariant(null);
      setEditForm({});
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreatingVariant(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to delete this ENTIRE product? This will also remove all connected variants and cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      setActiveMenuId(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div id="product-management-top" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in text-left mb-10 scroll-mt-24 lg:scroll-mt-32">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Inventory ({totalItems})</h3>
            {setShowImportModal && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20 active:scale-95"
              >
                <UploadCloud size={14} /> Import
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-md">{stats.public} Public</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">{stats.hidden} Hidden</span>
            {shopLimit > 0 && (
              <span className="bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-md">{totalItems}/{shopLimit} Quota</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full md:w-auto">
          {/* Row 1: Search */}
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Filter products..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm w-full focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-white"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>

          {/* Row 2: Dropdowns */}
          <div className="md:flex grid md:grid-cols-2 gap-2 w-full">
            <select
              className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-white"
              value={tableStatusFilter || ''}
              onChange={(e) => setTableStatusFilter && setTableStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
            </select>

            <select
              className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-white"
              value={tablePromoteFilter || ''}
              onChange={(e) => setTablePromoteFilter && setTablePromoteFilter(e.target.value)}
            >
              <option value="">All Promos</option>
              <option value="promoted">Boost Active</option>
              <option value="not_promoted">Not Boosting</option>
            </select>

            <select
              className="flex-1 px-3 py-2.5 col-span-2 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-white"
              value={tableCategoryFilter}
              onChange={(e) => setTableCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left md:min-w-[800px] block md:table">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hidden md:table-header-group">
            <tr>
              <th className="px-8 py-5">Product Info</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Stats</th>
              <th className="px-8 py-5">Base Price</th>
              <th className="px-8 py-5">Total Stock</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="flex flex-col gap-4 p-4 md:p-0 md:table-row-group md:gap-0 md:divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50 md:bg-transparent">
            {_loading ? (
              [...Array(itemsPerPage || 5)].map((_, i) => (
                <tr key={i} className="bg-white dark:bg-slate-900 rounded-2xl md:bg-transparent md:rounded-none border border-slate-200 dark:border-slate-800 md:border-none shadow-sm md:shadow-none p-5 md:p-0 grid grid-cols-2 gap-y-2 md:flex md:flex-col md:table-row animate-pulse">
                  <td className="col-span-2 px-0 py-0 md:px-8 md:py-6 flex flex-col md:table-cell gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                      </div>
                    </div>
                  </td>
                  <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 md:table-cell mt-4 md:mt-0">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full md:mx-auto"></div>
                  </td>
                  <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 md:table-cell mt-4 md:mt-0">
                    <div className="flex gap-2 justify-end md:justify-center">
                      <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                      <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                  </td>
                  <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 md:table-cell mt-3 md:mt-0">
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded md:mx-auto"></div>
                  </td>
                  <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 md:table-cell mt-3 md:mt-0 text-right md:text-center">
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto md:mx-auto"></div>
                  </td>
                  <td className="col-span-2 px-0 py-0 md:px-8 md:py-6 md:table-cell mt-3 md:mt-0 border-t border-slate-200 dark:border-slate-800 md:border-t-0 pt-4 md:pt-0">
                    <div className="flex justify-end gap-3">
                      <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                      <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl md:hidden"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <React.Fragment key={p.id}>
                  <tr
                    className={`bg-white dark:bg-slate-900 rounded-2xl md:bg-transparent md:rounded-none border border-slate-200 dark:border-slate-800 md:border-none shadow-sm md:shadow-none hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer group grid grid-cols-2 gap-y-2 p-5 md:flex md:flex-col md:table-row md:p-0 ${expandedId === p.id ? 'ring-2 ring-primary-500 md:ring-0 md:bg-primary-500/5 rounded-b-none border-b-0' : ''}`}
                    onClick={() => handleExpand(p.id)}
                  >
                    <td className="col-span-2 px-0 py-0 md:px-8 md:py-6 flex flex-col md:table-cell gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                          <ImageWithFallback
                            src={p.images?.[0] || p.product_variants?.[0]?.image_url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            containerClassName="w-full h-full"
                            alt={p.name}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm md:text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate">{p.name}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Category: {p.categories?.name || 'General'}</p>
                          {p.is_promoted && p.promoted_until && new Date(p.promoted_until).getTime() > Date.now() && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
                              <Zap size={10} className="text-yellow-500" />
                              Boosting {p.promote_type === 'views' ? 'Views' : 'Likes'} · Ends {new Date(p.promoted_until).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 flex flex-col justify-start items-start md:items-center md:flex-row md:justify-between md:table-cell relative mt-4 md:mt-0">
                      <span className="md:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Status</span>
                      <button
                        disabled={togglingId === p.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setTogglingId(p.id);
                          await Promise.resolve(onTogglePublish(p.id, p.is_published));
                          setTogglingId(null);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${togglingId === p.id ? 'opacity-50 cursor-not-allowed' : ''} ${p.is_published ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200'}`}
                      >
                        {togglingId === p.id ? <Loader2 size={12} className="animate-spin" /> : (p.is_published ? <Eye size={12} /> : <EyeOff size={12} />)}
                        {p.is_published ? 'Public' : 'Hidden'}
                      </button>
                    </td>
                    <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 flex flex-col justify-start items-end md:items-center md:flex-row md:justify-between md:table-cell relative mt-4 md:mt-0">
                      <span className="md:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Stats</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-yellow-500 font-black text-[10px] bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-lg">
                          <Star size={12} className={p.average_rating > 0 ? "fill-yellow-400" : ""} />
                          {p.average_rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-black text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          <Eye size={12} />
                          {p.view_count || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500 font-black text-[10px] bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                          <Flame size={12} />
                          {p.like_count || 0}
                        </div>
                      </div>
                    </td>
                    <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 flex flex-col justify-start items-start md:items-center md:flex-row md:justify-between md:table-cell font-black text-sm text-primary-500 relative mt-3 md:mt-0">
                      <span className="md:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Base Price</span>
                      ${Number(p.price || 0).toLocaleString()}
                    </td>
                    <td className="col-span-1 px-0 py-0 md:px-8 md:py-6 flex flex-col justify-start items-end md:items-center md:flex-row md:justify-between md:table-cell font-bold text-slate-900 dark:text-white text-xs relative mt-3 md:mt-0">
                      <span className="md:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Stock</span>
                      {Number((p.stock_quantity || 0) + (p.product_variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0)).toLocaleString()} Units
                    </td>
                    <td className="col-span-2 px-0 py-0 md:px-8 md:py-6 flex justify-between items-center md:table-cell text-right relative overflow-visible pt-4 md:pt-0 border-t border-slate-200 dark:border-slate-800 md:border-t-0 mt-3 md:mt-0">
                      <span className="md:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest">Actions</span>
                      <div className="flex items-center justify-end gap-3">
                        <div className="relative" ref={activeMenuId === p.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === p.id ? null : p.id);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm bg-slate-50 dark:bg-slate-800 md:bg-transparent"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {/* ACTION MENU DROPDOWN */}
                          {activeMenuId === p.id && (
                            <div className="absolute right-0 bottom-full mb-2 md:top-full md:bottom-auto md:mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[150] overflow-hidden animate-slide-up text-left">
                              <div className="p-2 space-y-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditProduct(p); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-500 hover:text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest"
                                >
                                  <Settings2 size={16} /> Edit Product
                                </button>
                                {p.promoted_until && new Date(p.promoted_until) > new Date() ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.error('This product is already being boosted. Please wait until the current boost ends.');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-xl transition-all text-xs font-black uppercase tracking-widest cursor-not-allowed opacity-50"
                                  >
                                    <TrendingUp size={16} /> Already Boosting
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/vendor/promote/${p.id}`);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-500 hover:text-white text-yellow-500 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
                                  >
                                    <TrendingUp size={16} /> Promote Product
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
                                >
                                  <Trash2 size={16} /> Delete Product
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 md:bg-transparent">
                          {expandedId === p.id ? <ChevronUp size={20} className="text-primary-500" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE AREA */}
                  {expandedId === p.id && (
                    <tr className="block md:table-row">
                      <td colSpan={6} className="px-0 md:px-8 py-0 block md:table-cell">
                        <div className="bg-slate-50 dark:bg-slate-800/40 md:border-x md:border-b border-slate-200 dark:border-slate-800 animate-slide-down overflow-hidden rounded-b-2xl md:rounded-none mb-4 md:mb-0 relative -mt-1 md:mt-0 z-10 md:z-auto border border-t-0 shadow-sm md:shadow-none">
                          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/20 flex-shrink-0"><Layers size={16} /></div>
                                <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-900 dark:text-white leading-tight">Connected Variant Objects</h4>
                              </div>
                              <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm w-full sm:w-auto ${showAddForm ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-primary-500 hover:text-white'}`}
                              >
                                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                                {showAddForm ? 'Cancel' : 'Add Variant'}
                              </button>
                            </div>

                            {showAddForm && (
                              <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border-2 border-primary-500/20 shadow-xl animate-fade-in flex flex-col md:flex-row gap-6 items-start">
                                {/* Variant Image Upload */}
                                <div className="flex-shrink-0 group">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Variant Image</p>
                                  <label className="w-32 h-32 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all overflow-hidden relative">
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setNewVariantForm({ ...newVariantForm, file: e.target.files[0] });
                                        }
                                      }}
                                    />
                                    {newVariantForm.file ? (
                                      <img src={URL.createObjectURL(newVariantForm.file)} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-slate-300">
                                          <ImageIcon size={24} />
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Select Photo</span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors pointer-events-none" />
                                  </label>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Option Name</p>
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={newVariantForm.name} onChange={e => setNewVariantForm({ ...newVariantForm, name: e.target.value })} placeholder="Color" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Option Value</p>
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={newVariantForm.value} onChange={e => setNewVariantForm({ ...newVariantForm, value: e.target.value })} placeholder="Blue" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Override</p>
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" type="number" value={newVariantForm.price_override} onChange={e => setNewVariantForm({ ...newVariantForm, price_override: e.target.value })} placeholder="Inherit" />
                                  </div>
                                  <div className="md:col-span-2 space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Quantity</p>
                                    <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" type="number" value={newVariantForm.stock_quantity} onChange={e => setNewVariantForm({ ...newVariantForm, stock_quantity: e.target.value })} placeholder="0" />
                                  </div>
                                  <div className="flex items-end">
                                    <button
                                      disabled={creatingVariant}
                                      onClick={() => handleAddVariant(p.id)}
                                      className="w-full h-[46px] bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                      {creatingVariant ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                                      {creatingVariant ? 'Processing...' : 'Confirm Variant'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {loadingVariants ? (
                              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" /></div>
                            ) : variants.length > 0 ? (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {variants.map((v: any) => (
                                  <div key={v.id} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 group transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                                        <ImageWithFallback
                                          src={v.image_url || p.images?.[0]}
                                          className="w-full h-full object-cover"
                                          containerClassName="w-full h-full"
                                          alt={v.value}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0 sm:hidden">
                                        <p className="font-black text-[11px] text-slate-900 dark:text-white uppercase tracking-tight truncate">{v.name}: {v.value}</p>
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                                      {editingVariant === v.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                          <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-[0.24em] font-black">Option name</label>
                                            <input
                                              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-xs w-full"
                                              value={editForm.name || ''}
                                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                              placeholder="Option"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-[0.24em] font-black">Option value</label>
                                            <input
                                              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-xs w-full"
                                              value={editForm.value || ''}
                                              onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                                              placeholder="Limited"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-[0.24em] font-black">Price override</label>
                                            <input
                                              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-xs w-full"
                                              type="number"
                                              value={editForm.price_override || ''}
                                              onChange={(e) => setEditForm({ ...editForm, price_override: e.target.value })}
                                              placeholder="Price"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-[0.24em] font-black">Stock quantity</label>
                                            <input
                                              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-xs w-full"
                                              type="number"
                                              value={editForm.stock_quantity || ''}
                                              onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                                              placeholder="Stock"
                                            />
                                          </div>
                                          <div className="md:col-span-2 space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-[0.24em] font-black">Variant image</label>
                                            {variantImagePreview ? (
                                              <img
                                                src={variantImagePreview}
                                                alt="Preview"
                                                className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                                              />
                                            ) : null}
                                            <input
                                              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-xs w-full"
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                  const file = e.target.files[0];
                                                  const previewUrl = URL.createObjectURL(file);
                                                  setVariantImagePreview(previewUrl);
                                                  setEditForm({ ...editForm, file });
                                                }
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col">
                                          <p className="hidden sm:block font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight truncate">{v.name}: {v.value}</p>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0 sm:mt-1.5">
                                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest whitespace-nowrap">${Number(parseFloat(v.price_override) || p.price || 0).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 dark:border-slate-800 pl-3 whitespace-nowrap">Stock: {v.stock_quantity}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-row sm:flex-col gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 mt-2 sm:mt-0 justify-end">
                                      {editingVariant === v.id ? (
                                        <>
                                          <button onClick={handleUpdateVariant} className="flex-1 sm:flex-none py-2 sm:p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex justify-center items-center"><Save size={14} /></button>
                                          <button onClick={() => setEditingVariant(null)} className="flex-1 sm:flex-none py-2 sm:p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all flex justify-center items-center"><X size={14} /></button>
                                        </>
                                      ) : (
                                        <>
                                          <button onClick={() => startEditing(v, p)} className="flex-1 sm:flex-none py-2 sm:p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all flex justify-center items-center"><Edit3 size={14} /></button>
                                          <button onClick={() => handleDeleteVariant(v.id)} className="flex-1 sm:flex-none py-2 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all flex justify-center items-center"><Trash2 size={14} /></button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest italic">No variants found for this product.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr className="block md:table-row">
                <td colSpan={6} className="px-8 py-20 text-center block md:table-cell border-none md:border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <Search className="text-slate-400" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">No products found</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  handlePageChange(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:border-primary-500 transition-colors shadow-sm"
              >
                {[10, 20, 50, 100].map(limit => (
                  <option key={limit} value={limit}>{limit}</option>
                ))}
              </select>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entries</span>
            </div>
            <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
              {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
            </span>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
            <span className="hidden sm:inline-block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-between">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                Prev
              </button>
              <div className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-500 text-xs font-black whitespace-nowrap shadow-inner border border-primary-500/10">
                {currentPage} / {totalPages || 1}
              </div>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Edit Product</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 dark:text-slate-400">Update product details</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Name
                  <input
                    value={editProductForm.name}
                    onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Category
                  <select
                    value={editProductForm.category_id}
                    onChange={(e) => setEditProductForm({ ...editProductForm, category_id: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Base Price
                  <input
                    type="number"
                    value={editProductForm.price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Compare Price
                  <input
                    type="number"
                    value={editProductForm.compare_at_price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, compare_at_price: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Stock Quantity
                  <input
                    type="number"
                    value={editProductForm.stock_quantity}
                    onChange={(e) => setEditProductForm({ ...editProductForm, stock_quantity: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  Brand
                  <input
                    value={editProductForm.brand}
                    onChange={(e) => setEditProductForm({ ...editProductForm, brand: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                Description
                <textarea
                  value={editProductForm.description}
                  onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </label>

              <label className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editProductForm.is_published}
                  onChange={(e) => setEditProductForm({ ...editProductForm, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                Published
              </label>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-primary-500 text-white font-black uppercase tracking-widest hover:bg-primary-600 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
