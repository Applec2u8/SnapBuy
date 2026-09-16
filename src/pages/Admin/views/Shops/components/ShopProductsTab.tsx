import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Search, Filter, Plus, UploadCloud, Eye, EyeOff,
  Edit3, Trash2, ExternalLink, Loader2, AlertCircle, CheckCircle2,
  Layers, Tag, DollarSign, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'sonner';
import { EditProductModal } from './EditProductModal';

interface ShopProductsTabProps {
  shopId: string;
  shop: any;
  categories: any[];
  onOpenImportModal: () => void;
  onOpenAddProductModal: () => void;
  onRefreshShopStats: () => void;
}

export const ShopProductsTab: React.FC<ShopProductsTabProps> = ({
  shopId,
  shop,
  categories,
  onOpenImportModal,
  onOpenAddProductModal,
  onRefreshShopStats,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'hidden' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Status counts for badge tabs
  const [counts, setCounts] = useState({
    all: 0,
    public: 0,
    hidden: 0,
    outOfStock: 0,
  });

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Fetch counts for all categories
  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, pubRes, hidRes, outRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_published', true).gt('stock_quantity', 0),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).eq('is_published', false),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId).lte('stock_quantity', 0),
      ]);

      setCounts({
        all: allRes.count || 0,
        public: pubRes.count || 0,
        hidden: hidRes.count || 0,
        outOfStock: outRes.count || 0,
      });
    } catch (e) {
      console.warn('Failed to fetch product status counts', e);
    }
  }, [shopId]);

  // Fetch paginated products based on filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, categories(id, name), product_variants(id, name, value, price_override, stock_quantity)', { count: 'exact' })
        .eq('shop_id', shopId);

      // Filter by Public / Hidden / Out of Stock
      if (filter === 'public') {
        query = query.eq('is_published', true).gt('stock_quantity', 0);
      } else if (filter === 'hidden') {
        query = query.eq('is_published', false);
      } else if (filter === 'out_of_stock') {
        query = query.lte('stock_quantity', 0);
      }

      // Filter by category
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      // Search by name
      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถโหลดรายการสินค้าได้: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [shopId, filter, selectedCategory, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Publish/Hide toggle
  const handleTogglePublish = async (product: any) => {
    setTogglingId(product.id);
    const newStatus = !product.is_published;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_published: newStatus, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(newStatus ? 'เผยแพร่สินค้าเรียบร้อยแล้ว' : 'ซ่อนสินค้าจากหน้าร้านแล้ว');
      // Update local state instantly
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_published: newStatus } : p));
      fetchCounts();
      onRefreshShopStats();
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถเปลี่ยนสถานะสินค้าได้: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (product: any) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${product.name}"? การดำเนินการนี้ไม่สามารถเรียกคืนได้`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('ลบสินค้าสำเร็จ');
      fetchProducts();
      fetchCounts();
      onRefreshShopStats();
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถลบสินค้าได้: ' + err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 text-left">
      {/* ─── Top Filter Tabs & Action Buttons ─────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Tabs (Public, Hidden, หมด Stock, All) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit flex-wrap">
          {/* 1. Public */}
          <button
            onClick={() => { setFilter('public'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === 'public'
                ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>1. Public (เผยแพร่)</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
              {counts.public}
            </span>
          </button>

          {/* 2. Hidden */}
          <button
            onClick={() => { setFilter('hidden'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === 'hidden'
                ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <EyeOff size={14} />
            <span>2. Hidden (ซ่อน)</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {counts.hidden}
            </span>
          </button>

          {/* 3. หมด Stock */}
          <button
            onClick={() => { setFilter('out_of_stock'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === 'out_of_stock'
                ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle size={14} />
            <span>3. หมด Stock</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
              {counts.outOfStock}
            </span>
          </button>

          {/* All */}
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-primary-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>ทั้งหมด</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
              {counts.all}
            </span>
          </button>
        </div>

        {/* Action Buttons: Add Product & Import Modal */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500/40 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <UploadCloud size={16} className="text-primary-500" />
            <span>นำเข้า JSON</span>
          </button>
          <button
            onClick={onOpenAddProductModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/25 transition-all"
          >
            <Plus size={16} />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Category Filter Controls ────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl py-2 px-4 pl-9 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Category filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all"
          >
            <option value={10}>10 รายการ/หน้า</option>
            <option value={20}>20 รายการ/หน้า</option>
            <option value={50}>50 รายการ/หน้า</option>
          </select>
        </div>
      </div>

      {/* ─── Products Table ───────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-bold flex flex-col items-center justify-center gap-3 animate-pulse">
            <Loader2 size={24} className="animate-spin text-primary-500" />
            <span>กำลังโหลดรายการสินค้า...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            ไม่พบรายการสินค้าที่ตรงกับเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">สินค้า (Product)</th>
                  <th className="pb-3">หมวดหมู่</th>
                  <th className="pb-3">ราคาขาย</th>
                  <th className="pb-3">สต็อก (Stock)</th>
                  <th className="pb-3">ยอดเข้าชม / ถูกใจ</th>
                  <th className="pb-3">สถานะแสดงผล</th>
                  <th className="pb-3 text-right pr-2">การจัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {products.map((prod) => {
                  const image =
                    Array.isArray(prod.images) && prod.images.length > 0
                      ? prod.images[0]
                      : prod.image_url || '';
                  const stock = Number(prod.stock_quantity ?? 0);
                  const isOutOfStock = stock <= 0;
                  const isPublished = Boolean(prod.is_published);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Product details */}
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                            {image ? (
                              <img src={image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[260px]">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {prod.brand ? `${prod.brand} • ` : ''}ID: {prod.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                          {prod.categories?.name || 'ไม่มีหมวดหมู่'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 font-mono">
                        <span className="text-slate-900 dark:text-white font-black text-sm">
                          ${Number(prod.price || 0).toFixed(2)}
                        </span>
                        {prod.compare_at_price && Number(prod.compare_at_price) > Number(prod.price) && (
                          <p className="text-[10px] text-slate-400 line-through">
                            ${Number(prod.compare_at_price).toFixed(2)}
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            isOutOfStock
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : stock < 10
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isOutOfStock ? 'หมด Stock' : `${stock} ชิ้น`}
                        </span>
                      </td>

                      {/* Views / Likes */}
                      <td className="py-4 text-[10px] text-slate-500">
                        <p>👁️ {Number(prod.view_count || 0).toLocaleString()} views</p>
                        <p>❤️ {Number(prod.like_count || 0).toLocaleString()} likes</p>
                      </td>

                      {/* Publish / Hide toggle */}
                      <td className="py-4">
                        <button
                          onClick={() => handleTogglePublish(prod)}
                          disabled={togglingId === prod.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {togglingId === prod.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isPublished ? (
                            <>
                              <Eye size={12} /> Public
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/product/${prod.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="ดูหน้าร้าน"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-2 rounded-xl text-slate-400 hover:text-violet-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="แก้ไขสินค้า"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="ลบสินค้า"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <p>
              แสดง {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} จากทั้งหมด {totalCount} รายการ
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            fetchProducts();
            fetchCounts();
            onRefreshShopStats();
          }}
        />
      )}
    </div>
  );
};
