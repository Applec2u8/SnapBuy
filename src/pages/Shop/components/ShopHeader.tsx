import { Sparkles, Search, LayoutGrid, List } from 'lucide-react';

interface ShopHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const ShopHeader = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode
}: ShopHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 text-left sticky lg:top-20 z-20 bg-background dark:bg-slate-950 py-2 border-b border-transparent will-change-transform">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-primary-500">
          <Sparkles size={12} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Premium Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
          Explore <span className="text-primary-500 italic">Everything</span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute left-3 top-2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full md:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:border-primary-500 transition-colors shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500/10 text-primary-500' : 'text-slate-400'}`}><LayoutGrid size={14} /></button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500/10 text-primary-500' : 'text-slate-400'}`}><List size={14} /></button>
        </div>
      </div>
    </div>
  );
};
