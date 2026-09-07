import { motion } from 'framer-motion';
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
export default WalletCard;