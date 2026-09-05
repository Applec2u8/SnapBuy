import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Calendar, 
  Check,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pagination } from '../../components/Pagination.tsx';

interface PaymentManagementProps {
  users: any[];
  loading: boolean;
  onUpdateUser: (userId: string, updates: any) => Promise<void>;
  onRefresh?: () => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({ users, loading, onUpdateUser, onRefresh }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const itemsPerPage = 20;

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleToggleAllowCreditCard = async (userId: string, currentValue: boolean) => {
    setTogglingUserId(userId);
    try {
      await onUpdateUser(userId, { allow_credit_card: !currentValue });
    } finally {
      setTogglingUserId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
      >
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder={t('admin_search_payments')} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-2xl py-3 px-4 pl-12 text-xs font-bold uppercase tracking-widest outline-none transition-all"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary-500 transition-all shadow-sm flex-shrink-0 ${loading ? 'animate-spin text-primary-500' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin_total')}:</span>
             <span className="text-sm font-black text-primary-500">{filteredUsers.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Table */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence>
            {paginatedUsers.map((user, index) => {
              const isAllowed = user.allow_credit_card !== false;
              const isToggling = togglingUserId === user.id;

              return (
                <motion.div 
                  key={user.id} 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.full_name || t('admin_unnamed_user')}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    {/* iOS Switch Toggle for Mobile */}
                    <div className="flex items-center gap-3">
                      {isToggling ? (
                        <Loader2 className="animate-spin text-primary-500" size={20} />
                      ) : (
                        <button
                          onClick={() => handleToggleAllowCreditCard(user.id, isAllowed)}
                          className={`w-12 h-6 rounded-full transition-all relative flex items-center ${isAllowed ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute w-4 h-4 bg-white rounded-full transition-all shadow ${isAllowed ? 'left-7' : 'left-1'}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{new Date(user.updated_at).toLocaleDateString()}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      isAllowed ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {isAllowed ? t('admin_active') : t('admin_payment_status')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_user_profile')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_status_role')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_payment_status')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_allow_credit_card')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {paginatedUsers.map((user, index) => {
                  const isAllowed = user.allow_credit_card !== false;
                  const isToggling = togglingUserId === user.id;

                  return (
                    <motion.tr 
                      key={user.id}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.full_name || t('admin_unnamed_user')}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                          isAllowed 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {isAllowed ? (
                            <>
                              <Check size={10} strokeWidth={3} />
                              Allowed
                            </>
                          ) : (
                            <>
                              <X size={10} strokeWidth={3} />
                              Disabled
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          {isToggling ? (
                            <Loader2 className="animate-spin text-primary-500" size={20} />
                          ) : (
                            <button
                              onClick={() => handleToggleAllowCreditCard(user.id, isAllowed)}
                              className={`w-12 h-6 rounded-full transition-all relative flex items-center ${isAllowed ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                              <div className={`absolute w-4 h-4 bg-white rounded-full transition-all shadow ${isAllowed ? 'left-7' : 'left-1'}`} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </div>
  );
};
