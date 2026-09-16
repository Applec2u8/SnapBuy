import React from 'react';
import {
  Package, Star, TrendingUp, ShieldCheck, User, MapPin, CalendarDays,
  Wallet, Gift, CircleDollarSign, BarChart2, ArrowRight, Clock,
  CheckCircle2, AlertCircle, ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ShopDashboardTabProps {
  shop: any;
  ownerProfile: any;
  summary: {
    saleBalance: number;
    bonusBalance: number;
    totalBalance: number;
    grossSales: number;
    totalWithdraw: number;
    publishedCount: number;
    totalViews: number;
    totalLikes: number;
  };
  operational: {
    isImporting: boolean;
    hasPausedJob: boolean;
    totalImportCompleted: number;
    totalImportTarget: number;
    shippingCount: number;
    guaranteeCount: number;
    guaranteePendingAmount?: number;
    unlockedCategoriesCount: number;
    quotaStatusText: string;
    quotaStatusColor: string;
    productLimit: number;
    totalProductCount: number;
    publishedProductCount: number;
    hiddenProductCount: number;
    outOfStockCount: number;
    slotUsage: number;
    isExpired: boolean;
    hasActiveSpecialQuota: boolean;
    hasActiveNormalQuota: boolean;
  };
  recentOrders: any[];
  recentTransactions: any[];
  onTabChange: (tab: string) => void;
  onOpenImportModal: () => void;
  onOpenFreeModal: () => void;
}

export const ShopDashboardTab: React.FC<ShopDashboardTabProps> = ({
  shop,
  ownerProfile,
  summary,
  operational,
  recentOrders,
  recentTransactions,
  onTabChange,
  onOpenImportModal,
  onOpenFreeModal,
}) => {
  const salesPct = Number(shop?.sales_percentage ?? 0);

  return (
    <div className="space-y-6">
      {/* ─── Operational Status Cards ───────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <BarChart2 size={14} className="text-primary-500" />
            สถานะการดำเนินงาน (Operational Status)
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            อัปเดตแบบเรียลไทม์
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Import Progress */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package
                  size={16}
                  className={operational.isImporting ? (operational.hasPausedJob ? 'text-amber-500' : 'text-primary-500 animate-pulse') : 'text-slate-400'}
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ความคืบหน้าการนำเข้า</p>
              </div>
            </div>
            <div>
              {operational.isImporting ? (
                <>
                  <p className="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {operational.totalImportCompleted} <span className="text-xs text-slate-400">/ {operational.totalImportTarget}</span>
                  </p>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${operational.hasPausedJob ? 'bg-amber-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.max(5, Math.min(100, (operational.totalImportCompleted / Math.max(1, operational.totalImportTarget)) * 100))}%` }}
                    />
                  </div>
                  <p className={`text-[9px] font-black mt-1.5 uppercase ${operational.hasPausedJob ? 'text-amber-500' : 'text-primary-500'}`}>
                    {operational.hasPausedJob ? 'PAUSED (ติดโควต้า)' : 'กำลังประมวลผล...'}
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  <p className="text-xs font-bold text-slate-400">ไม่มีงานนำเข้าทำงานอยู่</p>
                  <button
                    onClick={onOpenImportModal}
                    className="w-fit rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    เริ่มนำเข้าสินค้า (Import)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Quota */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star size={16} className={operational.hasActiveSpecialQuota ? 'text-violet-500' : 'text-slate-400'} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">โควต้าที่เปิดใช้งาน</p>
              </div>
              <button
                onClick={() => onTabChange('quota')}
                className="text-[10px] text-primary-500 font-bold hover:underline"
              >
                ดูรายละเอียด
              </button>
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${operational.quotaStatusColor}`}>
                {operational.quotaStatusText}
              </span>
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 mt-2">
                หมวดหมู่: {operational.unlockedCategoriesCount} ปลดล็อกแล้ว
              </p>
              <button
                onClick={onOpenFreeModal}
                className="mt-1.5 w-fit rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500 hover:text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                ปลดล็อกหมวดหมู่
              </button>
            </div>
          </div>

          {/* Shipping Items */}
          <div
            onClick={() => onTabChange('orders')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">กำลังจัดส่ง (Shipping)</p>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{operational.shippingCount}</p>
              <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">กำลังนำส่ง / รอรับสินค้า</p>
            </div>
          </div>

          {/* Pending Guarantee */}
          <div
            onClick={() => onTabChange('guarantee')}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between cursor-pointer hover:border-amber-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={operational.guaranteeCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ค้ำประกันรอชำระ</p>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className={`text-2xl font-black ${operational.guaranteeCount > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                {operational.guaranteeCount}
              </p>
              <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase">Awaiting Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Profile & Wallet Card ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Shop Profile Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex gap-5 items-start mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-md">
              <img
                src={shop.logo_url || shop.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name || 'Shop')}&background=random`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Active Shop
                </span>
                {salesPct > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                    {salesPct}% Sales Bonus
                  </span>
                )}
                {operational.isExpired && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                    Quota Expired
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{shop.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {shop.description || 'ไม่มีคำอธิบายร้านค้าสำหรับร้านนี้'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <User size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">เจ้าของ (Owner)</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                {ownerProfile?.full_name || (shop as any).profiles?.full_name || 'System Owner'}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{ownerProfile?.email || 'ไม่มีอีเมล'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <MapPin size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">ที่อยู่</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{shop.address || 'Global Store'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <CalendarDays size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">วันที่สร้าง</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">
                {shop.created_at ? new Date(shop.created_at).toLocaleDateString('th-TH') : '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
                <Star size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">คะแนนร้านค้า</span>
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">{shop.rating || '5.0'} / 5.0</p>
            </div>
          </div>
        </div>

        {/* Shop Wallet Overview Card */}
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 via-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden flex flex-col justify-between text-left">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/80">
                <Wallet size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Shop Wallet</span>
              </div>
              <span className="text-[9px] bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20 font-black uppercase tracking-widest">
                Net Balance
              </span>
            </div>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-black mb-1">ยอดเงินคงเหลือสุทธิ</p>
            <p className="text-3xl sm:text-4xl font-black mb-5 tracking-tight">
              {summary.totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">ยอดจากการขาย</p>
                <p className="text-base font-black">
                  {summary.saleBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">ยอดโบนัสพิเศษ</p>
                <p className="text-base font-black">
                  {summary.bonusBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onTabChange('wallet')}
            className="w-full rounded-2xl bg-white/20 hover:bg-white/30 border border-white/20 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all mt-2 flex items-center justify-center gap-2"
          >
            <span>ดูประวัติกระเป๋าเงินทั้งหมด</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* ─── Detail KPI Stats Row ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* Products Card */}
        <div
          onClick={() => onTabChange('products')}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm cursor-pointer hover:border-blue-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Package size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">สินค้า (Products)</span>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{operational.totalProductCount}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
            <span className="text-emerald-500">{operational.publishedProductCount} เผยแพร่</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-400">{operational.hiddenProductCount} ซ่อน</span>
            {operational.outOfStockCount > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-rose-500 font-black">{operational.outOfStockCount} หมด</span>
              </>
            )}
          </div>
        </div>

        {/* Quota Slots Card */}
        <div
          onClick={() => onTabChange('quota')}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm cursor-pointer hover:border-violet-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-violet-500">
              <CircleDollarSign size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">โควต้าสินค้า (Quota)</span>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {operational.productLimit > 0 ? `${operational.totalProductCount} / ${operational.productLimit}` : '—'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">
            {operational.productLimit > 0 ? `ใช้ไปแล้ว ${operational.slotUsage}%` : 'ยังไม่มีโควต้า'}
          </p>
          {operational.productLimit > 0 && (
            <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${operational.slotUsage >= 90 ? 'bg-rose-500' : operational.slotUsage >= 70 ? 'bg-amber-500' : 'bg-primary-500'}`}
                style={{ width: `${operational.slotUsage}%` }}
              />
            </div>
          )}
        </div>

        {/* Views Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <TrendingUp size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">การรับชมรวม (Views)</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.totalViews.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">สะสมทั้งหมดตลอดอายุร้าน</p>
        </div>

        {/* Likes Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Gift size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ถูกใจ (Likes)</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.totalLikes.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">สะสมทั้งหมดตลอดอายุร้าน</p>
        </div>
      </div>

      {/* ─── Recent Activity Section (Orders + Transactions) ────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
        {/* Recent Shipments */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  คำสั่งซื้อล่าสุด (Recent Orders)
                </h4>
              </div>
              <button
                onClick={() => onTabChange('orders')}
                className="text-[10px] font-black text-primary-500 hover:underline uppercase tracking-widest"
              >
                ดูทั้งหมด ({recentOrders.length})
              </button>
            </div>
            <div className="space-y-2.5">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  ยังไม่มีรายการคำสั่งซื้อ
                </div>
              ) : (
                recentOrders.slice(0, 5).map((item) => {
                  const status = item.orders?.status || item.status || 'processing';
                  const isDelivered = status === 'delivered';
                  const isShipped = status === 'shipped';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.products?.name || 'สินค้า'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>จำนวน: x{item.quantity || 1}</span>
                          <span>•</span>
                          <span>{item.orders?.created_at ? new Date(item.orders.created_at).toLocaleDateString('th-TH') : '—'}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                          isDelivered
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : isShipped
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-violet-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  ความเคลื่อนไหวกระเป๋าเงิน (Wallet Movement)
                </h4>
              </div>
              <button
                onClick={() => onTabChange('wallet')}
                className="text-[10px] font-black text-primary-500 hover:underline uppercase tracking-widest"
              >
                ดูทั้งหมด ({recentTransactions.length})
              </button>
            </div>
            <div className="space-y-2.5">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  ยังไม่มีประวัติธุรกรรม
                </div>
              ) : (
                recentTransactions.slice(0, 5).map((tx) => {
                  const isWithdrawal = tx.type === 'withdrawal';
                  const isBonus = tx.type === 'bonus';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            isWithdrawal
                              ? 'bg-rose-500/10 text-rose-500'
                              : isBonus
                              ? 'bg-violet-500/10 text-violet-500'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate mt-1">{tx.note || '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-xs font-black ${
                            isWithdrawal ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {isWithdrawal ? '-' : '+'}${Number(tx.amount || 0).toFixed(2)}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString('th-TH') : '—'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
