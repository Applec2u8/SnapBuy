import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { DollarSign, AlertCircle, Plus, Minus, X, Search as SearchIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';

interface WalletManagementProps {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logAction: (params: any) => Promise<void>;
  refreshData: () => Promise<void>;
  loading?: boolean;
}

// Shared amount input component
const AmountField = ({
  value, onChange, user, maxKey, maxAmount
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  maxKey: 'wallet_balance';
  maxAmount?: number;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</label>
      <button
        type="button"
        onClick={() => onChange(user[maxKey] || 0)}
        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary-500/10 hover:text-primary-500 transition-all"
      >MAX</button>
    </div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <DollarSign size={18} className="text-slate-400" />
      </div>
      <input
        type="number" min="1" step="1" required max={maxAmount}
        value={value}
        onChange={(e) => {
          const rawVal = e.target.value;
          if (rawVal === '') {
            onChange('');
            return;
          }
          let numVal = Number(rawVal);
          if (maxAmount !== undefined && numVal > maxAmount) {
            numVal = maxAmount;
          }
          onChange(numVal);
        }}
        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        placeholder="Enter amount..."
      />
    </div>
  </div>
);

export const WalletManagement: React.FC<WalletManagementProps> = ({ users, logAction, refreshData, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topUpUser, setTopUpUser] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deductUser, setDeductUser] = useState<any | null>(null);

  const [topUpAmount, setTopUpAmount] = useState<number | ''>('');
  const [deductAmount, setDeductAmount] = useState<number | ''>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global ESC key listener for both modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        if (topUpUser) handleCloseTopUp();
        if (deductUser) handleCloseDeduct();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [topUpUser, deductUser, isSubmitting]);

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    const name = u.full_name?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    return name.includes(search) || email.includes(search);
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalWalletBalance = users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0);
  const totalUsers = users.length;

  const handleCloseTopUp = () => { setTopUpUser(null); setTopUpAmount(''); };
  const handleCloseDeduct = () => { setDeductUser(null); setDeductAmount(''); };

  const handleSubmit = async (
    e: React.FormEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any,
    amount: number | '',
    type: 'wallet',
    action: 'add' | 'deduct',
    onClose: () => void
  ) => {
    e.preventDefault();
    if (!user || !amount || amount <= 0) { toast.error('Please enter a valid amount'); return; }

    setIsSubmitting(true);
    try {
      const rpcName = action === 'add' ? 'admin_top_up_wallet' : 'admin_deduct_wallet';
      const { data, error } = await supabase.rpc(rpcName, {
        target_user_id: user.id,
        amount: Number(amount),
        is_token: false,
      });
      if (error) throw error;

      await logAction({
        action_type: action === 'add' ? 'top_up_wallet' : 'deduct_wallet',
        target_type: 'user',
        target_id: user.id,
        target_name: user.full_name || user.email,
        metadata: { amount: Number(amount), type, new_wallet_balance: data?.wallet_balance },
      });

      toast.success(`Successfully ${action === 'add' ? 'added' : 'deducted'} ${amount} ${action === 'add' ? 'to' : 'from'} ${type}`);
      await refreshData();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Wallet Management
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Top-up user wallets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 font-medium"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          {refreshData && (
            <button
              onClick={refreshData}
              disabled={loading}
              className={`p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary-500 transition-all shadow-sm flex-shrink-0 ${loading ? 'animate-spin text-primary-500' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards — Wallet full row, then Users + Tokens */}
      <div className="space-y-3 flex-row w-full">
        {/* Full width: Total Wallet Balance */}
        <div className="flex flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
            <DollarSign size={26} className="text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Wallet Balance</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              ${totalWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Row: Users */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Users</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List — Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Balances</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4" data-label="User">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-400">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.full_name?.charAt(0) || user.email?.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.full_name || 'No Name'}</p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" data-label="Role">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                      user.role === 'vendor' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1" data-label="Balances">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                      <DollarSign size={14} /> ${user.wallet_balance?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4" data-label="Actions">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setTopUpUser(user); setTopUpAmount(''); }}
                        className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Plus size={13} /> Top Up
                      </button>
                      <button
                        onClick={() => { setDeductUser(user); setDeductAmount(''); }}
                        className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Minus size={13} /> Deduct
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500" data-label="User">
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold uppercase tracking-widest">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List — Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedUsers.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-widest">No users found</p>
          </div>
        )}
        {paginatedUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-400 shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0) || user.email?.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name || 'No Name'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0 ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                user.role === 'vendor' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-slate-500/10 text-slate-500'
                }`}>
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                  <DollarSign size={13} /> ${user.wallet_balance?.toLocaleString() || 0}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setTopUpUser(user); setTopUpAmount(''); }}
                  className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => { setDeductUser(user); setDeductAmount(''); }}
                  className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  <Minus size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ===== TOP UP MODAL ===== */}
      <AnimatePresence>
        {topUpUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseTopUp}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Green accent bar */}
              <div className="h-1.5 bg-green-500 w-full" />
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Plus size={16} className="text-green-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Top Up</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      Add funds to <span className="text-green-500">{topUpUser.full_name || topUpUser.email}</span>
                    </p>
                  </div>
                  <button onClick={handleCloseTopUp} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Current balances */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-500/70 mb-0.5">Wallet</p>
                    <p className="text-base font-black text-green-500">${(topUpUser.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <form onSubmit={(e) => handleSubmit(e, topUpUser, topUpAmount, 'wallet', 'add', handleCloseTopUp)} className="space-y-4">


                  <AmountField
                    value={topUpAmount}
                    onChange={setTopUpAmount}
                    user={topUpUser}
                    maxKey="wallet_balance"
                  />

                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-green-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Processing...' : `Confirm Top Up`}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== DEDUCT MODAL ===== */}
      <AnimatePresence>
        {deductUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseDeduct}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Red accent bar */}
              <div className="h-1.5 bg-red-500 w-full" />
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Minus size={16} className="text-red-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Deduct</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      Remove funds from <span className="text-red-500">{deductUser.full_name || deductUser.email}</span>
                    </p>
                  </div>
                  <button onClick={handleCloseDeduct} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Current balances */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500/70 mb-0.5">Wallet</p>
                    <p className="text-base font-black text-red-500">${(deductUser.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <form onSubmit={(e) => handleSubmit(e, deductUser, deductAmount, 'wallet', 'deduct', handleCloseDeduct)} className="space-y-4">

                  <AmountField
                    value={deductAmount}
                    onChange={setDeductAmount}
                    user={deductUser}
                    maxKey="wallet_balance"
                    maxAmount={deductUser.wallet_balance || 0}
                  />

                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-red-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Processing...' : `Confirm Deduction`}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
