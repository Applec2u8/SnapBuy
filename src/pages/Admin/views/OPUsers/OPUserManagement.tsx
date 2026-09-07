import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Shield,
  Store,
  User,
  PieChart,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pagination } from '../../components/Pagination.tsx';
import { useAdminPin } from '../../../../hooks/useAdminPin';

interface OPUserManagementProps {
  users: any[];
  loading: boolean;
  onUpdateUser?: (userId: string, updates: any) => Promise<void>;
  onRefresh?: () => void;
}

export const OPUserManagement: React.FC<OPUserManagementProps> = ({
  users,
  loading,
  onUpdateUser,
  onRefresh
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const { requirePin, pinModal } = useAdminPin();
  const itemsPerPage = 10;

  // Filter users based on search query AND role filter
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || (user.role || 'customer') === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredUsers, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        const role = u.role || 'customer';
        if (role === 'admin') acc.admins += 1;
        else if (role === 'vendor') acc.vendors += 1;
        else acc.customers += 1;
        return acc;
      },
      { customers: 0, vendors: 0, admins: 0 }
    );
  }, [users]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: 'all' | 'customer' | 'vendor' | 'admin') => {
    setRoleFilter(prev => prev === role ? 'all' : role);
    setCurrentPage(1);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    if (!onUpdateUser) return;

    // Require PIN before changing role
    requirePin(async () => {
      setUpdatingUserId(userId);
      setUpdatingRole(newRole);
      try {
        await onUpdateUser(userId, { role: newRole });
      } catch (error) {
        console.error('Failed to update role:', error);
      } finally {
        setUpdatingUserId(null);
        setUpdatingRole(null);
      }
    });
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
    <div className="space-y-4">
      {/* PIN Modal */}
      {pinModal}

      {/* Role Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'All', count: users.length, icon: PieChart, color: 'text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20', activeRing: 'ring-2 ring-black/50 dark:ring-white/50 shadow-lg shadow-black/10 dark:shadow-white/10', role: 'all' as const },
          { label: 'Customers', count: stats.customers, icon: User, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', activeRing: 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10', role: 'customer' as const },
          { label: 'Vendors', count: stats.vendors, icon: Store, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', activeRing: 'ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10', role: 'vendor' as const },
          { label: 'Admins', count: stats.admins, icon: Shield, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', activeRing: 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10', role: 'admin' as const }
        ].map((item, index) => {
          const Icon = item.icon;
          const isActive = roleFilter === item.role;
          return (
            <motion.div
              key={item.label}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => handleRoleFilter(item.role)}
              className={`p-3 bg-white dark:bg-slate-900 rounded-[1rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${isActive ? item.activeRing : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-2xl ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-2 leading-none">{item.count}</p>
                </div>
              </div>
              {isActive && (
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${item.color} border`}>Filtered</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Main Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder={t('admin_search_users')}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-2xl py-3.5 px-5 pl-12 text-xs font-bold uppercase tracking-widest outline-none transition-all"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-slate-400" size={18} />
          </div>

          <div className="flex items-center gap-3">
            {/* Role filter pill tabs */}
            <div className="hidden md:flex gap-1 p-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              {([
                { role: 'all', label: 'All', count: users.length },
                { role: 'customer', label: 'Customer', count: stats.customers },
                { role: 'vendor', label: 'Vendor', count: stats.vendors },
                { role: 'admin', label: 'Admin', count: stats.admins }
              ] as { role: 'all' | 'customer' | 'vendor' | 'admin'; label: string; count: number }[]).map(tab => (
                <button
                  key={tab.role}
                  onClick={() => handleRoleFilter(tab.role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === tab.role
                    ? tab.role === 'customer' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : tab.role === 'vendor' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : tab.role === 'admin' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${roleFilter === tab.role ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className={`flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary-500 transition-all ${loading ? 'animate-spin text-primary-500' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
              </button>
            )}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin_total')}:</span>
              <span className="text-sm font-black text-primary-500">{filteredUsers.length}</span>
            </div>
          </div>
        </div>

        {/* User Role Management Mobile List View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence mode="popLayout">
            {paginatedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.03 }}
                className="py-6 space-y-4 text-left"
              >
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{user.full_name || 'Unnamed User'}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${user.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        : user.role === 'vendor'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                        {user.role || 'customer'}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 truncate mt-1">{user.email}</p>
                  </div>
                </div>

                {/* Role Buttons Group */}
                <div className="flex flex-col gap-2 p-1.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-2 mt-1">Assign Status / Role</p>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'customer', label: 'Customer', icon: User, activeColor: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' },
                      { id: 'vendor', label: 'Vendor', icon: Store, activeColor: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' },
                      { id: 'admin', label: 'Admin', icon: Shield, activeColor: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' }
                    ].map((btn) => {
                      const BtnIcon = btn.icon;
                      const isActive = user.role === btn.id;
                      const isUpdatingThis = updatingUserId === user.id && updatingRole === btn.id;

                      return (
                        <button
                          key={btn.id}
                          disabled={updatingUserId !== null}
                          onClick={() => handleRoleChange(user.id, btn.id)}
                          className={`
                            flex items-center justify-center gap-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer select-none
                            ${isActive
                              ? btn.activeColor
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {isUpdatingThis ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <BtnIcon size={10} />
                          )}
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* User Role Management Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse responsive-table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Current Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Assign Status / Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              <AnimatePresence mode="popLayout">
                {paginatedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    {/* User profile info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0">
                          <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Current Role display */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        : user.role === 'vendor'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                        {user.role || 'customer'}
                      </span>
                    </td>

                    {/* Interactive Role Assignment Button Group */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex p-1 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80 gap-1">
                        {[
                          { id: 'customer', label: 'Customer', icon: User, activeColor: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' },
                          { id: 'vendor', label: 'Vendor', icon: Store, activeColor: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' },
                          { id: 'admin', label: 'Admin', icon: Shield, activeColor: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' }
                        ].map((btn) => {
                          const BtnIcon = btn.icon;
                          const isActive = user.role === btn.id;
                          const isUpdatingThis = updatingUserId === user.id && updatingRole === btn.id;

                          return (
                            <button
                              key={btn.id}
                              disabled={updatingUserId !== null}
                              onClick={() => handleRoleChange(user.id, btn.id)}
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer select-none
                                ${isActive
                                  ? btn.activeColor
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                              `}
                            >
                              {isUpdatingThis ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <BtnIcon size={10} />
                              )}
                              <span>{btn.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-10 font-bold text-slate-400 text-xs uppercase tracking-widest" data-label="Profile">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > itemsPerPage && (
          <div className="pt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
