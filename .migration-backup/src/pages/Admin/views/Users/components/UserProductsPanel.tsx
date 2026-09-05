import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUpDown, ChevronDown, Package } from 'lucide-react';
import { Pagination } from '../../../components/Pagination';
import { ProductCard } from './ProductCard';
import type { ProductRecord, EditForm } from './types';
import { SORT_OPTIONS } from './types';

interface UserProductsPanelProps {
  // Data
  products: ProductRecord[];
  totalCount: number;
  publishedCount: number;
  unpublishedCount: number;
  loading: boolean;
  // Filters
  searchTerm: string;
  filterCategory: string;
  sortBy: string;
  currentPage: number;
  itemsPerPage: number;
  filteredCategories: string[];
  isCategoryOpen: boolean;
  isSortOpen: boolean;
  categorySearch: string;
  // Editing
  editingProductId: string | null;
  editForm: EditForm;
  // Quick boost
  quickBoostId: string | null;
  quickBoostValue: number;
  quickBoostLikesValue: number;
  isSavingBoost: boolean;
  // Callbacks — filters
  onSearch: (val: string) => void;
  onFilterCategory: (cat: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onToggleCategoryOpen: () => void;
  onToggleSortOpen: () => void;
  onCategorySearchChange: (val: string) => void;
  // Callbacks — editing
  onStartEditing: (product: ProductRecord) => void;
  onSaveProduct: (id: string) => void;
  onCancelEditing: () => void;
  onEditFormChange: (form: EditForm) => void;
  // Callbacks — quick boost
  onOpenQuickBoost: (productId: string, defaultView: number, defaultLike: number) => void;
  onConfirmQuickBoost: (productId: string, currentViews: number, currentLikes: number) => void;
  onCancelQuickBoost: () => void;
  onQuickBoostViewChange: (val: number) => void;
  onQuickBoostLikeChange: (val: number) => void;
}

export const UserProductsPanel: React.FC<UserProductsPanelProps> = ({
  products,
  totalCount,
  publishedCount,
  unpublishedCount,
  loading,
  searchTerm,
  filterCategory,
  sortBy,
  currentPage,
  itemsPerPage,
  filteredCategories,
  isCategoryOpen,
  isSortOpen,
  categorySearch,
  editingProductId,
  editForm,
  quickBoostId,
  quickBoostValue,
  quickBoostLikesValue,
  isSavingBoost,
  onSearch,
  onFilterCategory,
  onSortChange,
  onPageChange,
  onToggleCategoryOpen,
  onToggleSortOpen,
  onCategorySearchChange,
  onStartEditing,
  onSaveProduct,
  onCancelEditing,
  onEditFormChange,
  onOpenQuickBoost,
  onConfirmQuickBoost,
  onCancelQuickBoost,
  onQuickBoostViewChange,
  onQuickBoostLikeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Panel header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-800/50 text-primary-500 rounded-2xl shadow-inner">
            <Package size={24} />
          </div>
          <h4 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            {t('admin_user_products_posts')}
          </h4>
        </div>
        <div className="px-5 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-700/50 shadow-xl flex items-baseline gap-2 whitespace-nowrap self-start">
          <span className="text-lg font-black uppercase tracking-tight">{totalCount}</span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t('admin_found')}</span>
        </div>
      </div>

      {/* Published / Unpublished stats bar */}
      {(publishedCount > 0 || unpublishedCount > 0) && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
              {publishedCount} Published
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              {unpublishedCount} Unpublished
            </span>
          </div>
          <div className="w-full sm:w-auto sm:ml-auto text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Only published products will be boosted
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 mb-6 sm:mb-8">
        {/* Search */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder={t('admin_search_user_products')}
            className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent focus:border-primary-500 rounded-2xl py-3.5 px-5 pl-14 text-[10px] font-bold uppercase tracking-widest outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-30">
          {/* Category Filter */}
          <div className="relative h-[52px]">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCategoryOpen(); }}
              className="w-full h-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <Filter size={12} className="text-primary-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {filterCategory === 'all' ? t('vendor_all_categories') : filterCategory}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform pointer-events-none ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <input
                    type="text"
                    placeholder={t('admin_search_categories')}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-xl py-2 px-3 text-[9px] font-bold uppercase tracking-widest outline-none"
                    value={categorySearch}
                    onChange={(e) => onCategorySearchChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => { onFilterCategory('all'); onPageChange(1); }}
                    className="w-full px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    {t('vendor_all_categories')}
                  </button>
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { onFilterCategory(cat); onPageChange(1); }}
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
          <div className="relative h-[52px]">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSortOpen(); }}
              className="w-full h-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 flex items-center justify-between transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <ArrowUpDown size={12} className="text-primary-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform pointer-events-none ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden py-2 px-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onSortChange(opt.value); onPageChange(1); }}
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

      {/* Product Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative">
        <>
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('loading')}...</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isEditing={editingProductId === product.id}
                editForm={editForm}
                onStartEditing={() => onStartEditing(product)}
                onSaveProduct={() => onSaveProduct(product.id)}
                onCancelEditing={onCancelEditing}
                onEditFormChange={onEditFormChange}
                isQuickBoostOpen={quickBoostId === product.id}
                quickBoostValue={quickBoostValue}
                quickBoostLikesValue={quickBoostLikesValue}
                isSavingBoost={isSavingBoost}
                onOpenQuickBoost={() => onOpenQuickBoost(product.id, quickBoostValue, quickBoostLikesValue)}
                onConfirmQuickBoost={() => onConfirmQuickBoost(product.id, product.view_count || 0, product.like_count || 0)}
                onCancelQuickBoost={onCancelQuickBoost}
                onQuickBoostViewChange={onQuickBoostViewChange}
                onQuickBoostLikeChange={onQuickBoostLikeChange}
              />
            ))
          )}
        </>
      </div>

      {/* Empty State */}
      {!loading && totalCount === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-[2.5rem]">
          <Package size={40} className="text-slate-200 mx-auto mb-4 bg-white dark:bg-slate-900" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('admin_no_results')}</p>
        </div>
      )}

      {/* Pagination */}
      {totalCount > itemsPerPage && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
