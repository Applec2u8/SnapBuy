import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import { logAdminAction } from '../../../lib/auditLog';

export const useGenerationWorker = (onJobComplete?: () => void) => {
  const { shop } = useAuthStore();
  const [runningJobs, setRunningJobs] = useState<any[]>([]);
  const previousJobs = useRef<any[]>([]);
  // Keep callback in a ref so changing it doesn't reset the polling interval
  const onJobCompleteRef = useRef(onJobComplete);
  useEffect(() => { onJobCompleteRef.current = onJobComplete; }, [onJobComplete]);

  useEffect(() => {
    // Reset previous jobs tracking when shop changes to prevent cross-shop checks
    previousJobs.current = [];
    setRunningJobs([]); // clear immediately on shop change to avoid stale widget flash
    if (!shop?.id) return;

    const fetchJob = async () => {
      try {
        const { data } = await supabase
          .from('generation_jobs')
          .select('*')
          .eq('shop_id', shop.id)
          .in('status', ['pending', 'running', 'paused'])
          .order('created_at', { ascending: false })
          .limit(10);

        const currentJobs = data || [];
        const oldJobs = previousJobs.current;
        // Update immediately to prevent infinite retry loop if subsequent check queries fail
        previousJobs.current = currentJobs;
        setRunningJobs(currentJobs);

        // Check for completed jobs by seeing if any job in oldJobs is no longer in currentJobs
        if (oldJobs.length > 0) {
          const currentJobIds = new Set(currentJobs.map(j => j.id));
          
          for (const prevJob of oldJobs) {
            if (!currentJobIds.has(prevJob.id)) {
              // This job disappeared, check its final status
              const { data: checkData } = await supabase
                .from('generation_jobs')
                .select('status')
                .eq('id', prevJob.id)
                .maybeSingle();
                
              if (checkData && checkData.status === 'completed') {
                toast.success(`🎉 Generated ${prevJob.target_count} products successfully!`);
                // Write ONE summary activity log row
                await logAdminAction('vendor_generate_products', 'product', undefined, shop?.name || 'Unknown Shop', {
                  products: prevJob.target_count,
                  description: `Generate สำเร็จ: สร้างสินค้า ${prevJob.target_count.toLocaleString()} รายการ`,
                });
                if (onJobCompleteRef.current) onJobCompleteRef.current();
              } else if (checkData && checkData.status === 'failed') {
                toast.error(`❌ Job failed to complete.`);
              }
            }
          }
        }
      } catch (err) {
        // Silently ignore network errors during polling
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 3000);
    return () => clearInterval(interval);
  }, [shop]); // onJobComplete intentionally omitted — tracked via ref to avoid interval resets

  return { runningJobs };
};


