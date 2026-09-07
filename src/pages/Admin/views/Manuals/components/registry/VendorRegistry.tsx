import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { Tag, CheckCircle2, Lock, DollarSign, ArrowUpRight, ShoppingBag, Clock, Plus, Filter, Upload, Image as ImageIcon, Search, Sparkles, KeyRound, Gift } from 'lucide-react';

export const VendorRegistry: ComponentItem[] = [
  {
    id: 'vendor-stat-card',
    label: 'Vendor Stat Card',
    category: 'Admin Widgets',
    description: 'การ์ดสถิติหน้าภาพรวมร้านค้า (Vendor Overview)',
    preview: (
      <div className="w-64 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
          <div className="p-2 sm:p-3 rounded-2xl bg-green-500 text-white shadow-lg group-hover:scale-110 transition-transform">
            <DollarSign size={20} />
          </div>
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-green-500">
            +12.5%
            <ArrowUpRight size={12} />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">GROSS SALES</p>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">$45,231</h3>
        </div>
      </div>
    )
  },
  {
    id: 'vendor-recent-order',
    label: 'Vendor Recent Order',
    category: 'Admin Widgets',
    description: 'รายการคำสั่งซื้อล่าสุด (Vendor Overview)',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-center group cursor-pointer text-left">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
          <ShoppingBag size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
            <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight truncate">
              Order #a1b2c3d4
            </p>
            <span className="text-[10px] font-black text-primary-500 whitespace-nowrap">$120.00</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
              completed
            </span>
            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
              <Clock size={10} /> 10/24/2026
            </span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'vendor-unlocked-categories',
    label: 'Unlocked Categories Widget',
    category: 'Admin Widgets',
    description: 'หน้าต่างแสดงหมวดหมู่ที่ปลดล็อกของร้านค้า',
    preview: (
      <div className="w-[600px] bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Tag size={20} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Unlocked Categories</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Categories Available</p>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Quota Limit</span>
            <span className="text-xl font-black text-primary-500">1,000 Slots</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border transition-all bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 mb-2">E</div>
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-center">Electronics</span>
            <div className="mt-2"><CheckCircle2 size={14} className="text-blue-500" /></div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border transition-all bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60 grayscale">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 mb-2">F</div>
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-center">Fashion</span>
            <div className="mt-2"><Lock size={14} className="text-slate-400" /></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'btn-vendor-upgrade-quota',
    label: 'Upgrade Quota Button',
    category: 'Buttons',
    description: 'ปุ่ม Upgrade Store Quota สีม่วง',
    preview: (
      <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20">
        <Sparkles size={14} /> Upgrade Store Quota
      </button>
    )
  },
  {
    id: 'btn-vendor-categories-quota',
    label: 'Categories Quota Button',
    category: 'Buttons',
    description: 'ปุ่มหมวดหมู่ร้านค้าในส่วน Quota',
    preview: (
      <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl font-black uppercase tracking-widest text-xs">
        <Tag size={14} /> Categories (3/4)
      </button>
    )
  },
  {
    id: 'btn-vendor-import-products',
    label: 'Import Products Button',
    category: 'Buttons',
    description: 'ปุ่ม Import Products สีเข้ม',
    preview: (
      <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/25">
        <Upload size={14} /> Import Products
      </button>
    )
  },
  {
    id: 'input-vendor-quota-slots',
    label: 'Additional Slots Input',
    category: 'Inputs',
    description: 'ช่องสไลเดอร์และช่องกรอกสำหรับซื้อ Product Slots เพิ่ม',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex justify-between mb-3">
          <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag size={14} className="text-primary-500" /> Additional Slots
          </label>
          <span className="text-xs font-bold text-slate-500">$0.10/slot</span>
        </div>
        <div className="flex items-center gap-4">
          <input type="range" min="0" max="1000" step="10" defaultValue="100" className="flex-1 accent-primary-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          <input type="number" defaultValue="100" readOnly className="w-20 text-center bg-slate-100 dark:bg-slate-800 rounded-xl py-2 font-black text-slate-900 dark:text-white outline-none border border-transparent" />
        </div>
      </div>
    )
  },
  {
    id: 'input-vendor-quota-days',
    label: 'Extend Duration Input',
    category: 'Inputs',
    description: 'ช่องสไลเดอร์และช่องกรอกสำหรับขยายเวลา Quota',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex justify-between mb-3">
          <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} className="text-amber-500" /> Extend Duration (Days)
          </label>
          <span className="text-xs font-bold text-slate-500">$0.50/day</span>
        </div>
        <div className="flex items-center gap-4">
          <input type="range" min="0" max="365" step="30" defaultValue="30" className="flex-1 accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          <input type="number" defaultValue="30" readOnly className="w-20 text-center bg-slate-100 dark:bg-slate-800 rounded-xl py-2 font-black text-slate-900 dark:text-white outline-none border border-transparent" />
        </div>
      </div>
    )
  },
  {
    id: 'form-vendor-redeem-quota',
    label: 'Redeem Quota Code Form',
    category: 'Forms',
    description: 'ฟอร์มกรอกโค้ด Quota ฟรี',
    preview: (
      <div className="w-96 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest shrink-0">
            <KeyRound size={12} /> Free Code
          </div>
          <input
            type="text"
            readOnly
            placeholder="Q-XXXX-XXXX"
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-red-400 rounded-xl py-2 px-3 text-xs font-black text-slate-900 dark:text-white outline-none uppercase tracking-wider placeholder:font-normal placeholder:text-slate-400 transition-colors"
          />
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors shrink-0"
          >
            <Gift size={12} /> Redeem
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'card-vendor-quota-package',
    label: 'Quota Package Card',
    category: 'Cards',
    description: 'การ์ดแพ็กเกจโควตาสำเร็จรูปสำหรับเลือกซื้อ',
    preview: (
      <div className="w-64 rounded-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
        <div className="text-center py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary-500 text-white">
          Popular
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-base font-black text-slate-900 dark:text-white">Silver Pack</h4>
            <CheckCircle2 size={18} className="text-primary-500 flex-shrink-0" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
            $29.00
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ShoppingBag size={13} className="text-primary-500 flex-shrink-0" />
              <span className="font-bold">500 Product Slots</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Tag size={13} className="text-blue-500 flex-shrink-0" />
              <span className="font-bold">5 Categories</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Clock size={13} className="text-amber-500 flex-shrink-0" />
              <span className="font-bold">30 Days</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
];
