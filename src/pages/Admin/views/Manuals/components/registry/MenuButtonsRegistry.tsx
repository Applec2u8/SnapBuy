import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import {
  ShoppingBag, MessageCircle, User, LogOut, Sun, Moon, MapPin, 
  CreditCard, Package, Shield, Settings, ShieldAlert, History,
  Home, Heart, Wallet, Smartphone, LayoutDashboard, Store
} from 'lucide-react';

export const MenuButtonsRegistry: ComponentItem[] = [
  {
    id: 'btn-menu-seller-center',
    label: 'Seller Center Button',
    category: 'Menu Items',
    description: 'ปุ่มไปหน้า Seller Center (Desktop)',
    preview: (
      <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-primary-600 bg-primary-500/5 hover:bg-primary-500 hover:text-white transition-all w-64 rounded-xl border border-primary-500/10">
        <Store size={16} /> Seller Center
      </button>
    ),
  },
  {
    id: 'btn-menu-my-shop',
    label: 'My Shop Button',
    category: 'Menu Items',
    description: 'ปุ่มไปหน้า My Shop (Desktop)',
    preview: (
      <button className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-64 rounded-xl text-slate-700 dark:text-slate-300">
        <ShoppingBag size={16} /> My Shop
      </button>
    ),
  },
  {
    id: 'btn-menu-login',
    label: 'Login/Register Button (Nav)',
    category: 'Menu Items',
    description: 'ปุ่ม Login มุมขวาบน Navbar',
    preview: (
      <button className="bg-primary-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-600 transition-all shadow-md">
        LOGIN
      </button>
    ),
  },
  {
    id: 'btn-menu-logout',
    label: 'Logout Button',
    category: 'Menu Items',
    description: 'ปุ่ม Logout สีแดง',
    preview: (
      <button className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-64 rounded-xl font-bold border border-red-500/20">
        <LogOut size={16} /> Logout
      </button>
    ),
  },
  {
    id: 'btn-menu-cart-icon',
    label: 'Cart Icon Button (Nav)',
    category: 'Menu Items',
    description: 'ปุ่มไอคอนตะกร้าพร้อมตัวเลขบน Navbar',
    preview: (
      <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
        <ShoppingBag className="text-slate-700 dark:text-slate-300 group-hover:text-primary-500 transition-colors" size={22} />
        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
          3
        </span>
      </button>
    ),
  },
  {
    id: 'btn-menu-message-icon',
    label: 'Message Icon Button (Nav)',
    category: 'Menu Items',
    description: 'ปุ่มไอคอนแชทพร้อมตัวเลขบน Navbar',
    preview: (
      <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
        <MessageCircle className="text-slate-700 dark:text-slate-300 group-hover:text-primary-500 transition-colors" size={22} />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
          5
        </span>
      </button>
    ),
  },
  {
    id: 'btn-menu-theme-toggle',
    label: 'Theme Toggle (Desktop)',
    category: 'Menu Items',
    description: 'ปุ่มสลับโหมดมืด/สว่าง',
    preview: (
      <button className="hover:text-primary-500 transition-colors flex items-center gap-2 text-slate-500 font-medium uppercase tracking-widest text-[11px]">
        <Moon size={14} />
        <span className="font-bold whitespace-nowrap">Dark Mode</span>
      </button>
    ),
  },
  {
    id: 'btn-menu-lang-toggle',
    label: 'Language Toggle',
    category: 'Menu Items',
    description: 'ปุ่มสลับภาษา',
    preview: (
      <div className="flex items-center gap-3">
        <button className="transition-all rounded-sm overflow-hidden border-2 border-primary-500 opacity-100 scale-110">
          <img src="https://flagcdn.com/w40/th.png" alt="TH" className="w-5 h-3.5 object-cover block" />
        </button>
        <button className="transition-all rounded-sm overflow-hidden border-2 border-transparent opacity-40 hover:opacity-80">
          <img src="https://flagcdn.com/w40/us.png" alt="EN" className="w-5 h-3.5 object-cover block" />
        </button>
      </div>
    ),
  },
  {
    id: 'btn-menu-sidebar-link',
    label: 'Sidebar Menu Link (Normal)',
    category: 'Menu Items',
    description: 'เมนู Sidebar ทั่วไป',
    preview: (
      <button className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-500/5 hover:text-primary-500 transition-colors w-64 text-slate-700 dark:text-slate-300 rounded-xl">
        <Package size={16} /> My Orders
      </button>
    ),
  },
  {
    id: 'btn-menu-sidebar-active',
    label: 'Sidebar Menu Link (Active)',
    category: 'Menu Items',
    description: 'เมนู Sidebar ที่กำลังถูกเลือก',
    preview: (
      <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-500 bg-primary-500/10 font-bold transition-colors w-64 rounded-xl">
        <User size={16} /> My Profile
      </button>
    ),
  },
  {
    id: 'btn-mobile-menu-item',
    label: 'Mobile Menu Grid Item',
    category: 'Menu Items',
    description: 'ปุ่มเมนูมือถือแบบกริด (Mobile Menu)',
    preview: (
      <div className="flex flex-col items-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl w-32 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
        <Store className="text-primary-500" />
        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700 dark:text-slate-300">Seller Center</span>
      </div>
    ),
  },
  {
    id: 'btn-mobile-logout',
    label: 'Mobile Logout Button',
    category: 'Menu Items',
    description: 'ปุ่ม Logout สีแดงบนมือถือ',
    preview: (
      <button className="flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold w-full">
        <LogOut size={20} /> Logout
      </button>
    ),
  }
];
