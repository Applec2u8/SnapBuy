import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => {
  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group select-none"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
    >
      <div 
        className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
          ${checked 
            ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/20' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 group-hover:border-primary-400'
          }`}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check size={14} className="text-white stroke-[3px]" />
          </motion.div>
        )}
      </div>
      {label && (
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors
          ${checked ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
