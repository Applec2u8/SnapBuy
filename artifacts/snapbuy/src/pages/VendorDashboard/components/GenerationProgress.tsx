import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Package, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const GenerationProgress: React.FC<{ runningJob: any }> = ({ runningJob }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {runningJob && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-4 flex items-start gap-4 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              {runningJob.status === 'completed' ? (
                <CheckCircle2 size={20} className="text-emerald-500" />
              ) : (
                <Package size={20} className="text-indigo-500 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {runningJob.status === 'completed' ? t('vendor_gen_complete') : t('vendor_gen_running')}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                {t('vendor_gen_progress', { done: runningJob.completed_count, total: runningJob.target_count })}
              </p>
              
              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, (runningJob.completed_count / runningJob.target_count) * 100))}%` }}
                />
              </div>
            </div>
            
            {runningJob.status === 'running' && (
              <Loader2 size={14} className="animate-spin text-slate-400 absolute top-4 right-4" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
