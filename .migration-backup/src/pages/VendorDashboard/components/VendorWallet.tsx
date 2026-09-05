import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  Gift,
  ArrowUpRight,
  Loader2,
  History,
  ShoppingCart,
  RefreshCw,
  CircleDollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────
interface ShopWalletTx {
  id: string;
  shop_id: string;
  type: 'sale' | 'bonus' | 'withdrawal';
  amount: number;
  note: string | null;
  created_at: string;
}

// ─── Stat Card ────────────────────────────────────────────────────
const WalletCard = ({
  icon,
  label,
  value,
  color,
  sub,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  sub?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ y: 16, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-3 shadow-sm"
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p 
        className={`text-2xl sm:text-3xl font-black truncate ${color.replace('bg-', 'text-').replace('/10', '').replace('/20', '')}`}
        title={value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      >
        {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

// ─── Transaction Row ──────────────────────────────────────────────
const TxRow = ({ tx }: { tx: ShopWalletTx }) => {
  const { t } = useTranslation();
  const meta = {
    sale: { label: 'Sale Revenue', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20', icon: <ShoppingCart size={13} className="text-emerald-500" />, sign: '+' },
    bonus: { label: 'Bonus', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20', icon: <Gift size={13} className="text-amber-500" />, sign: '+' },
    withdrawal: { label: 'Withdrawal', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20', icon: <ArrowUpRight size={13} className="text-rose-500" />, sign: '−' },
  }[tx.type];

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{t(`vendor_wallet_${tx.type}`)}</p>
        {tx.note && (
          <p className="text-[10px] text-slate-400 truncate">{tx.note}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-black ${meta.color}`}>
          {meta.sign}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {new Date(tx.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const VendorWallet = () => {
  const { t } = useTranslation();
  const { shop: storeShop, profile, user, fetchProfile } = useAuthStore();

  const [shop, setShop] = useState<any>(storeShop || null);
  const [transactions, setTransactions] = useState<ShopWalletTx[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);


  // ── Fetch Shop ─────────────────────────────────────────────────
  const fetchShop = useCallback(async () => {
    if (!storeShop?.id) { setLoadingShop(false); return; }
    setLoadingShop(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, sale_balance, bonus_balance, sales_percentage, owner_id')
        .eq('id', storeShop.id)
        .single();
      if (error) throw error;
      setShop(data);
    } catch (err) {
      console.error('Error fetching shop wallet:', err);
    } finally {
      setLoadingShop(false);
    }
  }, [storeShop?.id]);

  // ── Fetch Transactions ─────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!storeShop?.id) { setLoadingTx(false); return; }
    setLoadingTx(true);
    try {
      const { data, error } = await supabase
        .from('shop_wallet_transactions')
        .select('*')
        .eq('shop_id', storeShop.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  }, [storeShop?.id]);

  useEffect(() => {
    fetchShop();
    fetchTransactions();
  }, [fetchShop, fetchTransactions]);

  // ── Withdraw ───────────────────────────────────────────────────
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!shop || isNaN(amount) || amount <= 0) return;

    setWithdrawing(true);
    try {
      const { data, error } = await supabase.rpc('withdraw_shop_wallet', {
        p_shop_id: shop.id,
        p_amount: amount,
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`✅ Withdraw successful ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
        setWithdrawAmount('');
        await Promise.all([fetchShop(), fetchTransactions(), user?.id ? fetchProfile(user.id) : Promise.resolve()]);
      }
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถถอนเงินได้');
    } finally {
      setWithdrawing(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────
  const saleBalance = Number(shop?.sale_balance || 0);
  const bonusBalance = Number(shop?.bonus_balance || 0);
  const totalBalance = saleBalance + bonusBalance;
  const personalBalance = Number(profile?.wallet_balance || 0);
  const withdrawVal = parseFloat(withdrawAmount) || 0;
  const canWithdraw = withdrawVal > 0 && withdrawVal <= totalBalance;
  const previewPersonal = personalBalance + withdrawVal;

  if (loadingShop) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-primary-500/10 rounded-3xl flex items-center justify-center">
            <Wallet size={32} className="text-primary-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_wallet_no_shop')}</h2>
          <p className="text-sm text-slate-400 max-w-sm">{t('vendor_wallet_no_shop_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_wallet_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('vendor_wallet_desc')}</p>
        </div>
        <button
          onClick={() => { fetchShop(); fetchTransactions(); }}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </motion.div>

      {/* ── Wallet Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <WalletCard
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          label={t('vendor_wallet_sale')}
          value={saleBalance}
          color="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600"
          sub={t('vendor_wallet_sale_desc')}
          delay={0}
        />
        <WalletCard
          icon={<Gift size={20} className="text-amber-500" />}
          label={t('vendor_wallet_bonus')}
          value={bonusBalance}
          color="bg-amber-100 dark:bg-amber-500/20 text-amber-500"
          sub={t('vendor_wallet_bonus_desc', { pct: shop?.sales_percentage || 0 })}
          delay={0.06}
        />
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
          className="bg-gradient-to-br from-primary-500 to-indigo-500 rounded-3xl p-6 flex flex-col gap-3 shadow-xl shadow-primary-500/25"
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">{t('vendor_wallet_total_shop_balance')}</p>
            <p 
              className="text-2xl sm:text-3xl font-black text-white truncate"
              title={totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            >
              {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            <p className="text-[10px] text-white/60 mt-1">ยอดรวมกระเป๋าร้านค้า</p>
          </div>
        </motion.div>
      </div>

      {/* ── Withdraw Panel ── */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={18} className="text-primary-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_wallet_withdraw')}</h2>
          </div>
          <p className="text-xs text-slate-400">โอนเงินจากกระเป๋าร้านค้าไปยังกระเป๋าส่วนตัวของคุณ</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Balance info row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">กระเป๋าร้านค้า</p>
              <p 
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate"
                title={totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              >
                {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">กระเป๋าส่วนตัว</p>
              <p 
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate"
                title={personalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              >
                {personalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('vendor_wallet_withdraw_amount')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</span>
              <input
                id="withdraw-amount-input"
                type="number"
                min="0.01"
                step="0.01"
                max={totalBalance}
                value={withdrawAmount}
                onChange={e => {
                  setWithdrawAmount(e.target.value);
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>
            {withdrawVal > totalBalance && (
              <p className="text-xs font-bold text-rose-500">⚠ Insufficient funds (available {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</p>
            )}
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[25, 50, 75, 100].map(pct => {
              const amt = (totalBalance * pct / 100);
              return (
                <button
                  key={pct}
                  onClick={() => { setWithdrawAmount(amt.toFixed(2)); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-500/10 hover:text-primary-500 text-xs font-black text-slate-500 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {pct}%
                </button>
              );
            })}
            <button
              onClick={() => { setWithdrawAmount(totalBalance.toFixed(2)); }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-500/10 hover:text-primary-500 text-xs font-black text-slate-500 transition-colors border border-slate-200 dark:border-slate-700"
            >
              ทั้งหมด
            </button>
          </div>

          {/* Preview + Confirm */}
          <AnimatePresence>
            {canWithdraw && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 mb-4">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Preview หลังถอนเงิน</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400">กระเป๋าร้านค้าเหลือ</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white">
                        {(totalBalance - withdrawVal).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">กระเป๋าส่วนตัวจะเป็น</p>
                      <p className="text-lg font-black text-emerald-600">
                        {previewPersonal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="withdraw-confirm-btn"
            onClick={handleWithdraw}
            disabled={!canWithdraw || withdrawing}
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {withdrawing
              ? <><Loader2 size={16} className="animate-spin" /> {t('vendor_wallet_pending')}...</>
              : <><CircleDollarSign size={16} /> {t('vendor_wallet_withdraw')} {withdrawVal > 0 ? withdrawVal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'}</>
            }
          </button>
        </div>
      </motion.div>

      {/* ── Transaction History ── */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('vendor_wallet_history')}</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ล่าสุด 50 รายการ</span>
        </div>

        <div className="p-6">
          {loadingTx ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary-500" size={24} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <History size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-400">{t('vendor_wallet_no_history')}</p>
              <p className="text-xs text-slate-300 dark:text-slate-600">รายการจะแสดงเมื่อมีการขายหรือถอนเงิน</p>
            </div>
          ) : (
            <div>
              {transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default VendorWallet;
