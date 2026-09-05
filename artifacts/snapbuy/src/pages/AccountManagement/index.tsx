import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Phone, CreditCard, ShieldCheck, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LinkedAccountItem } from './components/LinkedAccountItem';
import { toast } from 'sonner';

const AccountManagement = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const [phoneNumber] = useState(profile?.phone || '');
  const [hasMastercard, setHasMastercard] = useState(true);

  const handleEditPhone = () => {
    toast.info('Phone number editing will be available soon.');
  };

  const handleAddCard = () => {
    toast.info('Adding new payment methods will be available soon.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-left min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary/50 dark:bg-slate-800 flex items-center justify-center hover:bg-secondary dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your linked accounts and contact information.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact Information Section */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Contact Details</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your primary info</p>
            </div>
          </div>

          <div className="space-y-4">
            <LinkedAccountItem
              icon={<Mail size={20} />}
              title="Email Address"
              value={user?.email || 'No email attached'}
              status={user?.email ? 'verified' : 'unverified'}
              actionLabel="Change"
              onAction={() => toast.info('Email changing is restricted.')}
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
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Payment Methods</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cards & Wallets</p>
              </div>
            </div>
            <button
              onClick={handleAddCard}
              className="flex items-center gap-2 text-sm font-bold text-primary-500 hover:text-primary-600 bg-primary-500/10 px-4 py-2 rounded-xl transition-colors"
            >
              <Plus size={16} /> Add New
            </button>
          </div>

          <div className="space-y-4">
            {hasMastercard ? (
              <LinkedAccountItem
                icon={<CreditCard size={20} />}
                title="Mastercard"
                value="Ending in •••• 4242"
                status="verified"
                actionLabel="Remove"
                onAction={() => setHasMastercard(false)}
              />
            ) : (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No payment methods linked.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountManagement;
