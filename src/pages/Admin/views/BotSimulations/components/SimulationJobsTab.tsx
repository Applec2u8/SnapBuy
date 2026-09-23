import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useCallback } from 'react';
import { Plus, Trash2, Play, Pause, RefreshCw, Users, ShoppingCart, Clock, Zap, ChevronDown, Store, BarChart3, Search, X, CheckCircle2, Loader2 } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  logo_url?: string;
  products?: { id: string }[];
}

interface BotJob {
  id: string;
  shop_id: string;
  bot_count_min: number;
  bot_count_max: number;
  items_per_order_min: number;
  items_per_order_max: number;
  price_preference: 'random' | 'cheap' | 'expensive' | 'all' | 'custom';
  price_min?: number | null;
  price_max?: number | null;
  max_runs?: number | null;
  interval_minutes: number;
  status: 'active' | 'paused';
  last_run_at: string | null;
  created_at: string;
  shops?: { name: string; logo_url?: string };
}

interface SimulationJobsTabProps {
  jobs: BotJob[];
  jobsLoading: boolean;
  shops: Shop[];
  showNewJobForm: boolean;
  setShowNewJobForm: (val: boolean) => void;
  newJob: any;
  setNewJob: (val: any) => void;
  creatingJob: boolean;
  handleCreateJob: () => void;
  handleRunJobNow: (id: string) => void;
  handleToggleJob: (job: BotJob) => void;
  handleDeleteJob: (id: string) => void;
  shopSearch: string;
  setShopSearch: (val: string) => void;
  shopDropdownOpen: boolean;
  setShopDropdownOpen: (val: any) => void;
  shopPickerRef: any;
  totalBots: number | null;
  fetchJobs: () => void;
  priceRangeInfo?: {
    matchCount: number | null;
    shopMinPrice: number | null;
    shopMaxPrice: number | null;
    checking: boolean;
  };
}

const formatInterval = (mins: number) => {
  if (mins < 60) return `${mins} นาที`;
  if (mins < 1440) return `${mins / 60} ชั่วโมง`;
  return `${mins / 1440} วัน`;
};

const getLastRunLabel = (lastRun: string | null) => {
  if (!lastRun) return 'ยังไม่รัน';
  const diff = Date.now() - new Date(lastRun).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อกี้';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  return `${Math.floor(mins / 60)} ชั่วโมงที่แล้ว`;
};

// ── Quick-select pill button ──────────────────────────────────────────────────
function QuickBtn({ active, onClick, children, disabled = false, color = 'violet' }: {
  active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; color?: string;
}) {
  const activeClass: Record<string, string> = {
    violet: 'bg-violet-500 text-white shadow-violet-500/25',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/25',
    blue: 'bg-blue-500 text-white shadow-blue-500/25',
    rose: 'bg-rose-500 text-white shadow-rose-500/25',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-sm whitespace-nowrap
        ${active
          ? `${activeClass[color] || activeClass.violet}`
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
    >
      {children}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</p>
  );
}

// ── Number input with icon ────────────────────────────────────────────────────
function NumberField({ icon, value, onChange, min = 0, max, placeholder }: {
  icon: React.ReactNode; value: number | string; onChange: (v: number | null) => void;
  min?: number; max?: number; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">{icon}</span>
      <input
        type="number"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      />
    </div>
  );
}

export function SimulationJobsTab({
  jobs,
  jobsLoading,
  shops,
  showNewJobForm,
  setShowNewJobForm,
  newJob,
  setNewJob,
  creatingJob,
  handleCreateJob,
  handleRunJobNow,
  handleToggleJob,
  handleDeleteJob,
  shopSearch,
  setShopSearch,
  shopDropdownOpen,
  setShopDropdownOpen,
  shopPickerRef,
  totalBots,
  fetchJobs,
  priceRangeInfo,
}: SimulationJobsTabProps) {

  const priceOk = priceRangeInfo && !priceRangeInfo.checking && priceRangeInfo.matchCount !== null && priceRangeInfo.matchCount > 0;
  const priceEmpty = priceRangeInfo && !priceRangeInfo.checking && priceRangeInfo.matchCount === 0;

  // Memoize filtered shops — re-compute only when shops list or search text changes
  const filteredShops = useMemo(() => {
    if (!shopSearch) return shops;
    const q = shopSearch.toLowerCase();
    return shops.filter(s => s.name.toLowerCase().includes(q));
  }, [shops, shopSearch]);

  const selectedShop = useMemo(() => shops.find(s => s.id === newJob.shop_id), [shops, newJob.shop_id]);

  return (
    <div className="space-y-4">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{jobs.length} Job{jobs.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={15} className="text-slate-400" />
          </button>
          <button
            onClick={() => setShowNewJobForm(true)}
            className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus size={14} />
            สร้าง Job ใหม่
          </button>
        </div>
      </div>

      {/* ── New Job Form ── */}
      <AnimatePresence>
        {showNewJobForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowNewJobForm(false)}
            />
            {/* Form Container */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border-t sm:border border-violet-200/60 dark:border-violet-500/20 shadow-2xl flex flex-col"
            >
              {/* Form header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">สร้าง Simulation Job ใหม่</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">กำหนดค่าบอทอัตโนมัติ</p>
                </div>
              </div>

              <div className="p-5 space-y-5">

                {/* ── 1. ร้านค้า ── */}
                <div className="space-y-2 relative" ref={shopPickerRef}>
                  <SectionLabel>1 · ร้านค้าเป้าหมาย *</SectionLabel>
                  <div className='flex gap-3'>
                    <button
                      type="button"
                      onClick={() => { setShopDropdownOpen((o: boolean) => !o); setShopSearch(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm transition-all focus:outline-none
                    ${shopDropdownOpen ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-violet-400'}`}
                    >
                      {newJob.shop_id ? (
                        <>
                          {selectedShop?.logo_url
                            ? <img src={selectedShop.logo_url} alt={selectedShop?.name} loading="lazy" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                            : <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0"><Store size={13} className="text-violet-500" /></div>
                          }
                          <span className="flex-1 text-left font-semibold text-slate-900 dark:text-white truncate">
                            {selectedShop?.name}
                            <span className="ml-2 text-xs text-slate-500 font-normal">({selectedShop?.products?.length || 0} สินค้า)</span>
                          </span>
                          <X size={15} className="text-slate-400 hover:text-rose-500 flex-shrink-0"
                            onClick={e => { e.stopPropagation(); setNewJob((p: any) => ({ ...p, shop_id: '' })); }}
                          />
                        </>
                      ) : (
                        <>
                          <Store size={15} className="text-slate-400 flex-shrink-0" />
                          <span className="flex-1 text-left text-slate-400 text-sm">— เลือกร้านค้า —</span>
                          <ChevronDown size={15} className={`text-slate-400 flex-shrink-0 transition-transform duration-150 ${shopDropdownOpen ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                    <div className="w-full">
                      About products
                    </div>
                  </div>

                  {/* Dropdown — plain div, no framer-motion overhead */}
                  {shopDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <Search size={13} className="text-slate-400 flex-shrink-0" />
                          <input
                            autoFocus
                            value={shopSearch}
                            onChange={e => setShopSearch(e.target.value)}
                            placeholder="ค้นหาร้านค้า..."
                            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                          />
                          {shopSearch && <button onClick={() => setShopSearch('')}><X size={12} className="text-slate-400" /></button>}
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredShops.map(s => (
                          <button key={s.id} type="button"
                            onClick={() => { setNewJob((p: any) => ({ ...p, shop_id: s.id })); setShopDropdownOpen(false); setShopSearch(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 dark:hover:bg-violet-500/10 ${newJob.shop_id === s.id ? 'bg-violet-50 dark:bg-violet-500/10' : ''}`}
                          >
                            {s.logo_url
                              ? <img src={s.logo_url} alt={s.name} loading="lazy" className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-slate-100 dark:border-slate-700" />
                              : <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0"><Store size={14} className="text-violet-500" /></div>
                            }
                            <div className="flex-1 text-left truncate">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</span>
                              <span className="ml-2 text-xs text-slate-500">({s.products?.length || 0} สินค้า)</span>
                            </div>
                            {newJob.shop_id === s.id && <CheckCircle2 size={14} className="text-violet-500 ml-auto flex-shrink-0" />}
                          </button>
                        ))}
                        {filteredShops.length === 0 && (
                          <p className="py-6 text-center text-xs text-slate-400">ไม่พบร้านค้า</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── 2. บอทต่อรอบ ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SectionLabel>2 · จำนวนบอทต่อรอบ</SectionLabel>
                    {totalBots !== null && (
                      <span className="text-[9px] font-black text-violet-500 bg-violet-100 dark:bg-violet-500/20 px-2 py-0.5 rounded-md">
                        Pool: {totalBots} บอท
                      </span>
                    )}
                  </div>
                  <NumberField
                    icon={<Users size={14} />}
                    value={newJob.bot_count}
                    min={1}
                    max={totalBots ?? undefined}
                    onChange={v => {
                      let val = v ?? 1;
                      if (totalBots !== null && totalBots > 0 && val > totalBots) val = totalBots;
                      setNewJob((p: any) => ({ ...p, bot_count: val }));
                    }}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 5, 10, 20, 50].map(n => (
                      <QuickBtn key={n} active={newJob.bot_count === n}
                        disabled={totalBots !== null && n > totalBots}
                        onClick={() => {
                          let val = n;
                          if (totalBots !== null && totalBots > 0 && val > totalBots) val = totalBots;
                          setNewJob((p: any) => ({ ...p, bot_count: val }));
                        }}>
                        {n} บอท
                      </QuickBtn>
                    ))}
                  </div>
                </div>

                {/* ── 3. ระดับราคาสินค้า ── */}
                <div className="space-y-2">
                  <SectionLabel>3 · ระดับราคาสินค้า</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'custom', label: '🎯 กำหนดเอง', color: 'blue' },
                      { val: 'random', label: '🟡 สุ่มทั้งหมด', color: 'violet' },
                      { val: 'cheap', label: '🟢 ราคาถูก', color: 'emerald' },
                      { val: 'expensive', label: '🔴 ราคาแพง', color: 'rose' },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setNewJob((p: any) => ({ ...p, price_preference: opt.val }))}
                        className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all text-center
                        ${newJob.price_preference === opt.val
                            ? opt.color === 'blue' ? 'bg-blue-500    text-white border-blue-500    shadow-md shadow-blue-500/20'
                              : opt.color === 'violet' ? 'bg-violet-500  text-white border-violet-500  shadow-md shadow-violet-500/20'
                                : opt.color === 'emerald' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                  : 'bg-rose-500    text-white border-rose-500    shadow-md shadow-rose-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom price inputs */}
                  <AnimatePresence>
                    {newJob.price_preference === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-4 bg-blue-50/70 dark:bg-blue-900/15 border border-blue-200/60 dark:border-blue-500/25 rounded-xl space-y-3">
                          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            🎯 ช่วงราคาต่อหน่วยสินค้า
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ราคาขั้นต่ำ</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                                <input type="number" min={0} placeholder="0"
                                  value={newJob.price_min ?? ''}
                                  onChange={e => setNewJob((p: any) => ({ ...p, price_min: e.target.value === '' ? null : Number(e.target.value) }))}
                                  className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ราคาสูงสุด</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                                <input type="number" min={0} placeholder="ไม่จำกัด"
                                  value={newJob.price_max ?? ''}
                                  onChange={e => setNewJob((p: any) => ({ ...p, price_max: e.target.value === '' ? null : Number(e.target.value) }))}
                                  className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Live match status */}
                          {priceRangeInfo?.checking && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <Loader2 size={11} className="animate-spin" /> กำลังตรวจสอบสินค้า...
                            </div>
                          )}
                          {priceOk && (
                            <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 size={12} /> พบ {priceRangeInfo!.matchCount} สินค้าที่ตรงกับช่วงราคานี้
                            </div>
                          )}
                          {priceEmpty && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-rose-500 font-bold">⚠️ ไม่พบสินค้าในช่วงราคานี้</p>
                              {priceRangeInfo!.shopMinPrice !== null && (
                                <p className="text-[10px] text-slate-500">
                                  ราคาสินค้าในร้านนี้อยู่ระหว่าง{' '}
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    ${priceRangeInfo!.shopMinPrice?.toFixed(2)} – ${priceRangeInfo!.shopMaxPrice?.toFixed(2)}
                                  </span>{' '}— กรุณาปรับช่วงราคาใหม่
                                </p>
                              )}
                            </div>
                          )}
                          {!priceRangeInfo?.checking && priceRangeInfo?.matchCount == null && newJob.shop_id && (
                            <p className="text-[10px] text-slate-400">พิมพ์ช่วงราคาเพื่อตรวจสอบสินค้าที่ตรงกัน</p>
                          )}
                          {!newJob.shop_id && (
                            <p className="text-[10px] text-slate-400">เลือกร้านค้าก่อนเพื่อดูจำนวนสินค้าที่ตรงกัน</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── 4. จำนวนสินค้าต่อรอบ ── */}
                <div className="space-y-2">
                  <SectionLabel>4 · จำนวนสินค้าที่ต้องการสุ่มซื้อ (รวมต่อ 1 รอบ)</SectionLabel>
                  <NumberField
                    icon={<ShoppingCart size={14} />}
                    value={newJob.items_per_order_max}
                    min={1}
                    onChange={v => setNewJob((p: any) => ({ ...p, items_per_order_max: v ?? 1 }))}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 5, 10].map(n => (
                      <QuickBtn key={n} color="emerald"
                        active={newJob.items_per_order_max === n}
                        onClick={() => setNewJob((p: any) => ({ ...p, items_per_order_max: n }))}>
                        {n} ชิ้น
                      </QuickBtn>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">จำนวนสินค้ารวมทั้งหมดใน 1 รอบ บอทที่สุ่มมาจะแบ่งกันซื้อให้ครบ</p>
                </div>

                {/* ── 5. ความถี่ ── */}
                <div className="space-y-2">
                  <SectionLabel>5 · ความถี่ในการรัน</SectionLabel>
                  <NumberField
                    icon={<Clock size={14} />}
                    value={newJob.interval_minutes}
                    min={1}
                    onChange={v => setNewJob((p: any) => ({ ...p, interval_minutes: v ?? 60 }))}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[5, 15, 30, 60, 360, 1440, 2880, 4320].map(m => (
                      <QuickBtn key={m} active={newJob.interval_minutes === m}
                        onClick={() => setNewJob((p: any) => ({ ...p, interval_minutes: m }))}>
                        {m === 2880 ? '2 วัน' : m === 4320 ? '3 วัน' : formatInterval(m)}
                      </QuickBtn>
                    ))}
                  </div>
                </div>

                {/* ── 6. จำนวนรอบ ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SectionLabel>6 · จำนวนรอบที่รัน</SectionLabel>
                    <span className="text-[9px] text-slate-400">(0 = ไม่จำกัด)</span>
                  </div>
                  <NumberField
                    icon={<RefreshCw size={14} className={newJob.max_runs === 0 ? 'text-violet-500' : 'text-slate-400'} />}
                    value={newJob.max_runs}
                    min={0}
                    onChange={v => setNewJob((p: any) => ({ ...p, max_runs: v ?? 0 }))}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 1, 5, 10, 50, 100].map(r => (
                      <QuickBtn key={r} active={newJob.max_runs === r}
                        onClick={() => setNewJob((p: any) => ({ ...p, max_runs: r }))}>
                        {r === 0 ? '♾️ ไม่จำกัด' : `${r} รอบ`}
                      </QuickBtn>
                    ))}
                  </div>
                </div>

                {/* ── Summary ── */}
                {(() => {
                  const expectedItems = newJob.items_per_order_max || 1;
                  const pMin = newJob.price_min ?? 0;
                  const pMax = newJob.price_max ?? 0;
                  const sMin = priceRangeInfo?.shopMinPrice ?? 0;
                  const sMax = priceRangeInfo?.shopMaxPrice ?? 0;

                  let costMin = 0;
                  let costMax = 0;

                  if (newJob.price_preference === 'custom') {
                    // ถ้ากำหนดช่วงราคาเอง แต่ยังไม่กรอก ให้ใช้ราคาของร้านค้าแทนชั่วคราว
                    costMin = (pMin > 0 ? pMin : sMin) * expectedItems;
                    costMax = (pMax > 0 ? pMax : sMax) * expectedItems;
                  } else {
                    // ถ้าเลือกแบบอื่น (ราคาถูก/แพง/สุ่ม) ให้เอาราคาต่ำสุด-สูงสุดของร้านมาประเมิน
                    costMin = sMin * expectedItems;
                    costMax = sMax * expectedItems;
                  }

                  const costLabel = (costMin > 0 || costMax > 0)
                    ? `$${costMin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - $${costMax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'กำลังคำนวณ...';

                  return (
                    <div className="bg-violet-50/60 dark:bg-violet-500/10 border border-violet-200/50 dark:border-violet-500/20 rounded-xl p-4 space-y-3 mt-4">
                      <p className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-violet-200/50 dark:border-violet-500/20 pb-2">
                        <Zap size={11} /> ประมาณการยอดใช้จ่ายและสรุปการทำงาน
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">จำนวนที่สั่งซื้อ</p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{expectedItems} ชิ้น</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ยอดเงินโดยรวม (ประมาณ)</p>
                          <p className="text-sm font-black text-rose-500 dark:text-rose-400 mt-1.5">{costLabel}</p>
                        </div>
                      </div>

                      <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc pt-1">
                        <li>ใช้บอทสุ่มซื้อสินค้าสูงสุดไม่เกิน <b>{newJob.bot_count} ตัว</b></li>
                        {newJob.max_runs === 0
                          ? <li>รันต่อเนื่อง <b>ไม่จำกัดรอบ</b> ทุก <b>{formatInterval(newJob.interval_minutes)}</b></li>
                          : <li>รัน <b>{newJob.max_runs} รอบ</b> ทุก <b>{formatInterval(newJob.interval_minutes)}</b></li>
                        }
                      </ul>
                    </div>
                  );
                })()}

              </div>

              {/* ── Form actions ── */}
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={() => setShowNewJobForm(false)}
                  className="px-5 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={creatingJob || !newJob.shop_id}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-400 px-4 py-3 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-violet-500/20 disabled:shadow-none transition-all"
                >
                  {creatingJob ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                  สร้าง Job
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Jobs List ── */}
      {jobsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-violet-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-400">ยังไม่มี Simulation Job</p>
          <button onClick={() => setShowNewJobForm(true)}
            className="text-[11px] font-black text-violet-500 hover:text-violet-600 uppercase tracking-widest">
            + สร้าง Job แรก
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <motion.div key={job.id} layout
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${job.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {(job as any).shops?.name || 'Unknown Shop'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 ${job.status === 'active'
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {job.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                        <Clock size={10} className="text-violet-500" /> {formatInterval(job.interval_minutes)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                        <Users size={10} className="text-amber-500" /> {job.bot_count_min} บอท/รอบ
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                        <ShoppingCart size={10} className="text-emerald-500" /> รวม {job.items_per_order_max} ชิ้น/รอบ
                      </span>
                      {job.max_runs ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <RefreshCw size={10} /> {job.max_runs} รอบ
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                          <RefreshCw size={10} /> ไม่จำกัด
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">รันล่าสุด: {getLastRunLabel(job.last_run_at)}</p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleRunJobNow(job.id)}
                    disabled={job.status !== 'active' || (job.max_runs != null && job.max_runs <= 0)}
                    title="รันทันที"
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Zap size={15} />
                  </button>
                  <button
                    onClick={() => handleToggleJob(job)}
                    title={job.status === 'active' ? 'หยุดชั่วคราว' : 'เปิดใช้งาน'}
                    className={`p-2.5 rounded-xl transition-colors ${job.status === 'active'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 hover:bg-amber-100'
                      : 'bg-green-50 dark:bg-green-500/10 text-green-500 hover:bg-green-100'}`}
                  >
                    {job.status === 'active' ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    title="ลบ"
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
