import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Star, Tag, Zap, Award, MessageCircle } from 'lucide-react';

export const BadgesRegistry: ComponentItem[] = [
  {
    id: 'badge-order-status-row',
    label: 'All Order Statuses',
    category: 'Badges',
    description: 'ป้ายสถานะคำสั่งซื้อทั้งหมด',
    preview: (
      <div className="flex flex-wrap gap-2 w-80">
        {[
          { label: 'Pending', icon: <Clock size={10} />, bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400' },
          { label: 'Processing', icon: <RefreshCw size={10} className="animate-spin-slow" />, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
          { label: 'Shipped', icon: <Truck size={10} />, bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-400' },
          { label: 'Delivered', icon: <CheckCircle size={10} />, bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400' },
          { label: 'Cancelled', icon: <XCircle size={10} />, bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400' },
          { label: 'Refunded', icon: <AlertCircle size={10} />, bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300' },
        ].map(s => (
          <span key={s.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
            {s.icon} {s.label}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: 'badge-product-tags',
    label: 'Product Feature Tags',
    category: 'Badges',
    description: 'ป้ายแท็กคุณสมบัติสินค้า',
    preview: (
      <div className="flex gap-2">
        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-sm shadow-red-500/30"><Zap size={8} className="fill-white"/> Hot</span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-violet-600 to-primary-500 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-sm"><Award size={8}/> Official</span>
        <span className="flex items-center gap-1 px-2 py-0.5 border border-primary-500 text-primary-500 text-[8px] font-black rounded uppercase tracking-widest"><Tag size={8}/> 20% OFF</span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold rounded">Free Shipping</span>
      </div>
    ),
  },
  {
    id: 'badge-rating',
    label: 'Rating Badges',
    category: 'Badges',
    description: 'ป้ายคะแนนรีวิวแบบต่างๆ',
    preview: (
      <div className="flex gap-3 items-center">
        <span className="flex items-center gap-1 bg-yellow-400 text-yellow-950 px-2 py-1 rounded-lg text-[10px] font-black"><Star size={10} className="fill-yellow-950"/> 4.8</span>
        <span className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300"><Star size={10} className="text-yellow-400 fill-yellow-400"/> 4.5 (2.4k)</span>
      </div>
    ),
  },
  {
    id: 'badge-notification',
    label: 'Notification Dot/Pill',
    category: 'Badges',
    description: 'ป้ายแจ้งเตือน (จุด / ตัวเลข)',
    preview: (
      <div className="flex gap-4 items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-fit">
        <div className="relative">
          <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center"><Package size={14} className="text-slate-500"/></div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full" />
        </div>
        <div className="relative">
          <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center"><Truck size={14} className="text-slate-500"/></div>
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary-500 text-white text-[8px] font-black flex items-center justify-center rounded-full px-1 border-2 border-white dark:border-slate-800 shadow-sm shadow-primary-500/40">3</span>
        </div>
        <div className="relative">
          <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center"><MessageCircle size={14} className="text-slate-500"/></div>
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full px-1 border-2 border-white dark:border-slate-800 shadow-sm shadow-red-500/40">99+</span>
        </div>
      </div>
    ),
  },
];
