import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Heart, ChevronDown, Zap, Save } from 'lucide-react';
import type { BoostConfig } from './types';
import { FREQUENCY_OPTIONS } from './types';

interface AutoBoostCardProps {
  pendingBoostConfig: BoostConfig;
  setPendingBoostConfig: (config: BoostConfig) => void;
  pendingLikeBoostConfig: BoostConfig;
  setPendingLikeBoostConfig: (config: BoostConfig) => void;
  isAnyBoostDirty: boolean;
  isSavingBoost: boolean;
  hasProducts: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onOpenBoostModal: () => void;
}

export const AutoBoostCard: React.FC<AutoBoostCardProps> = ({
  pendingBoostConfig,
  setPendingBoostConfig,
  pendingLikeBoostConfig,
  setPendingLikeBoostConfig,
  isAnyBoostDirty,
  isSavingBoost,
  hasProducts,
  onSave,
  onDiscard,
  onOpenBoostModal,
}) => {
  const { t } = useTranslation();

  const FrequencySelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pr-8 text-[10px] font-bold outline-none appearance-none focus:border-primary-500"
      >
        {FREQUENCY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label ?? (opt.labelKey ? t(opt.labelKey) : opt.value)}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-[4rem]" />

      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 sm:mb-6 flex items-center gap-3 relative">
        <Zap size={20} className="text-primary-500" />
        {t('admin_automation_boosts')}
      </h4>

      <div className="space-y-6 relative">
        {/* ── VIEW BOOST ── */}
        <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${pendingBoostConfig.isEnabled ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                <Eye size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t('admin_auto_view_boost')}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('admin_global_increase')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPendingBoostConfig({ ...pendingBoostConfig, isEnabled: !pendingBoostConfig.isEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${pendingBoostConfig.isEnabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pendingBoostConfig.isEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">
                {t('admin_boost_amount')}
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={pendingBoostConfig.amount}
                  onChange={(e) => setPendingBoostConfig({ ...pendingBoostConfig, amount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400 uppercase">
                  Views
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">
                {t('admin_frequency')}
              </p>
              <FrequencySelect
                value={pendingBoostConfig.frequency}
                onChange={(val) => setPendingBoostConfig({ ...pendingBoostConfig, frequency: val })}
              />
            </div>
          </div>
        </div>

        {/* ── LIKE BOOST ── */}
        <div className="space-y-4 pb-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${pendingLikeBoostConfig.isEnabled ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                <Heart size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Auto Like Boost
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('admin_global_increase')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPendingLikeBoostConfig({ ...pendingLikeBoostConfig, isEnabled: !pendingLikeBoostConfig.isEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${pendingLikeBoostConfig.isEnabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pendingLikeBoostConfig.isEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">
                {t('admin_boost_amount')}
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={pendingLikeBoostConfig.amount}
                  onChange={(e) => setPendingLikeBoostConfig({ ...pendingLikeBoostConfig, amount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400 uppercase">
                  Likes
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">
                {t('admin_frequency')}
              </p>
              <FrequencySelect
                value={pendingLikeBoostConfig.frequency}
                onChange={(val) => setPendingLikeBoostConfig({ ...pendingLikeBoostConfig, frequency: val })}
              />
            </div>
          </div>
        </div>

        {/* ── Unsaved Changes Banner ── */}
        
          {isAnyBoostDirty && (
            <div
              className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl transition-all"
            >
              <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Unsaved Changes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDiscard}
                  disabled={isSavingBoost}
                  className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  onClick={onSave}
                  disabled={isSavingBoost}
                  className="px-4 py-1.5 bg-primary-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  <Save size={10} />
                  {isSavingBoost ? '...' : 'Save'}
                </button>
              </div>
            </div>
          )}

        {/* ── BOOST ALL NOW ── */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onOpenBoostModal}
            disabled={isSavingBoost || !hasProducts}
            className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 border border-primary-400/50"
          >
            <Zap size={14} fill="currentColor" /> {t('admin_boost_all_now')}
          </button>
        </div>
      </div>
    </div>
  );
};
