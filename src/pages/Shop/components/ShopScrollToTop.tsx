import { ChevronUp } from 'lucide-react';

interface ShopScrollToTopProps {
  showScrollTop: boolean;
  scrollToTop: () => void;
}

export const ShopScrollToTop = ({ showScrollTop, scrollToTop }: ShopScrollToTopProps) => {
  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-28 right-6 p-3.5 bg-primary-500 text-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(244,63,94,0.5)] hover:scale-110 active:scale-95 transition-all z-[110] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300 group"
    >
      <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
    </button>
  );
};
