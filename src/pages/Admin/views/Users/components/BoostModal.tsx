import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Zap, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { BoostConfig, BoostOptions } from './types';

interface BoostModalProps {
  boostOptions: BoostOptions;
  setBoostOptions: (opts: BoostOptions) => void;
  pendingBoostConfig: BoostConfig;
  pendingLikeBoostConfig: BoostConfig;
  userProductsCount: number;
  isSavingBoost: boolean;
  boostProgress: { current: number; total: number } | null;
  onClose: () => void;
  onExecute: () => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({
  boostOptions,
  setBoostOptions,
  pendingBoostConfig,
  pendingLikeBoostConfig,
  userProductsCount,
  isSavingBoost,
  boostProgress,
  onClose,
  onExecute,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSavingBoost) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSavingBoost, onClose]);

  const effectLabel = () => {
    if (boostOptions.type === 'views') return `+${pendingBoostConfig.amount} Views`;
    if (boostOptions.type === 'likes') return `+${pendingLikeBoostConfig.amount} Likes`;
    return `+${pendingBoostConfig.amount} Views / +${pendingLikeBoostConfig.amount} Likes`;
  };

  const pct = boostProgress
    ? Math.round((boostProgress.current / boostProgress.total) * 100)
    : 0;
  const isDone = boostProgress !== null && boostProgress.current >= boostProgress.total;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start sm:items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 z-10 mx-4 my-4 sm:mx-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/20">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl">
                  {t('admin_boost_now')}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {t('admin_advanced_config')}
                </p>
              </div>
            </div>
            {!isSavingBoost && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* ── PROGRESS STATE ── */}
            {boostProgress ? (
              <div className="space-y-6">
                {/* Status icon */}
                <div className="flex flex-col items-center gap-4 py-2">
                  {isDone ? (
                    <div className="p-4 bg-green-500/10 rounded-full">
                      <CheckCircle size={36} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="relative w-16 h-16">
                      <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={18} className="text-primary-500" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {isDone ? '100%' : `${pct}%`}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {isDone ? 'Boost Complete!' : 'Boosting in progress...'}
                    </p>
                    <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary-500/10 rounded-full border border-primary-500/20">
                      <Zap size={12} className="text-primary-500" fill="currentColor" />
                      <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                        {effectLabel()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {isDone ? 'All Done' : 'Progress'}
                    </span>
                    <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">
                      {boostProgress.current} / {boostProgress.total} products
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-out ${isDone ? 'bg-green-500' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Batch detail */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {isDone ? (
                      <span className="text-green-500 font-black">✓ Successfully boosted {boostProgress.total} products with {effectLabel()}</span>
                    ) : (
                      <>
                        Applying <span className="text-primary-500 font-black">{effectLabel()}</span> to <span className="text-slate-900 dark:text-white font-black">{boostProgress.current}</span> of{' '}
                        <span className="text-primary-500 font-black">{boostProgress.total}</span> products
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Boost Type */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Boost Type
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['views', 'likes', 'both'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBoostOptions({ ...boostOptions, type })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          boostOptions.type === type
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {type === 'views' ? 'Views only' : type === 'likes' ? 'Likes only' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Percentage Selection */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>{t('admin_selection_range')}</span>
                    <span className="text-primary-500 font-black">
                      {boostOptions.percentage}% of {t('admin_products')}
                    </span>
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setBoostOptions({ ...boostOptions, percentage: pct })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          boostOptions.percentage === pct
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {t('admin_selection_logic')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { mode: 'random', icon: TrendingUp, label: 'admin_randomly', sub: 'admin_surprise_selection' },
                      { mode: 'ordered', icon: Clock, label: 'admin_in_order', sub: 'admin_by_newest_first' },
                    ] as const).map(({ mode, icon: Icon, label, sub }) => (
                      <button
                        key={mode}
                        onClick={() => setBoostOptions({ ...boostOptions, mode })}
                        type="button"
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                          boostOptions.mode === mode
                            ? 'border-primary-500 bg-primary-500/5'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50'
                        }`}
                      >
                        <Icon size={18} className={boostOptions.mode === mode ? 'text-primary-500' : 'text-slate-400'} />
                        <div className="text-left">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${boostOptions.mode === mode ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            {t(label)}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {t(sub)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Package size={14} className="text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {t('admin_effect')}:{' '}
                      <span className="text-slate-900 dark:text-white">{effectLabel()}</span>
                      {' '}to{' '}
                      <span className="text-primary-500 font-black">
                        {Math.ceil((userProductsCount * boostOptions.percentage) / 100)} {t('admin_products')}
                      </span>
                      {' '}
                      <span className="text-slate-400">
                        (of {userProductsCount} total)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={onExecute}
                    disabled={isSavingBoost}
                    className="flex-[2] py-4 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
                  >
                    <Zap size={14} fill="currentColor" /> Confirm Boost
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


