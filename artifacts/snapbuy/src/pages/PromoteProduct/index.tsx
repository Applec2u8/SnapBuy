import { ArrowLeft, TrendingUp, Clock, Zap, Target, Loader2, Coins, Eye, Menu, Flame, Activity } from 'lucide-react';
import { usePromoteProduct, PACKAGE_CONFIG, type DurationKey } from './hooks/usePromoteProduct';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { Link } from 'react-router-dom';
import VendorSidebar from '../VendorDashboard/components/VendorSidebar';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PromoteProduct = () => {
  const { t } = useTranslation();
  const {
    product,
    loading,
    promoteType,
    setPromoteType,
    duration,
    setDuration,
    isPromoting,
    getCost,
    getBoostPerMin,
    getEstimatedTotal,
    handleConfirm,
    walletBalance,
    navigate,
    isSidebarOpen,
    setIsSidebarOpen
  } = usePromoteProduct();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-black/20">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!product) return null;

  const cost = getCost();
  const boostRate = getBoostPerMin();
  const estimatedTotal = getEstimatedTotal();
  const isInsufficient = walletBalance < cost;

  return (
    <div className="h-screen overflow-hidden bg-background dark:bg-black/20 flex text-left">
      <VendorSidebar
        shop={product.shops}
        activeTab="inventory"
        setActiveTab={(tab) => navigate(`/vendor/dashboard#${tab}`)}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <motion.h1
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-sm sm:text-lg font-black uppercase tracking-tight"
            >
              {t('vendor_boost_tools')}
            </motion.h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            {/* Back + Title */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate('/vendor/dashboard')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
              >
                <ArrowLeft className="text-slate-500" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-yellow-500" /> {t('vendor_boost_promote')}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  {t('vendor_boost_auto_desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left: Config */}
              <div className="lg:col-span-2 space-y-6">

                {/* Product Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex-shrink-0">
                    <ImageWithFallback
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1">{t('vendor_boost_target_product')}</div>
                    <h2 className="font-bold text-slate-900 dark:text-white truncate">{product.name}</h2>
                    <p className="text-xs text-slate-500 truncate">{product.shops?.name}</p>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-1">${product.price?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Step 1: Objective */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                    <Target size={14} className="text-primary-500" /> {t('vendor_boost_objective')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(['views', 'likes'] as const).map((type) => (
                      <label
                        key={type}
                        onClick={() => setPromoteType(type)}
                        className={`flex flex-col gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${promoteType === type ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/40'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${promoteType === type ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              {type === 'views' ? <Eye size={18} /> : <Flame size={18} />}
                            </div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                              {t('vendor_boost_boost_type', { type: type === 'views' ? t('vendor_boost_views') : t('vendor_boost_likes') })}
                            </span>
                          </div>
                          <div className={`w-4 h-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${promoteType === type ? 'border-primary-500' : 'border-slate-300'}`}>
                            {promoteType === type && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {type === 'views'
                            ? t('vendor_boost_views_desc')
                            : t('vendor_boost_likes_desc')}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 2: Duration with Estimated Reach */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock size={14} className="text-primary-500" /> {t('vendor_boost_package')}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.entries(PACKAGE_CONFIG) as [DurationKey, typeof PACKAGE_CONFIG[DurationKey]][]).map(([key, cfg]) => {
                      const total = cfg.boostPerMin * cfg.minutes;
                      const selected = duration === key;
                      return (
                        <label
                          key={key}
                          onClick={() => setDuration(key)}
                          className={`relative flex flex-col gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selected ? 'border-yellow-500 bg-yellow-500/5 shadow-md shadow-yellow-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-yellow-500/40'}`}
                        >
                          {'highlight' in cfg && cfg.highlight && (
                            <div className="absolute -top-2.5 right-4 bg-yellow-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                              {t('vendor_boost_popular')}
                            </div>
                          )}

                          {/* Header row */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-black text-sm text-slate-900 dark:text-white">{cfg.label}</div>
                              <div className="text-[10px] font-bold uppercase text-slate-400">{cfg.desc}</div>
                            </div>
                            <div className={`w-4 h-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${selected ? 'border-yellow-500' : 'border-slate-300'}`}>
                              {selected && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                            </div>
                          </div>

                          {/* Boost rate */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-500">
                            <Activity size={12} />
                            +{cfg.boostPerMin} {promoteType === 'views' ? t('vendor_boost_views') : t('vendor_boost_likes')}/{t('vendor_boost_per_min')}
                          </div>

                          {/* Estimated total */}
                          <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${selected ? 'bg-yellow-500/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('vendor_boost_est_total')}</span>
                            <span className={`text-sm font-black ${selected ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              ~{total.toLocaleString()} {promoteType === 'views' ? t('vendor_boost_views') : t('vendor_boost_likes')}
                            </span>
                          </div>

                          {/* Token cost */}
                          <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500">
                            <Coins size={10} />
                            ${cfg.cost}/{t('vendor_boost_per_product')}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-200 dark:border-slate-800 sticky top-4 space-y-5">
                  <h3 className="text-base font-black uppercase tracking-tighter text-slate-900 dark:text-white">{t('vendor_boost_order_summary')}</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t('vendor_boost_obj_label')}</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize">{t('vendor_boost_boost_type', { type: promoteType === 'views' ? t('vendor_boost_views') : t('vendor_boost_likes') })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t('vendor_boost_duration')}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{PACKAGE_CONFIG[duration].label}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t('vendor_boost_rate')}</span>
                      <span className="font-bold text-primary-500 flex items-center gap-1">
                        <Activity size={12} /> +{boostRate}/{t('vendor_boost_per_min')}
                      </span>
                    </div>
                  </div>

                  {/* Estimated reach highlight box */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-4 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400">{t('vendor_boost_reach')}</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      ~{estimatedTotal.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('vendor_boost_reach_desc2', { type: promoteType === 'views' ? t('vendor_boost_views') : t('vendor_boost_likes'), duration: PACKAGE_CONFIG[duration].label })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-bold text-slate-500">{t('vendor_boost_total_cost')}</span>
                      <span className="text-lg font-black text-yellow-500 flex items-center gap-1">
                        ${cost.toFixed(2)}
                      </span>
                    </div>

                    {/* Wallet Balance Info */}
                    <div className="flex justify-between items-center text-xs pb-2">
                      <span className="text-slate-500">{t('vendor_boost_wallet')}</span>
                      <span className={isInsufficient ? "text-red-500 font-bold" : "text-slate-900 dark:text-white font-bold"}>
                        ${walletBalance.toFixed(2)}
                      </span>
                    </div>

                    {isInsufficient && (
                      <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-xs font-bold flex items-center justify-between">
                        {t('vendor_boost_insufficient')}
                        <Link to="/profile" className="underline hover:text-red-600">{t('vendor_boost_topup')}</Link>
                      </div>
                    )}

                    <button
                      disabled={isPromoting || isInsufficient}
                      onClick={handleConfirm}
                      className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {isPromoting ? (
                        <><Loader2 size={16} className="animate-spin" /> {t('vendor_boost_processing')}</>
                      ) : (
                        <><Zap size={16} /> {t('vendor_boost_confirm')}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PromoteProduct;
