import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileSectionProps {
  title: string;
  items: {
    label: string;
    icon: React.ReactNode;
    color: string;
    to?: string;
    onClick?: () => void;
    isToggle?: boolean;
    toggleValue?: boolean;
  }[];
}

export const ProfileSection = ({ title, items }: ProfileSectionProps) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-2 text-left">
      <h4 className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => item.onClick ? item.onClick() : item.to && navigate(item.to)}
            className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${i !== items.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white shadow-sm`}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.isToggle && (
                <div className={`w-8 h-4 rounded-full relative transition-colors ${item.toggleValue ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${item.toggleValue ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              )}
              {!item.isToggle && <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
