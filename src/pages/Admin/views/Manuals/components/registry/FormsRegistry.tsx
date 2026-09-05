import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { Eye, EyeOff, Lock, Mail, Search, ChevronDown, MapPin, CreditCard, RefreshCw, ArrowRight, Plus, Minus, Upload, Star, User, Phone, Truck, Shield, Store, X, Sparkles } from 'lucide-react';

export const FormsRegistry: ComponentItem[] = [
  {
    id: 'form-login',
    label: 'Login Form',
    category: 'Forms',
    description: 'ฟอร์ม Login สมบูรณ์',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Welcome Back</h3>
          <p className="text-[9px] text-slate-400">Sign in to your SnapBuy account</p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input readOnly className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="hello@example.com" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <span className="text-[9px] text-primary-500 font-bold cursor-pointer">Forgot?</span>
            </div>
            <div className="relative">
              <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input readOnly type="password" className="w-full pl-8 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" defaultValue="secret" />
              <Eye size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
        <button className="w-full py-3 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
          Sign In
        </button>
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"/></div><div className="relative flex justify-center text-[9px] text-slate-400 bg-white dark:bg-slate-900 px-2">or</div></div>
        <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <p className="text-center text-[9px] text-slate-400">Don't have an account? <span className="text-primary-500 font-bold">Sign up free</span></p>
      </div>
    ),
  },
  {
    id: 'form-register',
    label: 'Register Form',
    category: 'Forms',
    description: 'ฟอร์มสมัครสมาชิก',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Create Account</h3>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">First Name</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="John" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Last Name</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Email</label>
          <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="email@example.com" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Password</label>
          <input readOnly type="password" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" defaultValue="password" />
          <div className="flex gap-1 mt-1">
            {[1,2,3,4].map(i => <div key={i} className={`flex-1 h-1 rounded-full ${i<=3?'bg-yellow-400':'bg-slate-200 dark:bg-slate-700'}`}/>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary-500 flex items-center justify-center flex-shrink-0">
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-[9px] text-slate-500">I agree to the <span className="text-primary-500 font-bold">Terms of Service</span> and <span className="text-primary-500 font-bold">Privacy Policy</span></span>
        </div>
        <button className="w-full py-3 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
          Create Account
        </button>
      </div>
    ),
  },
  {
    id: 'form-add-product',
    label: 'Add Product Form',
    category: 'Forms',
    description: 'ฟอร์มเพิ่มสินค้าสำหรับ Seller',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Add New Product</h3>
        <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-1.5">
          <Upload size={18} className="text-slate-400" />
          <p className="text-[9px] font-bold text-slate-400">Upload product images</p>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Product Name</label>
          <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="Premium Running Sneakers" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Price</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="$0.00" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Stock</label>
            <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="0" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Category</label>
          <div className="relative">
            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 appearance-none">
              <option>Electronics</option><option>Fashion</option>
            </select>
            <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black">Save Draft</button>
          <button className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-xs font-black shadow-sm shadow-primary-500/20">Publish</button>
        </div>
      </div>
    ),
  },
  {
    id: 'form-checkout',
    label: 'Checkout Form',
    category: 'Forms',
    description: 'ฟอร์ม Checkout พร้อม Order Summary',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Checkout</h3>
        {/* Order Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2">
          {[{ name: 'Premium Sneakers × 1', price: '$55' }, { name: 'Casual Hoodie × 2', price: '$76' }].map(i => (
            <div key={i.name} className="flex justify-between text-[10px]">
              <span className="text-slate-600 dark:text-slate-400">{i.name}</span>
              <span className="font-bold text-slate-900 dark:text-white">{i.price}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white">Total</span>
            <span className="text-xs font-black text-primary-500">$131.00</span>
          </div>
        </div>
        {/* Shipping */}
        <div className="space-y-1.5">
          {[{ label: 'Express (1–2 days)', price: '$5.99', sel: true }, { label: 'Standard (3–5 days)', price: 'Free', sel: false }].map(s => (
            <div key={s.label} className={`flex items-center justify-between p-2.5 rounded-xl border-2 ${s.sel ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${s.sel ? 'border-primary-500' : 'border-slate-300'}`}>{s.sel && <div className="w-1.5 h-1.5 rounded-full bg-primary-500"/>}</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 dark:text-slate-300"><Truck size={10} className={s.sel ? 'text-primary-500' : 'text-slate-400'}/>{s.label}</div>
              </div>
              <span className={`text-[9px] font-black ${s.sel ? 'text-primary-500' : 'text-slate-400'}`}>{s.price}</span>
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
          <CreditCard size={14} /> Pay $136.99
        </button>
      </div>
    ),
  },
  {
    id: 'form-review-submit',
    label: 'Write Review Form',
    category: 'Forms',
    description: 'ฟอร์มเขียนรีวิวสินค้า',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-900 dark:text-white">Write a Review</h3>
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0"><Star size={16} className="text-primary-500"/></div>
          <div>
            <p className="text-[10px] font-black text-slate-900 dark:text-white">Premium Running Sneakers</p>
            <p className="text-[9px] text-slate-400">Order #SB-00123</p>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Your Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={22} className={i<=4?'fill-yellow-400 text-yellow-400':'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700 cursor-pointer'}/>)}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Title</label>
          <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" defaultValue="Great quality sneakers!" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Review</label>
          <textarea readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 resize-none h-16 block" defaultValue="Amazing quality and perfect fit! Delivery was super fast too." />
        </div>
        <button className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest shadow-sm shadow-primary-500/20">
          Submit Review
        </button>
      </div>
    ),
  },
  {
    id: 'form-profile-settings',
    label: 'Profile Settings Form',
    category: 'Forms',
    description: 'ฟอร์มแก้ไขข้อมูลโปรไฟล์',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-lg">J</div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Upload size={9} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">John Doe</p>
            <p className="text-[9px] text-slate-400">john@example.com</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[{l:'First Name',v:'John'},{l:'Last Name',v:'Doe'},{l:'Phone',v:'+66 81 234 5678'},{l:'Location',v:'Bangkok, TH'}].map(f=>(
            <div key={f.l} className="space-y-0.5">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{f.l}</label>
              <input readOnly className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-600 dark:text-slate-300" defaultValue={f.v} />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black">Discard</button>
          <button className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-xs font-black shadow-sm shadow-primary-500/20">Save Changes</button>
        </div>
      </div>
    ),
  },
  {
    id: 'form-contact-support',
    label: 'Contact Support Form',
    category: 'Forms',
    description: 'ฟอร์มติดต่อ Support',
    preview: (
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-900 dark:text-white">Contact Support</h3>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Issue Type</label>
          <div className="relative">
            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 appearance-none">
              <option>Order Issue</option><option>Payment Problem</option><option>Account Help</option>
            </select>
            <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Order Number (optional)</label>
          <input readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500" placeholder="#SB-XXXXX" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase">Message</label>
          <textarea readOnly className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 resize-none h-20 block" defaultValue="I have an issue with my recent order..." />
        </div>
        <button className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-xs font-black uppercase tracking-widest shadow-sm shadow-primary-500/20 flex items-center justify-center gap-2">
          <ArrowRight size={12} /> Send Message
        </button>
      </div>
    ),
  },
  {
    id: 'form-coupon',
    label: 'Coupon / Promo Code',
    category: 'Forms',
    description: 'ช่องกรอก Coupon Code',
    preview: (
      <div className="w-72 space-y-2">
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Promo Code</label>
        <div className="flex gap-2">
          <input readOnly className="flex-1 px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono tracking-widest text-slate-700 dark:text-slate-300" defaultValue="SNAP50" />
          <button className="px-4 py-3 bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-wider">Apply</button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
          <span className="text-green-500 text-sm">✓</span>
          <p className="text-[9px] font-bold text-green-600 dark:text-green-400">Code <span className="font-black">SNAP50</span> applied! Save 50% on your order.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'form-create-shop',
    label: 'Create Shop Form',
    category: 'Forms',
    description: 'ฟอร์มเปิดร้านค้าใหม่ (Seller Center)',
    preview: (
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl w-[600px] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full"></div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
          <Store className="text-primary-500" /> Shop Details
        </h2>
        
        <form className="space-y-8 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
            <input
              type="text"
              readOnly
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 focus:border-primary-500 transition-all outline-none font-bold text-sm"
              placeholder="e.g. Awesome Tech Store"
            />
          </div>
  
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              readOnly
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 focus:border-primary-500 transition-all outline-none min-h-[120px] font-medium text-sm"
              placeholder="Tell customers about your shop..."
            />
          </div>
  
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              Free Quota Code
              <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 focus:border-primary-500 transition-all outline-none font-bold text-sm uppercase tracking-widest"
                placeholder="Q-XXXX-XXXX"
                maxLength={12}
              />
            </div>
            <div className="flex items-start gap-1.5 px-1 pt-1">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                If you have a quota code, enter it here to activate product listing immediately.
              </p>
            </div>
          </div>
  
          <button
            type="button"
            className="w-full bg-primary-500 text-white py-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3"
          >
            Create My Shop <ArrowRight size={20} />
          </button>
        </form>
      </div>
    ),
  },
  {
    id: 'form-admin-generate-quota',
    label: 'Generate Quota Code Form',
    category: 'Forms',
    description: 'ฟอร์มสร้างโค้ด Quota (Admin)',
    preview: (
      <div className="bg-white dark:bg-slate-900 w-[420px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 text-left scale-95 origin-top-left">
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Generate Quota Code</h3>
          <div className="p-1.5 rounded-lg text-slate-400"><X size={18} /></div>
        </div>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 px-6 py-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Limit</label>
                <span className="text-[10px] font-bold text-slate-400">
                  Max: <span className="text-primary-500">1,000</span>
                  <span className="text-slate-400 font-normal ml-1">(Unsplash API)</span>
                </span>
              </div>
              <div className="flex gap-2">
                <input readOnly value="100" className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
                <button type="button" className="flex-shrink-0 px-4 py-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 text-[10px] font-black uppercase tracking-widest">Max</button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Total products the shop can list after redeeming.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Duration</label>
              <div className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 font-bold text-slate-900 dark:text-white">30 Days</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Limit</label>
                <span className="text-[10px] font-bold text-slate-400">Max: <span className="text-primary-500">54</span></span>
              </div>
              <div className="flex gap-2">
                <input readOnly value="0" className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
                <button type="button" className="flex-shrink-0 px-4 py-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 text-[10px] font-black uppercase tracking-widest">Max</button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Categories this shop can unlock (0 = none, max 54).</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sales Bonus Percentage (%)</label>
              <input readOnly value="0" className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
              <p className="text-xs text-slate-500 mt-1.5">Extra revenue percentage added to vendor sales (e.g., 15% bonus payout).</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-3 space-y-2.5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Quota Type</label>
                <p className="text-[11px] text-slate-500 leading-snug">Limits above set the cap — vendor imports &amp; unlocks manually in their dashboard.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative text-left rounded-xl border-2 p-3 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-slate-300/60 dark:ring-slate-600/60">
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_0_3px_rgba(100,116,139,0.25)]" />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white"><Store size={16} /></div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Normal</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">Manual only — no Import tool.</p>
                </div>
                <div className="relative text-left rounded-xl border-2 p-3 border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-slate-100 dark:bg-slate-800 text-slate-400"><Sparkles size={16} /></div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Special</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">Unlocks Import Products tool.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button type="button" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
            <button type="button" className="flex items-center gap-2 bg-primary-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">Generate Code</button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'form-admin-set-limit',
    label: 'Set Product Limit Form',
    category: 'Forms',
    description: 'ฟอร์มตั้งค่า Product Limit ร้านค้า (Admin)',
    preview: (
      <div className="bg-white dark:bg-slate-900 w-[360px] rounded-[2rem] shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Set Product Limit</h3>
          <div className="p-1.5 rounded-lg text-slate-400"><X size={16} /></div>
        </div>
        <p className="text-xs text-slate-500 mb-5">Manually set product limit for <span className="font-bold text-slate-700 dark:text-slate-300">Awesome Shop</span>. Current: <span className="font-bold">100</span></p>
        <div className="space-y-4">
          <input readOnly value="150" className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
            <button type="button" className="flex items-center gap-2 bg-primary-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">Save</button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'form-admin-quota-package',
    label: 'Quota Package Form',
    category: 'Forms',
    description: 'ฟอร์มสร้างแพ็กเกจ Quota (Admin)',
    preview: (
      <div className="bg-white dark:bg-slate-900 w-[420px] rounded-[2rem] shadow-2xl overflow-hidden text-left border border-slate-200 dark:border-slate-800 scale-95 origin-top-left">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">New Package</h3>
            <div className="p-1.5 rounded-lg text-slate-400"><X size={18} /></div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Package Name</label>
                <input readOnly value="Silver Pack" className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Product Slots</label>
                <input readOnly value="500" className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Limit</label>
                  <span className="text-[10px] font-bold text-slate-400">Total: 54</span>
                </div>
                <input readOnly value="5" className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                <input readOnly value="29.00" className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 outline-none font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Duration</label>
                <div className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl py-3 px-4 font-bold text-slate-900 dark:text-white">30 Days</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
              <button type="button" className="flex items-center gap-2 bg-primary-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">Save</button>
            </div>
          </div>
        </div>
      </div>
    ),
  }
];
