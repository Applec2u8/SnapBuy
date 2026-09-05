import React, { useEffect, useState } from 'react';
import {
  Phone,
  Mail,
  Globe,
  MessageCircle,
  MessageSquare,
  Headphones,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { motion } from 'framer-motion';

interface SupportChannel {
  id: string;
  channel_type: string;
  label: string;
  value: string;
  sort_order: number;
}

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'phone': return <Phone size={20} />;
    case 'whatsapp': return <MessageCircle size={20} />;
    case 'line': return <MessageSquare size={20} />;
    case 'email': return <Mail size={20} />;
    case 'website': return <Globe size={20} />;
    case 'facebook': return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
    case 'instagram': return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
    default: return <Globe size={20} />;
  }
};

const getChannelColor = (type: string) => {
  switch (type) {
    case 'phone': return { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20', glow: 'hover:shadow-green-500/10' };
    case 'facebook': return { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', glow: 'hover:shadow-blue-500/10' };
    case 'whatsapp': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', glow: 'hover:shadow-emerald-500/10' };
    case 'line': return { bg: 'bg-lime-500/10', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-500/20', glow: 'hover:shadow-lime-500/10' };
    case 'email': return { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20', glow: 'hover:shadow-orange-500/10' };
    case 'instagram': return { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20', glow: 'hover:shadow-pink-500/10' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', glow: 'hover:shadow-slate-500/10' };
  }
};

const buildHref = (channel: SupportChannel): string => {
  let href = channel.value;
  if (channel.channel_type === 'phone' && !href.startsWith('tel:')) return `tel:${href}`;
  if (channel.channel_type === 'email' && !href.startsWith('mailto:')) return `mailto:${href}`;
  if (channel.channel_type === 'line' && !href.startsWith('http')) return `https://line.me/R/ti/p/${href.replace('@', '')}`;
  if (!href.startsWith('http') && !href.startsWith('tel:') && !href.startsWith('mailto:')) return `https://${href}`;
  return href;
};

export const ShopContactSection: React.FC = () => {
  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('support_channels')
          .select('*')
          .eq('is_enabled', true)
          .order('sort_order', { ascending: true });
        if (error) throw error;
        setChannels(data || []);
      } catch (err) {
        // Silently fail — contact section is not critical
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading || channels.length === 0) return null;

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
          <Headphones size={22} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Contact Support
          </h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
            Reach us anytime
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
            {channels.length} Channels Available
          </span>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel, i) => {
          const color = getChannelColor(channel.channel_type);
          const href = buildHref(channel);
          const isExternal = href.startsWith('http');

          return (
            <motion.a
              key={channel.id}
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`group flex items-center gap-5 p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-sm ${color.border} ${color.glow}`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${color.bg} ${color.text}`}>
                {getChannelIcon(channel.channel_type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color.text}`}>
                  {channel.channel_type.toUpperCase()}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-primary-500 transition-colors">
                  {channel.label}
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 truncate">
                  {channel.value}
                </p>
              </div>

              {/* Arrow */}
              <div className={`flex-shrink-0 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ${color.text}`}>
                <ExternalLink size={16} />
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
};
