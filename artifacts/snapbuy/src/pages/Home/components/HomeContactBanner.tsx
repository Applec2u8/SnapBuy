import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Phone, Mail, Globe, MessageCircle, MessageSquare, Headphones, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SupportChannel {
  id: string;
  channel_type: string;
  label: string;
  value: string;
}

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'phone': return <Phone size={16} />;
    case 'whatsapp': return <MessageCircle size={16} />;
    case 'line': return <MessageSquare size={16} />;
    case 'email': return <Mail size={16} />;
    case 'website': return <Globe size={16} />;
    case 'facebook': return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
    case 'instagram': return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
    default: return <Globe size={16} />;
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

export const HomeContactBanner: React.FC = () => {
  const [channels, setChannels] = useState<SupportChannel[]>([]);

  useEffect(() => {
    supabase
      .from('support_channels')
      .select('id, channel_type, label, value')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
      .limit(5)
      .then(({ data }) => { if (data) setChannels(data); });
  }, []);

  return (
    <section className="max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl px-6 sm:px-12 py-10 sm:py-14">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: heading */}
          <div className="space-y-3 max-w-md">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 px-3 py-1.5 rounded-full">
              <Headphones size={13} className="text-primary-400" />
              <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Customer Support</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
              Need Help?<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                We're Here For You
              </span>
            </h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Our support team is available around the clock. Reach out through any of the channels below.
            </p>
          </div>

          {/* Right: channels or CTA */}
          <div className="flex-1 w-full lg:max-w-lg">
            {channels.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {channels.map((ch, i) => {
                  const href = buildHref(ch);
                  const isExternal = href.startsWith('http');
                  return (
                    <motion.a
                      key={ch.id}
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all group"
                    >
                      <span className="text-white/60 group-hover:text-primary-400 transition-colors">
                        {getChannelIcon(ch.channel_type)}
                      </span>
                      <div className="text-left">
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{ch.channel_type}</p>
                        <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{ch.label}</p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            ) : (
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-0.5"
              >
                Explore Shops <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
