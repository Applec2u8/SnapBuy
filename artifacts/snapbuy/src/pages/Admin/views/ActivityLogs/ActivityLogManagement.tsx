import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Eye,
  Heart,
  Shield,
  Zap,
  CreditCard,
  User,
  Package,
  Store,
  RefreshCcw,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import type { ActivityLog, ActivityActionType } from '../../hooks/useAdminActivityLog';

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
    hour12: true
  }).format(d);
}

interface ActionMeta {
  icon:  React.ReactNode;
  color: string;
  label: string;
}

function getActionMeta(type: ActivityActionType): ActionMeta {
  switch (type) {
    case 'boost_views':            return { icon: <Eye size={16} />,             color: 'text-blue-500 bg-blue-500/10',        label: 'Boosted Views' };
    case 'boost_likes':            return { icon: <Heart size={16} />,            color: 'text-red-500 bg-red-500/10',          label: 'Boosted Likes' };
    case 'update_role':            return { icon: <Shield size={16} />,           color: 'text-purple-500 bg-purple-500/10',    label: 'Changed Role' };
    case 'toggle_auto_boost':      return { icon: <Zap size={16} />,              color: 'text-amber-500 bg-amber-500/10',      label: 'Auto-boost Toggled' };
    case 'toggle_auto_like_boost': return { icon: <Heart size={16} />,            color: 'text-pink-500 bg-pink-500/10',        label: 'Auto-like Toggled' };
    case 'allow_credit_card':      return { icon: <CreditCard size={16} />,       color: 'text-emerald-500 bg-emerald-500/10',  label: 'Credit Card Access' };
    case 'update_user':            return { icon: <User size={16} />,             color: 'text-slate-500 bg-slate-500/10',      label: 'Updated User' };
    case 'update_product':         return { icon: <Package size={16} />,          color: 'text-indigo-500 bg-indigo-500/10',    label: 'Updated Product' };
    case 'top_up_wallet':          return { icon: <ArrowUpCircle size={16} />,    color: 'text-green-600 bg-green-500/10',      label: 'Wallet Top-Up' };
    case 'deduct_wallet':          return { icon: <ArrowDownCircle size={16} />,  color: 'text-red-500 bg-red-500/10',          label: 'Wallet Deduction' };
    default:                       return { icon: <Activity size={16} />,         color: 'text-slate-500 bg-slate-500/10',      label: 'System Action' };
  }
}

function formatMetadataDetail(log: ActivityLog): string {
  const m = log.metadata;
  if (!m) return '';
  if (log.action_type === 'boost_views' && m.amount !== undefined) {
    return `Views: ${m.old_value || 0} → ${m.new_value} (+${m.amount})`;
  }
  if (log.action_type === 'boost_likes' && m.amount !== undefined) {
    return `Likes: ${m.old_value || 0} → ${m.new_value} (+${m.amount})`;
  }
  if (log.action_type === 'update_role') return `${m.old_value} → ${m.new_value}`;
  if (log.action_type === 'toggle_auto_boost') return m.enabled ? 'Enabled' : 'Disabled';
  if (log.action_type === 'toggle_auto_like_boost') return m.enabled ? 'Enabled' : 'Disabled';
  if (log.action_type === 'allow_credit_card') return m.enabled ? 'Access granted' : 'Access revoked';
  if (log.action_type === 'top_up_wallet') {
    const amt = Number(m.amount || 0);
    const newBal = Number(m.new_wallet_balance || 0);
    const oldBal = newBal - amt;
    return `+$${amt} USD  ($${oldBal} → $${newBal})`;
  }
  if (log.action_type === 'deduct_wallet') {
    const amt = Number(m.amount || 0);
    const newBal = Number(m.new_wallet_balance || 0);
    const oldBal = newBal + amt;
    return `-$${amt} USD  ($${oldBal} → $${newBal})`;
  }
  return '';
}

// ── Component ─────────────────────────────────────────────────────────

export const ActivityLogManagement = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFullLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching full logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const adminMatch = log.profiles?.full_name?.toLowerCase().includes(term);
    const targetMatch = log.target_name?.toLowerCase().includes(term);
    const typeMatch = log.action_type.toLowerCase().includes(term);
    const shopMatch = (log.metadata?.shop_name as string)?.toLowerCase().includes(term);
    return adminMatch || targetMatch || typeMatch || shopMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Activity className="text-primary-500" />
            System Activity Logs
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Complete history of all administrative actions
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary-500 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={fetchFullLogs}
            disabled={loading}
            className={`flex-shrink-0 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-primary-500 transition-all shadow-sm ${loading ? 'animate-spin text-primary-500' : ''}`}
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Logs: Mobile Card / Desktop Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">

        {/* ── Loading / Empty states ── */}
        {loading && logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Activity size={24} className="opacity-50" />
            <p className="text-[9px] font-bold uppercase tracking-widest">No logs found</p>
          </div>
        ) : (
          <>
            {/* ── MOBILE CARD LIST (< md) ── */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const meta = getActionMeta(log.action_type);
                const detail = formatMetadataDetail(log);
                const adminName = log.profiles?.full_name || 'System / Unknown';
                const shopName = log.metadata?.shop_name as string | undefined;
                const ownerName = log.metadata?.owner_name as string | undefined;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 space-y-2"
                  >
                    {/* Row 1: action badge + time */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.color} flex-shrink-0`}>
                        {meta.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest">{meta.label}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    {/* Row 2: admin */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <User size={9} className="text-slate-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest truncate">
                        {adminName}
                      </span>
                    </div>

                    {/* Row 3: target */}
                    {log.target_name && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Package size={11} className="text-slate-400 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                          {log.target_name}
                        </span>
                      </div>
                    )}

                    {/* Row 4: shop / owner */}
                    {(shopName || ownerName) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {shopName && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Store size={10} className="text-slate-400 flex-shrink-0" />
                            <span className="text-[9px] font-bold text-slate-500 truncate">{shopName}</span>
                          </div>
                        )}
                        {ownerName && (
                          <div className="flex items-center gap-1 min-w-0">
                            <User size={10} className="text-slate-400 flex-shrink-0" />
                            <span className="text-[9px] font-bold text-slate-500 truncate">{ownerName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Row 5: detail badge */}
                    {detail && (
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}>
                        {detail}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* ── DESKTOP TABLE (≥ md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse responsive-table">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date &amp; Time</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Admin</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Action Type</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Target Item</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Shop / Owner</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const meta = getActionMeta(log.action_type);
                    const detail = formatMetadataDetail(log);
                    const adminName = log.profiles?.full_name || 'System / Unknown';
                    const shopName = log.metadata?.shop_name as string | undefined;
                    const ownerName = log.metadata?.owner_name as string | undefined;

                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {formatDate(log.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <User size={10} className="text-slate-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                              {adminName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.color}`}>
                            {meta.icon}
                            <span className="text-[9px] font-black uppercase tracking-widest">{meta.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[200px] truncate">
                          {log.target_name ? (
                            <div className="flex items-center gap-2">
                              <Package size={12} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate" title={log.target_name}>
                                {log.target_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-[150px] truncate">
                          {shopName || ownerName ? (
                            <div className="flex flex-col space-y-1">
                              {shopName && (
                                <div className="flex items-center gap-1.5">
                                  <Store size={10} className="text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate" title={shopName}>
                                    {shopName}
                                  </span>
                                </div>
                              )}
                              {ownerName && (
                                <div className="flex items-center gap-1.5">
                                  <User size={10} className="text-slate-400" />
                                  <span className="text-[9px] font-bold text-slate-500 truncate" title={ownerName}>
                                    {ownerName}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {detail ? (
                            <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}>
                              {detail}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
