import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye, Heart, MessageCircle, Edit3, Save, X,
  ExternalLink, Zap, Check, Calendar,
} from 'lucide-react';
import type { ProductRecord, EditForm } from './types';

interface ProductCardProps {
  product: ProductRecord;
  // Editing
  isEditing: boolean;
  editForm: EditForm;
  onStartEditing: () => void;
  onSaveProduct: () => void;
  onCancelEditing: () => void;
  onEditFormChange: (form: EditForm) => void;
  // Quick boost
  isQuickBoostOpen: boolean;
  quickBoostValue: number;
  quickBoostLikesValue: number;
  isSavingBoost: boolean;
  onOpenQuickBoost: () => void;
  onConfirmQuickBoost: () => void;
  onCancelQuickBoost: () => void;
  onQuickBoostViewChange: (val: number) => void;
  onQuickBoostLikeChange: (val: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isEditing,
  editForm,
  onStartEditing,
  onSaveProduct,
  onCancelEditing,
  onEditFormChange,
  isQuickBoostOpen,
  quickBoostValue,
  quickBoostLikesValue,
  isSavingBoost,
  onOpenQuickBoost,
  onConfirmQuickBoost,
  onCancelQuickBoost,
  onQuickBoostViewChange,
  onQuickBoostLikeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`p-4 rounded-3xl border transition-all group relative flex flex-col justify-between ${isEditing
        ? 'border-primary-500 bg-primary-500/5'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700'
        }`}
    >
      {/* ── Top: Image + Info ── */}
      <div>
        <div className="flex gap-4 mb-4">
          <a
            href={`/product/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 border border-slate-200 dark:border-slate-800 block cursor-pointer"
          >
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/150'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt=""
            />
          </a>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] mb-0.5">
              {product.shops?.name || 'Shop'}
            </p>
            <h5 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-2 line-clamp-2">
              {product.name}
            </h5>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1">
                <span className="text-slate-500 text-xs">$</span>
                {new Intl.NumberFormat().format(product.price || 0)}
              </p>
              {product.is_published ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-widest">{t('admin_published')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-400/10 text-slate-400 rounded-full border border-slate-300/30 dark:border-slate-700/50">
                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Unpublished</span>
                </div>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-slate-400">
              <Calendar size={10} />
              <span className="text-[8px] font-bold uppercase tracking-widest">
                {new Date(product.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats + Actions ── */}
        <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
          {/* Stat counters */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4">
            <div className="flex items-center gap-1.5">
              <Eye size={12} className={product.view_count ? 'text-primary-500' : ''} />
              <span className={`text-[10px] sm:text-xs font-black uppercase ${product.view_count ? 'text-slate-900 dark:text-white' : ''}`}>
                {new Intl.NumberFormat('en-US').format(product.view_count || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={12} className={product.like_count ? 'text-red-500' : ''} />
              <span className={`text-xs font-black uppercase ${product.like_count ? 'text-slate-900 dark:text-white' : ''}`}>
                {new Intl.NumberFormat('en-US').format(product.like_count || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={12} className={product.comment_count ? 'text-blue-500' : ''} />
              <span className={`text-xs font-black uppercase ${product.comment_count ? 'text-slate-900 dark:text-white' : ''}`}>
                {new Intl.NumberFormat('en-US').format(product.comment_count || 0)}
              </span>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/50">
            {isEditing ? (
              /* ── Edit mode ── */
              <div className="flex flex-col gap-3 w-full animate-in zoom-in-95 duration-200">
                <div className="grid grid-cols-3 gap-2">
                  {(['view_count', 'like_count', 'comment_count'] as const).map((field, i) => (
                    <div key={field} className="space-y-1">
                      <p className="text-[7px] font-black text-slate-400 uppercase">
                        {['Views', 'Likes', 'Comments'][i]}
                      </p>
                      <input
                        type="number"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={editForm[field]}
                        onChange={(e) => onEditFormChange({ ...editForm, [field]: parseInt(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onSaveProduct}
                    className="flex-1 py-2 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <Save size={12} /> {t('admin_save')}
                  </button>
                  <button
                    onClick={onCancelEditing}
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <>
                <button
                  onClick={onStartEditing}
                  className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 rounded-xl transition-all group/btn"
                  title={t('admin_edit_values')}
                >
                  <Edit3 size={18} className="group-hover/btn:scale-110 transition-transform" />
                </button>

                <a
                  href={`/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 rounded-xl transition-all group/btn"
                  title={t('admin_view_post')}
                >
                  <ExternalLink size={18} className="group-hover/btn:scale-110 transition-transform" />
                </a>

                {isQuickBoostOpen ? (
                  /* Quick boost inline */
                  <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-primary-500/10">
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <Eye size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input
                          type="number"
                          className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5 pl-5 pr-1 text-[9px] font-black text-slate-900 dark:text-white outline-none"
                          value={quickBoostValue}
                          onChange={(e) => onQuickBoostViewChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="relative">
                        <Heart size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500" />
                        <input
                          type="number"
                          className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5 pl-5 pr-1 text-[9px] font-black text-slate-900 dark:text-white outline-none"
                          value={quickBoostLikesValue}
                          onChange={(e) => onQuickBoostLikeChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={onConfirmQuickBoost}
                        disabled={isSavingBoost}
                        className="p-1 bg-primary-500 text-white rounded hover:scale-110 transition-all shadow shadow-primary-500/20"
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                      <button
                        onClick={onCancelQuickBoost}
                        className="p-1 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded hover:text-red-500 transition-all"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onOpenQuickBoost}
                    className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 rounded-xl transition-all group/btn"
                    title={t('admin_quick_boost')}
                  >
                    <Zap size={18} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
