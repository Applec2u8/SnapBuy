import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatWindow } from './ChatWindow';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId?: string;
  shopName?: string;
}

export const ChatModal = ({ isOpen, onClose, shopId, shopName }: ChatModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] sm:hidden"
          />

          {/* Drawer (Mobile) / Floating Window (Desktop) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[80vh] z-[9999] sm:right-6 sm:left-auto sm:bottom-6 sm:w-96 sm:h-[600px] sm:rounded-3xl"
          >
            <ChatWindow shopId={shopId} shopName={shopName} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
