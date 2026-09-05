import { Star, Users, Eye, ShoppingBag } from 'lucide-react';

interface ShopStatsProps {
  followersCount: number;
  viewCount: number;
  productsCount: number;
}

export const ShopStats = ({
  followersCount,
  viewCount,
  productsCount
}: ShopStatsProps) => {
  const stats = [
    {
      label: 'Store Rating',
      value: '4.9',
      subValue: '/ 5.0',
      icon: <Star size={20} />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      label: 'Loyal Followers',
      value: followersCount.toLocaleString(),
      icon: <Users size={20} />,
      color: 'bg-primary-500',
      textColor: 'text-primary-500'
    },
    {
      label: 'Total Views',
      value: viewCount?.toLocaleString() || '1.2k',
      icon: <Eye size={20} />,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      label: 'Inventory',
      value: productsCount,
      icon: <ShoppingBag size={20} />,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="group relative bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] blur-3xl transition-opacity rounded-full`} />
          
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className={`p-3 ${stat.color}/10 ${stat.textColor} rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                {stat.icon}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </h3>
                {stat.subValue && (
                  <span className="text-xs font-bold text-slate-400">{stat.subValue}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
