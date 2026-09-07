import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';

interface ImageViewerProps {
  selectedReviewImages: string[] | null;
  setSelectedReviewImages: (images: string[] | null) => void;
  activeReviewImageIndex: number;
  setActiveReviewImageIndex: (index: number | ((prev: number) => number)) => void;
}

export const ImageViewer = ({
  selectedReviewImages,
  setSelectedReviewImages,
  activeReviewImageIndex,
  setActiveReviewImageIndex
}: ImageViewerProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedReviewImages) setSelectedReviewImages(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedReviewImages, setSelectedReviewImages]);

  if (!selectedReviewImages) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in backdrop-blur-sm p-4 sm:p-10 cursor-pointer"
      onClick={() => setSelectedReviewImages(null)}
    >
      <button
        onClick={() => setSelectedReviewImages(null)}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
      >
        <X size={24} />
      </button>

      <div 
        className="relative w-full h-full flex items-center justify-center cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {selectedReviewImages.length > 1 && (
          <>
            <button
              onClick={() => setActiveReviewImageIndex((prev) => (prev - 1 + selectedReviewImages.length) % selectedReviewImages.length)}
              className="absolute left-0 sm:-left-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setActiveReviewImageIndex((prev) => (prev + 1) % selectedReviewImages.length)}
              className="absolute right-0 sm:-right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="max-w-full max-h-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReviewImageIndex}
              initial={{ opacity: 0, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -50 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              {selectedReviewImages[activeReviewImageIndex].toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || selectedReviewImages[activeReviewImageIndex].includes('video') ? (
                <video
                  src={selectedReviewImages[activeReviewImageIndex]}
                  className="max-w-full max-h-[80vh] sm:max-h-[90vh] object-contain rounded-xl"
                  controls
                  autoPlay
                />
              ) : (
                <motion.img
                  src={selectedReviewImages[activeReviewImageIndex]}
                  className="max-w-full max-h-[80vh] sm:max-h-[90vh] object-contain cursor-grab active:cursor-grabbing"
                  alt="Review Detail"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100) {
                      setActiveReviewImageIndex((prev) => (prev - 1 + selectedReviewImages.length) % selectedReviewImages.length);
                    } else if (info.offset.x < -100) {
                      setActiveReviewImageIndex((prev) => (prev + 1) % selectedReviewImages.length);
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
