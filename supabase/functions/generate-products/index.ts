import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// -------------------------------------------------------------
// Config
// -------------------------------------------------------------
const BATCH_SIZE = 20; // Products per function invocation
const API_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in ms

// -------------------------------------------------------------
// Dummy Data Generators
// -------------------------------------------------------------
const randomPick = (array: any[]) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const normalizeCategorySlug = (category: any) => (category.slug || category.name || '').toString().toLowerCase().replace(/\s+/g, '-');

const getCategoryVariantConfig = (category: any) => {
  const slug = normalizeCategorySlug(category);
  if (slug.includes('shoe') || slug.includes('shoes')) return { variantName: 'Size', values: ['36', '37', '38', '39', '40', '41', '42'] };
  if (slug.includes('cloth') || slug.includes('shirt') || slug.includes('dress') || slug.includes('pants') || slug.includes('clothes')) return { variantName: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] };
  if (slug.includes('watch') || slug.includes('glass') || slug.includes('glasses')) return { variantName: 'Color', values: ['Black', 'Gold', 'Silver', 'Rose Gold', 'Brown'] };
  if (slug.includes('bag') || slug.includes('backpack') || slug.includes('tote')) return { variantName: 'Color', values: ['Black', 'Brown', 'Beige', 'Navy', 'Olive'] };
  if (slug.includes('console') || slug.includes('game') || slug.includes('controller')) return { variantName: 'Edition', values: ['Standard', 'Limited', 'Collector', 'Deluxe'] };
  return { variantName: 'Option', values: ['Standard', 'Premium', 'Deluxe', 'Limited'] };
};

const randomBrand = () => randomPick(['UrbanEdge', 'DailyWear', 'PixelPlay', 'StudioLine', 'ClassicWorks', 'MetroPrime', 'FutureGear', 'FreshMarket']);
const randomHighlights = () => {
  const options = ['พร้อมส่ง', 'เก็บเงินปลายทาง', 'ของแท้', 'โปรโมชั่นพิเศษ', 'ส่งฟรี', 'สินค้าร้อนแรง'];
  return Array.from({ length: 2 }, () => randomPick(options)).filter((value, index, self) => self.indexOf(value) === index);
};
const randomProductTitle = (category: any) => {
  const suffixes = ['Pro', 'X', 'Plus', 'Deluxe', 'Prime', 'Max', 'Neo', 'Edition', 'Series'];
  return `${randomPick([category.name, `${category.name} รุ่นพิเศษ`, `${category.name} ใหม่`])} ${randomPick(suffixes)}`;
};

// -------------------------------------------------------------
// Unsplash Image Fetcher
// Returns { urls, quotaExhausted }
// -------------------------------------------------------------
async function getPlaceholderImages(
  supabaseAdmin: any,
  category: any,
  count = 7
): Promise<{ urls: string[]; quotaExhausted: boolean }> {
  const label = (category.name || category.slug || 'product').toString().trim();
  const query = encodeURIComponent(label);
  const fallback = Array.from({ length: count }, () => `https://placehold.co/600x600/0f172a/94a3b8.png?text=${query}`);

  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('id, key_value, remaining_requests, last_used_at')
    .eq('provider', 'unsplash')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  const allKeys = keys || [];
  const envKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
  if (envKey && !allKeys.find((k: any) => k.key_value === envKey)) {
    allKeys.push({ id: 'env', key_value: envKey, remaining_requests: 50, last_used_at: null });
  }

  // Find an active key that still has quota
  let activeKeyData = null;
  for (const key of allKeys) {
    const oneHourAgo = new Date(Date.now() - API_COOLDOWN_MS);
    const isReset = !key.last_used_at || new Date(key.last_used_at) < oneHourAgo;
    if (key.remaining_requests > 0 || isReset) {
      activeKeyData = key;
      break;
    }
  }

  // ALL keys are exhausted - signal quota exhaustion to the caller
  if (!activeKeyData) {
    console.warn('All Unsplash API keys are exhausted. Signalling pause.');
    return { urls: fallback, quotaExhausted: true };
  }

  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&count=${count}&orientation=squarish`, {
      headers: { Authorization: `Client-ID ${activeKeyData.key_value}` }
    });

    const limit = response.headers.get('X-Ratelimit-Limit');
    const remaining = response.headers.get('X-Ratelimit-Remaining');

    if (limit && remaining && activeKeyData.id !== 'env') {
      await supabaseAdmin.from('api_keys').update({
        remaining_requests: parseInt(remaining, 10),
        rate_limit: parseInt(limit, 10),
        last_used_at: new Date().toISOString()
      }).eq('id', activeKeyData.id);
    }

    // Rate limit hit
    if (response.status === 403 || response.status === 429) {
      if (activeKeyData.id !== 'env') {
        await supabaseAdmin.from('api_keys').update({
          remaining_requests: 0,
          last_used_at: new Date().toISOString()
        }).eq('id', activeKeyData.id);
      }
      console.warn(`Unsplash key exhausted (${response.status}). Signalling pause.`);
      return { urls: fallback, quotaExhausted: true };
    }

    if (!response.ok) {
      throw new Error(`Unsplash returned ${response.status}`);
    }

    const results = await response.json();
    const urls = results.map((photo: any) => photo?.urls?.regular || photo?.urls?.small).filter(Boolean).slice(0, count);
    if (urls.length > 0) {
      while (urls.length < count) urls.push(urls[urls.length - 1]);
      return { urls, quotaExhausted: false };
    }
  } catch (error) {
    console.warn('Unsplash API error, using fallback:', error);
  }

  return { urls: fallback, quotaExhausted: false };
}

// -------------------------------------------------------------
// Calculate the next resume time (when the earliest key resets)
// -------------------------------------------------------------
async function getNextResumeAt(supabaseAdmin: any): Promise<string> {
  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('last_used_at')
    .eq('provider', 'unsplash')
    .eq('is_active', true);

  if (!keys || keys.length === 0) {
    return new Date(Date.now() + API_COOLDOWN_MS).toISOString();
  }

  // Find the earliest reset time
  let earliestReset = Infinity;
  for (const key of keys) {
    if (key.last_used_at) {
      const resetAt = new Date(key.last_used_at).getTime() + API_COOLDOWN_MS;
      if (resetAt < earliestReset) earliestReset = resetAt;
    }
  }

  const resumeAt = earliestReset === Infinity
    ? Date.now() + API_COOLDOWN_MS
    : Math.max(earliestReset, Date.now() + 5 * 60 * 1000); // At least 5 min from now

  return new Date(resumeAt).toISOString();
}

// -------------------------------------------------------------
// Self-invoke: schedule next batch
// -------------------------------------------------------------
async function scheduleNextBatch(jobId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const functionUrl = `${supabaseUrl}/functions/v1/generate-products`;

  try {
    await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ type: 'BATCH_CONTINUE', job_id: jobId }),
    });
  } catch (err) {
    console.error('Failed to schedule next batch:', err);
  }
}

// -------------------------------------------------------------
// Resume paused jobs whose resume_at time has passed
// Called by pg_cron every 5 minutes
// -------------------------------------------------------------
async function resumePausedJobs() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Checking for paused jobs ready to resume...');

  const now = new Date().toISOString();
  const { data: pausedJobs, error } = await supabaseAdmin
    .from('generation_jobs')
    .select('id, completed_count, target_count')
    .eq('status', 'paused')
    .lte('resume_at', now);

  if (error) {
    console.error('Error fetching paused jobs:', error);
    return;
  }

  if (!pausedJobs || pausedJobs.length === 0) {
    console.log('No paused jobs ready to resume.');
    return;
  }

  console.log(`Found ${pausedJobs.length} paused job(s) to resume.`);

  for (const job of pausedJobs) {
    console.log(`Resuming job ${job.id} (${job.completed_count}/${job.target_count})`);
    // Mark as running again so duplicate triggers don't fire
    await supabaseAdmin.from('generation_jobs')
      .update({ status: 'running', resume_at: null })
      .eq('id', job.id);

    // Schedule next batch for this job
    await scheduleNextBatch(job.id);
  }
}

// -------------------------------------------------------------
// Process ONE batch of BATCH_SIZE products
// -------------------------------------------------------------
async function processBatch(job: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Re-fetch fresh job state
  const { data: freshJob, error: jobFetchError } = await supabaseAdmin
    .from('generation_jobs')
    .select('*')
    .eq('id', job.id)
    .single();

  if (jobFetchError || !freshJob) {
    console.error(`Job ${job.id} not found.`);
    return;
  }

  // Stop if already terminal
  if (freshJob.status === 'completed' || freshJob.status === 'failed' || freshJob.status === 'cancelled') {
    console.log(`Job ${freshJob.id} is already ${freshJob.status}. Stopping.`);
    return;
  }

  // Fetch categories
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .in('id', freshJob.category_ids);

  if (!categories || categories.length === 0) {
    await supabaseAdmin.from('generation_jobs').update({ status: 'failed' }).eq('id', freshJob.id);
    return;
  }

  // Fetch generation pricing settings
  const { data: settingsData } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'gen_price_cheap_min', 'gen_price_cheap_max', 
      'gen_price_expensive_min', 'gen_price_expensive_max', 
      'gen_cheap_ratio'
    ]);
  const settingsObj = (settingsData || []).reduce((acc: any, cur: any) => ({ ...acc, [cur.key]: Number(cur.value) }), {});
  
  const cheapMin = settingsObj['gen_price_cheap_min'] || 50;
  const cheapMax = settingsObj['gen_price_cheap_max'] || 490;
  const expMin = settingsObj['gen_price_expensive_min'] || 500;
  const expMax = settingsObj['gen_price_expensive_max'] || 4500;
  const cheapRatio = settingsObj['gen_cheap_ratio'] || 50; // default 50%

  await supabaseAdmin.from('generation_jobs').update({ status: 'running', resume_at: null }).eq('id', freshJob.id);

  // ----- Check shop product quota before starting -----
  const { data: shopData } = await supabaseAdmin
    .from('shops')
    .select('product_limit')
    .eq('id', freshJob.shop_id)
    .single();

  const { count: currentProductCount } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', freshJob.shop_id);

  const productLimit = shopData?.product_limit ?? 0;
  const usedSlots = currentProductCount ?? 0;
  const availableSlots = Math.max(0, productLimit - usedSlots);

  if (availableSlots <= 0) {
    console.log(`Job ${freshJob.id}: Shop product quota is FULL (${usedSlots}/${productLimit}). Pausing with quota_exceeded.`);
    await supabaseAdmin.from('generation_jobs').update({
      status: 'paused',
      pause_reason: 'quota_exceeded',
      resume_at: null,
      completed_count: freshJob.completed_count,
    }).eq('id', freshJob.id);
    return;
  }
  let completed = freshJob.completed_count || 0;
  const target = freshJob.target_count;

  // Limit this batch to not exceed quota
  const batchEnd = Math.min(completed + BATCH_SIZE, target, completed + availableSlots);

  console.log(`Job ${freshJob.id}: processing items ${completed + 1} to ${batchEnd} of ${target}`);

  while (completed < batchEnd) {
    try {
      const category = randomPick(categories);
      const variantConfig = getCategoryVariantConfig(category);
      const { urls: imageUrls, quotaExhausted } = await getPlaceholderImages(supabaseAdmin, category, 7);

      // -------------------------------------------------------
      // PAUSE if Unsplash quota is exhausted
      // -------------------------------------------------------
      if (quotaExhausted) {
        const resumeAt = await getNextResumeAt(supabaseAdmin);
        console.log(`Job ${freshJob.id}: API quota exhausted. Pausing until ${resumeAt}`);
        await supabaseAdmin.from('generation_jobs').update({
          status: 'paused',
          pause_reason: 'api_quota_exhausted',
          resume_at: resumeAt,
          completed_count: completed,
        }).eq('id', freshJob.id);
        return; // Stop this invocation — pg_cron will resume it later
      }

      const variantCount = randomInt(2, 4);
      const variants = Array.from({ length: variantCount }, (_, variantIndex) => ({
        name: variantConfig.variantName,
        value: randomPick(variantConfig.values),
        price_override: variantIndex === 0 ? 0 : randomInt(0, 200),
        stock_quantity: randomInt(5, 30),
        image_url: imageUrls[variantIndex % imageUrls.length],
        sku: `${normalizeCategorySlug(category)}-${Date.now()}-${variantIndex + 1}-${Math.random().toString(36).slice(2, 8)}`
      }));

      // Determine price using configured ratios
      const isCheap = (Math.random() * 100) < cheapRatio;
      const price = isCheap ? randomInt(cheapMin, cheapMax) : randomInt(expMin, expMax);

      const product = {
        shop_id: freshJob.shop_id,
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

      const { data: insertedProduct, error: pError } = await supabaseAdmin
        .from('products')
        .insert(product)
        .select('id')
        .single();

      if (pError) {
        // Check if it's a quota limit error from the DB trigger
        if (pError.message?.includes('product limit') || pError.message?.includes('quota')) {
          console.log(`Job ${freshJob.id}: DB product quota limit reached. Pausing with quota_exceeded.`);
          await supabaseAdmin.from('generation_jobs').update({
            status: 'paused',
            pause_reason: 'quota_exceeded',
            resume_at: null,
            completed_count: completed,
          }).eq('id', freshJob.id);
          return;
        }
        throw pError;
      }

      const variantRows = variants.map((v: any) => ({ ...v, product_id: insertedProduct.id }));
      if (variantRows.length > 0) {
        await supabaseAdmin.from('product_variants').insert(variantRows);
      }

      completed++;

      const isLastItem = completed >= target;
      await supabaseAdmin.from('generation_jobs').update({
        completed_count: completed,
        status: isLastItem ? 'completed' : 'running'
      }).eq('id', freshJob.id);

    } catch (err) {
      console.error(`Error on item ${completed + 1} for job ${freshJob.id}:`, err);
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  // Schedule next batch if more work remains
  if (completed < target) {
    console.log(`Job ${freshJob.id}: batch done (${completed}/${target}). Scheduling next batch...`);
    await scheduleNextBatch(freshJob.id);
  } else {
    console.log(`Job ${freshJob.id}: ALL DONE! (${completed}/${target})`);
  }
}

// -------------------------------------------------------------
// Server Entrypoint
// -------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const payload = await req.json();
    let job: any = null;

    // Case 1: Database Webhook on new INSERT
    if (payload.type === 'INSERT' && payload.table === 'generation_jobs' && payload.record) {
      job = payload.record;
      console.log(`Webhook triggered for new job: ${job.id}`);
    }

    // Case 2: Self-invoked for next batch
    if (payload.type === 'BATCH_CONTINUE' && payload.job_id) {
      job = { id: payload.job_id };
      console.log(`Batch continue triggered for job: ${job.id}`);
    }

    // Case 3: pg_cron checks for paused jobs to resume
    if (payload.type === 'RESUME_CHECK') {
      console.log('Resume check triggered by pg_cron.');
      // @ts-ignore
      if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
        // @ts-ignore
        EdgeRuntime.waitUntil(resumePausedJobs());
      } else {
        resumePausedJobs().catch(console.error);
      }
    }

    if (job) {
      // @ts-ignore
      if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
        // @ts-ignore
        EdgeRuntime.waitUntil(processBatch(job));
      } else {
        processBatch(job).catch(console.error);
      }
    }

    return new Response(JSON.stringify({ message: 'OK' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });

  } catch (err) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});
