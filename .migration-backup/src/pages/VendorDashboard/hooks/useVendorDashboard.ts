import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
// import {
//   randomPick,
//   randomInt,
//   normalizeCategorySlug,
//   getCategoryVariantConfig,
//   randomBrand,
//   randomHighlights,
//   randomProductTitle,
//   buildPlaceholderImages
// } from '../utils/dummyData';

export const useVendorDashboard = () => {
  const { user, shop, shops, loading: authLoading } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [activeTab, _setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['overview', 'inventory', 'orders', 'messages', 'settings', 'quota', 'wallet', 'bulk-promote'].includes(hash) ? hash : 'overview';
  });

  const setActiveTab = (tab: string) => {
    _setActiveTab(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'inventory', 'orders', 'messages', 'settings', 'quota', 'wallet', 'bulk-promote'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [generateCount, setGenerateCount] = useState(1);
  const [generationErrors, setGenerationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [shopCats, setShopCats] = useState<string[]>([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    variants: [] as any[]
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [tableSearch, setTableSearch] = useState('');
  const [tableCategoryFilter, setTableCategoryFilter] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('');
  const [tablePromoteFilter, setTablePromoteFilter] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isQuotaExpired = shop?.quota_expires_at ? new Date(shop.quota_expires_at) < new Date() : false;
  const unlockedCategories = categories.filter(cat => shopCats.includes(cat.id));
  const availableSlots = shop && !isQuotaExpired ? Math.max(0, (shop.product_limit || 0) - totalProductsCount) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray].slice(0, 20));
    }
  };

  useEffect(() => {
    if (user && shop) {
      const timer = setTimeout(() => {
        fetchProducts({
          page: currentPage,
          pageSize: itemsPerPage,
          search: tableSearch,
          category: tableCategoryFilter,
          status: tableStatusFilter,
          promote: tablePromoteFilter
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [user, shop, currentPage, itemsPerPage, tableSearch, tableCategoryFilter, tableStatusFilter, tablePromoteFilter]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      if (shop) {
        fetchShopCats();
      }
    }
  }, [user, shop]);

  useEffect(() => {
    if (showImportModal && shop) {
      fetchShopCats();
    }
  }, [showImportModal, shop]);

  useEffect(() => {
    if (activeTab === 'inventory' && shop) {
      fetchShopCats();
    }
  }, [activeTab, shop]);

  const fetchShopCats = async () => {
    if (!shop) return;
    try {
      const { data, error } = await supabase
        .from('shop_categories')
        .select('category_id')
        .eq('shop_id', shop.id);
      if (error) throw error;
      setShopCats((data || []).map(d => d.category_id));
    } catch (error) {
      console.error('Error fetching shop categories:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (params?: {
    page: number;
    pageSize: number;
    search?: string;
    category?: string;
    status?: string;
    promote?: string;
  }) => {
    if (!shop) return;
    setProductsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, images, categories(name), product_variants(stock_quantity)', { count: 'exact' })
        .eq('shop_id', shop.id);

      const fetchParams = params || {
        page: currentPage,
        pageSize: itemsPerPage,
        search: tableSearch,
        category: tableCategoryFilter,
        status: tableStatusFilter,
        promote: tablePromoteFilter
      };

      if (fetchParams.search) {
        query = query.ilike('name', `%${fetchParams.search}%`);
      }

      if (fetchParams.category) {
        query = query.eq('category_id', fetchParams.category);
      }

      if (fetchParams.status) {
        query = query.eq('is_published', fetchParams.status === 'public');
      }

      if (fetchParams.promote) {
        if (fetchParams.promote === 'promoted') {
          query = query.eq('is_promoted', true).gt('promoted_until', new Date().toISOString());
        } else if (fetchParams.promote === 'not_promoted') {
          query = query.or(`is_promoted.eq.false,promoted_until.lte.${new Date().toISOString()},promoted_until.is.null`);
        }
      }

      query = query.order('created_at', { ascending: false });

      const from = (fetchParams.page - 1) * fetchParams.pageSize;
      const to = from + fetchParams.pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      setProducts(data || []);
      setTotalProductsCount(count || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleTogglePublish = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_published: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_published: !currentStatus } : p
      ));

      toast.success(currentStatus ? 'Product hidden' : 'Product published!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGenerateProducts = async () => {
    if (!shop) {
      setGenerationErrors(['Shop not found.']);
      return;
    }

    setGenerationErrors([]);

    if (!selectedCategoryIds.length) {
      setGenerationErrors(['Please select at least one unlocked category.']);
      return;
    }

    if (!generateCount || generateCount < 1) {
      setGenerationErrors(['Please enter a valid number of products.']);
      return;
    }

    if (isQuotaExpired) {
      setGenerationErrors(['โควต้าของคุณหมดอายุแล้ว กรุณาต่ออายุโควต้าในหน้า Settings.']);
      return;
    }

    if (availableSlots <= 0) {
      setGenerationErrors(['Your quota is full.']);
      return;
    }

    const totalToGenerate = selectedCategoryIds.length * generateCount;

    if (totalToGenerate > availableSlots) {
      setGenerationErrors([`จำนวนสินค้าทั้งหมด (${totalToGenerate}) เกินโควต้าที่เหลือ ${availableSlots} ชิ้น.`]);
      return;
    }

    const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));
    if (selectedCategories.length === 0) {
      setGenerationErrors(['Selected categories are not available.']);
      return;
    }

    setIsGenerating(true);

    try {
      const { error: jobError } = await supabase.from('generation_jobs').insert({
        shop_id: shop.id,
        target_count: totalToGenerate,
        completed_count: 0,
        category_ids: selectedCategories,
        status: 'running'
      });

      if (jobError) throw jobError;

      toast.success('Generation job started in the background!');

      // Close modal and uncheck selected
      setShowImportModal(false);
      setSelectedCategoryIds([]);
      setGenerateCount(1);
    } catch (error: any) {
      setGenerationErrors([error.message || 'Error starting generation job.']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !user) return;

    if (shop?.product_limit === 0) {
      toast.error('ร้านค้าของคุณยังไม่มีโควต้า กรุณากรอกโค้ดโควต้าในหน้า Settings เพื่อเริ่มลงสินค้า', { id: 'quota-limit', duration: 5000 });
      return;
    }

    if (totalProductsCount >= (shop?.product_limit || 0)) {
      toast.error(
        `โควต้าของคุณเต็มแล้ว! คุณใช้ไปแล้ว ${totalProductsCount}/${shop?.product_limit} ชิ้น\nกรุณากรอกโค้ดโควต้าใหม่ในหน้า Settings`,
        { id: 'quota-limit', duration: 6000 }
      );
      return;
    }

    if (shop?.quota_expires_at && new Date(shop.quota_expires_at) < new Date()) {
      const expiredDate = new Date(shop.quota_expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      toast.error(
        `โควต้าของคุณหมดอายุแล้วตั้งแต่ ${expiredDate}\nกรุณากรอกโค้ดโควต้าใหม่ในหน้า Settings`,
        { id: 'quota-expired', duration: 6000 }
      );
      return;
    }

    setUploading(true);

    try {
      const imageUrls = [];
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
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

      // Exclude `variants` from the products table insert — variants go into product_variants
      const { variants: _variants, ...productFields } = newProduct;

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          ...productFields,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity),
          shop_id: shop.id,
          images: imageUrls,
          is_published: true
        }])
        .select()
        .single();

      if (productError) throw productError;

      if (newProduct.variants.length > 0) {
        // Upload each variant image (if provided) then insert only DB-safe columns
        const variantRows = await Promise.all(
          newProduct.variants.map(async (v: any) => {
            let image_url: string | null = null;

            if (v.file instanceof File) {
              const fileExt = v.file.name.split('.').pop();
              const filePath = `variants/${product.id}/${Math.random()}.${fileExt}`;
              const { error: uploadErr } = await supabase.storage
                .from('strong-shop')
                .upload(filePath, v.file);
              if (!uploadErr) {
                const { data: { publicUrl } } = supabase.storage
                  .from('strong-shop')
                  .getPublicUrl(filePath);
                image_url = publicUrl;
              }
            }

            // Only send columns that exist in product_variants — strip `file`
            const priceOverride = parseFloat(v.price_override || v.price || '');
            return {
              product_id: product.id,
              name: v.name,
              value: v.value,
              ...(isNaN(priceOverride) ? {} : { price_override: priceOverride }),
              stock_quantity: parseInt(v.stock_quantity) || 0,
              ...(image_url ? { image_url } : {}),
            };
          })
        );

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantRows);

        if (variantError) throw variantError;
      }

      toast.success('Product added successfully!');
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
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return {
    user,
    shop,
    shops,
    authLoading,
    products,
    productsLoading,
    totalProductsCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    activeTab,
    setActiveTab,
    showAddModal,
    setShowAddModal,
    isSidebarOpen,
    setIsSidebarOpen,
    categories,
    newProduct,
    setNewProduct,
    selectedFiles,
    setSelectedFiles,
    uploading,
    tableSearch,
    setTableSearch,
    tableCategoryFilter,
    setTableCategoryFilter,
    tableStatusFilter,
    setTableStatusFilter,
    tablePromoteFilter,
    setTablePromoteFilter,
    categorySearch,
    setCategorySearch,
    showCategoryDropdown,
    setShowCategoryDropdown,
    shopCats,
    showImportModal,
    setShowImportModal,
    selectedCategoryIds,
    setSelectedCategoryIds,
    generateCount,
    setGenerateCount,
    generationErrors,
    isGenerating,
    unlockedCategories,
    availableSlots,
    handleGenerateProducts,
    handleTogglePublish,
    handleDeleteProduct,
    handleAddProduct,
    handleFileChange,
    fetchProducts,
    filteredCategories
  };
};

