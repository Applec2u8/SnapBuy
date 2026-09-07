import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewsSliderProps {
  reviews: any[];
  activeReview: number;
  nextReview: () => void;
  prevReview: () => void;
}

export const ReviewsSlider = ({
  reviews,
  activeReview,
  nextReview,
  prevReview
}: ReviewsSliderProps) => {
  const review = reviews[activeReview];

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-12 sm:py-20 px-6 sm:px-12 text-center">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 blur-[60px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-8 sm:space-y-12">
        {/* Label */}
        <div className="space-y-2">
          <Quote className="mx-auto text-primary-500/30" size={36} />
          <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Community Feedback
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Trusted by thousands of shoppers
          </p>
        </div>

        {/* Slide */}
        <div className="relative min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReview}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < (review?.rating ?? 5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic max-w-lg">
                "{review?.comment}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={review?.avatar}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-md object-cover"
                  alt=""
                />
                <div className="text-left">
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-wide text-[10px] sm:text-xs">
                    {review?.name}
                  </h4>
                  <p className="text-primary-500 text-[9px] font-black uppercase tracking-widest">
                    {review?.role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevReview}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all shadow-sm group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => i !== activeReview && (i < activeReview ? prevReview() : nextReview())}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeReview ? 'bg-primary-500 w-6' : 'bg-slate-200 dark:bg-slate-700 w-2 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextReview}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all shadow-sm group"
          >
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
