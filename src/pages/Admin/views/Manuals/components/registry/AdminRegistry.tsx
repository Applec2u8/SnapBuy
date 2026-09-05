import React from 'react';
import type { ComponentItem } from '../ComponentRegistry';
import { Users, DollarSign, ShoppingCart, Store, TrendingUp, TrendingDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export const AdminRegistry: ComponentItem[] = [
  {
    id: 'admin-stat-card',
    label: 'Stat Card (Admin Dashboard)',
    category: 'Admin Widgets',
    description: 'การ์ดสถิติหน้า Admin พร้อมกราฟ',
    preview: (
      <div className="grid grid-cols-2 gap-3 w-[400px]">
        {[
          { title: 'Total Revenue', val: '$45,231', trend: '+12.5%', up: true, icon: <DollarSign size={16}/>, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Active Orders', val: '1,204', trend: '+5.2%', up: true, icon: <ShoppingCart size={16}/>, color: 'text-primary-500', bg: 'bg-primary-500/10' },
          { title: 'Registered Users', val: '8,421', trend: '-1.4%', up: false, icon: <Users size={16}/>, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Shops', val: '432', trend: '+8.1%', up: true, icon: <Store size={16}/>, color: 'text-orange-500', bg: 'bg-orange-500/10' }
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${s.up ? 'text-green-600 bg-green-100 dark:bg-green-500/20' : 'text-red-600 bg-red-100 dark:bg-red-500/20'}`}>
                {s.up ? <TrendingUp size={8}/> : <TrendingDown size={8}/>} {s.trend}
              </span>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.title}</h4>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'admin-table-row',
    label: 'Data Table Row (Admin)',
    category: 'Admin Widgets',
    description: 'แถวข้อมูลตารางในระบบหลังบ้าน',
    preview: (
      <div className="w-[600px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-10">ID</div>
          <div className="flex-1">User / Vendor</div>
          <div className="w-32">Status</div>
          <div className="w-24">Date</div>
          <div className="w-24 text-right">Revenue</div>
          <div className="w-12 text-center">Act</div>
        </div>
        {[
          { id: '#001', name: 'John Doe', email: 'john@example.com', status: 'Active', bg: 'bg-green-100 text-green-700', date: 'Oct 24, 2024', rev: '$1,240' },
          { id: '#002', name: 'Jane Smith', email: 'jane@example.com', status: 'Pending', bg: 'bg-yellow-100 text-yellow-700', date: 'Oct 23, 2024', rev: '$450' }
        ].map(r => (
          <div key={r.id} className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
            <div className="w-10 text-[10px] font-mono text-slate-400">{r.id}</div>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[9px] font-black">{r.name[0]}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 dark:text-white">{r.name}</p>
                <p className="text-[8px] text-slate-400">{r.email}</p>
              </div>
            </div>
            <div className="w-32">
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${r.bg}`}>{r.status}</span>
            </div>
            <div className="w-24 text-[9px] text-slate-500">{r.date}</div>
            <div className="w-24 text-right text-[10px] font-black text-slate-900 dark:text-white">{r.rev}</div>
            <div className="w-12 flex justify-center">
              <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"><MoreVertical size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];
