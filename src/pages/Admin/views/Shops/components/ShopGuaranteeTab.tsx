import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, AlertCircle, CheckCircle2, Search,
  ShoppingBag, User, MapPin, Calendar, Clock, Eye,
  Phone, Package, Filter, FileText
} from 'lucide-react';

interface ShopGuaranteeTabProps {
  shop: any;
  pendingItems: any[];
  paidItems: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const ShopGuaranteeTab: React.FC<ShopGuaranteeTabProps> = ({
  shop,
  pendingItems,
  paidItems,
  loading,
  onRefresh,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'paid' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute stats
  const pendingTotalDeposit = useMemo(() => {
    return pendingItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1) * 0.2), 0);
  }, [pendingItems]);

  const paidTotalDeposit = useMemo(() => {
    return paidItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1) * 0.2), 0);
  }, [paidItems]);

  const allItems = useMemo(() => {
    return [...pendingItems, ...paidItems];
  }, [pendingItems, paidItems]);

  const filteredItems = useMemo(() => {
    let list: any[] = [];
    if (filterTab === 'pending') list = pendingItems;
    else if (filterTab === 'paid') list = paidItems;
    else list = allItems;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const orderId = (item.orders?.id || item.order_id || '').toLowerCase();
      const prodName = (item.products?.name || '').toLowerCase();
      const customerName = (
        item.orders?.profiles?.full_name ||
        item.orders?.user_addresses?.full_name ||
        item.orders?.address?.full_name ||
        ''
      ).toLowerCase();
      return orderId.includes(q) || prodName.includes(q) || customerName.includes(q);
    });
  }, [filterTab, pendingItems, paidItems, allItems, searchQuery]);

  return (
    <div className="space-y-6 text-left">
      {/* ─── Top View-Only Banner ─────────────────────────────────── */}
      <div className="rounded-3xl p-4 bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-500">
                ระบบตรวจสอบเงินค้ำประกันคำสั่งซื้อ (Guarantee Payments)
              </h4>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                ดูอย่างเดียว (Read Only)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              แสดงรายการเงินค้ำประกันคำสั่งซื้อของร้าน {shop?.name} เพื่อความโปร่งใสและตรวจสอบได้
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline px-3 py-1.5 w-fit"
        >
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* ─── Guarantee Metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Guarantee */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                รอชำระค้ำประกัน (Pending)
              </span>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
              Awaiting Payment
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {pendingItems.length} <span className="text-sm font-bold text-slate-400">รายการ</span>
          </p>
          <p className="text-xs text-slate-500 font-bold mt-1">
            ยอดค้ำประกันรวม: <span className="text-amber-500 font-black">${pendingTotalDeposit.toFixed(2)}</span>
          </p>
        </div>

        {/* Paid Guarantee */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                ชำระค้ำประกันแล้ว (Paid)
              </span>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
              Completed
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {paidItems.length} <span className="text-sm font-bold text-slate-400">รายการ</span>
          </p>
          <p className="text-xs text-slate-500 font-bold mt-1">
            ยอดค้ำประกันที่ชำระแล้ว: <span className="text-emerald-500 font-black">${paidTotalDeposit.toFixed(2)}</span>
          </p>
        </div>

        {/* Total Ratio */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-primary-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                อัตราการค้ำประกันรวม
              </span>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
              20% Deposit
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {allItems.length} <span className="text-sm font-bold text-slate-400">คำสั่งซื้อทั้งหมด</span>
          </p>
          <p className="text-xs text-slate-500 font-bold mt-1">
            ยอดค้ำประกันสะสม: <span className="text-primary-500 font-black">${(pendingTotalDeposit + paidTotalDeposit).toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* ─── Controls & Filter Tabs ───────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterTab === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              รอชำระค้ำประกัน ({pendingItems.length})
            </button>
            <button
              onClick={() => setFilterTab('paid')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterTab === 'paid'
                  ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ประวัติที่ชำระแล้ว ({paidItems.length})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-primary-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ทั้งหมด ({allItems.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="ค้นหาเลขคำสั่งซื้อ, สินค้า หรือชื่อลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl py-2 px-4 pl-9 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Guarantee Items Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold animate-pulse">
            กำลังโหลดรายการค้ำประกัน...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            ไม่พบรายการค้ำประกันที่ตรงกับเงื่อนไข
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">เลขคำสั่งซื้อ (Order)</th>
                  <th className="pb-3">สินค้า (Product)</th>
                  <th className="pb-3">ลูกค้า & ที่อยู่จัดส่ง</th>
                  <th className="pb-3">ราคาสินค้า</th>
                  <th className="pb-3">เงินค้ำประกัน (20%)</th>
                  <th className="pb-3">สถานะ</th>
                  <th className="pb-3 pr-2">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {filteredItems.map((item) => {
                  const isPaid = Boolean(item.guarantee_paid);
                  const orderObj = Array.isArray(item.orders) ? item.orders[0] : item.orders;
                  const addrObj =
                    orderObj?.user_addresses ||
                    (Array.isArray(orderObj?.user_addresses) ? orderObj.user_addresses[0] : null) ||
                    orderObj?.address ||
                    null;
                  const customerName =
                    addrObj?.full_name || orderObj?.profiles?.full_name || 'ลูกค้าทั่วไป';
                  const phone = addrObj?.phone;
                  const fullAddress = addrObj
                    ? [addrObj.address_line, addrObj.district, addrObj.city, addrObj.province, addrObj.postal_code]
                        .filter(Boolean)
                        .join(' ')
                    : 'ไม่ระบุที่อยู่จัดส่ง';

                  const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
                  const guaranteeFee = itemTotal * 0.2;

                  const prodImage =
                    item.product_variants?.image_url ||
                    (Array.isArray(item.products?.images) ? item.products.images[0] : null) ||
                    '';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Order ID */}
                      <td className="py-4 pl-2 font-mono">
                        <span className="text-primary-500 font-black">
                          #{item.orders?.id ? item.orders.id.slice(0, 8) : item.id.slice(0, 8)}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : '—'}
                        </p>
                      </td>

                      {/* Product */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                            {prodImage ? (
                              <img src={prodImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[220px]">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.products?.name || 'สินค้า'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.product_variants ? `${item.product_variants.name}: ${item.product_variants.value}` : 'มาตรฐาน'} • x{item.quantity || 1}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer & Address */}
                      <td className="py-4 max-w-[240px]">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{customerName}</p>
                        {phone && <p className="text-[10px] text-slate-400">{phone}</p>}
                        <p className="text-[10px] text-slate-400 truncate mt-0.5" title={fullAddress}>
                          {fullAddress}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-4 font-mono">
                        <span className="text-slate-900 dark:text-white font-bold">${itemTotal.toFixed(2)}</span>
                        <p className="text-[10px] text-slate-400">(${Number(item.price || 0).toFixed(2)} x {item.quantity || 1})</p>
                      </td>

                      {/* Guarantee Fee */}
                      <td className="py-4 font-mono">
                        <span className={`text-sm font-black ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                          ${guaranteeFee.toFixed(2)}
                        </span>
                        <p className="text-[9px] text-slate-400">มัดจำ 20%</p>
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 size={11} /> ชำระแล้ว
                            </>
                          ) : (
                            <>
                              <Clock size={11} /> รอชำระค้ำประกัน
                            </>
                          )}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 pr-2 text-slate-400 font-mono text-[10px]">
                        {isPaid && item.guarantee_paid_at ? (
                          <div>
                            <span className="text-emerald-500 font-bold">Paid at:</span>
                            <p>{new Date(item.guarantee_paid_at).toLocaleString('th-TH')}</p>
                          </div>
                        ) : (
                          <div>
                            <span>Created:</span>
                            <p>{item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : '—'}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
