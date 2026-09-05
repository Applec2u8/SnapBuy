import { Truck, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  {
    icon: <Truck size={22} />,
    iconColor: 'text-primary-500',
    bg: 'bg-primary-500/10',
    title: 'Fast Delivery',
    desc: 'Express delivery within 24 hours to your door.',
  },
  {
    icon: <ShieldCheck size={22} />,
    iconColor: 'text-green-500',
    bg: 'bg-green-500/10',
    title: 'Secure Payment',
    desc: '100% encrypted & safe transactions every time.',
  },
  {
    icon: <Zap size={22} />,
    iconColor: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    title: 'Authenticity',
    desc: 'Every product is verified for guaranteed quality.',
  },
  {
    icon: <Headphones size={22} />,
    iconColor: 'text-violet-500',
    bg: 'bg-violet-500/10',
    title: '24/7 Support',
    desc: 'Our team is always here to help you anytime.',
  },
];

export const TrustBadges = () => {
  return (
    <section className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {badges.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="group flex flex-col gap-3 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
        >
          <div className={`w-11 h-11 flex items-center justify-center rounded-2xl ${item.bg} ${item.iconColor} transition-all group-hover:scale-110 group-hover:rotate-3`}>
            {item.icon}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-[10px] sm:text-xs text-slate-900 dark:text-white mb-1">
              {item.title}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-relaxed">
              {item.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </section>
  );
};
