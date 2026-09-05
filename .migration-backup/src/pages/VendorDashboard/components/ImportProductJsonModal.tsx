import React, { useCallback, useEffect, useState } from 'react';
// portal removed to avoid runtime hook-order issues
import { X, UploadCloud, AlertTriangle, Search, CheckSquare, Square, Layers, Image, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface ApiKeyStatus {
  id: string;
  remaining_requests: number;
  rate_limit: number;
  last_used_at: string | null;
}

function useApiQuotaStatus(show: boolean) {
  const [keys, setKeys] = useState<ApiKeyStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!show) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('api_keys')
        .select('id, remaining_requests, rate_limit, last_used_at')
        .eq('provider', 'unsplash')
        .eq('is_active', true);
      setKeys(data || []);
    } catch (e) {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    fetchKeys();
    const iv = setInterval(fetchKeys, 30000);
    return () => clearInterval(iv);
  }, [fetchKeys]);

  const totalRemaining = keys.reduce((acc, k) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isReset = !k.last_used_at || new Date(k.last_used_at) < oneHourAgo;
    return acc + (isReset ? (k.rate_limit || 50) : Math.max(0, k.remaining_requests ?? 50));
  }, 0);

  const totalLimit = keys.reduce((acc, k) => acc + (k.rate_limit || 50), 0);

  // Countdown: minutes until the EARLIEST reset among exhausted keys
  let cooldownMins: number | null = null;
  for (const k of keys) {
    if ((k.remaining_requests ?? 50) <= 0 && k.last_used_at) {
      const msPassed = Date.now() - new Date(k.last_used_at).getTime();
      if (msPassed < 60 * 60 * 1000) {
        const mins = Math.ceil((60 * 60 * 1000 - msPassed) / 60000);
        if (cooldownMins === null || mins < cooldownMins) cooldownMins = mins;
      }
    }
  }

  // Each product needs 7 images (1 API call of count=7)
  // const imagesPerProduct = 1; // 1 API call per product
  const maxProductsFromQuota = totalRemaining; // 1 quota = 1 product (count=7 uses 1 call)

  return { totalRemaining, totalLimit, cooldownMins, maxProductsFromQuota, loading };
}

interface ImportProductJsonModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  categories: any[];
  shopCats: string[];
  selectedCategoryIds: string[];
  setSelectedCategoryIds: (ids: string[]) => void;
  generateCount: number;
  setGenerateCount: (value: number) => void;
  generationErrors: string[];
  isGenerating: boolean;
  handleGenerate: () => Promise<void>;
  availableSlots: number;
}

const ImportProductJsonModal: React.FC<ImportProductJsonModalProps> = ({
  show,
  setShow,
  categories,
  shopCats,
  selectedCategoryIds,
  setSelectedCategoryIds,
  generateCount,
  setGenerateCount,
  generationErrors,
  isGenerating,
  handleGenerate,
  availableSlots
}) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!show || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShow(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setShow]);

  const { totalRemaining, totalLimit, cooldownMins } = useApiQuotaStatus(show);
  const { t } = useTranslation();

  const [categorySearch, setCategorySearch] = useState('');
  const [generateCountInput, setGenerateCountInput] = useState(String(generateCount));

  useEffect(() => {
    setGenerateCountInput(String(generateCount));
  }, [generateCount]);

  // Derived values (computed before early return so they're available in the clamp effect below)
  const totalToGenerate = selectedCategoryIds.length * generateCount;
  const maxPerCategory = Math.max(1, Math.floor(availableSlots / Math.max(1, selectedCategoryIds.length)));
  const isQuotaBlocked = totalRemaining === 0 && totalLimit > 0;
  const exceedsApiQuota = totalToGenerate > totalRemaining && totalLimit > 0;

  // ⚠️ This hook MUST stay above the early return to comply with React's Rules of Hooks
  useEffect(() => {
    if (generateCount > maxPerCategory) {
      setGenerateCount(maxPerCategory);
      setGenerateCountInput(String(maxPerCategory));
    }
  }, [generateCount, maxPerCategory]);

  if (!show || !isBrowser || typeof document === 'undefined') return null;

  const allUnlockedCategoryIds = categories
    .filter(cat => shopCats.includes(cat.id))
    .map(cat => cat.id);

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleCategory = (categoryId: string, locked: boolean) => {
    if (locked) return;
    setSelectedCategoryIds(
      selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter(id => id !== categoryId)
        : [...selectedCategoryIds, categoryId]
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShow(false);
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        style={{ maxHeight: 'min(90vh, 720px)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-500/20">
              <UploadCloud size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('vendor_import_title')}</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('vendor_import_subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── API QUOTA STATUS BANNER ── */}
        {totalLimit > 0 && (
          <div className={`px-6 py-3 flex items-center gap-3 border-b flex-shrink-0 ${isQuotaBlocked
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40'
            : exceedsApiQuota
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/40'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/40'
            }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isQuotaBlocked ? 'bg-red-100 dark:bg-red-900/40' :
              exceedsApiQuota ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'
              }`}>
              {isQuotaBlocked
                ? <Clock size={15} className="text-red-500" />
                : exceedsApiQuota
                  ? <AlertTriangle size={15} className="text-amber-500" />
                  : <Image size={15} className="text-emerald-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-widest ${isQuotaBlocked ? 'text-red-600 dark:text-red-400' :
                exceedsApiQuota ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                {isQuotaBlocked ? t('vendor_import_api_cooldown') : exceedsApiQuota ? t('vendor_import_api_exceeds') : t('vendor_import_api_ready')}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isQuotaBlocked
                  ? cooldownMins
                    ? t('vendor_import_api_exhausted', { mins: cooldownMins })
                    : t('vendor_import_api_wait')
                  : t('vendor_import_api_can_import', { count: totalRemaining, remaining: totalRemaining, total: totalLimit })}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className={`text-lg font-black tabular-nums ${isQuotaBlocked ? 'text-red-500' : exceedsApiQuota ? 'text-amber-500' : 'text-emerald-500'
                }`}>{totalRemaining}</span>
              <span className="text-[9px] font-bold text-slate-400 block">/ {totalLimit}</span>
            </div>
          </div>
        )}

        {/* ── PINNED: Products Per Category input (always visible) ── */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-end gap-5">
            {/* Input */}
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                {t('vendor_import_per_category')}
              </label>
              <input
                type="number"
                min={1}
                max={maxPerCategory}
                value={generateCountInput}
                onChange={e => {
                  const nextValue = e.target.value;
                  setGenerateCountInput(nextValue);
                  if (nextValue === '') {
                    return;
                  }
                  const parsed = Number(nextValue);
                  if (Number.isNaN(parsed)) {
                    return;
                  }
                  if (parsed <= 0) {
                    setGenerateCount(1);
                    return;
                  }
                  const clamped = Math.min(parsed, Math.max(1, maxPerCategory));
                  setGenerateCount(clamped);
                }}
                onBlur={() => {
                  if (generateCountInput === '') {
                    setGenerateCount(1);
                    setGenerateCountInput('1');
                    return;
                  }
                  const parsed = Number(generateCountInput);
                  if (Number.isNaN(parsed) || parsed < 1) {
                    setGenerateCount(1);
                    setGenerateCountInput('1');
                    return;
                  }
                  const clamped = Math.min(parsed, Math.max(1, maxPerCategory));
                  setGenerateCount(clamped);
                  setGenerateCountInput(String(clamped));
                }}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-0 transition-all"
              />
            </div>

            {/* Total */}
            <div className="text-right flex-shrink-0 pb-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{t('vendor_import_total')}</p>
              <p className="text-2xl font-black leading-none text-slate-900 dark:text-white">
                {totalToGenerate}
                <span className="text-xs font-bold text-slate-400 ml-1">{t('vendor_items')}</span>
              </p>
            </div>

            {/* Quota */}
            <div className="text-right flex-shrink-0 pb-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{t('vendor_import_quota_left')}</p>
              <p className={`text-2xl font-black leading-none ${availableSlots <= 0 ? 'text-red-500' : totalToGenerate > availableSlots ? 'text-amber-500' : 'text-primary-500'}`}>
                {availableSlots}
                <span className="text-xs font-bold text-slate-400 ml-1">{t('vendor_slots')}</span>
              </p>
            </div>
          </div>

          {/* Overflow warning */}
          {totalToGenerate > availableSlots && totalToGenerate > 0 && (
            <p className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              {t('vendor_import_quota_exceeded')}
            </p>
          )}
        </div>

        {/* ── SCROLLABLE: Category selector ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">

          {/* Search + header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Layers size={14} className="text-primary-500" />
              {t('vendor_import_select_cats')}
              {selectedCategoryIds.length > 0 && (
                <span className="ml-1 bg-primary-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {selectedCategoryIds.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategoryIds(selectedCategoryIds.length > 0 ? [] : allUnlockedCategoryIds)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {selectedCategoryIds.length > 0
                ? <CheckSquare size={13} className="text-primary-500" />
                : <Square size={13} className="text-slate-400" />}
              {selectedCategoryIds.length > 0 ? t('vendor_import_deselect_all') : t('vendor_import_select_all')}
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              placeholder={t('vendor_import_search_cats')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Category list */}
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-sm text-slate-400 text-center font-medium">
              {t('vendor_import_no_cats')}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-sm text-slate-400 text-center font-medium">
              {t('vendor_import_no_match')}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredCategories.map(category => {
                const locked = !shopCats.includes(category.id);
                const selected = selectedCategoryIds.includes(category.id);
                return (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id, locked)}
                    className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${locked
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-55 cursor-not-allowed'
                      : selected
                        ? 'bg-primary-50/60 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/30 cursor-pointer'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-slate-500 cursor-pointer'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={locked}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 pointer-events-none flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">{category.name}</h4>
                        {locked && (
                          <span className="shrink-0 text-[8px] uppercase tracking-wider font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {t('vendor_import_locked')}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER: Errors + Action buttons ── */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/80 px-6 py-4 flex-shrink-0">
          {generationErrors.length > 0 && (
            <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-500/10 p-3">
              <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 mb-1.5 text-xs">
                <AlertTriangle size={13} /> {t('vendor_import_errors')}
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-red-600 dark:text-red-300/80">
                {generationErrors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="w-28 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || selectedCategoryIds.length === 0 || generateCount < 1 || totalToGenerate > availableSlots || isQuotaBlocked || exceedsApiQuota}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('vendor_import_starting')}
                </>
              ) : isQuotaBlocked ? (
                <>
                  <Clock size={16} />
                  {cooldownMins ? t('vendor_import_cooldown_btn', { mins: cooldownMins }) : t('vendor_import_cooldown_wait')}
                </>
              ) : exceedsApiQuota ? (
                <>
                  <AlertTriangle size={16} />
                  {t('vendor_import_reduce_to', { count: totalRemaining })}
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  {selectedCategoryIds.length > 0
                    ? t('vendor_import_btn', { count: totalToGenerate })
                    : t('vendor_import_select_first')}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImportProductJsonModal;
