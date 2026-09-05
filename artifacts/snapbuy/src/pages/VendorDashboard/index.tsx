import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  PlusCircle,
  Menu,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useVendorDashboard } from './hooks/useVendorDashboard';

// Page-specific components
import VendorSidebar from './components/VendorSidebar';
import VendorOverview from './components/VendorOverview';
import ProductManagement from './components/ProductManagement';
import AddProductModal from './components/AddProductModal';
import ImportProductJsonModal from './components/ImportProductJsonModal';
import OrderManagement from './components/OrderManagement';
import VendorSettings from './components/VendorSettings';
import VendorMessages from './components/VendorMessages';
import VendorQuota from './components/VendorQuota';
import BulkBoost from './components/BulkBoost';
import VendorWallet from './components/VendorWallet';
import { GuaranteePayment } from './components/GuaranteePayment';
import { SkeletonVendorDashboard } from '../../components/ui/Skeleton';
import { useGenerationWorker } from './hooks/useGenerationWorker';
import { GenerationProgress } from './components/GenerationProgress';

const VendorDashboard = () => {
  const { user, shop, loading: authLoading } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    showAddModal,
    setShowAddModal,
    showImportModal,
    setShowImportModal,
    selectedCategoryIds,
    setSelectedCategoryIds,
    generateCount,
    setGenerateCount,
    generationErrors,
    isGenerating,
    availableSlots,
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
    tableStatusFilter, setTableStatusFilter,
    tablePromoteFilter, setTablePromoteFilter,
    categorySearch,
    setCategorySearch,
    showCategoryDropdown,
    setShowCategoryDropdown,
    shopCats,
    handleGenerateProducts,
    handleTogglePublish,
    handleAddProduct,
    handleFileChange,
    fetchProducts,
    products,
    productsLoading,
    totalProductsCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    filteredCategories
  } = useVendorDashboard();

  const { runningJob } = useGenerationWorker(() => {
    fetchProducts();
  });

  useEffect(() => {
    const contentArea = document.getElementById('vendor-content-area');
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  if (authLoading) return <SkeletonVendorDashboard />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!shop) {
    return <Navigate to="/become-seller" replace />;
  }

  return (
    <div className="h-screen overflow-hidden bg-background dark:bg-black/20 flex text-left print:h-auto print:overflow-visible print:bg-white print:text-black">
      <VendorSidebar
        shop={shop}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar menu"
              className="lg:hidden p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <motion.h1
              key={activeTab}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-sm sm:text-lg font-black uppercase tracking-tight truncate max-w-[150px] sm:max-w-none"
            >
              {activeTab.replace('-', ' ')}
            </motion.h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div
              onClick={() => setActiveTab('quota')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Package size={14} className="text-primary-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Quota</span>
                <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                  {totalProductsCount} / {shop?.product_limit || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20"
              >
                <PlusCircle size={16} /> Add Product
              </motion.button>
              <button
                onClick={() => setShowAddModal(true)}
                className="sm:hidden p-2 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 flex items-center justify-center"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>
        </header>

        <main
          id="vendor-content-area"
          className={`flex-1 overflow-y-auto flex flex-col ${activeTab === 'messages' ? 'p-0' : 'p-4 sm:p-6'} print:p-0 print:overflow-visible print:block`}
        >
          <div className={activeTab === 'messages' ? 'flex-1 flex flex-col h-full' : 'w-full'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <VendorOverview />}
                {activeTab === 'inventory' && (
                  <ProductManagement
                    products={products}
                    loading={productsLoading}
                    totalItems={totalProductsCount}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    onTogglePublish={handleTogglePublish}
                    onRefresh={fetchProducts}
                    tableSearch={tableSearch}
                    setTableSearch={setTableSearch}
                    tableCategoryFilter={tableCategoryFilter}
                    setTableCategoryFilter={setTableCategoryFilter}
                    tableStatusFilter={tableStatusFilter}
                    setTableStatusFilter={setTableStatusFilter}
                    tablePromoteFilter={tablePromoteFilter}
                    setTablePromoteFilter={setTablePromoteFilter}
                    categories={categories}
                    setShowImportModal={setShowImportModal}
                    shopLimit={shop?.product_limit || 0}
                  />
                )}
                {activeTab === 'orders' && <OrderManagement />}
                {activeTab === 'guarantee' && <GuaranteePayment />}
                {activeTab === 'messages' && <VendorMessages />}
                {activeTab === 'quota' && <VendorQuota setShowImportModal={setShowImportModal} />}
                {activeTab === 'wallet' && <VendorWallet />}
                {activeTab === 'bulk-promote' && <BulkBoost />}
                {activeTab === 'settings' && <VendorSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <GenerationProgress runningJob={runningJob} />

      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        showCategoryDropdown={showCategoryDropdown}
        setShowCategoryDropdown={setShowCategoryDropdown}
        categories={categories}
        shopCats={shopCats}
        filteredCategories={filteredCategories}
        selectedFiles={selectedFiles}
        handleFileChange={handleFileChange}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        shop={shop}
      />
      <ImportProductJsonModal
        show={showImportModal}
        setShow={setShowImportModal}
        categories={categories}
        shopCats={shopCats}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        generateCount={generateCount}
        setGenerateCount={setGenerateCount}
        generationErrors={generationErrors}
        isGenerating={isGenerating}
        handleGenerate={handleGenerateProducts}
        availableSlots={availableSlots}
      />
    </div>
  );
};

export default VendorDashboard;
