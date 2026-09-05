import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { Search, Eye, EyeOff, Lock, Mail, Phone, Upload, ChevronDown, User, MapPin } from 'lucide-react';

export const InputsRegistry: ComponentItem[] = [
  {
    id: 'input-text',
    label: 'Text Input',
    category: 'Inputs',
    description: 'ช่องกรอกข้อมูลทั่วไป',
    preview: (
      <div className="space-y-1.5 w-72">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
        <input readOnly className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" defaultValue="John Doe" />
      </div>
    ),
  },
  {
    id: 'input-email',
    label: 'Email Input',
    category: 'Inputs',
    description: 'ช่องกรอก Email พร้อมไอคอน',
    preview: (
      <div className="space-y-1.5 w-72">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
        <div className="relative">
          <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input readOnly className="w-full pl-9 pr-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="example@email.com" />
        </div>
      </div>
    ),
  },
  {
    id: 'input-password',
    label: 'Password Input',
    category: 'Inputs',
    description: 'ช่องรหัสผ่านพร้อมปุ่มแสดง/ซ่อน',
    preview: (
      <div className="space-y-1.5 w-72">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
        <div className="relative">
          <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input readOnly type="password" className="w-full pl-9 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" defaultValue="secret" />
          <Eye size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" />
        </div>
      </div>
    ),
  },
  {
    id: 'input-phone',
    label: 'Phone Number Input',
    category: 'Inputs',
    description: 'ช่องกรอกเบอร์โทรพร้อม Country Code',
    preview: (
      <div className="space-y-1.5 w-72">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
        <div className="flex">
          <div className="flex items-center gap-1.5 px-3 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-xl border-r-0 text-xs font-bold text-slate-600 dark:text-slate-400">
            🇹🇭 +66 <ChevronDown size={10} />
          </div>
          <input readOnly className="flex-1 px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl text-xs text-slate-500" placeholder="81-234-5678" />
        </div>
      </div>
    ),
  },
  {
    id: 'input-search',
    label: 'Search Input',
    category: 'Inputs',
    description: 'ช่องค้นหาพร้อมไอคอน',
    preview: (
      <div className="relative w-72">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input readOnly className="w-full pl-10 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 rounded-xl text-xs text-slate-500 placeholder:text-slate-400" placeholder="Search products, shops..." />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>
    ),
  },
  {
    id: 'input-textarea',
    label: 'Textarea',
    category: 'Inputs',
    description: 'กล่องพิมพ์ข้อความหลายบรรทัด',
    preview: (
      <div className="space-y-1.5 w-72">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</label>
        <textarea readOnly className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 resize-none h-24 block" defaultValue="Premium quality running sneakers with responsive cushioning and breathable mesh upper..." />
        <p className="text-[9px] text-slate-400 text-right">0 / 500 characters</p>
      </div>
    ),
  },
  {
    id: 'input-select',
    label: 'Select Dropdown',
    category: 'Inputs',
    description: 'ช่องเลือกตัวเลือก',
    preview: (
      <div className="space-y-1.5 w-72">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</label>
        <div className="relative">
          <select className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 appearance-none focus:outline-none">
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home & Living</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    ),
  },
  {
    id: 'input-checkbox',
    label: 'Checkboxes',
    category: 'Inputs',
    description: 'Checkbox group หลายตัวเลือก',
    preview: (
      <div className="space-y-3">
        {[
          { label: 'Remember me', checked: true },
          { label: 'Receive newsletter', checked: true },
          { label: 'Accept terms & conditions', checked: false },
          { label: 'Enable two-factor authentication', checked: false },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-primary-500' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
              {item.checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className={`text-xs font-medium ${item.checked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'input-radio',
    label: 'Radio Buttons',
    category: 'Inputs',
    description: 'Radio group เลือกตัวเลือกเดียว',
    preview: (
      <div className="space-y-3">
        {[
          { label: 'Standard Delivery (3–5 days)', sub: 'Free', selected: false },
          { label: 'Express Delivery (1–2 days)', sub: '$5.99', selected: true },
          { label: 'Same Day Delivery', sub: '$12.99', selected: false },
        ].map(item => (
          <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${item.selected ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.selected ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                {item.selected && <div className="w-2 h-2 rounded-full bg-primary-500" />}
              </div>
              <span className={`text-xs font-bold ${item.selected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.label}</span>
            </div>
            <span className={`text-xs font-black ${item.selected ? 'text-primary-500' : 'text-slate-400'}`}>{item.sub}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'input-toggle',
    label: 'Toggle Switches',
    category: 'Inputs',
    description: 'Toggle Switch เปิด/ปิด',
    preview: (
      <div className="space-y-3 w-72">
        {[
          { label: 'Email Notifications', sub: 'Receive order updates', on: true },
          { label: 'Push Notifications', sub: 'Browser alerts', on: true },
          { label: 'SMS Alerts', sub: 'Text message updates', on: false },
          { label: 'Dark Mode', sub: 'Use dark theme', on: true },
          { label: 'Two-Factor Auth', sub: 'Enhanced security', on: false },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</p>
              <p className="text-[9px] text-slate-400">{item.sub}</p>
            </div>
            <div className={`w-10 h-5.5 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0 ${item.on ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ height: '22px' }}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${item.on ? 'translate-x-[18px]' : 'translate-x-0'}`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'input-otp',
    label: 'OTP Input (6 digits)',
    category: 'Inputs',
    description: 'ช่องกรอกรหัส OTP 6 หลัก',
    preview: (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Enter verification code</p>
        <div className="flex gap-2">
          {['1', '2', '3', '4', '', ''].map((v, i) => (
            <div key={i} className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center text-base font-black transition-all ${v ? 'border-primary-500 text-slate-900 dark:text-white bg-primary-500/5' : i === 4 ? 'border-primary-500 border-dashed animate-pulse' : 'border-slate-200 dark:border-slate-700 text-slate-300'}`} style={{ height: '50px' }}>
              {v || (i === 4 ? <span className="w-0.5 h-5 bg-primary-500" /> : '—')}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-slate-400">Didn't receive? <span className="text-primary-500 font-bold">Resend in 00:45</span></p>
      </div>
    ),
  },
  {
    id: 'input-file-upload',
    label: 'File Upload Zone',
    category: 'Inputs',
    description: 'พื้นที่อัปโหลดไฟล์ Drag & Drop',
    preview: (
      <div className="w-72 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <Upload size={22} className="text-primary-500" />
        </div>
        <p className="text-xs font-black text-slate-700 dark:text-slate-300 text-center">
          Drop files here or <span className="text-primary-500">browse</span>
        </p>
        <p className="text-[9px] text-slate-400 text-center">Supports: PNG, JPG, PDF, MP4 · Max 10MB</p>
        <div className="flex gap-2 mt-1 w-full">
          {['product-img.jpg', 'banner.png'].map(f => (
            <div key={f} className="flex items-center gap-1.5 px-2 py-1 bg-primary-500/10 rounded-lg text-[9px] text-primary-600 dark:text-primary-400 font-bold">
              📎 {f}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'input-range',
    label: 'Range Slider (Price)',
    category: 'Inputs',
    description: 'Slider กำหนดช่วงราคา',
    preview: (
      <div className="space-y-3 w-72">
        <div className="flex justify-between">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Price Range</label>
          <span className="text-[10px] font-black text-primary-500">$20 — $80</span>
        </div>
        <div className="relative h-4 flex items-center">
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
            <div className="absolute h-1.5 bg-primary-500 rounded-full" style={{ left: '20%', right: '20%' }} />
          </div>
          <div className="absolute w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-sm cursor-pointer" style={{ left: '20%' }} />
          <div className="absolute w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-sm cursor-pointer" style={{ left: '80%' }} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold">$20</div>
          <div className="flex items-center text-slate-400 text-xs">—</div>
          <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold">$80</div>
        </div>
      </div>
    ),
  },
  {
    id: 'input-address',
    label: 'Address Input Fields',
    category: 'Inputs',
    description: 'กลุ่มช่องกรอกที่อยู่จัดส่ง',
    preview: (
      <div className="space-y-2.5 w-72">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">First Name</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" defaultValue="John" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" defaultValue="Doe" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
          <div className="relative">
            <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input readOnly className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" defaultValue="123 Commerce St" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">City</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" defaultValue="Bangkok" />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ZIP</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" defaultValue="10110" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'input-credit-card',
    label: 'Credit Card Input',
    category: 'Inputs',
    description: 'ช่องกรอกข้อมูลบัตรเครดิต',
    preview: (
      <div className="space-y-2.5 w-72">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
          <div className="relative">
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono pr-14" defaultValue="4242  4242  4242  4242" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="w-5 h-3 bg-red-500 rounded-sm opacity-80" />
              <div className="w-5 h-3 bg-orange-400 rounded-sm opacity-80 -ml-2" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Expiry</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 font-mono" defaultValue="12 / 27" />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CVV</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 font-mono" defaultValue="•••" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'input-profile-avatar',
    label: 'Profile Avatar Upload',
    category: 'Inputs',
    description: 'อัปโหลดรูปโปรไฟล์',
    preview: (
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-xl">J</div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-500 border-2 border-white dark:border-slate-900 flex items-center justify-center cursor-pointer">
            <Upload size={10} className="text-white" />
          </div>
        </div>
        <div>
          <p className="text-xs font-black text-slate-900 dark:text-white">John Doe</p>
          <p className="text-[9px] text-slate-400 mt-0.5">PNG or JPG (max 2MB)</p>
          <button className="text-[9px] font-bold text-primary-500 hover:text-primary-600 mt-1">Change Photo</button>
        </div>
      </div>
    ),
  },
  {
    id: 'input-search-with-filters',
    label: 'Search Bar + Filters',
    category: 'Inputs',
    description: 'ช่องค้นหาพร้อม Filter chips',
    preview: (
      <div className="space-y-2 w-80">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input readOnly className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs text-slate-500" placeholder="Search products..." />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Electronics', 'Fashion', 'Sports', 'Beauty'].map((f, i) => (
            <button key={f} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${i === 0 ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'input-error-state',
    label: 'Input Error State',
    category: 'Inputs',
    description: 'ช่องกรอกข้อมูลที่มี Validation Error',
    preview: (
      <div className="space-y-2 w-72">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email</label>
          <input readOnly className="w-full px-3.5 py-3 bg-red-50 dark:bg-red-500/10 border-2 border-red-400 rounded-xl text-xs text-slate-700 dark:text-slate-300" defaultValue="invalid-email" />
          <p className="text-[9px] font-bold text-red-500 flex items-center gap-1">⚠ Please enter a valid email address</p>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
          <input readOnly className="w-full px-3.5 py-3 bg-green-50 dark:bg-green-500/10 border-2 border-green-400 rounded-xl text-xs text-slate-700 dark:text-slate-300" defaultValue="strongpass123" />
          <p className="text-[9px] font-bold text-green-500 flex items-center gap-1">✓ Strong password</p>
        </div>
      </div>
    ),
  },
];
