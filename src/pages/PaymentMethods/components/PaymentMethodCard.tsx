import { useState } from 'react';
import { Trash2, AlertTriangle, X, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentMethodCardProps {
  id?: string;
  isDefault?: boolean;
  type: 'cod' | 'card';
  cardDetails?: {
    brand: string;
    last4: string;
    name: string;
  };
  onDelete?: (id: string) => Promise<void>;
}

const BRAND_GRADIENTS: Record<string, string> = {
  'visa': 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
  'mastercard': 'from-[#1a0a00] via-[#2d1600] to-[#1a0a00]',
  'amex': 'from-[#003366] via-[#004080] to-[#002244]',
  'default': 'from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',
};

const getBrandGradient = (brand: string) => {
  const key = brand?.toLowerCase();
  return BRAND_GRADIENTS[key] || BRAND_GRADIENTS['default'];
};

const BrandLogo = ({ brand }: { brand: string }) => {
  const b = brand?.toLowerCase();
  if (b === 'visa') return (
    <span className="font-black text-white text-2xl italic tracking-tight" style={{ fontFamily: 'serif', letterSpacing: '-0.04em' }}>
      VISA
    </span>
  );
  if (b === 'mastercard') return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
      <div className="w-8 h-8 rounded-full bg-orange-400 opacity-90 -ml-4" />
    </div>
  );
  if (b === 'amex') return (
    <span className="font-black text-white text-xs tracking-[0.25em] uppercase">AMEX</span>
  );
  return (
    <span className="font-black text-white/80 text-xs tracking-[0.2em] uppercase">{brand}</span>
  );
};

export const PaymentMethodCard = ({ id, isDefault = false, type, cardDetails, onDelete }: PaymentMethodCardProps) => {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  // COD card — simple flat design
  if (type === 'cod') {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex items-center gap-5 shadow-lg shadow-primary-500/5">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
          💵
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{t('cod')}</h3>
          <p className="text-[10px] font-black text-primary-500 mt-0.5 uppercase tracking-[0.2em]">Pay when you receive</p>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Cash on delivery. No card required.</p>
        </div>
        {isDefault && (
          <span className="text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-full border border-primary-500/30">
            Default
          </span>
        )}
      </div>
    );
  }

  // Credit card — premium physical card design
  const gradient = getBrandGradient(cardDetails?.brand || '');

  return (
    <div className="w-full group relative">
      {/* The physical card */}
      <div className={`relative w-full rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden shadow-2xl`}
        style={{ aspectRatio: '1.586 / 1' }}>

        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-4 -right-6 w-32 h-32 rounded-full bg-white/5" />

        {/* Default badge */}
        {isDefault && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full border border-white/20">
              ✦ Default
            </span>
          </div>
        )}

        {/* Delete controls */}
        {onDelete && (
          <div className="absolute top-4 right-4 z-10">
            {confirmDelete ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/40"
                >
                  <AlertTriangle size={10} strokeWidth={3} />
                  {isDeleting ? '...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                  className="p-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/50 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                title="Remove card"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        {/* Card content */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between">
          {/* Top row: chip + brand */}
          <div className="flex items-start justify-between">
            {/* EMV Chip */}
            <div className="lg:w-16 md:w-14 w-10 lg:h-14 md:h-12 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-inner flex items-center justify-center overflow-hidden">
              <div className="w-full h-full grid grid-cols-3 gap-[1px] p-[3px]">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-yellow-600/40 rounded-[1px]" />
                ))}
              </div>
            </div>
            {/* NFC + Brand */}
            <div className="flex items-center gap-2">
              <Wifi size="14" className="text-white/40 rotate-90" />
              <BrandLogo brand={cardDetails?.brand || ''} />
            </div>
          </div>

          {/* Card number dots */}
          <div className="flex items-center gap-3 sm:gap-4">
            {[0, 1, 2].map(g => (
              <div key={g} className="flex items-center gap-1">
                {[0, 1, 2, 3].map(d => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/60" />
                ))}
              </div>
            ))}
            <span className="text-white font-mono text-base sm:text-lg font-bold tracking-[0.25em]">
              {cardDetails?.last4}
            </span>
          </div>

          {/* Bottom row: cardholder + expiry placeholder */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] mb-0.5">Cardholder</p>
              <p className="text-white font-bold text-xs sm:text-sm uppercase tracking-widest truncate max-w-[140px]">
                {cardDetails?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] mb-0.5">Expires</p>
              <p className="text-white font-mono text-xs tracking-widest">••/••</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
