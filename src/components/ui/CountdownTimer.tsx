import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string | Date;
  className?: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, className = '', onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime();
    
    if (isNaN(targetTime)) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        isExpired: false
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 ${className}`}>
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
          <Clock size={12} />
          <span>Ready to Ship</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-sm ${className}`}>
      <span className="text-[9px] font-black uppercase tracking-widest mb-1.5 opacity-80">Funds Held (Cooldown)</span>
      <div className="flex items-center justify-center gap-1 font-black font-mono text-xs w-full bg-orange-500/10 rounded-lg py-1 px-2 border border-orange-500/10">
        {timeLeft.days > 0 && <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-md">{timeLeft.days}d</span>}
        <span className="bg-orange-500/20 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">{timeLeft.hours.toString().padStart(2, '0')}</span><span className="text-[10px] opacity-50">:</span>
        <span className="bg-orange-500/20 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">{timeLeft.minutes.toString().padStart(2, '0')}</span><span className="text-[10px] opacity-50">:</span>
        <span className="bg-orange-500/20 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">{timeLeft.seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};
