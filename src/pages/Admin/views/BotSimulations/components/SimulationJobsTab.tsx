import { motion, AnimatePresence } from 'framer-motion';
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
  price_preference: 'random' | 'cheap' | 'expensive' | 'all';
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
  fetchJobs
}: SimulationJobsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{jobs.length} Simulation Job{jobs.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button
            onClick={fetchJobs}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className="text-slate-400" />
          </button>
          <button
            onClick={() => setShowNewJobForm(true)}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out w-full flex justify-center items-center gap-2 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/30 disabled:cursor-not-allowed px-3 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest"
          >
            <Plus size={14} />
            สร้าง Job ใหม่
          </button>
        </div>
      </div>

      {/* New Job Form */}
      <AnimatePresence>
        {showNewJobForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-violet-200/50 dark:border-violet-500/20 p-8 space-y-6 shadow-2xl shadow-violet-500/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">สร้าง Simulation Job ใหม่</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">กำหนดค่าและเป้าหมายสำหรับการรันบอทอัตโนมัติ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Shop Searchable Picker */}
              <div className="sm:col-span-2 space-y-1.5 relative" ref={shopPickerRef}>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ร้านค้าเป้าหมาย *</label>

                {/* Selected shop display / trigger */}
                <button
                  type="button"
                  onClick={() => { setShopDropdownOpen((o: boolean) => !o); setShopSearch(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm transition-all focus:outline-none ${shopDropdownOpen
                    ? 'border-violet-500 ring-2 ring-violet-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-violet-400'
                    }`}
                >
                  {newJob.shop_id ? (() => {
                    const s = shops.find(s => s.id === newJob.shop_id);
                    return (
                      <>
                        {s?.logo_url
                          ? <img src={s.logo_url} alt={s?.name} className="w-6 h-6 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0"><Store size={12} className="text-violet-500" /></div>
                        }
                        <span className="flex-1 text-left font-semibold text-slate-900 dark:text-white truncate">
                          {s?.name}
                          <span className="ml-2 text-xs text-slate-500 font-normal">
                            ({s?.products?.length || 0} สินค้า)
                          </span>
                        </span>
                        <X size={14} className="text-slate-400 hover:text-rose-500 flex-shrink-0"
                          onClick={e => { e.stopPropagation(); setNewJob((p: any) => ({ ...p, shop_id: '' })); }}
                        />
                      </>
                    );
                  })() : (
                    <>
                      <Store size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="flex-1 text-left text-slate-400">-- เลือกร้านค้า --</span>
                      <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                    </>
                  )}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {shopDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                    >
                      {/* Search input */}
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
                          {shopSearch && (
                            <button onClick={() => setShopSearch('')}>
                              <X size={12} className="text-slate-400 hover:text-slate-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Shop list */}
                      <div className="max-h-52 overflow-y-auto">
                        {shops
                          .filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase()))
                          .map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setNewJob((p: any) => ({ ...p, shop_id: s.id }));
                                setShopDropdownOpen(false);
                                setShopSearch('');
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors ${newJob.shop_id === s.id ? 'bg-violet-50 dark:bg-violet-500/10' : ''
                                }`}
                            >
                              {s.logo_url
                                ? <img src={s.logo_url} alt={s.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-slate-100 dark:border-slate-700" />
                                : <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0"><Store size={14} className="text-violet-500" /></div>
                              }
                              <div className="flex-1 text-left truncate">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</span>
                                <span className="ml-2 text-xs text-slate-500">({s.products?.length || 0} สินค้า)</span>
                              </div>
                              {newJob.shop_id === s.id && (
                                <CheckCircle2 size={14} className="text-violet-500 ml-auto flex-shrink-0" />
                              )}
                            </button>
                          ))
                        }
                        {shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())).length === 0 && (
                          <p className="py-6 text-center text-xs text-slate-400">ไม่พบร้านค้า</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interval */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ความถี่ (นาที)</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    value={newJob.interval_minutes}
                    onChange={e => setNewJob((p: any) => ({ ...p, interval_minutes: Number(e.target.value) }))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[5, 15, 30, 60, 360, 1440, 2880, 4320].map(m => (
                    <button
                      key={m}
                      onClick={() => setNewJob((p: any) => ({ ...p, interval_minutes: m }))}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${newJob.interval_minutes === m ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {m === 2880 ? '2 วัน' : m === 4320 ? '3 วัน' : formatInterval(m)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Runs */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                  จำนวนรอบที่ให้รัน
                  <span className="text-slate-400 font-normal lowercase">(0 = รันเรื่อยๆ)</span>
                </label>
                <div className="relative">
                  <RefreshCw size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${newJob.max_runs === 0 ? 'text-violet-500 animate-spin-slow' : 'text-slate-400'}`} />
                  <input
                    type="number"
                    min={0}
                    value={newJob.max_runs}
                    onChange={e => setNewJob((p: any) => ({ ...p, max_runs: Number(e.target.value) }))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[0, 1, 5, 10, 50, 100].map(r => (
                    <button
                      key={r}
                      onClick={() => setNewJob((p: any) => ({ ...p, max_runs: r }))}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${newJob.max_runs === r ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {r === 0 ? '♾️ ไม่จำกัด' : `${r} รอบ`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot Count — single field */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">จำนวนบอทที่ใช้ต่อรอบ</label>
                  {totalBots !== null && (
                    <span className="text-[9px] font-black text-violet-500 bg-violet-100 dark:bg-violet-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      🤖 Pool ทั้งหมด {totalBots} บอท
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={totalBots ?? undefined}
                    value={newJob.bot_count}
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (totalBots !== null && totalBots > 0 && val > totalBots) {
                        val = totalBots;
                      }
                      setNewJob((p: any) => ({ ...p, bot_count: val }));
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[1, 2, 5, 10, 20, 50].map(n => (
                    <button
                      key={n}
                      type="button"
                      disabled={totalBots !== null && n > totalBots}
                      onClick={() => {
                        let val = n;
                        if (totalBots !== null && totalBots > 0 && val > totalBots) val = totalBots;
                        setNewJob((p: any) => ({ ...p, bot_count: val }));
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${newJob.bot_count === n
                        ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                    >
                      {n} บอท
                    </button>
                  ))}
                </div>
                {totalBots !== null && (
                  <p className="text-[10px] text-slate-400">
                    * กำหนดได้สูงสุดตามจำนวนบอทในระบบ ({totalBots} บอท)
                  </p>
                )}
              </div>

              {/* Price Preference */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ระดับราคาสินค้าที่ต้องการซื้อ</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewJob((p: any) => ({ ...p, price_preference: 'all' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${newJob.price_preference === 'all' ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'}`}
                  >
                    🔵 ทั้งหมด (สุ่ม)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewJob((p: any) => ({ ...p, price_preference: 'random' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${newJob.price_preference === 'random' ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-violet-300'}`}
                  >
                    🟡 สุ่มสินค้า
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewJob((p: any) => ({ ...p, price_preference: 'cheap' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${newJob.price_preference === 'cheap' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300'}`}
                  >
                    🟢 ราคาถูก
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewJob((p: any) => ({ ...p, price_preference: 'expensive' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${newJob.price_preference === 'expensive' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-rose-300'}`}
                  >
                    🔴 ราคาแพง
                  </button>
                </div>
              </div>

              {/* Max Items Per Bot */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">จำนวนสินค้าสูงสุดต่อบอท 1 ตัว</label>
                <div className="relative">
                  <ShoppingCart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    value={newJob.items_per_order_max}
                    onChange={e => setNewJob((p: any) => ({ ...p, items_per_order_max: Number(e.target.value) }))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {[1, 2, 3, 5, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNewJob((p: any) => ({ ...p, items_per_order_max: n }))}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${newJob.items_per_order_max === n
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      สูงสุด {n} ชิ้น
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">บอทแต่ละตัวจะสุ่มซื้อสินค้า 1 ถึง {newJob.items_per_order_max} ชิ้น (ไม่เกินจำนวนนี้)</p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 mt-2">
              <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Zap size={12} /> สรุปการทำงานของ Job นี้
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-5 list-disc">
                <li>เมื่อกดปุ่มสร้าง จะทำการรัน <b>ทันที 1 รอบ</b> และบอทจำนวน <b>{newJob.bot_count} ตัว</b> จะถูกสุ่มมาสร้างออเดอร์ (ได้ออเดอร์ใหม่ทันที {newJob.bot_count} รายการ)</li>
                <li>บอทแต่ละตัวจะสุ่มเลือกสินค้าในร้าน 1 ชิ้น และสุ่มซื้อ <b>1 ถึง {newJob.items_per_order_max} ชิ้น</b></li>
                {newJob.max_runs === 0 ? (
                  <li>หลังจากรันรอบแรก ระบบจะรันรอบถัดไป <b>อัตโนมัติแบบไม่จำกัดจำนวนรอบ</b> ทุกๆ <b>{newJob.interval_minutes} นาที</b></li>
                ) : (
                  <li>หลังจากรันรอบแรก ระบบจะรันรอบถัดไปอัตโนมัติทุกๆ <b>{newJob.interval_minutes} นาที</b> จนครบ <b>{newJob.max_runs} รอบ</b> (รวมรอบแรก)</li>
                )}
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCreateJob}
                disabled={creatingJob || !newJob.shop_id}
                className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out flex justify-center items-center gap-2 text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed px-4 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-violet-500/20 disabled:shadow-none transition-all"
              >
                {creatingJob ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                สร้าง Simulation Job
              </button>
              <button
                onClick={() => setShowNewJobForm(false)}
                className="px-6 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs List */}
      {jobsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-violet-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <BarChart3 size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-400">ยังไม่มี Simulation Job</p>
          <button
            onClick={() => setShowNewJobForm(true)}
            className="text-[11px] font-black text-violet-500 hover:text-violet-600 uppercase tracking-widest"
          >
            + สร้าง Job แรก
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <motion.div
              key={job.id}
              layout
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status indicator */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${job.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                    }`} />

                  {/* Shop info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {(job as any).shops?.name || 'Unknown Shop'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${job.status === 'active'
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                        {job.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1.5">
                        <Clock size={12} className="text-violet-500" /> ทุก {formatInterval(job.interval_minutes)}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1.5">
                        <Users size={12} className="text-amber-500" /> {job.bot_count_min}–{job.bot_count_max} บอท/รอบ
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1.5">
                        <ShoppingCart size={12} className="text-emerald-500" /> {job.items_per_order_min} ชิ้น
                      </span>
                      {job.max_runs ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <RefreshCw size={12} /> จำกัด {job.max_runs} รอบ
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1.5">
                          <RefreshCw size={12} /> ไม่จำกัดรอบ
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-1">
                        รันล่าสุด: {getLastRunLabel(job.last_run_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRunJobNow(job.id)}
                    disabled={job.status !== 'active' || (job.max_runs != null && job.max_runs <= 0)}
                    title="สั่งซื้อทันทีเดี๋ยวนี้!"
                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-300 transition-all flex items-center justify-center group"
                  >
                    <Zap size={16} className="group-hover:fill-blue-500" />
                  </button>
                  <button
                    onClick={() => handleToggleJob(job)}
                    title={job.status === 'active' ? 'หยุดชั่วคราว' : 'เปิดใช้งาน'}
                    className={`p-2 rounded-lg transition-all ${job.status === 'active'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 hover:bg-amber-100'
                      : 'bg-green-50 dark:bg-green-500/10 text-green-500 hover:bg-green-100'
                      }`}
                  >
                    {job.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    title="ลบ Job"
                    className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={16} />
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
