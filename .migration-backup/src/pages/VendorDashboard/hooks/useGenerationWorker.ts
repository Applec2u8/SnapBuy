import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import {
  getCategoryVariantConfig,
  randomPick,
  randomInt,
  normalizeCategorySlug,
  buildPlaceholderImages,
  randomProductTitle,
  randomBrand,
  randomHighlights
} from '../utils/dummyData';

export const useGenerationWorker = (onJobComplete?: () => void) => {
  const { shop } = useAuthStore();
  const [runningJob, setRunningJob] = useState<any>(null);
  const isWorking = useRef(false);

  useEffect(() => {
    if (!shop) return;

    const fetchJob = async () => {
      if (isWorking.current) return;

      try {
        const { data } = await supabase
          .from('generation_jobs')
          .select('*')
          .eq('shop_id', shop.id)
          .eq('status', 'running')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data) {
          setRunningJob(data);
          processJob(data);
        } else {
          setRunningJob(null);
        }
      } catch (err) {
        // No active job found, safely ignore
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 2000);
    return () => clearInterval(interval);
  }, [shop]);

  const processJob = async (job: any) => {
    if (isWorking.current || !shop) return;
    isWorking.current = true;

    try {
      const remainingCount = job.target_count - job.completed_count;
      if (remainingCount <= 0) {
        await completeJob(job.id);
        return;
      }

      // Pick a random category from the job's selected categories
      const category = randomPick(job.category_ids);

      const variantConfig = getCategoryVariantConfig(category);
      const imageUrls = await buildPlaceholderImages(category, 7);
      const variantCount = randomInt(2, 4);
      const variants = Array.from({ length: variantCount }, (_, variantIndex) => ({
        name: variantConfig.variantName,
        value: randomPick(variantConfig.values),
        price_override: variantIndex === 0 ? 0 : randomInt(0, 200),
        stock_quantity: randomInt(5, 30),
        image_url: imageUrls[variantIndex % imageUrls.length],
        sku: `${normalizeCategorySlug(category)}-${Date.now()}-${variantIndex + 1}-${Math.random().toString(36).slice(2, 8)}`
      }));

      const price = randomInt(490, 4490);
      const product = {
        shop_id: shop.id,
        category_id: category.id,
        name: randomProductTitle(category),
        description: `สินค้ารุ่นสุ่มสำหรับหมวด ${category.name}`,
        price,
        compare_at_price: price + randomInt(100, 450),
        stock_quantity: variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),
        images: imageUrls,
        is_published: true,
        brand: randomBrand(),
        highlights: randomHighlights(),
      };

      const { data: insertedProduct, error: pError } = await supabase.from('products').insert(product).select('id').single();
      if (pError) throw pError;

      const variantRows = variants.map((v: any) => ({ ...v, product_id: insertedProduct.id }));
      if (variantRows.length > 0) {
        await supabase.from('product_variants').insert(variantRows);
      }

      const newCompleted = job.completed_count + 1;
      const newStatus = newCompleted >= job.target_count ? 'completed' : 'running';

      await supabase.from('generation_jobs').update({
        completed_count: newCompleted,
        status: newStatus
      }).eq('id', job.id);

      setRunningJob((prev: any) => ({ ...prev, completed_count: newCompleted, status: newStatus }));

      if (newStatus === 'completed') {
        toast.success(`🎉 Generated ${job.target_count} products successfully!`);
        if (onJobComplete) onJobComplete();
      }
    } catch (e: any) {
      console.error('Job error', e);
      toast.error('Generation Error: ' + e.message);
      await supabase.from('generation_jobs').update({ status: 'failed' }).eq('id', job.id);
      setRunningJob(null);
    } finally {
      isWorking.current = false;
    }
  };

  const completeJob = async (id: string) => {
    await supabase.from('generation_jobs').update({ status: 'completed' }).eq('id', id);
    setRunningJob(null);
    if (onJobComplete) onJobComplete();
  };

  return { runningJob };
};
