import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, DollarSign, ArrowUpRight, ArrowDownLeft,
  Filter, Download, Calendar, Search, RefreshCw,
  Clock, ShieldCheck, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'sonner';

interface ShopWalletTabProps {
  shopId: string;
  shop: any;
  walletTotals: {
    sale: number;
    bonus: number;
    withdrawal: number;
    total: number;
  };
  onRefresh: () => void;
}

const TX_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  sale: { label: 'ยอดขาย (Sale)', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  bonus: { label: 'โบนัส (Bonus)', color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
  withdrawal: { label: 'ถอนเงิน (Withdrawal)', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
};

export const ShopWalletTab: React.FC<ShopWalletTabProps> = ({
  shopId,
  shop,
  walletTotals,
  onRefresh,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'bonus' | 'withdrawal'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchNote, setSearchNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 30;

  // Authoritative balance
  const saleBalance = Number(shop?.sale_balance ?? walletTotals.sale ?? 0);
  const bonusBalance = Number(shop?.bonus_balance ?? walletTotals.bonus ?? 0);
  const netBalance = saleBalance + bonusBalance;
  const totalWithdrawn = walletTotals.withdrawal;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('shop_wallet_transactions')
        .select('*', { count: 'exact' })
        .eq('shop_id', shopId);

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      if (dateFrom) {
        query = query.gte('created_at', new Date(dateFrom).toISOString());
      }

      if (dateTo) {
        query = query.lte('created_at', new Date(dateTo + 'T23:59:59.999Z').toISOString());
      }

      if (searchNote.trim()) {
        query = query.ilike('note', `%${searchNote.trim()}%`);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถโหลดรายการธุรกรรมได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [shopId, filterType, dateFrom, dateTo, searchNote, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExportCSV = async () => {
    try {
      let query = supabase
        .from('shop_wallet_transactions')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (filterType !== 'all') query = query.eq('type', filterType);
      if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
      if (dateTo) query = query.lte('created_at', new Date(dateTo + 'T23:59:59.999Z').toISOString());

      const { data, error } = await query;
      if (error) throw error;

      const rows = data || [];
      const header = ['Transaction ID', 'Type', 'Amount ($)', 'Note', 'Created At'];
      const csv = [header.join(',')].concat(
        rows.map((r: any) => [
          r.id,
          r.type,
          r.amount,
          `"${(r.note || '').toString().replace(/"/g, '""')}"`,
          r.created_at
        ].join(','))
      ).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop_${shopId}_wallet_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด CSV');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 text-left">
      {/* ─── Top View-Only Banner ─────────────────────────────────── */}
      <div className="rounded-3xl p-4 bg-primary-500/10 border border-primary-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/20 text-primary-500 flex items-center justify-center flex-shrink-0">
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary-500">
                กระเป๋าเงินร้านค้า (Shop Wallet Overview)
              </h4>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-500 text-white">
                ดูอย่างเดียว (Read Only)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ตรวจสอบยอดเงินคงเหลือ รายได้จากการขาย ยอดโบนัส และประวัติการทำธุรกรรมทั้งหมดของร้านค้านี้
            </p>
          </div>
        </div>
        <button
          onClick={() => { onRefresh(); fetchTransactions(); }}
          className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline px-3 py-1.5 w-fit"
        >
          <RefreshCw size={13} />
          <span>รีเฟรชยอดเงิน</span>
        </button>
      </div>

      {/* ─── Wallet Balance Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Current Balance */}
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 p-6 text-white shadow-xl shadow-primary-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-white/80">
              <div className="flex items-center gap-2">
                <Wallet size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">ยอดเงินคงเหลือสุทธิ</span>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-black">
                Net Balance
              </span>
            </div>
            <p className="text-3xl font-black mb-1">
              ${netBalance.toFixed(2)}
            </p>
            <p className="text-xs text-white/70">
              ยอดคงเหลือที่สามารถใช้งานได้
            </p>
          </div>
        </div>

        {/* Sales Balance */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-emerald-500">
              <div className="flex items-center gap-2">
                <ArrowDownLeft size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ยอดจากการขาย (Sales)</span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase font-black">
                Revenue
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              ${saleBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 font-bold">
              รายได้จากการขายสินค้าทั้งหมด
            </p>
          </div>
        </div>

        {/* Bonus Balance */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-violet-500">
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ยอดโบนัสพิเศษ (Bonus)</span>
              </div>
              <span className="text-[9px] bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-full uppercase font-black">
                Sales Share
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              ${bonusBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 font-bold">
              โบนัสส่วนแบ่งยอดขาย {shop?.sales_percentage || 0}%
            </p>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-rose-500">
              <div className="flex items-center gap-2">
                <ArrowUpRight size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ยอดที่ถอนแล้ว (Withdrawn)</span>
              </div>
              <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full uppercase font-black">
                Payout
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              ${totalWithdrawn.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 font-bold">
              ยอดเงินที่ร้านค้าถอนออกไปทั้งหมด
            </p>
          </div>
        </div>
      </div>

      {/* ─── Transaction Filters & Export ─────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all"
            >
              <option value="all">ทุกประเภทธุรกรรม</option>
              <option value="sale">ยอดขาย (Sales)</option>
              <option value="bonus">โบนัสพิเศษ (Bonus)</option>
              <option value="withdrawal">การถอนเงิน (Withdrawal)</option>
            </select>

            {/* Date From */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <span>จาก:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <span>ถึง:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all"
              />
            </div>

            {(dateFrom || dateTo || filterType !== 'all' || searchNote) && (
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setFilterType('all');
                  setSearchNote('');
                  setCurrentPage(1);
                }}
                className="text-xs text-slate-400 hover:text-rose-500 font-bold px-2 py-1"
              >
                ล้างฟิลเตอร์
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search note */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="ค้นหาบันทึก..."
                value={searchNote}
                onChange={(e) => { setSearchNote(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-primary-500 rounded-xl py-1.5 px-3 pl-8 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
            >
              <Download size={14} />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* ─── Transactions Table ─────────────────────────────────── */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-bold animate-pulse">
            กำลังโหลดรายการธุรกรรม...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            ไม่พบประวัติธุรกรรมที่ตรงกับเงื่อนไข
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-3 pl-2">รหัสธุรกรรม (ID)</th>
                  <th className="pb-3">ประเภท</th>
                  <th className="pb-3">บันทึก / รายละเอียด</th>
                  <th className="pb-3">จำนวนเงิน</th>
                  <th className="pb-3 pr-2 text-right">วัน-เวลาที่ทำรายการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {transactions.map((t) => {
                  const meta = TX_TYPE_META[t.type] || TX_TYPE_META['sale'];
                  const isWithdrawal = t.type === 'withdrawal';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-slate-400">
                        #{t.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {t.note || '—'}
                      </td>
                      <td className="py-3.5 font-mono">
                        <span className={`text-sm font-black ${isWithdrawal ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {isWithdrawal ? '-' : '+'}${Number(t.amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right text-slate-400 font-mono text-[11px]">
                        {t.created_at ? new Date(t.created_at).toLocaleString('th-TH') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <p>
              แสดง {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} จากทั้งหมด {totalCount} ธุรกรรม
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
