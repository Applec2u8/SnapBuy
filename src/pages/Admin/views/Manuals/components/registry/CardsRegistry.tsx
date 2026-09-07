import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { ShoppingBag, Star, Plus, CheckCircle, Package, Store, Truck, ShieldCheck, Zap, Headphones, Wallet, Box, Users, Settings, LogOut, ArrowRight, DollarSign, ArrowUpRight, Clock } from 'lucide-react';

export const CardsRegistry: ComponentItem[] = [
  {
    id: 'card-product',
    label: 'Product Card',
    category: 'Cards',
    description: 'การ์ดสินค้า แนวตั้ง',
    preview: (
      <div className="w-44 bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">-45%</div>
        <div className="aspect-square rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 mb-2.5 flex items-center justify-center">
          <ShoppingBag size={32} className="text-primary-400" />
        </div>
        <div className="space-y-1 px-0.5">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SnapStore</p>
          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Premium Sneakers</p>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={8} className={i<=4?'fill-yellow-400 text-yellow-400':'fill-slate-200 text-slate-200'} />)}
            <span className="text-[8px] text-slate-400">(128)</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-primary-500">$55</span>
            <span className="text-[9px] font-bold text-slate-300 line-through">$100</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-product-list',
    label: 'Product Card (List)',
    category: 'Cards',
    description: 'สินค้าในมุมมอง List แนวนอน',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-3">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-bl-lg">-45%</div>
          <ShoppingBag size={24} className="text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SnapStore</p>
          <p className="text-xs font-black text-slate-900 dark:text-white truncate">Premium Running Sneakers</p>
          <div className="flex items-center gap-1 my-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={9} className={i<=4?'fill-yellow-400 text-yellow-400':'fill-slate-200 text-slate-200'} />)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-primary-500">$55</span>
              <span className="text-[9px] text-slate-400 line-through">$100</span>
            </div>
            <button className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/30">
              <Plus size={12} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-order',
    label: 'Order Card',
    category: 'Cards',
    description: 'การ์ดคำสั่งซื้อพร้อมสถานะ',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
            <p className="text-xs font-black text-slate-900 dark:text-white">#SB-00123</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[9px] font-black rounded-full">
            <CheckCircle size={9} /> Delivered
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
            <Package size={20} className="text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 dark:text-white truncate">Premium Sneakers × 2</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Estimated: 3–5 business days</p>
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white flex-shrink-0">$110</span>
        </div>
        <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button className="flex-1 py-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-black hover:bg-primary-500/20">Track</button>
          <button className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700">Reorder</button>
        </div>
      </div>
    ),
  },
  {
    id: 'card-shop',
    label: 'Shop / Vendor Card',
    category: 'Cards',
    description: 'การ์ดร้านค้าพร้อม Rating',
    preview: (
      <div className="w-64 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="h-20 bg-gradient-to-br from-primary-600 to-primary-400 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Store size={48} className="text-white" />
          </div>
        </div>
        <div className="px-4 pb-4 -mt-6">
          <div className="flex justify-between items-end mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center">
              <Store size={20} className="text-primary-500" />
            </div>
            <button className="px-3 py-1 bg-primary-500 text-white text-[9px] font-black rounded-lg uppercase shadow-sm">Visit Shop</button>
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white">SnapStore Official</p>
          <div className="flex items-center gap-1 mt-0.5">
            {[1,2,3,4,5].map(i=><Star key={i} size={9} className="fill-yellow-400 text-yellow-400"/>)}
            <span className="text-[9px] text-slate-400 ml-0.5">5.0 · 2.4k reviews</span>
          </div>
          <div className="flex gap-3 mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="text-center flex-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">1.2k</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Products</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">98%</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Positive</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">2 Hrs</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Resp. Time</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-trust',
    label: 'Trust Badge Cards (Grid)',
    category: 'Cards',
    description: 'การ์ดความน่าเชื่อถือแบบตาราง',
    preview: (
      <div className="grid grid-cols-2 gap-2 w-72">
        {[
          { icon: <Truck size={16} />, color: 'text-primary-500', bg: 'bg-primary-500/10', title: 'Fast Delivery', desc: 'Within 24 hours' },
          { icon: <ShieldCheck size={16} />, color: 'text-green-500', bg: 'bg-green-500/10', title: 'Secure Pay', desc: '100% encrypted' },
          { icon: <Zap size={16} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', title: 'Authentic', desc: 'Verified products' },
          { icon: <Headphones size={16} />, color: 'text-violet-500', bg: 'bg-violet-500/10', title: '24/7 Support', desc: 'Always available' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${item.bg} ${item.color}`}>{item.icon}</div>
            <p className="font-black text-[9px] text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</p>
            <p className="text-[8px] text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'card-review',
    label: 'Customer Review Card',
    category: 'Cards',
    description: 'การ์ดรีวิวสินค้าจากลูกค้า',
    preview: (
      <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-xs">A</div>
            <div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white flex items-center gap-1">
                Alex M. <span className="text-[8px] bg-green-100 text-green-600 px-1 py-0.5 rounded uppercase font-bold">Verified</span>
              </p>
              <div className="flex mt-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={8} className="fill-yellow-400 text-yellow-400"/>)}</div>
            </div>
          </div>
          <span className="text-[9px] text-slate-400">2 days ago</span>
        </div>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          "Amazing quality! The sneakers fit perfectly and look exactly like in the photos. Delivery was super fast too. Will definitely buy again! 🎉"
        </p>
        <div className="flex gap-1.5 mt-2">
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center"><ShoppingBag size={12} className="text-slate-400"/></div>
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center"><ShoppingBag size={12} className="text-slate-400"/></div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-wallet',
    label: 'Wallet / Balance Card',
    category: 'Cards',
    description: 'การ์ดแสดงยอดเงิน Wallet',
    preview: (
      <div className="w-72 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xl border border-slate-700/50">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-500/30 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-primary-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">My Wallet</span>
          </div>
          <span className="text-[8px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-600">SnapPay</span>
        </div>
        <div className="relative z-10">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white">$1,250.00</p>
            <span className="text-[10px] font-bold text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">+5%</span>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 mt-4">
          <button className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-[9px] font-black uppercase tracking-wider hover:bg-primary-600">Top Up</button>
          <button className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] font-black uppercase tracking-wider transition-colors">Withdraw</button>
        </div>
      </div>
    ),
  },
];
