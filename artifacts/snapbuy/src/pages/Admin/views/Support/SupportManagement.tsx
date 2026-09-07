import React, { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  Mail,
  Globe,
  MessageCircle,
  MessageSquare,
  Loader2,
  Pencil,
  X,
  ToggleLeft,
  ToggleRight,
  Headphones,
  Save,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';

interface SupportChannel {
  id: string;
  channel_type: string;
  label: string;
  value: string;
  is_enabled: boolean;
  icon: string;
  sort_order: number;
}

const channelIcons: Record<string, React.ReactNode> = {
  phone: <Phone size={18} />,
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  whatsapp: <MessageCircle size={18} />,
  line: <MessageSquare size={18} />,
  email: <Mail size={18} />,
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  website: <Globe size={18} />,
};

const channelColors: Record<string, string> = {
  phone:     'bg-green-500/10 text-green-600 dark:text-green-400',
  facebook:  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  whatsapp:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  line:      'bg-lime-500/10 text-lime-600 dark:text-lime-400',
  email:     'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  instagram: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  website:   'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

const channelPlaceholders: Record<string, string> = {
  phone:     'e.g. +66 81 234 5678',
  facebook:  'e.g. https://facebook.com/yourpage',
  whatsapp:  'e.g. +66 81 234 5678',
  line:      'e.g. @yourlineid',
  email:     'e.g. support@yourstore.com',
  instagram: 'e.g. @yourinstagram',
  website:   'e.g. https://yourwebsite.com',
};

interface ChannelRowProps {
  channel: SupportChannel;
  onSave: (id: string, label: string, value: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
}

const ChannelRow: React.FC<ChannelRowProps> = ({ channel, onSave, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(channel.label);
  const [editValue, setEditValue] = useState(channel.value);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(channel.id, editLabel, editValue);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(channel.label);
    setEditValue(channel.value);
    setIsEditing(false);
  };

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggle(channel.id, !channel.is_enabled);
    setIsToggling(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
        channel.is_enabled
          ? 'border-primary-200 dark:border-primary-500/20 shadow-sm shadow-primary-500/5'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-5 flex items-start gap-4">
        {/* Drag Handle (visual only) */}
        <div className="text-slate-300 dark:text-slate-700 pt-1 cursor-grab">
          <GripVertical size={16} />
        </div>

        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${channelColors[channel.channel_type] || channelColors['website']}`}>
          {channelIcons[channel.channel_type] || <Globe size={18} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Channel Label</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                  Contact Value
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={channelPlaceholders[channel.channel_type]}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">{channel.label}</p>
              <p className={`text-xs mt-0.5 truncate ${channel.value ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600 italic'}`}>
                {channel.value || 'Not configured — click Edit to add'}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-actions"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5"
              >
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all disabled:opacity-60 shadow-sm shadow-primary-500/30"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="view-actions"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5"
              >
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 transition-all"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
              channel.is_enabled
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20 hover:bg-primary-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={channel.is_enabled ? 'Disable' : 'Enable'}
          >
            {isToggling ? (
              <Loader2 size={13} className="animate-spin" />
            ) : channel.is_enabled ? (
              <ToggleRight size={16} />
            ) : (
              <ToggleLeft size={16} />
            )}
            {channel.is_enabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className={`h-1 w-full transition-all duration-500 ${channel.is_enabled ? 'bg-primary-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
    </motion.div>
  );
};

export const SupportManagement: React.FC = () => {
  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_channels')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      toast.error('Failed to load support channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleSave = async (id: string, label: string, value: string) => {
    try {
      const { error } = await supabase
        .from('support_channels')
        .update({ label, value })
        .eq('id', id);
      if (error) throw error;
      setChannels(prev => prev.map(c => c.id === id ? { ...c, label, value } : c));
      toast.success('Channel updated successfully');
    } catch {
      toast.error('Failed to update channel');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('support_channels')
        .update({ is_enabled: enabled })
        .eq('id', id);
      if (error) throw error;
      setChannels(prev => prev.map(c => c.id === id ? { ...c, is_enabled: enabled } : c));
      toast.success(enabled ? 'Channel enabled' : 'Channel disabled');
    } catch {
      toast.error('Failed to update channel status');
    }
  };

  const enabledCount = channels.filter(c => c.is_enabled).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <Headphones size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Support Channels
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {enabledCount} of {channels.length} channels enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${enabledCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {enabledCount > 0 ? 'Live' : 'All Hidden'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-black text-white">i</span>
        </div>
        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
          Channel information configured here is displayed on all shop pages. Click <strong>Edit</strong> to update a channel's label or contact value, then click <strong>Save</strong>. Use the <strong>On/Off toggle</strong> to control visibility without deleting any data.
        </p>
      </div>

      {/* Channels List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {channels.map((channel) => (
              <ChannelRow
                key={channel.id}
                channel={channel}
                onSave={handleSave}
                onToggle={handleToggle}
              />
            ))}
          </AnimatePresence>

          {channels.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Headphones size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-bold">No support channels found.</p>
              <p className="text-xs mt-1">Run the database migration to seed default channels.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
