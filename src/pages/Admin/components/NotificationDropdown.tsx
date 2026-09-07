import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Eye,
  Heart,
  Shield,
  Zap,
  CreditCard,
  User,
  Package,
  X,
  RefreshCcw,
  ChevronDown,
  Store,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import type { ActivityLog, ActivityActionType } from '../hooks/useAdminActivityLog';

// ── Helpers ───────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface ActionMeta {
  icon: React.ReactNode;
  color: string;
  label: string;
}

function getActionMeta(type: ActivityActionType): ActionMeta {
  switch (type) {
    case 'boost_views':
      return { icon: <Eye size={13} />, color: 'text-blue-500 bg-blue-500/10', label: 'Boosted views' };
    case 'boost_likes':
      return { icon: <Heart size={13} />, color: 'text-red-500 bg-red-500/10', label: 'Boosted likes' };
    case 'update_role':
      return { icon: <Shield size={13} />, color: 'text-purple-500 bg-purple-500/10', label: 'Changed role' };
    case 'toggle_auto_boost':
      return { icon: <Zap size={13} />, color: 'text-amber-500 bg-amber-500/10', label: 'Auto-boost toggled' };
    case 'toggle_auto_like_boost':
      return { icon: <Heart size={13} />, color: 'text-pink-500 bg-pink-500/10', label: 'Auto-like toggled' };
    case 'allow_credit_card':
      return { icon: <CreditCard size={13} />, color: 'text-emerald-500 bg-emerald-500/10', label: 'Credit card access' };
    case 'update_user':
      return { icon: <User size={13} />, color: 'text-slate-500 bg-slate-500/10', label: 'Updated user' };
    case 'update_product':
      return { icon: <Package size={13} />, color: 'text-indigo-500 bg-indigo-500/10', label: 'Updated product' };
    case 'top_up_wallet':
      return { icon: <ArrowUpCircle size={13} />, color: 'text-green-600 bg-green-500/10', label: 'Wallet Top-Up' };
    case 'deduct_wallet':
      return { icon: <ArrowDownCircle size={13} />, color: 'text-red-500 bg-red-500/10', label: 'Wallet Deduction' };
    default:
      return { icon: <Package size={13} />, color: 'text-slate-500 bg-slate-500/10', label: 'Action' };
  }
}

function formatMetadata(log: ActivityLog): string {
  const m = log.metadata;
  if (!m) return '';
  if (log.action_type === 'boost_views' && m.amount !== undefined) {
    return `Views: ${m.old_value || 0} → ${m.new_value} (+${m.amount})`;
  }
  if (log.action_type === 'boost_likes' && m.amount !== undefined) {
    return `Likes: ${m.old_value || 0} → ${m.new_value} (+${m.amount})`;
  }
  if (log.action_type === 'update_role')
    return `${m.old_value} → ${m.new_value}`;
  if (log.action_type === 'toggle_auto_boost')
    return m.enabled ? 'Enabled' : 'Disabled';
  if (log.action_type === 'toggle_auto_like_boost')
    return m.enabled ? 'Enabled' : 'Disabled';
  if (log.action_type === 'allow_credit_card')
    return m.enabled ? 'Access granted' : 'Access revoked';
  if (log.action_type === 'top_up_wallet') {
    const amt = Number(m.amount || 0);
    const newBal = Number(m.new_wallet_balance || 0);
    const oldBal = newBal - amt;
    return `+$${amt} USD ($${oldBal}→$${newBal})`;
  }
  if (log.action_type === 'deduct_wallet') {
    const amt = Number(m.amount || 0);
    const newBal = Number(m.new_wallet_balance || 0);
    const oldBal = newBal + amt;
    return `-$${amt} USD ($${oldBal}→$${newBal})`;
  }
  return '';
}

// ── Component ─────────────────────────────────────────────────────────

interface NotificationDropdownProps {
  isOpen: boolean;
  logs: ActivityLog[];
  unreadCount: number;
  isLoading: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  logs,
  unreadCount,
  isLoading,
  onOpen,
  onClose,
  onRefresh,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="admin-notification-bell"
        onClick={isOpen ? onClose : onOpen}
        className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        title="Activity Log"
      >
        <Bell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-slate-900"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute md:right-0 -right-20 top-full mt-3 md:w-[360px] w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Activity Log
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {logs.length} recent actions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className={`p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all ${isLoading ? 'animate-spin' : ''}`}
                  title="Refresh log"
                >
                  <RefreshCcw size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Log List */}
            <div className="max-h-[420px] overflow-y-auto no-scrollbar">
              {isLoading && logs.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Loading…</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Bell size={20} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No activity yet</p>
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  {logs.map((log) => {
                    const meta = getActionMeta(log.action_type);
                    const detail = formatMetadata(log);
                    const isExpanded = expandedLogId === log.id;
                    const adminName = log.profiles?.full_name || 'System / Unknown Admin';
                    const shopName = log.metadata?.shop_name as string | undefined;
                    const ownerName = log.metadata?.owner_name as string | undefined;

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        {/* Action icon */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center ${meta.color} mt-1`}>
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                              {meta.label}
                            </p>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
                              {relativeTime(log.created_at)}
                            </span>
                          </div>

                          {/* Target name */}
                          {log.target_name && (
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {log.target_name}
                            </p>
                          )}

                          {/* Detail (e.g. "+500 views", "customer → vendor") */}
                          {detail && !isExpanded && (
                            <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.color}`}>
                              {detail}
                            </span>
                          )}

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                                  <div className="space-y-0.5">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Admin</p>
                                    <div className="flex items-center gap-1.5">
                                      <User size={10} className="text-slate-400" />
                                      <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{adminName}</p>
                                    </div>
                                  </div>

                                  {log.target_name && (
                                    <div className="space-y-0.5">
                                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Target Item</p>
                                      <div className="flex items-center gap-1.5">
                                        <Package size={10} className="text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{log.target_name}</p>
                                      </div>
                                    </div>
                                  )}

                                  {shopName && (
                                    <div className="space-y-0.5">
                                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Shop / Owner</p>
                                      <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-1.5">
                                          <Store size={10} className="text-slate-400" />
                                          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{shopName}</p>
                                        </div>
                                        {ownerName && (
                                          <div className="flex items-center gap-1.5">
                                            <User size={10} className="text-slate-400" />
                                            <p className="text-[9px] font-bold text-slate-500">{ownerName}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {detail && (
                                    <div className="pt-1">
                                      <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.color}`}>
                                        {detail}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex-shrink-0 pt-1.5 text-slate-300 dark:text-slate-600 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          <ChevronDown size={12} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {logs.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Showing last {logs.length} actions
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
