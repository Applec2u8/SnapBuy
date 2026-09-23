import {
  Search, Zap, Eye, Flame, Coins, Clock, Target,
  CheckSquare, Square, Loader2, TrendingUp, Activity,
  ChevronDown, ChevronUp, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useBulkPromote, PACKAGE_CONFIG, type DurationKey } from "../../hooks/useBulkPromote";
import ImageWithFallback from "../../../../components/ui/ImageWithFallback";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BulkBoost = () => {
  const { t } = useTranslation();
  const {
    activeBoosts,
    boostableProducts,
    loading,
    search,
    setSearch,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    selectedCount,
    promoteType,
    setPromoteType,
    duration,
    setDuration,
    isPromoting,
    promotingIds,
    handleBulkPromote,
    totalCost,
    costPerProduct,
    estimatedTotal,
    walletBalance,
    isInsufficient,
    config,
  } = useBulkPromote();

  const [showActiveBoosts, setShowActiveBoosts] = useState(false);
  const [showMobileConfig, setShowMobileConfig] = useState(false);

  const renderConfigPanel = () => (
    <div className="space-y-4">
      {/* Objective */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Target size={13} className="text-primary-500" /> {t('vendor_boost_objective')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(["views", "likes"] as const).map(type => (
            <button
              key={type}
              onClick={() => setPromoteType(type)}
              className={`flex flex-col items-start gap-2 p-3 rounded-xl border-2 transition-all ${promoteType === type
                ? "border-primary-500 bg-primary-500/5"
                : "border-slate-200 dark:border-slate-800 hover:border-primary-500/30"
                }`}
            >
              <div className={`p-1.5 rounded-lg ${promoteType === type ? "bg-primary-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {type === "views" ? <Eye size={14} /> : <Flame size={14} />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                {t('vendor_boost_boost_type', { type: type === "views" ? t('vendor_boost_views') : t('vendor_boost_likes') })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration / Package */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={13} className="text-primary-500" /> {t('vendor_boost_package')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(PACKAGE_CONFIG) as [DurationKey, typeof PACKAGE_CONFIG[DurationKey]][]).map(([key, cfg]) => {
            const selected = duration === key;
            return (
              <button
                key={key}
                onClick={() => setDuration(key)}
                className={`relative flex flex-col gap-1.5 p-3 rounded-xl border-2 text-left transition-all ${selected
                  ? "border-yellow-500 bg-yellow-500/5"
                  : "border-slate-200 dark:border-slate-800 hover:border-yellow-500/30"
                  }`}
              >
                {"highlight" in cfg && cfg.highlight && (
                  <div className="absolute -top-2 right-2 bg-yellow-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                    {t('vendor_boost_popular')}
                  </div>
                )}
                <span className="text-xs font-black text-slate-900 dark:text-white">{cfg.label}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cfg.desc}</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500">
                  <Coins size={10} />
                  ${cfg.cost}/{t('vendor_boost_per_product')}
                </div>
                <div className="text-[9px] font-bold text-primary-500 flex items-center gap-1">
                  <Activity size={9} />
                  +{cfg.boostPerMin} {promoteType === "views" ? t('vendor_boost_views') : t('vendor_boost_likes')}/{t('vendor_boost_per_min')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary + Confirm */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 sticky top-4 will-change-transform">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={13} className="text-primary-500" /> {t('vendor_boost_summary')}
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>{t('vendor_boost_products_selected')}</span>
            <span className="font-black text-slate-900 dark:text-white">{selectedCount}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>{t('vendor_boost_obj_label')}</span>
            <span className="font-black text-slate-900 dark:text-white capitalize">{t('vendor_boost_boost_type', { type: promoteType === "views" ? t('vendor_boost_views') : t('vendor_boost_likes') })}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>{t('vendor_boost_duration')}</span>
            <span className="font-black text-slate-900 dark:text-white">{config.label}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>{t('vendor_boost_cost_per_product')}</span>
            <span className="font-black text-yellow-500 flex items-center gap-1">
              ${costPerProduct.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>{t('vendor_boost_est_per_product')}</span>
            <span className="font-black text-primary-500">~{estimatedTotal.toLocaleString()} {promoteType === "views" ? t('vendor_boost_views') : t('vendor_boost_likes')}</span>
          </div>
        </div>

        {/* Reach highlight */}
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-xl p-3 space-y-0.5"
          >
            <div className="text-[9px] font-black uppercase tracking-widest text-primary-500">{t('vendor_boost_reach')}</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              ~{(estimatedTotal * selectedCount).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">{t('vendor_boost_reach_desc', { type: promoteType === "views" ? t('vendor_boost_views') : t('vendor_boost_likes'), count: selectedCount })}</div>
          </motion.div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t('vendor_boost_total_cost')}</span>
            <span className="text-lg font-black text-yellow-500 flex items-center gap-1">
              ${totalCost.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-widest">{t('vendor_boost_balance')}</span>
            <span className={`font-black flex items-center gap-1 ${isInsufficient ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
              ${walletBalance.toFixed(2)}
            </span>
          </div>

          {isInsufficient && (
            <div className="bg-red-500/10 text-red-500 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
              {t('vendor_boost_insufficient')}
              <Link to="/profile" className="underline hover:text-red-600">{t('vendor_boost_topup')}</Link>
            </div>
          )}

          <motion.button
            whileHover={{ scale: isPromoting || isInsufficient || selectedCount === 0 ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPromoting || isInsufficient || selectedCount === 0}
            onClick={() => {
              handleBulkPromote();
              setShowMobileConfig(false);
            }}
            className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isPromoting ? (
              <><Loader2 size={14} className="animate-spin" /> {t('vendor_boost_boosting')}</>
            ) : (
              <><Zap size={14} /> {selectedCount > 0 ? t('vendor_boost_btn_count', { count: selectedCount }) : t('vendor_boost_btn')}</>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Title + Token Balance */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-yellow-500" size={24} />
            {t('vendor_boost_title')}
          </h2>
          <p className="text-xs text-slate-500">{t('vendor_boost_desc')}</p>
        </div>
        <div className="flex items-center gap-2 text-yellow-500 font-black text-xs bg-yellow-50 dark:bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/20">
          <Coins size={14} />
          ${walletBalance.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Product List */}
        <div className="xl:col-span-2 space-y-4">

          {/* Active Boosts Collapse */}
          {activeBoosts.length > 0 && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowActiveBoosts(v => !v)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-black text-xs uppercase tracking-widest">
                  <Zap size={14} />
                  {activeBoosts.length > 1 ? t('vendor_boost_active_pl', { count: activeBoosts.length }) : t('vendor_boost_active', { count: activeBoosts.length })}
                  <span className="font-normal text-yellow-500/60 normal-case tracking-normal">{t('vendor_boost_running')}</span>
                </div>
                {showActiveBoosts ? <ChevronUp size={16} className="text-yellow-500" /> : <ChevronDown size={16} className="text-yellow-500" />}
              </button>
              <AnimatePresence>
                {showActiveBoosts && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeBoosts.map((p: any) => (
                        <div key={p.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-yellow-500/10">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            <ImageWithFallback src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-[10px] text-yellow-500 font-bold flex items-center gap-1">
                              <Zap size={9} /> {t('vendor_boost_status', { type: p.promote_type === "views" ? t('vendor_boost_views') : t('vendor_boost_likes'), date: new Date(p.promoted_until).toLocaleDateString() })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Search + Select All */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={15} />
                <input
                  type="text"
                  placeholder={t('vendor_boost_search')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all border-none text-slate-900 dark:text-white"
                />
              </div>
              <button
                onClick={toggleSelectAll}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex-shrink-0 ${isAllSelected
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-500/50"
                  }`}
              >
                {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                {isAllSelected ? t('vendor_boost_deselect_all') : t('vendor_boost_select_all')}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>{boostableProducts.length} {t('vendor_boost_boostable')}</span>
              {selectedCount > 0 && (
                <span className="text-primary-500">{selectedCount} {t('vendor_boost_selected')}</span>
              )}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-primary-500" />
            </div>
          ) : boostableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <Package size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">{t('vendor_boost_no_products')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AnimatePresence>
                {boostableProducts.map((p: any, idx: number) => {
                  const isSelected = selectedIds.has(p.id);
                  const isBoosting = promotingIds.has(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => toggleSelect(p.id)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all select-none ${isSelected
                        ? "border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500/40"
                        }`}
                    >
                      {/* Checkbox */}
                      <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary-500 border-primary-500" : "border-slate-300 dark:border-slate-600"
                        }`}>
                        {isSelected && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            width="10" height="8" viewBox="0 0 10 8" fill="none"
                          >
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>

                      {/* Image */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        <ImageWithFallback
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.categories?.name || t('vendor_boost_general')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-primary-500">${Number(p.price).toLocaleString()}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-bold">
                            <Eye size={9} /> {p.view_count || 0}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-red-400 font-bold">
                            <Flame size={9} /> {p.like_count || 0}
                          </span>
                        </div>
                      </div>

                      {/* Boosting spinner */}
                      {isBoosting && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-primary-500" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT: Configuration Panel (Desktop) */}
        <div className="hidden xl:block">
          {renderConfigPanel()}
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('vendor_boost_total_cost')}</p>
          <p className="text-lg font-black text-yellow-500">${totalCost.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowMobileConfig(true)}
          className="px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white transition-all"
        >
          {t('vendor_boost_configure') || 'Configure'} ({selectedCount})
        </button>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      <AnimatePresence>
        {showMobileConfig && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileConfig(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[100] xl:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-slate-950 z-[101] xl:hidden rounded-t-[2rem] max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-10 rounded-t-[2rem]">
                <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap size={16} className="text-primary-500" />
                  {t('vendor_boost_configure') || 'Configuration'}
                </h3>
                <button
                  onClick={() => setShowMobileConfig(false)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              <div className="p-5 pb-8">
                {renderConfigPanel()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BulkBoost;
