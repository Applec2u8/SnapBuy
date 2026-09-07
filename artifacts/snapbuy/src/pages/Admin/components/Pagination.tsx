import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-8 py-8 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
      <motion.div 
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex flex-col items-center sm:items-start text-center sm:text-left"
      >
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-tight">Showing</p>
        <p className="text-[12px] font-black uppercase tracking-tight mt-1">
          <span className="text-primary-500">{(currentPage - 1) * itemsPerPage + 1}</span>
          <span className="text-slate-900 dark:text-white mx-1">TO</span>
          <span className="text-primary-500">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">
          <span className="text-slate-400 dark:text-slate-500">OF</span>
          <span className="text-slate-900 dark:text-white mx-1">{totalItems}</span>
          <span className="text-slate-400 dark:text-slate-500">ITEMS</span>
        </p>
      </motion.div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <motion.button 
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={18} />
        </motion.button>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            
            const isFirst = pageNum === 1;
            const isLast = pageNum === totalPages;
            const isNearCurrent = Math.abs(pageNum - currentPage) <= (window.innerWidth < 640 ? 0 : 1);

            if (isFirst || isLast || isNearCurrent) {
              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[10px] sm:text-[12px] font-black transition-all duration-300 ${
                    currentPage === pageNum 
                      ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(100,108,255,0.4)] scale-110' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            } else if (
              (window.innerWidth >= 640 && (pageNum === currentPage - 2 || pageNum === currentPage + 2)) ||
              (window.innerWidth < 640 && (pageNum === currentPage - 1 || pageNum === currentPage + 1))
            ) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return <span key={pageNum} className="text-slate-300 dark:text-slate-700 px-0.5 font-black text-[10px]">...</span>;
              }
            }
            return null;
          })}
        </div>

        <motion.button 
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-all"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
};

