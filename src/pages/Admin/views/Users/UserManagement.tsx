import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Store,
  ChevronUp,
  MoreVertical,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pagination } from '../../components/Pagination.tsx';

interface UserManagementProps {
  users: any[];
  shops: any[];
  loading: boolean;
  onSelectUser: (id: string) => void;
  onRefresh?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, shops, loading, onSelectUser, onRefresh }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getUserShops = (userId: string) => {
    return shops.filter(shop => shop.owner_id === userId);
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
      >
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder={t('admin_search_users')}
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

      {/* Users List - Mobile: Cards / Desktop: Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence>
            {paginatedUsers.map((user, index) => (
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
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">{user.email || '—'}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectUser(user.id)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-500 rounded-xl transition-all"
                      title={t('admin_manage_user')}
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                      className={`p-2.5 rounded-xl transition-all ${expandedUser === user.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      title={t('admin_view_shops')}
                    >
                      <Store size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                    {user.role || 'user'}
                  </span>
                  {(user.role === 'vendor' || getUserShops(user.id).length > 0) && (
                    <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                      <Store size={8} /> Vendor
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">{new Date(user.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Mobile Expanded Shops */}
                <AnimatePresence>
                  {expandedUser === user.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                          <Store size={14} className="text-amber-500" />
                          <h4 className="font-black text-[10px] text-slate-900 dark:text-white uppercase tracking-tight">{t('admin_user_shops')}</h4>
                        </div>
                        <div className="space-y-2">
                          {getUserShops(user.id).length > 0 ? (
                            getUserShops(user.id).map(shop => (
                              <Link
                                key={shop.id}
                                to={`/shop/${shop.id}`}
                                target="_blank"
                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-primary-500 transition-all"
                              >
                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={shop.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=random`} className="w-full h-full object-cover" alt="" />
                                </div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate flex-1">{shop.name}</p>
                                <ChevronUp size={14} className="text-slate-300 rotate-90" />
                              </Link>
                            ))
                          ) : (
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic py-2 text-center">{t('admin_no_shops')}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_user_profile')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_email')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_status_role')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('admin_joined')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t('admin_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {paginatedUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <motion.tr
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-default"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform">
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.full_name || t('admin_unnamed_user')}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email || '-'}</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">{user.email ? user.email : t('admin_no_email')}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                            {user.role || 'user'}
                          </span>
                          {(user.role === 'vendor' || getUserShops(user.id).length > 0) && (
                            <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                              <Store size={8} /> Vendor
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(user.updated_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectUser(user.id)}
                            className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                            title={t('admin_manage_user')}
                          >
                            <Settings size={20} />
                          </button>
                          <button
                            onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            className={`p-2.5 rounded-xl transition-all active:scale-90 ${expandedUser === user.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title={t('admin_view_shops')}
                          >
                            <Store size={20} />
                          </button>
                          <button className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Desktop Expanded Shops Row */}
                    <AnimatePresence>
                      {expandedUser === user.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={4} className="px-8 py-0">
                            <motion.div
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="py-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] my-4 mx-4 border border-slate-200 dark:border-slate-800"
                            >
                              <div className="px-8">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                                    <Store size={18} />
                                  </div>
                                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base">{t('admin_user_shops')}</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {getUserShops(user.id).length > 0 ? (
                                    getUserShops(user.id).map((shop, shopIdx) => (
                                      <motion.div
                                        key={shop.id}
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: shopIdx * 0.05 }}
                                      >
                                        <Link
                                          to={`/shop/${shop.id}`}
                                          target="_blank"
                                          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all group/shop"
                                        >
                                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0">
                                            <img src={shop.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=random`} className="w-full h-full object-cover" alt="" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{shop.name}</p>
                                            <p className="text-[8px] font-bold text-primary-500 uppercase tracking-widest mt-0.5">{t('admin_view_shop')}</p>
                                          </div>
                                        </Link>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic py-4">
                                      {t('admin_no_shops_desc')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
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

