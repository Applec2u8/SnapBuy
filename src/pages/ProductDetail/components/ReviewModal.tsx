import { Star, X, Camera, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface ReviewModalProps {
  showReviewModal: boolean;
  setShowReviewModal: (show: boolean) => void;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  reviewFiles: File[];
  setReviewFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  submittingReview: boolean;
  handleReviewSubmit: (e: React.FormEvent) => void;
}

export const ReviewModal = ({
  showReviewModal,
  setShowReviewModal,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewFiles,
  setReviewFiles,
  submittingReview,
  handleReviewSubmit
}: ReviewModalProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showReviewModal && !submittingReview) setShowReviewModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showReviewModal, submittingReview, setShowReviewModal]);

  if (!showReviewModal) return null;

  return (
    <div 
      className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in cursor-pointer"
      onClick={() => !submittingReview && setShowReviewModal(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">{t('write_review')}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Share your experience with others</p>
          </div>
          <button onClick={() => setShowReviewModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('rating')}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`p-2 rounded-xl transition-all ${reviewRating >= star ? 'text-yellow-400 bg-yellow-400/5' : 'text-slate-300 bg-slate-50 dark:bg-slate-800'}`}
                >
                  <Star size={24} className={reviewRating >= star ? 'fill-yellow-400' : ''} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('comment')}</label>
            <textarea
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 focus:border-primary-500 transition-all outline-none min-h-[120px] font-medium text-sm"
              placeholder="What did you like or dislike?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('upload_images')}</label>
            <div className="flex flex-wrap gap-3">
              {reviewFiles.map((file, idx) => (
                <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden relative group border border-slate-200">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                  <button
                    type="button"
                    onClick={() => setReviewFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group">
                <Camera size={20} className="text-slate-400 group-hover:text-primary-500" />
                <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-primary-500 mt-1">Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && setReviewFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            className="w-full bg-primary-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {submittingReview ? <Loader2 className="animate-spin" size={20} /> : <>{t('submit_review')} <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
