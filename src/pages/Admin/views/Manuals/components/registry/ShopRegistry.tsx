import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import {
  Home, Trash2, Minus, Plus, ExternalLink, Star, ShoppingBag,
  Heart, MapPin, Phone, Mail, Wifi, Sparkles, ArrowRight, Play,
  CheckCircle2, Clock, Truck, Package, Shield, CreditCard,
  Eye, MessageCircle, Share2, Filter, Grid, List, Search,
  ChevronRight, User, Camera, Edit2, AlertTriangle, X, Store,
  Layers, Tag, TrendingUp, BarChart2, DollarSign, RefreshCw,
  Upload, Gift, Lock, Settings, LogOut, Bell, Zap, Award
} from 'lucide-react';

export const ShopRegistry: ComponentItem[] = [
  // ─── ADDRESS BOOK ───────────────────────────────────────────────────────────
  {
    id: 'card-address-default',
    label: 'Address Card (Default)',
    category: 'Cards',
    description: 'การ์ดที่อยู่จัดส่ง — แสดง Default badge',
    preview: (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-left w-[340px] relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Default</div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 flex-shrink-0">
            <Home size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">Somchai Jaidee</h3>
            <p className="text-[10px] font-medium text-primary-500 mt-0.5">+66 81-234-5678</p>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed line-clamp-2">123 Sukhumvit Road, Khlong Toei, Bangkok 10110</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex-1 text-[10px] font-bold py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">Edit</button>
          <button className="flex-1 text-[10px] font-bold py-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-100">Delete</button>
        </div>
      </div>
    ),
  },
  {
    id: 'card-address-normal',
    label: 'Address Card (Normal)',
    category: 'Cards',
    description: 'การ์ดที่อยู่จัดส่ง — มีปุ่ม Set as Default',
    preview: (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-left w-[340px]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
            <Home size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Office Address</h3>
            <p className="text-[10px] font-medium text-primary-500 mt-0.5">+66 89-876-5432</p>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">456 Silom Complex, Silom, Bangkok 10500</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex-1 text-[10px] font-bold py-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-900 dark:text-white">Edit</button>
          <button className="flex-1 text-[10px] font-bold py-2 text-primary-500 hover:bg-primary-500/5 rounded-xl border border-primary-500/10">Default</button>
          <button className="flex-1 text-[10px] font-bold py-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-100">Delete</button>
        </div>
      </div>
    ),
  },

  // ─── CART ────────────────────────────────────────────────────────────────────
  {
    id: 'card-cart-item',
    label: 'Cart Item Card',
    category: 'Cards',
    description: 'รายการสินค้าในตะกร้า พร้อม Checkbox, ปรับจำนวน, และราคา',
    preview: (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-primary-500 shadow-xl shadow-primary-500/10 flex gap-4 text-left w-[420px]">
        <div className="absolute top-4 left-4 z-20 w-4 h-4 rounded bg-primary-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-sm" />
        </div>
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 flex-shrink-0">
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 ml-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase">Premium Watch Black</h3>
              <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest mt-1">Black / 42mm</p>
            </div>
            <button className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-all">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
              <button className="p-1.5 rounded-lg text-slate-900 dark:text-white"><Minus size={12} /></button>
              <span className="w-8 text-center font-black text-xs text-slate-900 dark:text-white">2</span>
              <button className="p-1.5 rounded-lg text-slate-900 dark:text-white"><Plus size={12} /></button>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold mb-1">$299.00</p>
              <p className="text-sm font-black text-primary-500">$598.00</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-order-summary',
    label: 'Order Summary Card',
    category: 'Cards',
    description: 'สรุปคำสั่งซื้อ — ยอดรวม, ค่าส่ง, ส่วนลด, และปุ่ม Checkout',
    preview: (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-left w-[280px] space-y-4">
        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Summary</h3>
        <div className="space-y-3">
          {[
            { label: 'Subtotal (3 items)', val: '$897.00' },
            { label: 'Shipping', val: '$5.99' },
            { label: 'Discount', val: '-$50.00' },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-xs">
              <span className="text-slate-500">{r.label}</span>
              <span className={`font-bold ${r.label === 'Discount' ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>{r.val}</span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-sm font-black text-slate-900 dark:text-white">Total</span>
          <span className="text-xl font-black text-primary-500">$852.99</span>
        </div>
        <button className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20">
          Checkout Now →
        </button>
      </div>
    ),
  },

  // ─── ORDERS ─────────────────────────────────────────────────────────────────
  {
    id: 'card-order-item',
    label: 'Order Card',
    category: 'Cards',
    description: 'การ์ดคำสั่งซื้อ — สถานะ, สินค้า, ยอดรวม, ปุ่ม Receipt',
    preview: (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm text-left w-[480px]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
              <CheckCircle2 size={9} /> Delivered
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Order: #a1b2c3d4</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">25 Jul 2025</span>
        </div>
        <div className="p-4 flex gap-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1 py-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Premium Watch Black Edition</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase">Quantity: x1</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">$299.00</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total:</span>
            <span className="text-xl font-black text-primary-500">$299.00</span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5">
              <ExternalLink size={12} /> Receipt
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase">
              Buy Again
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-empty-orders',
    label: 'Empty Orders State',
    category: 'Cards',
    description: 'หน้าว่างเมื่อไม่มีคำสั่งซื้อ',
    preview: (
      <div className="flex flex-col items-center justify-center py-16 text-center w-[300px]">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
          <Package size={32} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">No Orders Yet</h3>
        <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-6">Start shopping and your orders will appear here</p>
        <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20">
          <ShoppingBag size={14} /> Shop Now
        </button>
      </div>
    ),
  },

  // ─── PAYMENT METHODS ─────────────────────────────────────────────────────────
  {
    id: 'card-credit-card-visa',
    label: 'Credit Card (Visa)',
    category: 'Cards',
    description: 'การ์ดบัตรเครดิต Visa — ดีไซน์สามมิติระดับ Premium',
    preview: (
      <div className="relative w-[320px] rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] overflow-hidden shadow-2xl" style={{ aspectRatio: '1.586 / 1' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full border border-white/20">✦ Default</span>
        </div>
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 grid grid-cols-3 gap-[1px] p-0.5">
              {[...Array(9)].map((_, i) => <div key={i} className="bg-yellow-600/40 rounded-[1px]" />)}
            </div>
            <div className="flex items-center gap-2">
              <Wifi size={12} className="text-white/40 rotate-90" />
              <span className="font-black text-white text-xl italic" style={{ fontFamily: 'serif' }}>VISA</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[0, 1, 2].map(g => (
              <div key={g} className="flex items-center gap-1">
                {[0, 1, 2, 3].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/60" />)}
              </div>
            ))}
            <span className="text-white font-mono text-base font-bold tracking-[0.25em]">4242</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] mb-0.5">Cardholder</p>
              <p className="text-white font-bold text-xs uppercase tracking-widest">JOHN DOE</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] mb-0.5">Expires</p>
              <p className="text-white font-mono text-xs tracking-widest">••/••</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-cod',
    label: 'Cash on Delivery Card',
    category: 'Cards',
    description: 'การ์ดชำระเงินปลายทาง (COD)',
    preview: (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-5 shadow-lg shadow-primary-500/5 w-[360px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">💵</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cash on Delivery</h3>
          <p className="text-[10px] font-black text-primary-500 mt-0.5 uppercase tracking-[0.2em]">Pay when you receive</p>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Cash on delivery. No card required.</p>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-full border border-primary-500/30 flex-shrink-0">Default</span>
      </div>
    ),
  },

  // ─── HOME PAGE ───────────────────────────────────────────────────────────────
  {
    id: 'section-hero',
    label: 'Hero Banner Section',
    category: 'Banners',
    description: 'Hero banner หน้าแรก — gradient overlay, headline, CTA buttons',
    preview: (
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 w-[500px]">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary-500/20 rounded-full blur-[60px] z-10 pointer-events-none" />
        <div className="relative z-20 h-full flex flex-col justify-center px-8 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-widest w-fit">
            <Sparkles size={9} className="text-yellow-400" /> Trending Summer Collection
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">
            Unleash Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 italic">Style</span>
          </h1>
          <div className="flex gap-2 pt-1">
            <button className="inline-flex bg-primary-500 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest items-center gap-1.5 text-[10px] shadow-xl shadow-primary-500/30">
              <ShoppingBag size={12} /> Shop Now <ArrowRight size={12} />
            </button>
            <button className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest items-center gap-1.5 text-[10px]">
              <Play size={10} className="fill-white" /> Browse Shops
            </button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'card-flash-sale',
    label: 'Flash Sale Banner',
    category: 'Banners',
    description: 'แบนเนอร์ Flash Sale พร้อม Countdown Timer',
    preview: (
      <div className="w-[480px] rounded-2xl overflow-hidden shadow-xl text-left">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">⚡</div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs">Flash Sale</h3>
              <p className="text-white/70 text-[9px] font-bold">Limited time deals</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest mr-1">Ends in</span>
            {['02', '14', '35'].map((v, i) => (
              <React.Fragment key={i}>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white font-black text-xs">{v}</div>
                {i < 2 && <span className="text-white/60 font-black text-xs">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0 bg-white dark:bg-slate-900 p-4 gap-3">
          {[
            { name: 'AirPods Pro', price: '$199', original: '$249', off: '20%', img: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=120&h=120&fit=crop' },
            { name: 'Smart Watch', price: '$249', original: '$399', off: '38%', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop' },
            { name: 'Sneakers', price: '$89', original: '$150', off: '41%', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop' },
          ].map(p => (
            <div key={p.name} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-center border border-slate-100 dark:border-slate-700">
              <div className="relative mb-2">
                <img src={p.img} className="w-full h-16 object-cover rounded-lg" alt="" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">-{p.off}</span>
              </div>
              <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300 truncate">{p.name}</p>
              <p className="text-xs font-black text-primary-500">{p.price}</p>
              <p className="text-[7px] text-slate-400 line-through">{p.original}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'section-trust-badges',
    label: 'Trust Badges Row',
    category: 'Banners',
    description: 'แถวไอคอน Trust — ส่งฟรี, รับประกัน, ความปลอดภัย',
    preview: (
      <div className="grid grid-cols-4 gap-4 w-[480px]">
        {[
          { icon: <Truck size={20} className="text-primary-500" />, title: 'Free Shipping', sub: 'On orders over $50' },
          { icon: <RefreshCw size={20} className="text-green-500" />, title: 'Easy Returns', sub: '30-day policy' },
          { icon: <Shield size={20} className="text-blue-500" />, title: 'Secure Pay', sub: 'SSL encrypted' },
          { icon: <Award size={20} className="text-amber-500" />, title: 'Premium Quality', sub: 'Certified products' },
        ].map(b => (
          <div key={b.title} className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-2">{b.icon}</div>
            <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{b.title}</p>
            <p className="text-[8px] text-slate-400 mt-0.5">{b.sub}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'section-category-grid',
    label: 'Category Grid',
    category: 'Navigation',
    description: 'Grid หมวดหมู่สินค้าบนหน้าแรก',
    preview: (
      <div className="grid grid-cols-4 gap-3 w-[480px]">
        {[
          { name: 'Electronics', emoji: '📱', color: 'bg-blue-500/10 text-blue-600' },
          { name: 'Fashion', emoji: '👗', color: 'bg-purple-500/10 text-purple-600' },
          { name: 'Home & Garden', emoji: '🏡', color: 'bg-green-500/10 text-green-600' },
          { name: 'Sports', emoji: '⚽', color: 'bg-orange-500/10 text-orange-600' },
          { name: 'Beauty', emoji: '💄', color: 'bg-pink-500/10 text-pink-600' },
          { name: 'Books', emoji: '📚', color: 'bg-amber-500/10 text-amber-600' },
          { name: 'Toys', emoji: '🧸', color: 'bg-cyan-500/10 text-cyan-600' },
          { name: 'Food', emoji: '🍜', color: 'bg-red-500/10 text-red-600' },
        ].map(c => (
          <button key={c.name} className={`flex flex-col items-center py-4 px-2 ${c.color} rounded-2xl gap-2 hover:scale-105 transition-transform`}>
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-[9px] font-black uppercase tracking-tight text-center leading-tight">{c.name}</span>
          </button>
        ))}
      </div>
    ),
  },

  // ─── SHOP / PRODUCT ──────────────────────────────────────────────────────────
  {
    id: 'card-product-grid',
    label: 'Product Grid Card',
    category: 'Cards',
    description: 'การ์ดสินค้าในหน้า Shop — รูป, ชื่อ, ราคา, ปุ่มเพิ่มตะกร้า',
    preview: (
      <div className="grid grid-cols-3 gap-3 w-[480px]">
        {[
          { name: 'Wireless Headphones', price: '$89', stars: 4.8, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', badge: 'HOT' },
          { name: 'Smart Watch Pro', price: '$249', stars: 4.9, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', badge: 'NEW' },
          { name: 'Running Shoes', price: '$149', stars: 4.7, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop', badge: null },
        ].map(p => (
          <div key={p.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              <img src={p.img} className="w-full h-28 object-cover" alt="" />
              {p.badge && (
                <span className={`absolute top-2 left-2 text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${p.badge === 'HOT' ? 'bg-red-500 text-white' : 'bg-primary-500 text-white'}`}>{p.badge}</span>
              )}
              <button className="absolute top-2 right-2 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Heart size={10} className="text-slate-400" />
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[9px] font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
              <div className="flex items-center gap-1 my-1">
                <Star size={8} className="fill-yellow-400 text-yellow-400" />
                <span className="text-[8px] text-slate-400 font-bold">{p.stars}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-primary-500">{p.price}</span>
                <button className="w-5 h-5 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Plus size={10} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'card-shop-header',
    label: 'Shop Header Card',
    category: 'Cards',
    description: 'Header หน้าร้านค้า — โลโก้, ชื่อร้าน, Rating, ปุ่ม Follow',
    preview: (
      <div className="w-[480px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-600 relative">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=200&fit=crop" className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-primary-900/40" />
        </div>
        <div className="px-6 pb-5 -mt-8 relative">
          <div className="flex items-end justify-between">
            <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 overflow-hidden shadow-md flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop" className="w-full h-full object-cover" alt="" />
            </div>
            <button className="mb-1 px-5 py-2 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">Follow</button>
          </div>
          <div className="mt-2">
            <h2 className="font-black text-base text-slate-900 dark:text-white">TechZone Official Store</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-black text-slate-900 dark:text-white">4.9</span>
                <span className="text-[10px] text-slate-400">(2.4k reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin size={10} /> Bangkok, Thailand
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'section-filter-sidebar',
    label: 'Filter Sidebar',
    category: 'Navigation',
    description: 'Sidebar กรองสินค้า — ราคา, หมวดหมู่, Rating',
    preview: (
      <div className="w-[200px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-left space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Filters</h3>
          <button className="text-[10px] text-primary-500 font-bold">Clear All</button>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Price Range</p>
          <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
            <div className="absolute left-[20%] right-[30%] h-full bg-primary-500 rounded-full" />
            <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary-500 rounded-full shadow" />
            <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary-500 rounded-full shadow" />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-bold">
            <span>$0</span><span>$500</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Category</p>
          {['Electronics', 'Fashion', 'Sports'].map((c, i) => (
            <label key={c} className="flex items-center gap-2 py-1 cursor-pointer">
              <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-primary-500 border-primary-500' : 'border-slate-300'}`}>
                {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{c}</span>
            </label>
          ))}
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Rating</p>
          {[5, 4, 3].map(r => (
            <label key={r} className="flex items-center gap-2 py-1 cursor-pointer">
              <div className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 ${r === 4 ? 'bg-primary-500 border-primary-500' : 'border-slate-300'}`} />
              <div className="flex gap-0.5">
                {[...Array(r)].map((_, i) => <Star key={i} size={8} className="fill-yellow-400 text-yellow-400" />)}
                {[...Array(5 - r)].map((_, i) => <Star key={i} size={8} className="text-slate-200" />)}
              </div>
              <span className="text-[9px] text-slate-400">& up</span>
            </label>
          ))}
        </div>
      </div>
    ),
  },

  // ─── PROFILE ─────────────────────────────────────────────────────────────────
  {
    id: 'card-profile-header',
    label: 'Profile Header Card',
    category: 'Cards',
    description: 'Header โปรไฟล์ผู้ใช้ — Avatar, ชื่อ, อีเมล, ปุ่มแก้ไข',
    preview: (
      <div className="w-[360px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-left">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black text-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-slate-900 dark:text-white">John Doe</h2>
            <p className="text-xs text-slate-500 mt-0.5">john.doe@email.com</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[8px] font-black uppercase bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full">Premium Member</span>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
            <Edit2 size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
          {[
            { label: 'Orders', val: '24' },
            { label: 'Wishlist', val: '12' },
            { label: 'Reviews', val: '8' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-black text-slate-900 dark:text-white">{s.val}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'card-profile-menu-section',
    label: 'Profile Menu Section',
    category: 'Navigation',
    description: 'ส่วน Menu โปรไฟล์ — ลิสต์รายการพร้อมไอคอน',
    preview: (
      <div className="w-[320px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account Settings</span>
        </div>
        {[
          { icon: <User size={15} />, label: 'Edit Profile', color: 'text-blue-500' },
          { icon: <MapPin size={15} />, label: 'Address Book', color: 'text-green-500' },
          { icon: <CreditCard size={15} />, label: 'Payment Methods', color: 'text-purple-500' },
          { icon: <Bell size={15} />, label: 'Notifications', color: 'text-orange-500' },
          { icon: <Lock size={15} />, label: 'Security', color: 'text-red-500' },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className={`${item.color} bg-current/10 w-7 h-7 rounded-lg flex items-center justify-center bg-opacity-10`}
              style={{ backgroundColor: 'currentColor', color: item.color.replace('text-', ''), opacity: 1 }}>
              <div className={item.color}>{item.icon}</div>
            </div>
            <span className="flex-1 text-xs font-bold text-slate-700 dark:text-slate-300 text-left">{item.label}</span>
            <ChevronRight size={14} className="text-slate-300" />
          </button>
        ))}
      </div>
    ),
  },

  // ─── PRODUCT DETAIL ──────────────────────────────────────────────────────────
  {
    id: 'section-product-info',
    label: 'Product Info Section',
    category: 'Cards',
    description: 'ส่วนข้อมูลสินค้า — ชื่อ, ราคา, Rating, ปุ่มซื้อ',
    preview: (
      <div className="w-[340px] space-y-4 text-left">
        <div>
          <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded-full">Electronics</span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mt-2 uppercase tracking-tight">Sony WH-1000XM5 Headphones</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">4.9</span>
          <span className="text-xs text-slate-400">(1,283 reviews)</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-green-500 font-bold">2,100 sold</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-black text-primary-500">$299.00</span>
          <span className="text-lg text-slate-400 line-through font-bold">$399.00</span>
          <span className="text-xs font-black bg-red-500 text-white px-2 py-0.5 rounded-full">-25%</span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 bg-primary-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
            <ShoppingBag size={14} /> Add to Cart
          </button>
          <button className="w-12 h-12 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500">
            <Heart size={18} />
          </button>
          <button className="w-12 h-12 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'section-product-review',
    label: 'Product Review Card',
    category: 'Cards',
    description: 'การ์ดรีวิวสินค้า — Avatar, ดาว, ข้อความ, วันที่',
    preview: (
      <div className="w-[380px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-left space-y-3">
        <div className="flex items-start gap-3">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">John D.</p>
                <p className="text-[9px] text-slate-400">Verified Purchase · Bangkok, TH</p>
              </div>
              <span className="text-[9px] text-slate-400">3 days ago</span>
            </div>
            <div className="flex gap-0.5 my-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Amazing headphones! The noise cancellation is absolutely incredible. Perfect for long flights and working from coffee shops. Highly recommend!</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-primary-500 transition-colors">
            👍 Helpful (24)
          </button>
          <button className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
            👎 Not Helpful
          </button>
        </div>
      </div>
    ),
  },

  // ─── CHECKOUT ────────────────────────────────────────────────────────────────
  {
    id: 'section-checkout-address',
    label: 'Checkout Address Selection',
    category: 'Cards',
    description: 'เลือกที่อยู่จัดส่งในหน้า Checkout',
    preview: (
      <div className="w-[400px] space-y-3 text-left">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Delivery Address</h3>
        {[
          { name: 'Home', address: '123 Sukhumvit Rd, Bangkok 10110', phone: '+66 81-234-5678', selected: true },
          { name: 'Office', address: '456 Silom Complex, Bangkok 10500', phone: '+66 89-876-5432', selected: false },
        ].map(a => (
          <div key={a.name} className={`p-4 rounded-2xl border-2 transition-all ${a.selected ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${a.selected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                {a.selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{a.name}</p>
                  {a.selected && <span className="text-[8px] font-black bg-primary-500/10 text-primary-500 px-1.5 py-0.5 rounded-full">Selected</span>}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{a.address}</p>
                <p className="text-[10px] text-primary-500 font-bold mt-0.5">{a.phone}</p>
              </div>
            </div>
          </div>
        ))}
        <button className="w-full py-3 border-2 border-dashed border-primary-500/30 text-primary-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500/5 transition-colors flex items-center justify-center gap-2">
          <Plus size={12} /> Add New Address
        </button>
      </div>
    ),
  },

  // ─── VENDOR OVERVIEW ─────────────────────────────────────────────────────────
  {
    id: 'card-vendor-stat-row',
    label: 'Vendor Stats Overview',
    category: 'Cards',
    description: 'แถวสถิติหน้า Vendor Dashboard — Revenue, Orders, Products, Rating',
    preview: (
      <div className="grid grid-cols-4 gap-3 w-[560px]">
        {[
          { label: 'Total Revenue', val: '$45,231', change: '+12.5%', up: true, icon: <DollarSign size={16} />, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Orders', val: '1,204', change: '+5.2%', up: true, icon: <ShoppingBag size={16} />, color: 'text-primary-500', bg: 'bg-primary-500/10' },
          { label: 'Products', val: '86', change: '+3', up: true, icon: <Package size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Avg Rating', val: '4.9', change: '+0.2', up: true, icon: <Star size={16} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${s.up ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                <TrendingUp size={7} /> {s.change}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">{s.label}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{s.val}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'card-vendor-product-row',
    label: 'Vendor Product Table Row',
    category: 'Cards',
    description: 'แถวสินค้าในตาราง Vendor — รูปภาพ, ชื่อ, สต็อก, ราคา, สถานะ',
    preview: (
      <div className="w-[560px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm text-left">
        <div className="flex bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
          <div className="w-8" />
          <div className="flex-1">Product</div>
          <div className="w-20">Stock</div>
          <div className="w-20">Price</div>
          <div className="w-24">Status</div>
          <div className="w-16 text-right">Actions</div>
        </div>
        {[
          { name: 'AirPods Pro Max', stock: 45, price: '$549', status: 'Active', img: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=60&h=60&fit=crop' },
          { name: 'MacBook Air M3', stock: 12, price: '$1,299', status: 'Active', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&h=60&fit=crop' },
          { name: 'iPhone 15 Pro', stock: 0, price: '$999', status: 'Out of Stock', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=60&h=60&fit=crop' },
        ].map(p => (
          <div key={p.name} className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="w-8 flex-shrink-0">
              <div className="w-4 h-4 rounded border-2 border-slate-300" />
            </div>
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <img src={p.img} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" alt="" />
              <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
            </div>
            <div className="w-20 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span className={p.stock === 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}>{p.stock}</span>
            </div>
            <div className="w-20 text-[10px] font-black text-slate-900 dark:text-white">{p.price}</div>
            <div className="w-24">
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {p.status}
              </span>
            </div>
            <div className="w-16 flex justify-end gap-1">
              <button className="p-1.5 text-slate-400 hover:text-primary-500 rounded-lg"><Edit2 size={12} /></button>
              <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'card-vendor-order-management',
    label: 'Vendor Order Row',
    category: 'Cards',
    description: 'แถวคำสั่งซื้อในหน้า Vendor — Order ID, ชื่อลูกค้า, ยอด, สถานะ',
    preview: (
      <div className="w-[560px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm text-left">
        <div className="flex bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
          <div className="w-24">Order ID</div>
          <div className="flex-1">Customer</div>
          <div className="w-24">Amount</div>
          <div className="w-24">Date</div>
          <div className="w-28">Status</div>
        </div>
        {[
          { id: '#ORD-001', customer: 'Somchai J.', amount: '$598.00', date: 'Jul 25', status: 'Delivered', color: 'bg-green-100 text-green-700' },
          { id: '#ORD-002', customer: 'Priya K.', amount: '$249.00', date: 'Jul 24', status: 'Shipped', color: 'bg-blue-100 text-blue-700' },
          { id: '#ORD-003', customer: 'Tanaka M.', amount: '$89.00', date: 'Jul 24', status: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
        ].map(o => (
          <div key={o.id} className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="w-24 text-[9px] font-mono font-bold text-primary-500">{o.id}</div>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[9px] font-black">{o.customer[0]}</div>
              <span className="text-[10px] font-bold text-slate-900 dark:text-white">{o.customer}</span>
            </div>
            <div className="w-24 text-[10px] font-black text-slate-900 dark:text-white">{o.amount}</div>
            <div className="w-24 text-[9px] text-slate-400 font-bold">{o.date}</div>
            <div className="w-28">
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${o.color}`}>{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'card-vendor-wallet',
    label: 'Vendor Wallet Card',
    category: 'Cards',
    description: 'Wallet card ยอดเงิน Vendor — Balance, Pending, Withdraw button',
    preview: (
      <div className="w-[360px] bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-2xl shadow-primary-500/30 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Vendor Wallet</p>
              <p className="text-white font-bold text-xs mt-0.5">TechZone Store</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <Store size={18} />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">Available Balance</p>
            <p className="text-4xl font-black mt-1">$12,845.00</p>
          </div>
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-white/10 rounded-2xl p-3">
              <p className="text-white/60 text-[8px] font-black uppercase tracking-widest">Pending</p>
              <p className="text-white font-black text-base mt-0.5">$2,340</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl p-3">
              <p className="text-white/60 text-[8px] font-black uppercase tracking-widest">This Month</p>
              <p className="text-white font-black text-base mt-0.5">$8,910</p>
            </div>
          </div>
          <button className="w-full py-3.5 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
            Withdraw Funds
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'section-vendor-sidebar',
    label: 'Vendor Sidebar Navigation',
    category: 'Navigation',
    description: 'Sidebar เมนู Vendor Dashboard — ไอคอน + ชื่อเมนู',
    preview: (
      <div className="w-[200px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[400px] flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
              <Store size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white">TechZone Store</p>
              <p className="text-[8px] text-primary-500 font-bold">Premium Seller</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { icon: <BarChart2 size={14} />, label: 'Overview', active: true },
            { icon: <Package size={14} />, label: 'Products' },
            { icon: <ShoppingBag size={14} />, label: 'Orders' },
            { icon: <Layers size={14} />, label: 'Import' },
            { icon: <Tag size={14} />, label: 'Categories' },
            { icon: <DollarSign size={14} />, label: 'Wallet' },
            { icon: <MessageCircle size={14} />, label: 'Messages' },
            { icon: <Settings size={14} />, label: 'Settings' },
          ].map(item => (
            <button key={item.label} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${item.active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {item.icon}
              <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut size={14} />
            <span className="text-[10px] font-black uppercase tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    ),
  },

  // ─── CHECKOUT STEPS ──────────────────────────────────────────────────────────
  {
    id: 'section-checkout-steps',
    label: 'Checkout Step Indicator',
    category: 'Navigation',
    description: 'แถบขั้นตอน Checkout — Address, Payment, Confirm',
    preview: (
      <div className="flex items-center justify-center w-[480px] py-4">
        {[
          { label: 'Address', num: 1, done: true },
          { label: 'Payment', num: 2, done: false, active: true },
          { label: 'Confirm', num: 3, done: false },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${step.done ? 'bg-green-500 text-white' : step.active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {step.done ? <CheckCircle2 size={18} /> : step.num}
              </div>
              <span className={`text-[9px] font-black uppercase mt-1.5 tracking-widest ${step.active ? 'text-primary-500' : step.done ? 'text-green-500' : 'text-slate-400'}`}>{step.label}</span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-0.5 mx-3 ${i === 0 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    ),
  },

  // ─── SECURITY ────────────────────────────────────────────────────────────────
  {
    id: 'card-login-session',
    label: 'Login Session Card',
    category: 'Cards',
    description: 'การ์ดเซสชันที่ล็อกอิน — อุปกรณ์, IP, เวลา, ปุ่ม Revoke',
    preview: (
      <div className="w-[400px] space-y-2">
        {[
          { device: 'Chrome on Windows 11', location: 'Bangkok, Thailand', time: 'Active now', current: true, ip: '203.154.xxx.xxx' },
          { device: 'Safari on iPhone 16', location: 'Chiang Mai, Thailand', time: '2 hours ago', current: false, ip: '171.97.xxx.xxx' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.current ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              {s.current ? <Shield size={18} /> : <Bell size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{s.device}</p>
                {s.current && <span className="text-[7px] font-black bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">Current</span>}
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">{s.location} · {s.ip}</p>
              <p className="text-[9px] text-slate-400">{s.time}</p>
            </div>
            {!s.current && (
              <button className="flex-shrink-0 text-[9px] font-black text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors uppercase tracking-widest">
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    ),
  },

  // ─── SHOP STATS ──────────────────────────────────────────────────────────────
  {
    id: 'section-shop-stats',
    label: 'Shop Stats Row',
    category: 'Cards',
    description: 'แถวสถิติร้านค้าบนหน้า Shop Detail',
    preview: (
      <div className="grid grid-cols-4 gap-3 w-[480px]">
        {[
          { label: 'Products', val: '248', icon: <Package size={16} className="text-primary-500" /> },
          { label: 'Sales', val: '12.4k', icon: <TrendingUp size={16} className="text-green-500" /> },
          { label: 'Rating', val: '4.9 ★', icon: <Star size={16} className="text-yellow-400" /> },
          { label: 'Response', val: '< 1hr', icon: <MessageCircle size={16} className="text-blue-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <p className="text-lg font-black text-slate-900 dark:text-white">{s.val}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    ),
  },
];
