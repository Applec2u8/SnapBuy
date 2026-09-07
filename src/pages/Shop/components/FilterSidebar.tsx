import { Filter as FilterIcon, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface FilterSidebarProps {
  isFilterExpanded: boolean;
  setIsFilterExpanded: (expanded: boolean) => void;
  selectedCategories: string[];
  showCatDropdown: boolean;
  setShowCatDropdown: (show: boolean) => void;
  catSearch: string;
  setCatSearch: (search: string) => void;
  filteredCategories: any[];
  toggleCategory: (id: string) => void;
  shops: any[];
  selectedShops: string[];
  toggleShop: (id: string) => void;
  minPrice: number;
  setMinPrice: (price: number) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

export const FilterSidebar = ({
  isFilterExpanded,
  setIsFilterExpanded,
  selectedCategories,
  showCatDropdown,
  setShowCatDropdown,
  catSearch,
  setCatSearch,
  filteredCategories,
  toggleCategory,
  shops,
  selectedShops,
  toggleShop,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  resetFilters
}: FilterSidebarProps) => {
  return (
    <aside className="lg:col-span-1 h-fit space-y-2 text-left lg:sticky lg:top-40 z-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col">
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex items-center justify-between group transition-colors"
        >
          <div className="flex items-center gap-2">
            <FilterIcon size={14} className={isFilterExpanded ? "text-primary-500" : "text-slate-400"} />
            <span className={`text-[11px] sm:text-xs font-black uppercase tracking-widest ${isFilterExpanded ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>Filters</span>
          </div>
          {isFilterExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isFilterExpanded ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 space-y-4 max-h-[1350px] overflow-y-auto custom-scrollbar">
            <div className="space-y-1 relative">
              <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Categories</label>
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 flex items-center justify-between group transition-all"
              >
                <span className="text-xs sm:text-sm font-bold truncate pr-2">
                  {selectedCategories.length > 0 ? `${selectedCategories.length} Selected` : 'All Categories'}
                </span>
                <ChevronDown className={`text-slate-400 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} size={12} />
              </button>
              {showCatDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] p-2 space-y-2">
                  <input className="w-full bg-slate-50 dark:bg-slate-900 p-2 sm:p-2.5 rounded-md text-xs sm:text-sm outline-none border border-slate-200 dark:border-slate-800" placeholder="Search..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                  <div className="max-h-32 overflow-y-auto space-y-0.5 custom-scrollbar">
                    {filteredCategories.map(cat => (
                      <button key={cat.id} onClick={() => toggleCategory(cat.id)} className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-left">
                        <div className={`w-3 h-3 rounded border flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                          {selectedCategories.includes(cat.id) && <Check size={6} className="text-white" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold ${selectedCategories.includes(cat.id) ? 'text-primary-500' : 'text-slate-500 dark:text-slate-400'}`}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* {shops.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Shops {selectedShops.length > 0 && <span className="text-primary-500">({selectedShops.length})</span>}
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {shops.map(shop => {
                    const isSelected = selectedShops.includes(shop.id);
                    const initials = shop.name?.slice(0, 2).toUpperCase() || '??';
                    return (
                      <button
                        key={shop.id}
                        onClick={() => toggleShop(shop.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'bg-primary-500/10 border border-primary-500/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {shop.logo_url ? (
                            <img
                              src={shop.logo_url}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                            />
                          ) : null}
                          <span className={`text-[9px] font-black text-slate-500 dark:text-slate-400 ${shop.logo_url ? 'hidden' : ''}`}>{initials}</span>
                        </div>
                        <span className={`text-xs font-bold truncate flex-1 ${isSelected ? 'text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {shop.name}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check size={7} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )} */}


            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Range</label>
              <div className="flex items-center gap-1.5 mt-2">
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs sm:text-sm font-bold outline-none text-center" />
                <div className="w-3 h-px bg-slate-300"></div>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs sm:text-sm font-bold outline-none text-center" />
              </div>
            </div>

            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sorting</label>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { id: 'newest', label: 'Newest' },
                  { id: 'price_asc', label: 'Price: Low' },
                  { id: 'price_desc', label: 'Price: High' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => setSortBy(opt.id)} className={`px-3 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase text-left transition-all ${sortBy === opt.id ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={resetFilters} className="w-full py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800 text-[10px] sm:text-xs font-black uppercase text-slate-500 hover:text-primary-500 transition-colors border border-slate-200 dark:border-slate-800 rounded-lg">Reset Filters</button>
          </div>
        </div>
      </div>
    </aside>
  );
};
