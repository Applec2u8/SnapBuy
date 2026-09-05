import React, { useEffect, useState } from 'react';
import { X, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import type { UserManual } from '../ManualManagement';
// We need to import ComponentRichView, but since it's inside ManualManagement.tsx,
// we might have an issue. Wait, I should probably move ComponentRichView to a shared file,
// or just re-implement a wrapper here if it's simple, or put ManualPreviewModal inside ManualManagement.tsx.

// For now, let's define it here and assume we can pass the ComponentRichView as a prop, 
// or I will move ComponentRichView to its own file.
// Wait, I will just create the modal and use it in ManualManagement.tsx directly!
// Actually, if I create it here, I can pass a `renderContent` prop.

interface ManualPreviewModalProps {
  manualId: string;
  isOpen: boolean;
  onClose: () => void;
  renderContent: (content: string) => React.ReactNode;
}

export const ManualPreviewModal: React.FC<ManualPreviewModalProps> = ({ manualId, isOpen, onClose, renderContent }) => {
  const [manual, setManual] = useState<UserManual | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && manualId) {
      fetchManual();
    }
  }, [isOpen, manualId]);

  const fetchManual = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_manuals')
        .select('*')
        .eq('id', manualId)
        .single();

      if (error) throw error;
      setManual(data);
    } catch (error) {
      console.error('Error fetching manual:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-500 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto flex-1 no-scrollbar bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-bold text-lg">Loading manual...</p>
            </div>
          ) : !manual ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
              <p className="font-bold text-lg text-slate-600 dark:text-slate-400">Manual not found</p>
              <p className="text-sm">The manual you are trying to view might have been deleted.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
              <div className="mb-8">
                <div className="inline-block px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  {manual.category}
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  {manual.title}
                </h1>
              </div>

              {manual.image_url && (
                <div className="mb-8 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 max-h-[400px]">
                  <img 
                    src={manual.image_url} 
                    alt={manual.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {renderContent(manual.content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
