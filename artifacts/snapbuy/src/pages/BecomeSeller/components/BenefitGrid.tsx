import { Layout as LayoutIcon, Image as ImageIcon, Store } from 'lucide-react';

export const BenefitGrid = () => {
  const items = [
    { icon: <LayoutIcon />, title: "Easy Setup", desc: "Start selling in minutes with our intuitive interface." },
    { icon: <ImageIcon />, title: "Product Showcase", desc: "Upload high-quality images and manage inventory." },
    { icon: <Store />, title: "Brand Identity", desc: "Customize your shop profile to stand out." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {items.map((item, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-xl transition-all text-left">
          <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center">{item.icon}</div>
          <h3 className="font-black uppercase tracking-tight text-lg">{item.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
        </div>
      ))}
    </div>
  );
};
