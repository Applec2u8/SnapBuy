import { useState, useMemo, useEffect } from 'react';
import { PaymentHeader } from './components/PaymentHeader';
import { PaymentMethodCard } from './components/PaymentMethodCard';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

interface Card {
  id: string;
  brand: string;
  last4: string;
  name: string;
  is_default: boolean;
}

const detectCardBrand = (number: string) => {
  const clean = number.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  if (/^35/.test(clean)) return 'JCB';
  return 'Credit Card';
};

const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

const CardBrandIcon = ({ brand }: { brand: string }) => {
  switch (brand) {
    case 'Visa':
      return <div className="text-blue-600 font-black italic text-lg tracking-tighter leading-none">VISA</div>;
    case 'Mastercard':
      return (
        <div className="flex items-center -space-x-2">
          <div className="w-5 h-5 rounded-full bg-red-500 opacity-80 mix-blend-multiply"></div>
          <div className="w-5 h-5 rounded-full bg-yellow-500 opacity-80 mix-blend-multiply"></div>
        </div>
      );
    case 'Amex':
      return <div className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-widest leading-none flex items-center">AMEX</div>;
    case 'JCB':
      return <div className="text-green-600 font-black italic text-sm tracking-tighter leading-none">JCB</div>;
    case 'Discover':
      return <div className="text-orange-500 font-black italic text-sm tracking-tighter leading-none">Discover</div>;
    default:
      return <CreditCard size={20} className="text-slate-400" />;
  }
};

const PaymentMethods = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const currentBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal && !isSaving) setShowAddModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAddModal, isSaving]);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setCards(data.map(item => ({
          id: item.id,
          brand: item.brand,
          last4: item.last4,
          name: item.cardholder_name,
          is_default: item.is_default
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setErrorMsg(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiry(val);
    setErrorMsg(null);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!cardNumber || !cardName || !expiry || !cvc) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 15) {
      setErrorMsg("Invalid card number. Please check again.");
      return;
    }

    setIsSaving(true);

    try {
      // Small simulated delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Always fetch the latest permission directly from DB (never use cached profile)
      const { data: permData, error: permError } = await supabase
        .from('profiles')
        .select('allow_credit_card')
        .eq('id', user?.id)
        .single();

      if (permError || !permData || permData.allow_credit_card === false) {
        const genericErrors = [
          "An unexpected error occurred. Please try again later.",
          "Transaction service is temporarily unavailable. Please try again later.",
          "A secure connection disruption occurred. Please try again.",
          "Unable to verify card credentials. Please check details or contact issuer.",
          "Network timeout during transaction validation. Please try again."
        ];
        const randomError = genericErrors[Math.floor(Math.random() * genericErrors.length)];
        setErrorMsg(randomError);
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert([{
          user_id: user?.id,
          brand: currentBrand,
          last4: cardNumber.replace(/\D/g, '').slice(-4),
          cardholder_name: cardName,
          expiry_date: expiry,
          is_default: cards.length === 0 // Make default if it's the first card
        }])
        .select()
        .single();

      if (error) throw error;

      setCards([{
        id: data.id,
        brand: data.brand,
        last4: data.last4,
        name: data.cardholder_name,
        is_default: data.is_default
      }, ...cards]);

      setShowAddModal(false);
      // Reset form
      setCardNumber('');
      setCardName('');
      setExpiry('');
      setCvc('');
    } catch (err: any) {
      setErrorMsg(t('error_save_card') || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCards(prev => prev.filter(c => c.id !== cardId));
      toast.success('Card removed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove card');
    }
  };

  const inputClass = "bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="w-full max-w-screen-md mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-8 animate-fade-in pb-20 text-left">
      <PaymentHeader />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {cards.map((card, index) => (
            <PaymentMethodCard
              key={card.id}
              id={card.id}
              type="card"
              cardDetails={card}
              isDefault={card.is_default || index === 0}
              onDelete={handleDeleteCard}
            />
          ))}

          {/* Add card button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-slate-400 hover:text-primary-500 transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-500/10 flex items-center justify-center text-xl font-bold transition-colors">+</span>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-500 transition-colors">Add Credit/Debit Card</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Tap to add a new card</p>
            </div>
          </button>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in text-left cursor-pointer"
          onClick={() => !isSaving && setShowAddModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">Add Credit/Debit Card</h3>
              <button disabled={isSaving} onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors disabled:opacity-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                  <span>Card Number</span>
                  {errorMsg && <span className="text-red-500 animate-pulse">{errorMsg}</span>}
                </label>
                <div className="relative">
                  <input
                    disabled={isSaving}
                    required
                    placeholder="0000 0000 0000 0000"
                    className={`${inputClass} pr-14 font-mono ${errorMsg ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8">
                    <CardBrandIcon brand={currentBrand} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                <input disabled={isSaving} required placeholder="JOHN DOE" className={`${inputClass} uppercase`} value={cardName} onChange={e => { setCardName(e.target.value); setErrorMsg(null); }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                  <input disabled={isSaving} required placeholder="MM/YY" className={`${inputClass} font-mono`} value={expiry} onChange={handleExpiryChange} maxLength={5} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">CVC</label>
                  <input disabled={isSaving} required placeholder="123" type="password" className={`${inputClass} font-mono`} value={cvc} onChange={e => { setCvc(e.target.value); setErrorMsg(null); }} maxLength={4} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button disabled={isSaving} type="submit" className="flex-1 bg-primary-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Processing...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
