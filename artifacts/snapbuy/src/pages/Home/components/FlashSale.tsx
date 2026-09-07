import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';
import { motion } from 'framer-motion';

interface FlashSaleProps {
  products: any[];
}

const SALE_HOURS = 2;
const SALE_MINUTES = 45;
const SALE_SECONDS = 0;

const useCountdown = (h: number, m: number, s: number) => {
  const [time, setTime] = useState(h * 3600 + m * 60 + s);
  useEffect(() => {
    const id = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = Math.floor(time / 3600).toString().padStart(2, '0');
  const mm = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
  const ss = (time % 60).toString().padStart(2, '0');
  return { hh, mm, ss };
};

const TimeBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-slate-900 dark:bg-slate-950 text-white font-black text-sm sm:text-base w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg shadow-inner border border-slate-700 tabular-nums">
      {value}
    </div>
    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</span>
  </div>
);

export const FlashSale = ({ products }: FlashSaleProps) => {
  const { hh, mm, ss } = useCountdown(SALE_HOURS, SALE_MINUTES, SALE_SECONDS);

  return (
    <section className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-primary-500/20 shadow-xl text-left">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Zap size={14} className="fill-white text-white" />
            <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Flash Sale</span>
          </div>
          <div className="flex items-end gap-1.5">
            <TimeBlock value={hh} label="hrs" />
            <span className="text-white font-black text-lg mb-2.5">:</span>
            <TimeBlock value={mm} label="min" />
            <span className="text-white font-black text-lg mb-2.5">:</span>
            <TimeBlock value={ss} label="sec" />
          </div>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
        >
          See All <ArrowRight size={12} />
        </Link>
      </div>

      {/* Products scroll */}
      <div className="bg-primary-500/5 p-4 sm:p-6">
        <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 no-scrollbar -mx-2 px-2">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/product/${p.id}`}
                className="block min-w-[140px] sm:min-w-[175px] bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Discount badge */}
                <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow">
                  -45%
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                  <ImageWithFallback
                    src={p.images?.[0]}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    alt={p.name}
                  />
                </div>

                <div className="mt-2.5 px-1 space-y-1.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.shops?.name}</p>
                  <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{p.name}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-primary-500">${Math.floor(p.price * 0.55).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-300 line-through">${p.price.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{ width: '70%' }} />
                    </div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">70% Sold</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
