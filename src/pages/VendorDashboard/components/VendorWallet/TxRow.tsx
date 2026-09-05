import { ShoppingCart, Gift, ArrowUpRight } from 'lucide-react';
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


export default TxRow;