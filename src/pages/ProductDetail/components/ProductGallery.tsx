import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, ImageOff } from 'lucide-react';
import { useState } from 'react';
import ImageWithFallback from '../../../components/ui/ImageWithFallback';

interface ProductGalleryProps {
  images: string[];
  activeImage: string;
  setActiveImage: (img: string) => void;
  productName: string;
  setSelectedReviewImages: (images: string[]) => void;
  setActiveReviewImageIndex: (index: number) => void;
}

export const ProductGallery = ({
  images,
  activeImage,
  setActiveImage,
  productName,
  setSelectedReviewImages,
  setActiveReviewImageIndex
}: ProductGalleryProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        <div
          onClick={() => {
            setSelectedReviewImages(images);
            const currentIndex = images.indexOf(activeImage);
            setActiveReviewImageIndex(currentIndex >= 0 ? currentIndex : 0);
          }}
          className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {imgError || !activeImage ? (
              <motion.div
                key="fallback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"
              >
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <div className="p-4 rounded-full bg-white/60 dark:bg-black/20 shadow-inner">
                    <ImageOff size={40} className="text-slate-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image Unavailable</span>
                </div>
              </motion.div>
            ) : (
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={activeImage}
                className="w-full h-full object-cover"
                alt={productName}
                onError={() => setImgError(true)}
              />
            )}
          </AnimatePresence>
          
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-slate-900 dark:text-white shadow-xl border border-white/20">
              <Eye size={18} />
            </div>
          </div>

          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = images.indexOf(activeImage);
                  const prevIndex = (currentIndex - 1 + images.length) % images.length;
                  setActiveImage(images[prevIndex]);
                }}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/40 transition-all shadow-lg active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = images.indexOf(activeImage);
                  const nextIndex = (currentIndex + 1) % images.length;
                  setActiveImage(images[nextIndex]);
                }}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/40 transition-all shadow-lg active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {images.map((img: string, i: number) => (
          <button
            key={i}
            onClick={() => { setActiveImage(img); setImgError(false); }}
            className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${activeImage === img ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-slate-950 scale-95 shadow-lg' : 'opacity-40 hover:opacity-100 hover:scale-105 border border-slate-200 dark:border-slate-800'}`}
          >
            <ImageWithFallback src={img} className="w-full h-full object-cover" containerClassName="w-full h-full" alt={`${productName} thumbnail ${i}`} />
            {activeImage === img && (
              <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                <div className="w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
