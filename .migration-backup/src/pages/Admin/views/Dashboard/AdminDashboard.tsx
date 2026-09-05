import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Store, 
  Package, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Circle
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface AdminDashboardProps {
  stats: any;
  loading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, loading }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => [
    { name: '00:00', value: 400 },
    { name: '04:00', value: 300 },
    { name: '08:00', value: 600 },
    { name: '12:00', value: 800 },
    { name: '16:00', value: 500 },
    { name: '20:00', value: 900 },
    { name: '23:59', value: 700 },
  ], []);

  const cards = [
    { label: t('admin_total_users'), value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12.5%', isUp: true },
    { label: t('admin_total_shops'), value: stats.totalShops, icon: Store, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+5.2%', isUp: true },
    { label: t('admin_total_products'), value: stats.totalProducts, icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '+18.4%', isUp: true },
    { label: t('admin_total_sales'), value: '$0', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', trend: '0%', isUp: true },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.trend}
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl relative">
                <Activity size={20} />
                <motion.div 
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Circle size={8} className="fill-red-500 text-red-500" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl">{t('admin_system_activity')}</h3>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Monitoring</span>
                </div>
              </div>
            </div>
            <button className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline transition-all active:scale-95">{t('admin_view_analytics')}</button>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(var(--primary-500))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(var(--primary-500))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="rgb(var(--primary-500))" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl mb-6">{t('admin_recent_alerts')}</h3>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group/alert"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 group-hover:scale-150 transition-transform" />
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('admin_system_notice')}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{i + 2} {t('admin_mins_ago')}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{t('admin_db_backup_success')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

