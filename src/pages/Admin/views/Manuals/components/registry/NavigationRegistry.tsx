import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { Home, Search, ShoppingCart, Heart, User, ChevronRight, ChevronDown, BarChart2, Box, MessageCircle, Wallet, Settings, LogOut, LayoutDashboard, Compass, Shield, Package, MapPin, CreditCard, Store, ShoppingBag, ExternalLink, Camera } from 'lucide-react';

export const NavigationRegistry: ComponentItem[] = [
  {
    id: 'nav-desktop-profile-menu',
    label: 'Desktop Profile Menu',
    category: 'Navigation',
    description: 'เมนู Dropdown โปรไฟล์แบบเต็มตามที่ออกแบบไว้',
    preview: (
      <div className="w-64 bg-[#111626] rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-sans">
        <div className="px-5 py-4 border-b border-slate-800/80">
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Manage Account</p>
        </div>
        <div className="p-2 space-y-1">
          {[
            { icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
            { icon: <User size={16} />, label: 'Account', hasDropdown: true },
            { icon: <User size={16} className="opacity-70" />, label: 'My Profile' },
            { icon: <Shield size={16} />, label: 'System Admin' },
            { icon: <Package size={16} />, label: 'My Orders' },
            { icon: <MapPin size={16} />, label: 'Address Book' },
            { icon: <CreditCard size={16} />, label: 'Payment Methods' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {item.hasDropdown && <ChevronDown size={14} className="text-slate-400" />}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800/80 p-2 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors text-[#a855f7]">
            <Store size={16} />
            <span className="text-sm font-bold">Seller Center</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors text-slate-200">
            <ShoppingBag size={16} />
            <span className="text-sm font-semibold">My Shop</span>
          </div>
        </div>
        <div className="border-t border-slate-800/80 p-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors text-red-500">
            <LogOut size={16} />
            <span className="text-sm font-semibold">Logout</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'nav-mobile-profile-view',
    label: 'Mobile Profile View',
    category: 'Navigation',
    description: 'หน้าจอโปรไฟล์ในมือถือแบบเต็ม (Header + Menus)',
    preview: (
      <div className="w-[320px] bg-[#0A0F1C] rounded-[2rem] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans" style={{ height: '600px' }}>
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] p-6 pb-8 relative rounded-b-3xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  S
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#1e293b] rounded-full flex items-center justify-center border-2 border-[#7c3aed]">
                  <Camera size={12} className="text-white" />
                </div>
              </div>
              <div className="text-white">
                <h2 className="text-xl font-black leading-none mb-1">support</h2>
                <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-2">support@gmail.com</p>
                <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                  <Shield size={8} className="text-white" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Verified Member</span>
                </div>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <Settings size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar -mt-4 relative z-10">
          {/* Shop Section */}
          <div className="bg-[#151b2b] rounded-2xl p-4 border border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Store size={18} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Shop Sup</h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Manage your storefront</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </div>

          <button className="w-full py-3.5 bg-[#151b2b] rounded-xl border border-slate-800/50 flex items-center justify-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest">
            <ExternalLink size={14} /> View My Shop
          </button>

          {/* Dashboard Banner */}
          <div className="bg-gradient-to-r from-[#9333ea] to-[#7c3aed] rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-purple-500/20 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Wallet size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">My Dashboard</h3>
                <p className="text-[9px] text-white/80 font-medium">Manage Wallet & Shop</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-white" />
          </div>

          {/* My Purchases */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">My Purchases</h4>
            <div className="bg-[#151b2b] rounded-2xl border border-slate-800/50 overflow-hidden">
              {[
                { icon: <Package size={16} />, label: 'My Orders', color: 'bg-blue-500', text: 'text-white' },
                { icon: <Heart size={16} />, label: 'Wishlist', color: 'bg-red-500', text: 'text-white' },
                { icon: <Wallet size={16} />, label: 'Wallet', color: 'bg-orange-500', text: 'text-white' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color} ${item.text}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-200">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Manage Account */}
          <div className="space-y-2 pt-2 pb-6">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Manage Account</h4>
            <div className="bg-[#151b2b] rounded-2xl border border-slate-800/50 overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-700 text-white">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-200">My Profile</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'nav-bottom-mobile',
    label: 'Bottom Navigation (Mobile)',
    category: 'Navigation',
    description: 'แถบเมนูด้านล่างสำหรับมือถือ',
    preview: (
      <div className="flex items-center justify-around w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-2 py-2 shadow-lg">
        {[
          { icon: <Home size={18} />, label: 'Home', active: true },
          { icon: <Compass size={18} />, label: 'Explore', active: false },
          { icon: <ShoppingCart size={18} />, label: 'Cart', active: false, badge: '3' },
          { icon: <Heart size={18} />, label: 'Saved', active: false },
          { icon: <User size={18} />, label: 'Profile', active: false },
        ].map((item, i) => (
          <div key={i} className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl relative ${item.active ? 'text-primary-500 bg-primary-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            {item.badge && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900">{item.badge}</span>}
            {item.icon}
            <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'nav-breadcrumb',
    label: 'Breadcrumb Trail',
    category: 'Navigation',
    description: 'เส้นทางหมวดหมู่ Home › Shop › Product',
    preview: (
      <div className="flex items-center gap-1.5 text-[10px] font-bold">
        <span className="text-primary-500 cursor-pointer flex items-center gap-1"><Home size={10}/> Home</span>
        <ChevronRight size={10} className="text-slate-400" />
        <span className="text-slate-500 cursor-pointer hover:text-primary-500">Categories</span>
        <ChevronRight size={10} className="text-slate-400" />
        <span className="text-slate-500 cursor-pointer hover:text-primary-500">Electronics</span>
        <ChevronRight size={10} className="text-slate-400" />
        <span className="text-slate-900 dark:text-white font-black">Premium Headphones</span>
      </div>
    ),
  },
  {
    id: 'nav-sidebar',
    label: 'Sidebar Menu (Vertical)',
    category: 'Navigation',
    description: 'เมนูแนวตั้ง เช่น Vendor Dashboard',
    preview: (
      <div className="w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm space-y-1">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-3 mb-2">Main Menu</p>
        {[
          { icon: <LayoutDashboard size={14} />, label: 'Dashboard', active: true },
          { icon: <Box size={14} />, label: 'Products', active: false },
          { icon: <ShoppingCart size={14} />, label: 'Orders', active: false, badge: '5' },
          { icon: <MessageCircle size={14} />, label: 'Messages', active: false },
          { icon: <Wallet size={14} />, label: 'Wallet', active: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${item.active ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <div className="flex items-center gap-2.5">{item.icon}{item.label}</div>
            {item.badge && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${item.active ? 'bg-white/20 text-white' : 'bg-red-500 text-white shadow-sm'}`}>{item.badge}</span>}
          </div>
        ))}
        <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings size={14}/> Settings
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'nav-tabs',
    label: 'Tab Navigation (Horizontal)',
    category: 'Navigation',
    description: 'แถบ Tab แนวนอน สลับหน้า',
    preview: (
      <div className="w-80">
        <div className="flex border-b border-slate-200 dark:border-slate-700 gap-4 px-2 overflow-x-auto no-scrollbar">
          {['All Products', 'Active', 'Out of Stock', 'Draft'].map((tab, i) => (
            <button key={tab} className={`py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${i === 0 ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {tab} {i === 0 && <span className="bg-primary-500/10 text-primary-500 px-1.5 py-0.5 rounded text-[8px]">124</span>}
            </button>
          ))}
        </div>
      </div>
    ),
  },
];
