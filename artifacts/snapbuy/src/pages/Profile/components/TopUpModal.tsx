import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, AlertCircle, MessageCircle, Wallet, Phone, Mail, Globe, MessageSquare, ChevronLeft, CheckCircle2, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/useAuthStore';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';

interface Card {
  id: string;
  brand: string;
  last4: string;
  name: string;
}

interface TopUpModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'phone': return <Phone size={18} />;
    case 'whatsapp': return <MessageCircle size={18} />;
    case 'line': return <MessageSquare size={18} />;
    case 'email': return <Mail size={18} />;
    case 'website': return <Globe size={18} />;
    case 'facebook': return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
    case 'instagram': return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
    default: return <Globe size={18} />;
  }
};

const getChannelColor = (type: string) => {
  switch (type) {
    case 'phone': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'facebook': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'whatsapp': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'line': return 'bg-lime-500/10 text-lime-600 dark:text-lime-400';
    case 'email': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'instagram': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400';
    default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
  }
};

export const TopUpModal: React.FC<TopUpModalProps> = ({ show, onClose }) => {
  const { user } = useAuthStore();

  type Step = 'input' | 'receipt' | 'processing' | 'error' | 'support' | 'success';
  const [step, setStep] = useState<Step>('input');
  const isProcessing = step === 'processing';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show && !isProcessing) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, isProcessing, onClose]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  const [dollars, setDollars] = useState<string>('');
  const [cents, setCents] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [supportChannels, setSupportChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  useEffect(() => {
    if (show && user) {
      fetchCards();
      fetchSupportChannels();
    }
  }, [show, user]);

  useEffect(() => {
    if (show) {
      // Reset states only when modal opens
      setDollars('');
      setCents('');
      setSelectedCardId(null);
      setStep('input');
    }
  }, [show]);

  const fetchSupportChannels = async () => {
    setLoadingChannels(true);
    try {
      const { data, error } = await supabase
        .from('support_channels')
        .select('*')
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setSupportChannels(data || []);
    } catch (err) {
      console.error('Error fetching support channels:', err);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchCards = async () => {
    setLoadingCards(true);
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
      if (data && data.length > 0) {
        setSelectedCardId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleTopUpClick = () => {
    const totalAmount = Number(dollars || 0) + Number(cents || 0) / 100;
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) return;
    if (!selectedCardId) return;

    setStep('receipt');
  };

  const handleConfirmPayment = async () => {
    setStep('processing');

    // Simulate processing with a random delay between 10–15 seconds
    const delay = Math.floor(Math.random() * 6000) + 10000; // 10,000–15,000 ms

    setTimeout(() => {
      setStep('error');
    }, delay);
  };

  const openSupportChat = () => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-support-chat'));
    }, 200);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md cursor-pointer"
        onClick={() => !isProcessing && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 cursor-default"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Wallet Top-Up</h3>
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Add Funds</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <div className="relative overflow-hidden">
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-green-50 dark:border-green-500/10">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Top-Up Successful</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
                  ${(Number(dollars || 0) + Number(cents || 0) / 100).toFixed(2)} has been added to your wallet balance.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Done
                </button>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col"
              >
                {/* Red banner with icon */}
                <div className="bg-gradient-to-br from-red-500 to-rose-600 px-8 pt-10 pb-16 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-56 h-56 bg-black rounded-full translate-x-1/3 translate-y-1/3" />
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-xl">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white relative z-10">Transaction Failed</h3>
                  <p className="text-[11px] font-bold text-red-100 uppercase tracking-widest mt-1 relative z-10">Error Code: TOP-UP-001</p>
                </div>

                {/* Content card overlapping the banner */}
                <div className="bg-white dark:bg-slate-900 mx-5 -mt-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 relative z-10">
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                    We couldn't process your top-up request. Please contact our customer support to verify your account or card details before proceeding.
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-white">!</span>
                    </div>
                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                      Your card was <span className="font-black">not charged</span>. No funds have been deducted from your account.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={openSupportChat}
                      className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <Headphones size={15} /> Chat with Support
                    </button>
                    <button
                      onClick={() => setStep('input')}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
                <div className="h-6" />
              </motion.div>
            )}

            {step === 'support' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full bg-white dark:bg-slate-900"
              >
                <div className="p-5 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep('error')} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all">
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Contact Support</h3>
                  </div>

                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Please reach out to our team through any of the following available channels.
                  </p>

                  {loadingChannels ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-slate-300" size={24} />
                    </div>
                  ) : supportChannels.length > 0 ? (
                    <div className="space-y-3">
                      {supportChannels.map((channel) => {
                        let href = channel.value;
                        if (channel.channel_type === 'phone' && !href.startsWith('tel:')) href = `tel:${href}`;
                        if (channel.channel_type === 'email' && !href.startsWith('mailto:')) href = `mailto:${href}`;
                        if (channel.channel_type === 'line' && !href.startsWith('http')) href = `https://line.me/R/ti/p/${href.replace('@', '')}`;
                        if (!href.startsWith('http') && !href.startsWith('tel:') && !href.startsWith('mailto:')) href = `https://${href}`;

                        return (
                          <a 
                            key={channel.id} 
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all group bg-white dark:bg-slate-900"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getChannelColor(channel.channel_type)}`}>
                              {getChannelIcon(channel.channel_type)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover:text-primary-500 transition-colors">{channel.label}</p>
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{channel.value}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <MessageCircle size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No support channels currently available.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 md:p-8 py-16 space-y-6 text-center flex flex-col justify-center items-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                  <Wallet className="absolute inset-0 m-auto text-primary-500 animate-pulse" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Processing Transaction...</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">
                    Please wait while we securely process your payment. Do not close this window.
                  </p>
                  <p className="mt-4 text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                    Verifying payment gateway...
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'receipt' && (
              <div className="p-5 md:p-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Top-Up Amount</p>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                    ${Number(dollars || 0).toLocaleString()}<span className="text-2xl text-slate-400">.{(cents || '00').padEnd(2, '0')}</span>
                  </h2>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment For</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Vendor Wallet Top-Up</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={14} className="text-primary-500" />
                      {cards.find(c => c.id === selectedCardId)?.brand} •••• {cards.find(c => c.id === selectedCardId)?.last4}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Fee</span>
                    <span className="text-xs font-black text-green-500">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-2 pt-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
                    <span className="text-sm font-black text-primary-500">
                      ${Number(dollars || 0).toLocaleString()}.{(cents || '00').padEnd(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="w-1/3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 py-4 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                  >
                    Pay Now
                  </button>
                </div>
              </motion.div>
              </div>
            )}

            {step === 'input' && (
              <div className="p-5 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Top-Up</label>
                  <div className="flex items-center w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-sm">
                    <span className="text-slate-400 font-black text-xl mr-2">$</span>
                    <input
                      type="number"
                      value={dollars}
                      onChange={(e) => setDollars(e.target.value)}
                      placeholder="0"
                      className="flex-1 min-w-0 bg-transparent py-4 text-3xl font-black outline-none dark:text-white text-right placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-3xl font-black text-slate-300 mx-1">.</span>
                    <input
                      type="number"
                      value={cents}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= 2) setCents(val);
                      }}
                      placeholder="00"
                      className="w-20 min-w-0 bg-transparent py-4 text-3xl font-black outline-none dark:text-white placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Card Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Method</label>

                  {loadingCards ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                  ) : cards.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                      {cards.map(card => (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${selectedCardId === card.id ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCardId === card.id ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                            {selectedCardId === card.id && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                          </div>
                          <CreditCard size={18} className={selectedCardId === card.id ? 'text-primary-500' : 'text-slate-400'} />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{card.brand} •••• {card.last4}</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest">{card.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-500">No payment methods found</p>
                      <Link to="/payment-methods" className="text-[10px] text-primary-500 font-black uppercase tracking-widest hover:underline">
                        Add a card in settings
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleTopUpClick}
                  disabled={(Number(dollars || 0) + Number(cents || 0) / 100) <= 0 || !selectedCardId}
                  className="w-full py-4 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                >
                  Continue
                </button>

                {/* Support shortcut */}
                <button
                  onClick={openSupportChat}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Headphones size={12} /> Need help? Chat with Support
                </button>
              </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
