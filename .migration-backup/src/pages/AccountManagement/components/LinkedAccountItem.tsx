import React from 'react';

interface LinkedAccountItemProps {
  icon: React.ReactNode;
  title: string;
  value: string | React.ReactNode;
  status?: 'verified' | 'unverified' | 'pending';
  actionLabel?: string;
  onAction?: () => void;
  isPrimary?: boolean;
}

export const LinkedAccountItem: React.FC<LinkedAccountItemProps> = ({
  icon,
  title,
  value,
  status,
  actionLabel = 'Edit',
  onAction,
  isPrimary
}) => {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isPrimary ? 'bg-primary-500/10 text-primary-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm sm:text-base">{title}</h4>
            {status === 'verified' && (
              <span className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Verified
              </span>
            )}
            {status === 'unverified' && (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Unverified
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">{value}</p>
        </div>
      </div>
      
      {onAction && (
        <button
          onClick={onAction}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-100"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
