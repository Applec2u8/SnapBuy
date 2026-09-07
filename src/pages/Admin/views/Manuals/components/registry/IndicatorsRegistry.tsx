import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { ShoppingBag, Truck, PackageCheck, FileSearch, RefreshCw } from 'lucide-react';

export const IndicatorsRegistry: ComponentItem[] = [
  {
    id: 'indicator-progress-bar',
    label: 'Progress Bar',
    category: 'Indicators',
    description: 'แถบความคืบหน้า (เช่น การจัดส่ง, ยอดขาย)',
    preview: (
      <div className="w-72 space-y-2">
        <div className="flex justify-between text-[9px] font-bold">
          <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider">Free Shipping Target</span>
          <span className="text-primary-500 font-black">$35 / $50</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 w-[70%] rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]" />
        </div>
        <p className="text-[9px] text-slate-400">Add $15 more to get free shipping!</p>
      </div>
    ),
  },
  {
    id: 'indicator-step-tracker',
    label: 'Order Step Tracker',
    category: 'Indicators',
    description: 'สถานะการจัดส่งแบบเส้น',
    preview: (
      <div className="w-80 px-2 py-4">
        <div className="relative flex justify-between">
          <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700" />
          <div className="absolute top-3 left-0 w-[50%] h-0.5 bg-primary-500" />
          
          {[
            { icon: <ShoppingBag size={10} />, label: 'Ordered', status: 'done' },
            { icon: <PackageCheck size={10} />, label: 'Packed', status: 'done' },
            { icon: <Truck size={10} />, label: 'Shipping', status: 'active' },
            { icon: <ShoppingBag size={10} />, label: 'Delivered', status: 'pending' },
          ].map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${s.status === 'done' ? 'bg-primary-500 border-primary-500 text-white' : s.status === 'active' ? 'bg-white dark:bg-slate-900 border-primary-500 text-primary-500 shadow-[0_0_0_3px_rgba(124,58,237,0.2)]' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-600'}`}>
                {s.icon}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-wider ${s.status === 'pending' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'indicator-empty-state',
    label: 'Empty State (No Data)',
    category: 'Indicators',
    description: 'หน้าจอว่างเปล่าเมื่อไม่มีข้อมูล',
    preview: (
      <div className="w-72 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-1">
          <FileSearch size={20} className="text-slate-400" />
        </div>
        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">No Orders Yet</h4>
        <p className="text-[9px] text-slate-400 max-w-[200px]">You haven't placed any orders yet. Start shopping to see your orders here.</p>
        <button className="mt-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm shadow-primary-500/20">Explore Products</button>
      </div>
    ),
  },
  {
    id: 'indicator-skeleton',
    label: 'Skeleton Loading (List)',
    category: 'Indicators',
    description: 'หน้าจอโหลดข้อมูล (Skeleton)',
    preview: (
      <div className="w-72 space-y-3 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mt-2" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'indicator-spinner',
    label: 'Loading Spinners',
    category: 'Indicators',
    description: 'ไอคอนโหลดแบบหมุน',
    preview: (
      <div className="flex gap-6 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-fit">
        <RefreshCw size={16} className="text-primary-500 animate-spin" />
        <div className="w-4 h-4 border-2 border-slate-200 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin" />
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    ),
  },
];
