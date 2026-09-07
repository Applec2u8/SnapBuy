import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Package, CheckCircle2, PauseCircle, Clock,
  ChevronDown, ChevronUp, GripHorizontal, AlertTriangle, ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../../lib/supabase';

// Countdown hook
// ---------------------------------------------------------------------------
function useCountdown(resumeAt: string | null) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!resumeAt) { setTimeLeft(''); return; }
    const update = () => {
      const diff = new Date(resumeAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('กำลัง Resume...'); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [resumeAt]);
  return timeLeft;
}

// ---------------------------------------------------------------------------
// Mobile detection hook
// ---------------------------------------------------------------------------
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ---------------------------------------------------------------------------
// Frontend-side resume trigger
// Calls the edge function when resume_at has passed (backup for pg_cron)
// ---------------------------------------------------------------------------
async function triggerResume(jobId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    await fetch(`${supabaseUrl}/functions/v1/generate-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ type: 'BATCH_CONTINUE', job_id: jobId }),
    });
    console.log(`[GenerationProgress] Frontend triggered resume for job ${jobId}`);
  } catch (err) {
    console.warn('[GenerationProgress] Resume trigger failed (will retry):', err);
  }
}

// ---------------------------------------------------------------------------
// Single job row
// ---------------------------------------------------------------------------

const JobItem: React.FC<{ job: any; compact?: boolean }> = ({ job, compact }) => {
  const { t } = useTranslation();
  const resumeTriggeredRef = useRef(false);

  const isPaused = job?.status === 'paused';
  const isCompleted = job?.status === 'completed';
  // Treat as API quota exhausted if pause_reason is 'api_quota_exhausted' OR if it's an old job with null pause_reason
  const isApiQuotaExhausted = isPaused && (job?.pause_reason === 'api_quota_exhausted' || !job?.pause_reason);
  const isProductQuotaExceeded = isPaused && job?.pause_reason === 'quota_exceeded';
  const countdown = useCountdown(isApiQuotaExhausted ? job?.resume_at : null);

  const handleManualResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    resumeTriggeredRef.current = true;
    triggerResume(job.id);
  };

  // Auto-trigger resume from the frontend when resume_at has passed
  useEffect(() => {
    if (!isApiQuotaExhausted || !job?.resume_at) {
      resumeTriggeredRef.current = false;
      return;
    }
    if (resumeTriggeredRef.current) return;

    const diff = new Date(job.resume_at).getTime() - Date.now();
    if (diff <= 0) {
      // Already past — trigger immediately
      resumeTriggeredRef.current = true;
      triggerResume(job.id);
      return;
    }
    // Schedule trigger for when resume_at arrives
    const timeout = setTimeout(() => {
      resumeTriggeredRef.current = true;
      triggerResume(job.id);
    }, diff);
    return () => clearTimeout(timeout);
  }, [isApiQuotaExhausted, job?.resume_at, job?.id]);

  const barColor = isProductQuotaExceeded
    ? 'bg-rose-500'
    : isPaused
      ? 'bg-amber-400'
      : isCompleted
        ? 'bg-emerald-500'
        : 'bg-indigo-500';

  const pct = Math.min(100, Math.max(0, (job.completed_count / job.target_count) * 100));

  if (compact) {
    // Compact one-liner for mobile collapsed view
    return (
      <div className="flex items-center gap-2 py-1">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${barColor}`} />
        <span className="text-[11px] text-slate-300 truncate">
          {isProductQuotaExceeded ? '⚠️ โควต้าหมด' : isPaused ? '⏸ API Quota หมด' : isCompleted ? '✅ เสร็จแล้ว' : '⚙️ กำลังเจน...'}
        </span>
        <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">
          {job.completed_count}/{job.target_count}
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 flex items-start gap-3 relative border-t border-slate-100 dark:border-slate-800 first:border-0">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isProductQuotaExceeded ? 'bg-rose-50 dark:bg-rose-500/10'
        : isPaused ? 'bg-amber-50 dark:bg-amber-500/10'
          : isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10'
            : 'bg-indigo-50 dark:bg-indigo-500/10'
        }`}>
        {isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" />
          : isProductQuotaExceeded ? <AlertTriangle size={18} className="text-rose-500" />
            : isPaused ? <PauseCircle size={18} className="text-amber-500" />
              : <Package size={18} className="text-indigo-500 animate-pulse" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-[11px] font-black uppercase tracking-tight ${isProductQuotaExceeded ? 'text-rose-600 dark:text-rose-400'
          : isPaused ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-900 dark:text-white'
          }`}>
          {isCompleted ? t('vendor_gen_complete')
            : isProductQuotaExceeded ? '⚠️ โควต้าสินค้าหมด!'
              : isApiQuotaExhausted ? '⏸ API Quota หมด — พักชั่วคราว'
                : t('vendor_gen_running')}
        </h4>

        <p className="text-[10px] text-slate-500 mt-0.5">
          {t('vendor_gen_progress', { done: job.completed_count, total: job.target_count })}
        </p>

        {/* Product quota exceeded */}
        {isProductQuotaExceeded && (
          <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg border border-rose-200 dark:border-rose-500/30">
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
              โควต้าสินค้าเต็มแล้ว — ต้องเติมโควต้าก่อน จึงจะเจนสินค้าต่อได้
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.hash = 'quota'}
                className="flex items-center gap-1 text-[10px] font-bold text-white bg-rose-500 hover:bg-rose-600 px-2 py-1 rounded-md transition-colors"
              >
                <ExternalLink size={10} />
                เติมโควต้า
              </button>
              <button
                onClick={handleManualResume}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-md transition-colors border border-rose-500/20"
              >
                <RefreshCw size={10} />
                ดำเนินการต่อ
              </button>
            </div>
          </div>
        )}

        {/* API quota countdown & manual resume */}
        {isApiQuotaExhausted && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-200/50 dark:border-amber-500/20">
              {countdown === 'กำลัง Resume...' ? (
                <RefreshCw size={10} className="text-amber-500 animate-spin" />
              ) : (
                <Clock size={10} className="text-amber-500" />
              )}
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {job?.resume_at ? (countdown || 'กำลังเช็ค...') : 'รอทำต่อ'}
              </span>
            </div>

            <button
              onClick={handleManualResume}
              className="flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-2 py-1 rounded-md transition-colors"
            >
              <RefreshCw size={10} />
              ลองรันต่อเดี๋ยวนี้
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-2.5 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
          />
        </div>
      </div>

      {!isPaused && !isCompleted && (
        <Loader2 size={13} className="animate-spin text-slate-400 absolute top-3 right-3" />
      )}
    </div>
  );
};


export default JobItem;