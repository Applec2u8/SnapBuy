import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, PauseCircle,
  ChevronDown, ChevronUp, GripHorizontal, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import JobItem from './JobItem';
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

// Main widget — responsive: draggable on desktop, bottom-bar on mobile
// ---------------------------------------------------------------------------
export const GenerationProgress: React.FC<{ runningJobs: any[] }> = ({ runningJobs }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  if (!runningJobs || runningJobs.length === 0) return null;

  const totalCompleted = runningJobs.reduce((acc, j) => acc + (j.completed_count || 0), 0);
  const totalTarget = runningJobs.reduce((acc, j) => acc + (j.target_count || 0), 0);
  const hasQuotaError = runningJobs.some(j => j.pause_reason === 'quota_exceeded');
  const hasPaused = runningJobs.some(j => j.status === 'paused');

  const headerBg = hasQuotaError
    ? 'bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
    : hasPaused
      ? 'bg-amber-500/10 border-amber-200 dark:border-amber-800/40'
      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';

  // ── MOBILE: fixed bottom bar ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-900 border-t border-slate-700 shadow-2xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Collapsed summary row */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`w-full flex items-center justify-between px-4 py-2.5 ${headerBg} border-b`}
          >
            <div className="flex items-center gap-2">
              {hasQuotaError
                ? <AlertTriangle size={14} className="text-rose-500" />
                : hasPaused
                  ? <PauseCircle size={14} className="text-amber-500" />
                  : <Loader2 size={14} className="animate-spin text-indigo-400" />}
              <span className={`text-[11px] font-black uppercase tracking-widest ${hasQuotaError ? 'text-rose-400' : hasPaused ? 'text-amber-400' : 'text-slate-200'
                }`}>
                {hasQuotaError ? 'โควต้าหมด' : hasPaused ? 'API หยุดชั่วคราว' : 'กำลังเจนสินค้า'}
              </span>
              <span className="text-[10px] text-slate-400">({totalCompleted}/{totalTarget})</span>
            </div>
            {isMinimized ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>

          {/* Expanded job list */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="max-h-[45vh] overflow-y-auto divide-y divide-slate-800">
                  {runningJobs.map(job => (
                    <JobItem key={job.id} job={job} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── DESKTOP: draggable floating card ─────────────────────────────────────
  return (
    <>
      {/* Drag boundary — inset 8px from each edge */}
      <div ref={constraintsRef} className="fixed inset-2 pointer-events-none z-[9998]" />

      <AnimatePresence>
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0.05}
          className="fixed bottom-6 right-6 z-[9999] touch-none select-none"
          style={{ width: isMinimized ? 'auto' : 320 }}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">

            {/* Header / drag handle */}
            <div className={`flex items-center justify-between px-3 py-2 border-b cursor-grab active:cursor-grabbing ${headerBg}`}>
              <div className="flex items-center gap-2">
                <GripHorizontal size={13} className="text-slate-400" />
                {isMinimized && (
                  <span className={`text-[10px] font-black uppercase tracking-widest ${hasQuotaError ? 'text-rose-400' : hasPaused ? 'text-amber-400' : 'text-slate-500 dark:text-slate-300'
                    }`}>
                    {runningJobs.length} Jobs ({totalCompleted}/{totalTarget})
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors pointer-events-auto"
              >
                {isMinimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {/* Job list */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden pointer-events-auto"
                >
                  <div className="max-h-[300px] overflow-y-auto">
                    {runningJobs.map(job => (
                      <JobItem key={job.id} job={job} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
