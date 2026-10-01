import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Phone, CreditCard, ShieldCheck, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LinkedAccountItem } from './components/LinkedAccountItem';
import OTPEmailModal from './components/OTPEmailModal';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const AccountManagement = () => {
  const { user, profile, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const phoneNumber = profile?.phone || '';
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchCards = async () => {
        try {
          const { data, error } = await supabase
            .from('user_payment_methods')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (data) {
            setCards(data);
          }
        } catch (err) {
          console.error('Error fetching cards:', err);
        } finally {
          setLoadingCards(false);
        }
      };
      fetchCards();
    }
  }, [user]);

  const handleEditPhone = async () => {
    const newPhone = window.prompt('Enter your new phone number:', phoneNumber);
    if (newPhone !== null && newPhone.trim() !== phoneNumber) {
      try {
        const { error } = await supabase.from('profiles').update({ phone: newPhone.trim() }).eq('id', user?.id);
        if (error) throw error;
        toast.success('Phone number updated successfully');
        if (user) await fetchProfile(user.id);
      } catch (err: any) {
        toast.error(err.message || 'Failed to update phone number');
      }
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left min-h-screen overflow-x-hidden sm:overflow-x-visible">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 w-full">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary/50 dark:bg-slate-800 flex items-center justify-center hover:bg-secondary dark:hover:bg-slate-700 transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-black text-foreground truncate">Account Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">Manage your linked accounts and contact information.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact Information Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
              <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Contact Details</h3>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Your primary info</p>
            </div>
          </div>

          <div className="space-y-4">
            <LinkedAccountItem
              icon={<Mail size={20} />}
              title="Email Address"
              value={user?.email || 'No email attached'}
              status={user?.email ? 'verified' : 'unverified'}
              actionLabel="Change"
              onAction={() => setShowEmailModal(true)}
              isPrimary={true}
            />

            <LinkedAccountItem
              icon={<Phone size={20} />}
              title="Phone Number"
              value={phoneNumber || 'No phone number linked'}
              status={phoneNumber ? 'verified' : 'unverified'}
              actionLabel={phoneNumber ? 'Edit' : 'Add Phone'}
              onAction={handleEditPhone}
            />
          </div>
        </section>

        {/* Linked Payment Methods */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2 w-full">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
                <CreditCard size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Payment Methods</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Cards & Wallets</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loadingCards ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary-500" size={24} />
              </div>
            ) : cards.length > 0 ? (
              cards.map((card) => (
                <LinkedAccountItem
                  key={card.id}
                  icon={<CreditCard size={20} />}
                  title={`${card.brand} Card`}
                  value={`Ending in •••• ${card.last4}`}
                  status="verified"
                  actionLabel="Remove"
                  onAction={() => handleDeleteCard(card.id)}
                />
              ))
            ) : (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No payment methods linked.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showEmailModal && user?.email && (
        <OTPEmailModal
          email={user.email}
          userName={profile?.full_name || profile?.username}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};

export default AccountManagement;
