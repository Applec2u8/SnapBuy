import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { ImgHTMLAttributes } from 'react';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  alt: string;
  fallbackClassName?: string;
  containerClassName?: string;
}

/**
 * Drop-in replacement for <img> that shows a beautiful fallback
 * UI when the image fails to load or src is empty.
 */
const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClassName,
  containerClassName,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(!src);

  useEffect(() => {
    setError(!src);
  }, [src]);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 select-none ${fallbackClassName || containerClassName || className || ''}`}
        title={alt}
      >
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <div className="p-2 rounded-full bg-white/60 dark:bg-black/20 shadow-inner">
            <ImageOff size={20} className="text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            No Image
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default ImageWithFallback;
