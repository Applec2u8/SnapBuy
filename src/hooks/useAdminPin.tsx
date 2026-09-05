import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const PinModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (pin: string) => void }> = ({ isOpen, onClose, onSubmit }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto focus next
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto submit if all filled
    if (value && index === 3 && newPin.every(p => p !== '')) {
      onSubmit(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.every(p => p !== '')) onSubmit(pin.join(''));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-slate-200 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 text-indigo-500">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">ยืนยันตัวตน</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">กรุณากรอกรหัส PIN 4 หลักเพื่อดำเนินการต่อ</p>

              <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 mb-6">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                ))}
              </form>
              
              <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                ยกเลิก
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const useAdminPin = () => {
  const [pinAction, setPinAction] = useState<{ action: () => void } | null>(null);

  const requirePin = (action: () => void) => {
    setPinAction({ action });
  };

  const handlePinSubmit = async (enteredPin: string) => {
    const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'admin_api_pin').single();
    const currentPin = !error && data?.value ? data.value : '0000';

    console.log('Current PIN:', data); // Debugging line

    if (enteredPin === currentPin) {
      setPinAction(null);
      if (pinAction) pinAction.action();
    } else {
      toast.error('PIN ไม่ถูกต้อง!');
      setPinAction(null);
    }
  };

  const pinModal = (
    <PinModal isOpen={!!pinAction} onClose={() => setPinAction(null)} onSubmit={handlePinSubmit} />
  );

  return { requirePin, pinModal };
};
