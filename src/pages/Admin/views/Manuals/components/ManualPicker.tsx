import React, { useState, useEffect } from 'react';
import { Search, Book, X, Loader2 } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import type { UserManual } from '../ManualManagement';

interface ManualPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (manual: UserManual) => void;
}

export const ManualPicker: React.FC<ManualPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manuals, setManuals] = useState<UserManual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchManuals();
    }
  }, [isOpen]);

  const fetchManuals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_manuals')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setManuals(data || []);
    } catch (error) {
      console.error('Error fetching manuals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredManuals = manuals.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Book size={20} className="text-primary-500" />
            Link to Manual
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search manuals to link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold">Loading manuals...</p>
            </div>
          ) : filteredManuals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 pt-10">
              <Book size={48} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No manuals found</p>
            </div>
          ) : (
            filteredManuals.map(manual => (
              <button
                key={manual.id}
                onClick={() => {
                  onSelect(manual);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary-500 hover:shadow-md transition-all text-left group"
              >
                <div>
                  <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">
                    {manual.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                    {manual.title}
                  </h3>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
