import React, { useState, useEffect } from 'react';
import {
  Package, CircleDollarSign, Percent, Clock, Tag, Gift,
  CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, UploadCloud,
  ChevronRight, Calendar
} from 'lucide-react';

interface ShopQuotaTabProps {
  shop: any;
  totalProductCount: number;
  shopCats: string[];
  allCategories: any[];
  quotaHistory: any[];
  onOpenUnlockModal: () => void;
  onOpenImportModal: () => void;
  onRefresh: () => void;
}

export const ShopQuotaTab: React.FC<ShopQuotaTabProps> = ({
  shop,
  totalProductCount,
  shopCats,
  allCategories,
  quotaHistory,
  onOpenUnlockModal,
  onOpenImportModal,
}) => {
  const productLimit = Number(shop?.product_limit ?? 0);
  const categoryLimit = Number(shop?.category_limit ?? 0);
  const salesPct = Number(shop?.sales_percentage ?? 0);
  const quotaExpiresAt = shop?.quota_expires_at ?? null;
  const specialQuotaExpiresAt = shop?.special_quota_expires_at ?? null;

  const isExpired = quotaExpiresAt ? new Date(quotaExpiresAt) < new Date() : false;
  const isSpecialExpired = specialQuotaExpiresAt ? new Date(specialQuotaExpiresAt) < new Date() : false;
  const hasActiveSpecialQuota = Boolean(shop?.has_special_quota && (!specialQuotaExpiresAt || !isSpecialExpired));
  const hasActiveNormalQuota = Boolean(productLimit > 0 && !isExpired);

  const slotUsage = productLimit > 0 ? Math.min(100, Math.round((totalProductCount / productLimit) * 100)) : 0;
  const availableSlots = Math.max(0, productLimit - totalProductCount);
  const availableCategorySlots = Math.max(0, categoryLimit - shopCats.length);

  // Countdown timer for expiry
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const target = hasActiveSpecialQuota && specialQuotaExpiresAt ? specialQuotaExpiresAt : quotaExpiresAt;
    if (!target) {
      setTimeLeft(null);
      return;
    }
    const update = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [quotaExpiresAt, specialQuotaExpiresAt, hasActiveSpecialQuota]);

  const unlockedCategoryNames = allCategories.filter(c => shopCats.includes(c.id));

  return (
    <div className="space-y-6 text-left">
      {/* ─── Top Quota Overview Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Product Slots */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-primary-500">
                <Package size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">โควต้าสินค้า (Product Limit)</span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
                {productLimit > 0 ? `${slotUsage}% Used` : 'No Limit'}
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalProductCount.toLocaleString()} <span className="text-sm font-bold text-slate-400">/ {productLimit > 0 ? productLimit.toLocaleString() : '—'}</span>
            </p>
            <p className="text-xs text-slate-500 font-bold mt-1">
              คงเหลือว่าง: <span className="text-primary-500 font-black">{availableSlots.toLocaleString()} ชิ้น</span>
            </p>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  slotUsage >= 90 ? 'bg-rose-500' : slotUsage >= 70 ? 'bg-amber-500' : 'bg-primary-500'
                }`}
                style={{ width: `${slotUsage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Limit */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-violet-500">
                <Tag size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">หมวดหมู่ (Category Limit)</span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                Unlocked
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {shopCats.length} <span className="text-sm font-bold text-slate-400">/ {categoryLimit > 0 ? categoryLimit : '—'}</span>
            </p>
            <p className="text-xs text-slate-500 font-bold mt-1">
              ปลดล็อกเพิ่มได้อีก: <span className="text-violet-500 font-black">{availableCategorySlots} หมวด</span>
            </p>
          </div>
          <button
            onClick={onOpenUnlockModal}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500 text-violet-600 dark:text-violet-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            ปลดล็อกหมวดหมู่ฟรี
          </button>
        </div>

        {/* Sales Percentage Bonus */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-500">
                <Percent size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ส่วนแบ่งยอดขาย (Sales Bonus)</span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                Bonus Share
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {salesPct}%
            </p>
            <p className="text-xs text-slate-500 font-bold mt-1">
              ร้านค้าจะได้รับโบนัสส่วนแบ่ง {salesPct}% จากยอดสั่งซื้อ
            </p>
          </div>
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 size={13} className="flex-shrink-0" />
            <span>คำนวณเข้า Bonus Balance อัตโนมัติ</span>
          </div>
        </div>

        {/* Expiry Countdown */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-500">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">อายุโควต้า (Expiry)</span>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isExpired ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
            {timeLeft ? (
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {timeLeft.days}ว {timeLeft.hours}ชม {timeLeft.minutes}น
                </p>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  หมดอายุ: {new Date(hasActiveSpecialQuota && specialQuotaExpiresAt ? specialQuotaExpiresAt : quotaExpiresAt!).toLocaleDateString('th-TH')}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {quotaExpiresAt ? (isExpired ? 'หมดอายุแล้ว' : new Date(quotaExpiresAt).toLocaleDateString('th-TH')) : 'ไม่จำกัดเวลา'}
                </p>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  {isExpired ? 'กรุณาเติมหรือเปิดโควต้าใหม่' : 'ไม่มีกำหนดวันหมดอายุ'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onOpenImportModal}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20"
          >
            นำเข้าสินค้าตามโควต้า
          </button>
        </div>
      </div>

      {/* ─── Unlocked Categories ──────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Tag size={16} className="text-violet-500" />
              หมวดหมู่ที่ปลดล็อกแล้วสำหรับร้านค้านี้ ({unlockedCategoryNames.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ร้านค้านี้สามารถลงและจัดหมวดหมู่สินค้าในกลุ่มด้านล่างนี้ได้
            </p>
          </div>
          <button
            onClick={onOpenUnlockModal}
            className="px-4 py-2 rounded-xl bg-violet-500 text-white hover:bg-violet-600 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 w-fit"
          >
            + ปลดล็อกหมวดหมู่เพิ่มเติม
          </button>
        </div>

        {unlockedCategoryNames.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            ยังไม่มีหมวดหมู่ที่ปลดล็อก คลิกที่ปุ่ม "ปลดล็อกหมวดหมู่เพิ่มเติม" เพื่อเปิดใช้งาน
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unlockedCategoryNames.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700/80"
              >
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>{cat.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── Quota Redemption / Activation History ────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Calendar size={16} className="text-primary-500" />
              ประวัติการใช้งานโค้ดโควต้า (Quota Redemption History)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              รายการโค้ดที่ร้านค้านี้เคยนำมากรอกใช้งานเพื่อเพิ่มโควต้า
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
            {quotaHistory.length} รายการ
          </span>
        </div>

        {quotaHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            ไม่พบประวัติการใช้โค้ดโควต้าสำหรับร้านนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">โค้ด (Code)</th>
                  <th className="pb-3">ระยะเวลา</th>
                  <th className="pb-3">โควต้าสินค้า</th>
                  <th className="pb-3">หมวดหมู่</th>
                  <th className="pb-3">โบนัส %</th>
                  <th className="pb-3">ประเภท</th>
                  <th className="pb-3 pr-2">วันที่เปิดใช้งาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {quotaHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-2 font-mono text-primary-500 font-black">{item.code || '—'}</td>
                    <td className="py-3">{item.duration_days ? `${item.duration_days} วัน` : 'ถาวร'}</td>
                    <td className="py-3">{item.product_limit ? `${item.product_limit.toLocaleString()} ชิ้น` : '—'}</td>
                    <td className="py-3">{item.category_limit ? `${item.category_limit} หมวด` : '—'}</td>
                    <td className="py-3">{item.sales_percentage ? `${item.sales_percentage}%` : '—'}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                          item.is_special_quota
                            ? 'bg-violet-500/10 text-violet-500 border border-violet-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.is_special_quota ? 'Special' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-slate-400">
                      {item.used_at ? new Date(item.used_at).toLocaleString('th-TH') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
