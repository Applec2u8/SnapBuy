import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Store,
  ChevronUp,
  MoreVertical,
  Settings,
  Tag,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pagination } from '../../components/Pagination.tsx';
import { supabase } from '../../../../lib/supabase';

// â”€â”€ TagPanel: standalone component (must be outside UserManagement to avoid remount) â”€â”€
interface TagPanelProps {
  userId: string;
  tags: string[];
  loading: boolean;
  input: string;
  suggestions: string[];
  onAdd: (userId: string) => void;
  onRemove: (userId: string, tag: string) => void;
  onInputChange: (userId: string, val: string) => void;
  onPickSuggestion: (userId: string, tag: string) => void;
  onFocus: (userId: string) => void;
}

function TagPanel({ userId, tags, loading, input, suggestions, onAdd, onRemove, onInputChange, onPickSuggestion, onFocus }: TagPanelProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dropStyle, setDropStyle] = React.useState<React.CSSProperties>({});

  const calcDrop = () => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setDropStyle({ position: 'fixed', top: r.bottom + 4, left: r.left, width: r.width, zIndex: 9999 });
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-violet-500/10 text-violet-500 rounded-lg"><Tag size={13} /></div>
        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Admin Tags</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {tag}
            <button onClick={() => onRemove(userId, tag)} className="hover:text-rose-500 transition-colors"><X size={10} /></button>
          </span>
        ))}
        {tags.length === 0 && !loading && <p className="text-[9px] text-slate-400 italic">ยังไม่มี tag</p>}
        {loading && <Loader2 size={14} className="animate-spin text-violet-400" />}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={e => { calcDrop(); onInputChange(userId, e.target.value); }}
            onFocus={() => { calcDrop(); onFocus(userId); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(userId); } }}
            placeholder="พิมพ์ tag ใหม่..."
            className="w-full px-3 py-2 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 placeholder-slate-400"
          />
          {suggestions.length > 0 && (
            <div style={dropStyle} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-52 overflow-y-auto">
              {suggestions.map(s => (
                <button key={s} type="button"
                  onMouseDown={e => { e.preventDefault(); onPickSuggestion(userId, s); }}
                  className="w-full text-left px-3 py-2 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 flex items-center gap-2 transition-colors"
                >
                  <Tag size={10} className="text-violet-400" />{s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onAdd(userId)}
          disabled={!input.trim() || loading}
          className="px-3 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 rounded-lg text-[11px] font-black transition-all flex items-center gap-1"
        >
          <Plus size={13} /> เพิ่ม
        </button>
      </div>
    </div>
  );
}

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
  const [activeRole, setActiveRole] = useState<string>('vendor');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Count per role
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length };
    users.forEach(u => {
      const role = u.is_bot ? 'bot' : (u.role || 'customer');
      counts[role] = (counts[role] || 0) + 1;
      // count vendor = has role vendor OR has shop
      if (u.role === 'vendor') {
        counts['vendor'] = (counts['vendor'] || 0);
      }
    });
    // Vendor = users with role==='vendor'
    counts['vendor'] = users.filter(u => u.role === 'vendor').length;
    counts['customer'] = users.filter(u => !u.is_bot && u.role !== 'vendor' && u.role !== 'admin').length;
    counts['admin'] = users.filter(u => u.role === 'admin').length;
    return counts;
  }, [users]);

  const filterTabs = [
    { key: 'vendor', label: 'Vendor', color: 'amber' },
    { key: 'customer', label: 'Customer', color: 'blue' },
    { key: 'admin', label: 'Admin', color: 'purple' },
    { key: 'bot', label: 'Bot', color: 'emerald' },
    { key: 'all', label: 'ทั้งหมด', color: 'slate' },
  ];

  const filteredUsers = useMemo(() => {
    let list = users;
    // Apply role filter
    if (activeRole !== 'all') {
      if (activeRole === 'vendor') list = list.filter(u => u.role === 'vendor');
      else if (activeRole === 'customer') list = list.filter(u => !u.is_bot && u.role !== 'vendor' && u.role !== 'admin');
      else if (activeRole === 'admin') list = list.filter(u => u.role === 'admin');
      else if (activeRole === 'bot') list = list.filter(u => u.is_bot);
    }
    // Apply search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, activeRole, searchTerm]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    setCurrentPage(1);
    setExpandedUser(null);
  };

  const getUserShops = (userId: string) => {
    return shops.filter(shop => shop.owner_id === userId);
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // â”€â”€ Tag System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [userTags, setUserTags] = useState<Record<string, string[]>>({});       // userId -> tags[]
  const [allTags, setAllTags] = useState<string[]>([]);                          // all distinct tags (autocomplete)
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});       // userId -> current input
  const [tagLoading, setTagLoading] = useState<Record<string, boolean>>({});    // userId -> loading
  const [tagSuggestions, setTagSuggestions] = useState<Record<string, string[]>>({});

  // Fetch ALL user_tags on mount — builds userTags map + allTags autocomplete list
  useEffect(() => {
    supabase.from('user_tags').select('user_id, tag').then(({ data }) => {
      if (data) {
        const map: Record<string, string[]> = {};
        const tagSet = new Set<string>();
        data.forEach((r: any) => {
          if (!map[r.user_id]) map[r.user_id] = [];
          map[r.user_id].push(r.tag);
          tagSet.add(r.tag);
        });
        setUserTags(map);
        setAllTags([...tagSet]);
      }
    });
  }, []);

  const fetchTagsForUser = useCallback(async (userId: string) => {
    setTagLoading(p => ({ ...p, [userId]: true }));
    const { data } = await supabase
      .from('user_tags')
      .select('id, tag')
      .eq('user_id', userId)
      .order('created_at');
    setUserTags(p => ({ ...p, [userId]: (data || []).map((r: any) => r.tag) }));
    setTagLoading(p => ({ ...p, [userId]: false }));
  }, []);

  const handleExpandUser = (userId: string) => {
    const next = expandedUser === userId ? null : userId;
    setExpandedUser(next);
    if (next && userTags[next] === undefined) {
      fetchTagsForUser(next);
    }
  };

  const handleAddTag = async (userId: string) => {
    const tag = (tagInputs[userId] || '').trim();
    if (!tag) return;
    if ((userTags[userId] || []).includes(tag)) {
      setTagInputs(p => ({ ...p, [userId]: '' }));
      return;
    }
    setTagLoading(p => ({ ...p, [userId]: true }));
    const { error } = await supabase.from('user_tags').insert({ user_id: userId, tag });
    if (!error) {
      setUserTags(p => ({ ...p, [userId]: [...(p[userId] || []), tag] }));
      setAllTags(p => p.includes(tag) ? p : [...p, tag]);
      setTagInputs(p => ({ ...p, [userId]: '' }));
      setTagSuggestions(p => ({ ...p, [userId]: [] }));
    }
    setTagLoading(p => ({ ...p, [userId]: false }));
  };

  const handleRemoveTag = async (userId: string, tag: string) => {
    await supabase.from('user_tags').delete().eq('user_id', userId).eq('tag', tag);
    setUserTags(p => ({ ...p, [userId]: (p[userId] || []).filter(t => t !== tag) }));
  };

  const handleTagInputChange = (userId: string, val: string) => {
    setTagInputs(p => ({ ...p, [userId]: val }));
    if (val.trim()) {
      const q = val.toLowerCase();
      setTagSuggestions(p => ({
        ...p,
        [userId]: allTags.filter(t => t.toLowerCase().includes(q) && !(userTags[userId] || []).includes(t)),
      }));
    } else {
      setTagSuggestions(p => ({ ...p, [userId]: [] }));
    }
  };

  const handlePickSuggestion = (userId: string, tag: string) => {
    setTagInputs(p => ({ ...p, [userId]: tag }));
    setTagSuggestions(p => ({ ...p, [userId]: [] }));
    setTimeout(async () => {
      if ((userTags[userId] || []).includes(tag)) return;
      setTagLoading(p => ({ ...p, [userId]: true }));
      const { error } = await supabase.from('user_tags').insert({ user_id: userId, tag });
      if (!error) {
        setUserTags(p => ({ ...p, [userId]: [...(p[userId] || []), tag] }));
        setAllTags(p => p.includes(tag) ? p : [...p, tag]);
        setTagInputs(p => ({ ...p, [userId]: '' }));
      }
      setTagLoading(p => ({ ...p, [userId]: false }));
    }, 0);
  };
  const handleTagFocus = (userId: string) => {
    const existing = userTags[userId] || [];
    const available = allTags.filter(t => !existing.includes(t));
    setTagSuggestions(p => ({ ...p, [userId]: available }));
  };


  // â”€â”€ Use expandedUser as the modal trigger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const modalUser = expandedUser
    ? users.find(u => u.id === expandedUser) || null
    : null;

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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin_total')}:</span>
            <span className="text-sm font-black text-primary-500">{filteredUsers.length}</span>
          </div>
        </div>
      </motion.div>

      {/* â”€â”€ Role Filter Tabs â”€â”€ */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map(tab => {
          const isActive = activeRole === tab.key;
          const count = roleCounts[tab.key] ?? 0;
          const colorMap: Record<string, string> = {
            amber: isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 border-amber-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/60',
            blue: isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:border-blue-500/60',
            purple: isActive ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25 border-purple-500' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:border-purple-500/60',
            emerald: isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border-emerald-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60',
            slate: isActive ? 'bg-slate-700 text-white shadow-lg shadow-slate-500/25 border-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400',
          };
          return (
            <button
              key={tab.key}
              onClick={() => handleRoleChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${colorMap[tab.color]} ${tab.key === 'bot' ? 'hidden md:flex' : ''}`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${isActive ? 'bg-white/20' : 'bg-black/8 dark:bg-white/10'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Users List */}
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
                className="px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 transition-all"
                onClick={() => handleExpandUser(user.id)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  {/* Role dot indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                    user.role === 'admin' ? 'bg-purple-500' :
                    user.role === 'vendor' ? 'bg-amber-500' :
                    user.is_bot ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight">
                    {user.full_name || t('admin_unnamed_user')}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                    {user.email || '—'}
                  </p>
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {/* Tags first */}
                    {(userTags[user.id] || []).map(tag => (
                      <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                        <Tag size={6} />{tag}
                      </span>
                    ))}
                    {/* Role */}
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${
                      user.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {user.role || 'user'}
                    </span>
                    {/* Vendor */}
                    {(user.role === 'vendor' || getUserShops(user.id).length > 0) && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Store size={6} />Vendor
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronUp size={14} className="text-slate-300 dark:text-slate-600 rotate-90 flex-shrink-0" />
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
                  <motion.tr
                    key={user.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleExpandUser(user.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                          <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.full_name || t('admin_unnamed_user')}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email || '-'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(userTags[user.id] || []).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center gap-0.5">
                            <Tag size={7} /> {tag}
                          </span>
                        ))}
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {user.role || 'user'}
                        </span>
                        {(user.role === 'vendor' || getUserShops(user.id).length > 0) && (
                          <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                            <Store size={8} /> Vendor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(user.updated_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectUser(user.id); }}
                          className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                          title={t('admin_manage_user')}
                        >
                          <Settings size={18} />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
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

      {/* â”€â”€ User Detail Modal â”€â”€ */}
      <AnimatePresence>
        {modalUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedUser(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[88vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <img src={modalUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(modalUser.full_name || 'U')}&background=random`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{modalUser.full_name || t('admin_unnamed_user')}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{modalUser.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${modalUser.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{modalUser.role || 'user'}</span>
                    {(modalUser.role === 'vendor' || getUserShops(modalUser.id).length > 0) && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1"><Store size={9} /> Vendor</span>
                    )}
                    {(userTags[modalUser.id] || []).map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center gap-0.5"><Tag size={8} /> {tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { onSelectUser(modalUser.id); setExpandedUser(null); }}
                    className="p-2.5 bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl transition-all"
                    title={t('admin_manage_user')}
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => setExpandedUser(null)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Admin Tags — first */}
                <TagPanel
                  userId={modalUser.id}
                  tags={userTags[modalUser.id] || []}
                  loading={!!tagLoading[modalUser.id]}
                  input={tagInputs[modalUser.id] || ''}
                  suggestions={tagSuggestions[modalUser.id] || []}
                  onAdd={handleAddTag}
                  onRemove={handleRemoveTag}
                  onInputChange={handleTagInputChange}
                  onPickSuggestion={handlePickSuggestion}
                  onFocus={handleTagFocus}
                />

                {/* Shops — below tags */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg"><Store size={14} /></div>
                    <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('admin_user_shops')}</p>
                  </div>
                  {getUserShops(modalUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getUserShops(modalUser.id).map(shop => (
                        <Link
                          key={shop.id}
                          to={`/shop/${shop.id}`}
                          target="_blank"
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-transparent hover:border-primary-500 transition-all"
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={shop.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=random`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate flex-1">{shop.name}</p>
                          <ChevronUp size={14} className="text-slate-300 rotate-90 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic py-3 text-center">{t('admin_no_shops')}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
