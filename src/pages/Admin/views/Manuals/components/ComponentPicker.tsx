import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronRight, Puzzle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPONENT_REGISTRY, type ComponentItem } from './ComponentRegistry';

interface ComponentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (component: ComponentItem) => void;
}

export const ComponentPicker: React.FC<ComponentPickerProps> = ({ isOpen, onClose, onInsert }) => {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Array.from(new Set(COMPONENT_REGISTRY.map(c => c.category))))
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return COMPONENT_REGISTRY;
    const q = search.toLowerCase();
    return COMPONENT_REGISTRY.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, ComponentItem[]> = {};
    filtered.forEach(c => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  }, [filtered]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Side panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative ml-auto w-full max-w-sm bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Puzzle size={14} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm leading-none">Insert Component</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">{COMPONENT_REGISTRY.length} components available</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ค้นหา component..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Component list */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Puzzle size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold">ไม่พบ component</p>
                  <p className="text-[10px] mt-1">ลองค้นหาด้วยคำอื่น</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="mb-1">
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category}</span>
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      </div>
                      {expandedCategories.has(category)
                        ? <ChevronDown size={12} className="text-slate-400" />
                        : <ChevronRight size={12} className="text-slate-400" />
                      }
                    </button>

                    {/* Items */}
                    <AnimatePresence>
                      {expandedCategories.has(category) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1.5 px-1 pb-2">
                            {items.map(item => (
                              <div
                                key={item.id}
                                className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary-500/40 hover:shadow-md transition-all group"
                              >
                                {/* Preview */}
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center min-h-[72px] overflow-hidden">
                                  <div className="pointer-events-none transform scale-90 origin-center">
                                    {item.preview}
                                  </div>
                                </div>

                                {/* Info row */}
                                <div className="px-2.5 py-2 flex items-center justify-between bg-white dark:bg-slate-900 gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white truncate">{item.label}</p>
                                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{item.description}</p>
                                  </div>
                                  <button
                                    onClick={() => { onInsert(item); onClose(); }}
                                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-primary-500 text-white text-[9px] font-black rounded-lg hover:bg-primary-600 transition-colors uppercase tracking-wider shadow-sm shadow-primary-500/20"
                                  >
                                    <Plus size={9} /> Insert
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
              <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                Component จะแสดงผลจริงในหน้าดูคู่มือ<br/>แต่จะไม่สามารถกดได้ (Preview Mode)
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
