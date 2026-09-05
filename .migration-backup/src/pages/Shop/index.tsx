import { ShoppingBag } from 'lucide-react';
import { useShop } from './hooks/useShop';
import { ShopHeader } from './components/ShopHeader';
import { FilterSidebar } from './components/FilterSidebar';
import { RecommendedProducts } from './components/RecommendedProducts';
import { ProductGrid } from './components/ProductGrid';
import { ShopScrollToTop } from './components/ShopScrollToTop';
import { SkeletonGrid } from '../../components/ui/Skeleton';

const Shop = () => {
  const {
    products,
    recommendedProducts,
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
    observerTarget,
    toggleCategory,
    toggleShop,
    shops,
    filteredCategories
  } = useShop();

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedShops([]);
    setMinPrice(0);
    setMaxPrice(900000000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 sm:py-6 animate-fade-in text-left min-h-screen">
      <ShopHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <FilterSidebar
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          selectedCategories={selectedCategories}
          showCatDropdown={showCatDropdown}
          setShowCatDropdown={setShowCatDropdown}
          catSearch={catSearch}
          setCatSearch={setCatSearch}
          filteredCategories={filteredCategories}
          toggleCategory={toggleCategory}
          shops={shops}
          selectedShops={selectedShops}
          toggleShop={toggleShop}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetFilters={resetFilters}
        />

        <div className="lg:col-span-3">
          <RecommendedProducts products={searchTerm ? [] : recommendedProducts} />

          {loading && products.length === 0 ? (
            <SkeletonGrid count={9} />
          ) : products.length > 0 ? (
            <ProductGrid
              products={products}
              viewMode={viewMode}
              loadingMore={loadingMore}
              hasMore={hasMore}
              observerTarget={observerTarget}
            />
          ) : (
            <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
              <ShoppingBag size={32} className="mx-auto text-slate-300" />
              <h3 className="text-base font-black uppercase">No results found</h3>
            </div>
          )}
        </div>
      </div>

      <ShopScrollToTop showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
    </div>
  );
};

export default Shop;
