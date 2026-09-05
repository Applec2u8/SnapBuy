import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { ArrowRight, Zap, Gift, Timer, Percent, Store } from 'lucide-react';

export const BannersRegistry: ComponentItem[] = [
  {
    id: 'banner-hero',
    label: 'Hero Banner',
    category: 'Banners',
    description: 'แบนเนอร์หลักหน้าแรก ขนาดใหญ่',
    preview: (
      <div className="w-[400px] h-48 rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white p-6 relative overflow-hidden flex flex-col justify-center">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute right-8 bottom-4 text-white/20">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.5l7 14H5l7-14z"/></svg>
        </div>
        <div className="relative z-10 max-w-[60%] space-y-2">
          <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-widest text-primary-100">New Collection</span>
          <h2 className="text-xl font-black leading-tight">Summer<br/>Vibes 2024</h2>
          <p className="text-[9px] text-primary-100 mb-3">Up to 50% off on selected items.</p>
          <button className="bg-white text-primary-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-1.5 w-fit">
            Shop Now <ArrowRight size={10} />
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'banner-flash-sale',
    label: 'Flash Sale Banner',
    category: 'Banners',
    description: 'แบนเนอร์ Flash Sale มีเวลานับถอยหลัง',
    preview: (
      <div className="w-[400px] rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 relative overflow-hidden flex items-center justify-between shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjIiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Zap size={24} className="fill-yellow-300 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5">Flash Sale <span className="bg-white text-red-600 text-[8px] px-1.5 py-0.5 rounded font-black">LIVE</span></h3>
            <p className="text-[10px] text-white/80">Hurry up! Limited time offer.</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-white/80 flex items-center gap-1"><Timer size={10}/> Ends in</span>
          <div className="flex gap-1">
            {['02','45','12'].map((t,i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded text-xs font-black w-7 h-7 flex items-center justify-center shadow-inner">{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'banner-promo-strip',
    label: 'Promo Strip Banner',
    category: 'Banners',
    description: 'แถบโปรโมชั่นแนวยาวขนาดเล็ก',
    preview: (
      <div className="w-full max-w-[400px] h-10 bg-gradient-to-r from-violet-600 to-primary-500 rounded-xl flex items-center justify-between px-4 text-white text-[10px]">
        <div className="flex items-center gap-2">
          <Gift size={14} className="animate-bounce" />
          <span className="font-bold">Free Shipping on orders over $50</span>
        </div>
        <div className="flex items-center gap-1 font-black underline cursor-pointer hover:text-primary-100">
          Learn More <ArrowRight size={10} />
        </div>
      </div>
    ),
  },
  {
    id: 'banner-seller-center',
    label: 'Seller Center Banner',
    category: 'Banners',
    description: 'แบนเนอร์ชวนเปิดร้าน',
    preview: (
      <div className="w-[400px] bg-slate-900 rounded-2xl p-5 relative overflow-hidden flex items-center border border-slate-800 shadow-xl">
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary-500/20 rounded-full blur-xl" />
        <div className="relative z-10 flex-1">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
            <Store className="text-primary-400" size={16} /> Open Your Shop Today
          </h3>
          <p className="text-[10px] text-slate-400 max-w-[80%] mb-3">Join thousands of sellers and reach millions of customers. 0% commission for first 3 months.</p>
          <button className="bg-primary-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors">
            Start Selling
          </button>
        </div>
      </div>
    ),
  },
];
