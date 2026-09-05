import { useState, useMemo, useEffect } from 'react';
import { CreditCard, Plus, X, Loader2, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { CheckCircle2 } from 'lucide-react';

interface Card {
   id: string;
   brand: string;
   last4: string;
   name: string;
   is_default: boolean;
}

interface PaymentMethodSelectionProps {
   selectedMethod: string;
   setSelectedMethod: (method: string) => void;
   error?: boolean;
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

   return parts.length ? parts.join(' ') : value;
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

export const PaymentMethodSelection = ({ selectedMethod, setSelectedMethod, error }: PaymentMethodSelectionProps) => {
   const { t } = useTranslation();
   const { user, profile } = useAuthStore();
   const [showAddForm, setShowAddForm] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [cards, setCards] = useState<Card[]>([]);
   const [loading, setLoading] = useState(true);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);

   // Form states
   const [cardNumber, setCardNumber] = useState('');
   const [cardName, setCardName] = useState('');
   const [expiry, setExpiry] = useState('');
   const [cvc, setCvc] = useState('');

   const currentBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

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
            const fetchedCards = data.map(item => ({
               id: item.id,
               brand: item.brand,
               last4: item.last4,
               name: item.cardholder_name,
               is_default: item.is_default
            }));
            setCards(fetchedCards);

            // Auto select default or first card — always prefer card over wallet
            if (fetchedCards.length > 0) {
               const defCard = fetchedCards.find(c => c.is_default) || fetchedCards[0];
               setSelectedMethod(defCard.id);
            } else {
               // No cards saved — fall back to wallet
               setSelectedMethod('wallet');
            }
         }
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCardNumber(formatCardNumber(e.target.value));
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
         // Small delay for UX
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
               is_default: cards.length === 0
            }])
            .select()
            .single();

         if (error) throw error;

         const newCard = {
            id: data.id,
            brand: data.brand,
            last4: data.last4,
            name: data.cardholder_name,
            is_default: data.is_default
         };

         setCards([newCard, ...cards]);
         setSelectedMethod(newCard.id);
         setShowAddForm(false);

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

   const inputClass = "bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed";

   return (
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border ${error && !selectedMethod ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm'} overflow-hidden`}>
         {/* Header */}
         <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <CreditCard size={16} className="text-primary-500" />
               </div>
               <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white">
                  {t('payment_method')}
               </h2>
            </div>
            {!showAddForm && (
               <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest border border-primary-500/30 hover:border-primary-500 px-3 py-1.5 rounded-lg transition-all"
               >
                  <Plus size={12} />
                  Add Card
               </button>
            )}
         </div>

         <div className="p-5 sm:p-6">
            {loading ? (
               <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary-500" />
               </div>
            ) : showAddForm ? (
               <form onSubmit={handleAddCard} className="animate-fade-in bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">Enter Card Details</h3>
                     <button disabled={isSaving} type="button" onClick={() => setShowAddForm(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors disabled:opacity-50">
                        <X size={16} />
                     </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="sm:col-span-2">
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
                     <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                        <input disabled={isSaving} required placeholder="JOHN DOE" className={`${inputClass} uppercase`} value={cardName} onChange={e => { setCardName(e.target.value); setErrorMsg(null); }} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                        <input disabled={isSaving} required placeholder="MM/YY" className={`${inputClass} font-mono`} value={expiry} onChange={handleExpiryChange} maxLength={5} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">CVC / CVV</label>
                        <input disabled={isSaving} required placeholder="123" type="password" className={`${inputClass} font-mono`} value={cvc} onChange={e => { setCvc(e.target.value); setErrorMsg(null); }} maxLength={4} />
                     </div>

                     <div className="sm:col-span-2 flex gap-3 mt-2">
                        <button disabled={isSaving} type="submit" className="flex-1 bg-primary-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                           {isSaving && <Loader2 size={16} className="animate-spin" />}
                           {isSaving ? 'Processing...' : 'Save Card'}
                        </button>
                        <button disabled={isSaving} type="button" onClick={() => setShowAddForm(false)} className="px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                           Cancel
                        </button>
                     </div>
                  </div>
               </form>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Wallet Option */}
                  <label className={`flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${selectedMethod === 'wallet'
                     ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                     : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/30'
                     }`}>
                     <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm ${selectedMethod === 'wallet' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                           <Wallet size={20} />
                        </div>
                        {selectedMethod === 'wallet' && <CheckCircle2 className="text-primary-500" size={20} />}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">My Wallet</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Available Balance</p>
                        <p className={`text-xl sm:text-2xl md:text-3xl font-black leading-tight mt-1 ${selectedMethod === 'wallet' ? 'text-primary-500' : 'text-slate-700 dark:text-white'}`}>
                           ${(profile?.wallet_balance ?? 0).toLocaleString()}
                        </p>
                     </div>
                     <input type="radio" name="payment" className="hidden" checked={selectedMethod === 'wallet'} onChange={() => setSelectedMethod('wallet')} />
                  </label>

                  {/* Added Cards */}
                  {cards.map(card => (
                     <label key={card.id} className={`flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedMethod === card.id
                        ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/30'
                        }`}>
                        <div className="flex justify-between items-start">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${selectedMethod === card.id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <CreditCard size={20} />
                           </div>
                           {selectedMethod === card.id && <CheckCircle2 className="text-primary-500" size={20} />}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 dark:text-white">{card.brand} ending in {card.last4}</p>
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5 truncate">
                              {card.name}
                           </p>
                        </div>
                        <input type="radio" name="payment" className="hidden" checked={selectedMethod === card.id} onChange={() => setSelectedMethod(card.id)} />
                     </label>
                  ))}

                  {/* Add Card Button */}
                  <button
                     onClick={() => setShowAddForm(true)}
                     className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-500/5 transition-all text-slate-500 hover:text-primary-500 min-h-[120px]"
                  >
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Plus size={16} />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest">Add New Card</p>
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

