import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import {
  ShoppingBag, ArrowRight, ShoppingCart, Zap, Minus, Plus,
  Heart, Share2, Bookmark, RefreshCw, Filter, Grid, List,
  ChevronLeft, ChevronDown, Trash2, Edit2, Download, Eye,
  Bell, Send, Star, CreditCard,
} from 'lucide-react';

export const ButtonsRegistry: ComponentItem[] = [
  {
    id: 'btn-primary',
    label: 'Primary Button',
    category: 'Buttons',
    description: 'ปุ่มหลัก — bg-primary-500 สีม่วง',
    preview: (
      <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
        <ShoppingBag size={14} /> Shop Now <ArrowRight size={14} />
      </button>
    ),
  },
  {
    id: 'btn-primary-lg',
    label: 'Primary Button (Large)',
    category: 'Buttons',
    description: 'ปุ่มหลักขนาดใหญ่',
    preview: (
      <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/30">
        <ShoppingBag size={16} /> Shop Now <ArrowRight size={16} />
      </button>
    ),
  },
  {
    id: 'btn-outline',
    label: 'Outline Button',
    category: 'Buttons',
    description: 'ปุ่ม Outline border-primary-500',
    preview: (
      <button className="inline-flex items-center gap-2 border-2 border-primary-500 text-primary-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-500 hover:text-white transition-all">
        Browse Shops
      </button>
    ),
  },
  {
    id: 'btn-danger',
    label: 'Danger Button',
    category: 'Buttons',
    description: 'ปุ่มลบ/ยกเลิก สีแดง',
    preview: (
      <button className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-sm">
        <Trash2 size={14} /> Delete Item
      </button>
    ),
  },
  {
    id: 'btn-ghost',
    label: 'Ghost / Cancel Button',
    category: 'Buttons',
    description: 'ปุ่ม Ghost พื้นหลังสีเทา',
    preview: (
      <button className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-xs">
        Cancel
      </button>
    ),
  },
  {
    id: 'btn-add-to-cart',
    label: 'Add to Cart Button',
    category: 'Buttons',
    description: 'ปุ่มเพิ่มสินค้าลงตะกร้า (full width)',
    preview: (
      <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/30 w-64 justify-center">
        <ShoppingCart size={15} /> Add to Cart
      </button>
    ),
  },
  {
    id: 'btn-buy-now',
    label: 'Buy Now Button',
    category: 'Buttons',
    description: 'ปุ่ม Buy Now gradient สีม่วง',
    preview: (
      <button className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/30 w-64 justify-center">
        <Zap size={14} className="fill-white" /> Buy Now
      </button>
    ),
  },
  {
    id: 'btn-quantity',
    label: 'Quantity Counter (±)',
    category: 'Buttons',
    description: 'ปุ่มเพิ่ม-ลดจำนวนสินค้า',
    preview: (
      <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-black">
          <Minus size={14} />
        </button>
        <span className="w-12 h-10 flex items-center justify-center font-black text-slate-900 dark:text-white text-sm border-x border-slate-200 dark:border-slate-700">2</span>
        <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-black">
          <Plus size={14} />
        </button>
      </div>
    ),
  },
  {
    id: 'btn-size-selector',
    label: 'Size Selector (S/M/L/XL)',
    category: 'Buttons',
    description: 'ปุ่มเลือกขนาดสินค้า',
    preview: (
      <div className="flex gap-2">
        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size, i) => (
          <button key={size} className={`w-10 h-10 rounded-lg font-black text-xs border-2 transition-all ${i === 2 ? 'bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/30' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500'}`}>
            {size}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'btn-color-selector',
    label: 'Color Selector',
    category: 'Buttons',
    description: 'ปุ่มเลือกสีสินค้า',
    preview: (
      <div className="flex gap-2 items-center">
        {[
          { color: '#1e293b', label: 'Black' },
          { color: '#ef4444', label: 'Red' },
          { color: '#3b82f6', label: 'Blue' },
          { color: '#f59e0b', label: 'Yellow' },
          { color: '#10b981', label: 'Green' },
        ].map((c, i) => (
          <button key={c.color} title={c.label} className={`w-8 h-8 rounded-full border-2 transition-all ${i === 2 ? 'border-primary-500 scale-110' : 'border-transparent hover:border-slate-400'}`} style={{ background: c.color }} />
        ))}
      </div>
    ),
  },
  {
    id: 'btn-icon-actions',
    label: 'Icon Action Buttons',
    category: 'Buttons',
    description: 'ปุ่มไอคอน: Wishlist, Share, Bookmark',
    preview: (
      <div className="flex gap-2">
        <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-red-400 hover:text-red-500 transition-colors">
          <Heart size={16} />
        </button>
        <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary-500 transition-colors">
          <Share2 size={16} />
        </button>
        <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary-500 transition-colors">
          <Bookmark size={16} />
        </button>
        <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary-500 transition-colors">
          <Download size={16} />
        </button>
      </div>
    ),
  },
  {
    id: 'btn-loading',
    label: 'Loading Button',
    category: 'Buttons',
    description: 'ปุ่ม Loading Spinner state',
    preview: (
      <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs opacity-80 cursor-not-allowed">
        <RefreshCw size={14} className="animate-spin" /> Saving...
      </button>
    ),
  },
  {
    id: 'btn-filter-sort',
    label: 'Filter + Sort + View Toggle',
    category: 'Buttons',
    description: 'แถบ Filter, Sort และ View toggle',
    preview: (
      <div className="flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Filter size={12} /> Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <ChevronDown size={12} /> Sort: Best Match
        </button>
        <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button className="w-9 h-9 flex items-center justify-center bg-primary-500 text-white"><Grid size={14} /></button>
          <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700"><List size={14} /></button>
        </div>
      </div>
    ),
  },
  {
    id: 'btn-back',
    label: 'Back Button',
    category: 'Buttons',
    description: 'ปุ่มย้อนกลับ',
    preview: (
      <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors text-sm font-bold">
        <ChevronLeft size={18} /> Back to Manuals
      </button>
    ),
  },
  {
    id: 'btn-edit-delete-row',
    label: 'Edit + Delete Row Actions',
    category: 'Buttons',
    description: 'ปุ่ม Edit + Delete คู่',
    preview: (
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-black hover:bg-primary-500/20 transition-colors">
          <Edit2 size={12} /> Edit
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-black hover:bg-red-500/20 transition-colors">
          <Trash2 size={12} /> Delete
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black">
          <Eye size={12} /> View
        </button>
      </div>
    ),
  },
  {
    id: 'btn-social-login',
    label: 'Social Login Buttons',
    category: 'Buttons',
    description: 'ปุ่ม Login ด้วย Google, Facebook',
    preview: (
      <div className="flex flex-col gap-2 w-64">
        <button className="flex items-center justify-center gap-2.5 w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <button className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#1877F2] rounded-xl text-xs font-bold text-white hover:bg-[#1664d0] transition-colors">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Continue with Facebook
        </button>
      </div>
    ),
  },
  {
    id: 'btn-pagination',
    label: 'Pagination Buttons',
    category: 'Buttons',
    description: 'ปุ่มเลื่อนหน้า Pagination',
    preview: (
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
          <ChevronLeft size={14} />
        </button>
        {[1, 2, 3, '...', 8, 9, 10].map((p, i) => (
          <button key={i} className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${p === 2 ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30' : p === '...' ? 'text-slate-400 cursor-default' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500'}`}>
            {p}
          </button>
        ))}
        <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
          <ArrowRight size={14} />
        </button>
      </div>
    ),
  },
  {
    id: 'btn-review-actions',
    label: 'Review Action Buttons',
    category: 'Buttons',
    description: 'ปุ่ม Rate, Review, Share ของสินค้า',
    preview: (
      <div className="flex gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-black shadow-sm shadow-primary-500/20 uppercase tracking-wider">
          <Star size={12} className="fill-white" /> Write Review
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider">
          <Share2 size={12} /> Share
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider">
          <Bell size={12} /> Notify Me
        </button>
      </div>
    ),
  },
  {
    id: 'btn-checkout-steps',
    label: 'Checkout Step Buttons',
    category: 'Buttons',
    description: 'ปุ่มกลับ/ถัดไปในขั้นตอน Checkout',
    preview: (
      <div className="flex gap-3 w-64">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300">
          <ChevronLeft size={12} /> Back
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-primary-500 text-white rounded-xl text-xs font-black shadow-sm shadow-primary-500/20">
          Continue <ArrowRight size={12} />
        </button>
      </div>
    ),
  },
  {
    id: 'btn-pay-now',
    label: 'Pay Now Button',
    category: 'Buttons',
    description: 'ปุ่มชำระเงิน พร้อมไอคอนบัตร',
    preview: (
      <button className="flex items-center justify-center gap-2 w-64 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/30">
        <CreditCard size={16} /> Pay $110.00
      </button>
    ),
  },
  {
    id: 'btn-send-message',
    label: 'Send Message Button',
    category: 'Buttons',
    description: 'ปุ่ม Send ในหน้าแชท',
    preview: (
      <button className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/30 hover:bg-primary-600 transition-colors">
        <Send size={16} className="text-white" />
      </button>
    ),
  },
];
