import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// -------------------------------------------------------------
// Config
// -------------------------------------------------------------
const BATCH_SIZE = 20;
const API_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
type ImportProvider = 'unsplash' | 'dummyjson' | 'hybrid';

// -------------------------------------------------------------
// Dummy Data Generators (used for Unsplash path)
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
// Read active provider from site_settings
// -------------------------------------------------------------
async function getActiveProvider(supabaseAdmin: any): Promise<ImportProvider> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'import_image_provider')
      .maybeSingle();
    if (data?.value === 'dummyjson') return 'dummyjson';
    if (data?.value === 'hybrid') return 'hybrid';
  } catch (e) {
    console.warn('Could not read import_image_provider, defaulting to unsplash:', e);
  }
  return 'unsplash';
}

// Read hybrid_dummy_ratio (0-100, default 80 = 80% DummyJSON images, 20% Unsplash)
async function getHybridRatio(supabaseAdmin: any): Promise<number> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'hybrid_dummy_ratio')
      .maybeSingle();
    if (data?.value) return Math.max(0, Math.min(100, Number(data.value)));
  } catch {
    // ignore
  }
  return 80; // default: 80% DummyJSON
}

// -------------------------------------------------------------
// DummyJSON Product Fetcher
// Maps DummyJSON's product schema â†’ our products table schema.
// Returns a ready-to-insert product row + image URLs.
// -------------------------------------------------------------
interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  thumbnail: string;
  brand?: string;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY → DummyJSON endpoint mapping
// Keyword matching (slug / name contains key) → DummyJSON category slug(s)
// DummyJSON available slugs:
//   beauty, fragrances, furniture, groceries, home-decoration, kitchen-accessories,
//   laptops, mens-shirts, mens-shoes, mens-watches, mobile-accessories, motorcycles,
//   skin-care, smartphones, sports-accessories, sunglasses, tablets, tops, vehicle,
//   womens-bags, womens-dresses, womens-jewellery, womens-shoes, womens-watches
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_TO_DUMMYJSON: Array<{ keys: string[]; djCats: string[] }> = [
  // Electronics
  { keys: ['electronic','อิเล็กทรอนิกส์','อิเล็ก'],    djCats: ['smartphones','laptops','tablets','mobile-accessories'] },
  { keys: ['smartphone','โทรศัพท์','มือถือ','phone'],   djCats: ['smartphones','mobile-accessories'] },
  { keys: ['laptop','โน้ตบุ๊ค','notebook','computer'],  djCats: ['laptops','tablets'] },
  { keys: ['tablet','แท็บเล็ต','ipad'],                 djCats: ['tablets','laptops'] },
  { keys: ['mobile-accessory','accessory','อุปกรณ์เสริม'], djCats: ['mobile-accessories','sunglasses'] },
  // Sports (Games removed to trigger Unsplash fallback)
  { keys: ['กีฬา','sport','sports','exercise'], djCats: ['sports-accessories'] },
  // Fashion / Clothing
  { keys: ['fashion','เสื้อผ้า','clothes','clothing','apparel'], djCats: ['mens-shirts','tops','womens-dresses','mens-shoes','womens-shoes'] },
  { keys: ['shirt','เสื้อ','top','blouse'],              djCats: ['mens-shirts','tops'] },
  { keys: ['dress','กระโปรง','skirt'],                  djCats: ['womens-dresses','tops'] },
  { keys: ['pants','กางเกง','trouser','jean'],           djCats: ['mens-shirts','tops'] },
  // Shoes
  { keys: ['shoe','รองเท้า','sneaker','footwear','boot'], djCats: ['mens-shoes','womens-shoes'] },
  // Watches
  { keys: ['watch','นาฬิกา','timepiece','clock'],        djCats: ['mens-watches','womens-watches'] },
  // Bags
  { keys: ['bag','กระเป๋า','backpack','tote','purse','luggage'], djCats: ['womens-bags'] },
  // Beauty / Skincare
  { keys: ['beauty','เครื่องสำอาง','cosmetic','makeup'], djCats: ['beauty','skin-care','fragrances'] },
  { keys: ['skincare','skin','ผิว','lotion','cream'],    djCats: ['skin-care','beauty'] },
  { keys: ['fragrance','perfume','น้ำหอม'],              djCats: ['fragrances'] },
  // Jewellery / Sunglasses
  { keys: ['jewel','jewelry','jewellery','เครื่องประดับ','แหวน','สร้อย','ต่างหู'], djCats: ['womens-jewellery'] },
  { keys: ['sunglass','แว่นตา','glasses','eyewear'],    djCats: ['sunglasses'] },
  // Home / Furniture
  { keys: ['furniture','เฟอร์นิเจอร์','sofa','chair','table','desk'], djCats: ['furniture','home-decoration'] },
  { keys: ['home','บ้าน','decor','decoration','ของตกแต่ง'], djCats: ['home-decoration','furniture'] },
  { keys: ['kitchen','ครัว','cooking','cookware','utensil'], djCats: ['kitchen-accessories','groceries'] },
  // Food / Grocery
  { keys: ['food','อาหาร','grocery','groceries','snack','drink'], djCats: ['groceries'] },
  // Vehicle / Motorcycle
  { keys: ['vehicle','ยานพาหนะ','car','รถยนต์','auto'],  djCats: ['vehicle','motorcycles'] },
  { keys: ['motorcycle','มอเตอร์ไซค์','motorbike','bike'], djCats: ['motorcycles','vehicle'] },
];

// Fallback: fetch ALL categories (broad/generic category names)
const ALL_DUMMYJSON_CATS = [
  'beauty','fragrances','furniture','groceries','home-decoration',
  'kitchen-accessories','laptops','mens-shirts','mens-shoes','mens-watches',
  'mobile-accessories','motorcycles','skin-care','smartphones','sports-accessories',
  'sunglasses','tablets','tops','vehicle','womens-bags',
  'womens-dresses','womens-jewellery','womens-shoes','womens-watches'
];

/**
 * Returns the DummyJSON category slugs that best match a given app category.
 * Tries slug first, then name, using keyword contains matching.
 */
function getDjCatsForCategory(category: any): string[] {
  const slug = normalizeCategorySlug(category).toLowerCase();
  const name = (category.name || '').toString().toLowerCase();
  const haystack = `${slug} ${name}`;
  for (const entry of CATEGORY_TO_DUMMYJSON) {
    if (entry.keys.some(k => haystack.includes(k))) {
      return entry.djCats;
    }
  }
  // No specific match — return empty array so processBatch forces Unsplash fallback
  return [];
}

// Per-category product pools  ─  key: our app's category.id  ─  value: DummyJSON product array
const _catPoolsV2: Map<string, DummyJsonProduct[]> = new Map();
const _catIdxV2:   Map<string, number>             = new Map();

/**
 * Ensures a DummyJSON product pool exists for the given app category.
 * Fetches from the category-specific DummyJSON endpoint(s) so that
 * product titles / images always match the chosen category.
 */
async function ensureCategoryPool(category: any): Promise<void> {
  const cid = String(category.id);
  if ((_catPoolsV2.get(cid)?.length ?? 0) > 0) {
    // Already loaded — re-shuffle for randomness
    const pool = _catPoolsV2.get(cid)!;
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    _catIdxV2.set(cid, 0);
    return;
  }

  const djCats = getDjCatsForCategory(category);
  const FIELDS = 'id,title,description,price,category,images,thumbnail,brand,discountPercentage,rating,stock,tags';
  const collected: DummyJsonProduct[] = [];

  for (const djSlug of djCats) {
    try {
      const res = await fetch(
        `https://dummyjson.com/products/category/${djSlug}?limit=0&select=${FIELDS}`
      );
      if (!res.ok) { console.warn(`DummyJSON /${djSlug} returned ${res.status}`); continue; }
      const json = await res.json();
      collected.push(...(json.products || []));
    } catch (e) {
      console.warn(`DummyJSON fetch failed for ${djSlug}:`, e);
    }
  }

  // Fallback: leave empty to trigger Unsplash for this category dynamically
  if (collected.length === 0) {
    console.warn(`No products for djCats [${djCats}], pool is empty (will trigger Unsplash fallback).`);
  }

  // Fisher-Yates shuffle
  for (let i = collected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [collected[i], collected[j]] = [collected[j], collected[i]];
  }

  _catPoolsV2.set(cid, collected);
  _catIdxV2.set(cid, 0);
  console.log(`Category pool [${category.name}] → djCats:${djCats.join(',')} → ${collected.length} products loaded.`);
}

/** Returns next DummyJSON product that matches the app category. */
function nextProductForCategory(category: any): DummyJsonProduct | null {
  const cid = String(category.id);
  const pool = _catPoolsV2.get(cid);
  if (!pool || pool.length === 0) return null;
  const idx = _catIdxV2.get(cid) ?? 0;
  const product = pool[idx % pool.length];
  _catIdxV2.set(cid, idx + 1);
  return product;
}

/**
 * Build a product row from DummyJSON data, mapped to our schema.
 */
function buildProductFromDummyJson(
  dj: DummyJsonProduct,
  shopId: string,
  categoryId: string,
  category: any,
  cheapMin: number,
  cheapMax: number,
  expMin: number,
  expMax: number,
  cheapRatio: number
): { product: any; images: string[]; variants: any[] } {
  // Use DummyJSON price directly (it's in USD range, typically 10â€“1750)
  const rawPrice = Math.round(dj.price);
  // Clamp into our configured ranges for consistency
  const isCheap = rawPrice < 500;
  const price = isCheap
    ? Math.min(Math.max(rawPrice, cheapMin), cheapMax)
    : Math.min(Math.max(rawPrice, expMin), expMax);

  const compareAt = Math.round(price * (1 + (dj.discountPercentage || 10) / 100));

  // Use real images from DummyJSON â€” no padding needed
  const images = dj.images?.length > 0
    ? dj.images
    : dj.thumbnail
      ? [dj.thumbnail]
      : [`https://placehold.co/600x600/0f172a/94a3b8.png?text=${encodeURIComponent(dj.title)}`];

  const variantConfig = getCategoryVariantConfig(category);
  const variantCount = randomInt(2, 4);
  const variants = Array.from({ length: variantCount }, (_, i) => ({
    name: variantConfig.variantName,
    value: randomPick(variantConfig.values),
    price_override: i === 0 ? 0 : randomInt(0, 200),
    stock_quantity: Math.ceil((dj.stock || 20) / variantCount),
    image_url: images[i % images.length],
    sku: `dj-${dj.id}-${normalizeCategorySlug(category)}-${i + 1}-${Date.now()}`
  }));

  const product = {
    shop_id: shopId,
    category_id: categoryId,
    name: dj.title,
    description: dj.description || `สินค้าจาก DummyJSON หมวด ${category.name}`,
    price,
    compare_at_price: compareAt,
    stock_quantity: variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),
    images,
    is_published: true,
    brand: dj.brand || randomBrand(),
    highlights: randomHighlights(),
  };

  return { product, images, variants };
}

// -------------------------------------------------------------
// Unsplash Image Fetcher (unchanged, kept for Unsplash path)
// Returns { urls, quotaExhausted }
// -------------------------------------------------------------
// Strict e-commerce product search keywords â€” avoids people, nature, landscapes
const ECOMMERCE_QUERIES = [
  'product studio white background isolated',
  'commercial product photography isolated',
  'ecommerce product shot white background',
  'product on white background studio',
  'commercial item clean background',
];

// Banned non-product tags to filter out
const BANNED_TAGS = ['person', 'people', 'woman', 'man', 'child', 'face', 'portrait', 'mountain', 'nature', 'landscape', 'sky', 'street', 'city', 'ocean', 'sea', 'forest', 'travel'];

function isProductPhoto(photo: any): boolean {
  const tags: string[] = (photo.tags || []).map((t: any) => (t.title || t.source?.title || '').toLowerCase());
  return !tags.some(tag => BANNED_TAGS.some(banned => tag.includes(banned)));
}

async function getPlaceholderImagesUnsplash(
  supabaseAdmin: any,
  category: any,
  count = 7,
  strictProductFilter = false
): Promise<{ urls: string[]; quotaExhausted: boolean }> {
  const label = (category.name || category.slug || 'product').toString().trim();
  // Use strict e-commerce query if filtering is requested (Hybrid mode)
  const searchQuery = strictProductFilter
    ? ECOMMERCE_QUERIES[Math.floor(Math.random() * ECOMMERCE_QUERIES.length)] + ' ' + label
    : label;
  const query = encodeURIComponent(searchQuery);
  const fallback = Array.from({ length: count }, () => `https://placehold.co/600x600/0f172a/94a3b8.png?text=${encodeURIComponent(label)}`);

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

  let activeKeyData = null;
  for (const key of allKeys) {
    const oneHourAgo = new Date(Date.now() - API_COOLDOWN_MS);
    const isReset = !key.last_used_at || new Date(key.last_used_at) < oneHourAgo;
    if (key.remaining_requests > 0 || isReset) {
      activeKeyData = key;
      break;
    }
  }

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

    if (!response.ok) throw new Error(`Unsplash returned ${response.status}`);

    const results = await response.json();
    // Apply strict product filter if requested: reject non-product photos
    const filtered = strictProductFilter ? results.filter(isProductPhoto) : results;
    const urls = filtered.map((photo: any) => photo?.urls?.regular || photo?.urls?.small).filter(Boolean).slice(0, count);
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
// Calculate next resume time (for Unsplash pause/resume)
// -------------------------------------------------------------
async function getNextResumeAt(supabaseAdmin: any): Promise<string> {
  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('last_used_at')
    .eq('provider', 'unsplash')
    .eq('is_active', true);

  if (!keys || keys.length === 0) return new Date(Date.now() + API_COOLDOWN_MS).toISOString();

  let earliestReset = Infinity;
  for (const key of keys) {
    if (key.last_used_at) {
      const resetAt = new Date(key.last_used_at).getTime() + API_COOLDOWN_MS;
      if (resetAt < earliestReset) earliestReset = resetAt;
    }
  }

  const resumeAt = earliestReset === Infinity
    ? Date.now() + API_COOLDOWN_MS
    : Math.max(earliestReset, Date.now() + 5 * 60 * 1000);

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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
      body: JSON.stringify({ type: 'BATCH_CONTINUE', job_id: jobId }),
    });
  } catch (err) {
    console.error('Failed to schedule next batch:', err);
  }
}

// -------------------------------------------------------------
// Resume paused jobs (pg_cron trigger)
// -------------------------------------------------------------
async function resumePausedJobs() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date().toISOString();
  const { data: pausedJobs, error } = await supabaseAdmin
    .from('generation_jobs')
    .select('id, completed_count, target_count')
    .eq('status', 'paused')
    .lte('resume_at', now);

  if (error) { console.error('Error fetching paused jobs:', error); return; }
  if (!pausedJobs || pausedJobs.length === 0) { console.log('No paused jobs ready to resume.'); return; }

  for (const job of pausedJobs) {
    await supabaseAdmin.from('generation_jobs')
      .update({ status: 'running', resume_at: null })
      .eq('id', job.id);
    await scheduleNextBatch(job.id);
  }
}

// -------------------------------------------------------------
// Process ONE batch â€” provider-aware
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

  if (jobFetchError || !freshJob) { console.error(`Job ${job.id} not found.`); return; }
  if (['completed', 'failed', 'cancelled'].includes(freshJob.status)) {
    console.log(`Job ${freshJob.id} is already ${freshJob.status}. Stopping.`);
    return;
  }

  // â”€â”€ Read active provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const provider = await getActiveProvider(supabaseAdmin);
  const hybridRatio = provider === 'hybrid' ? await getHybridRatio(supabaseAdmin) : 80;
  console.log(`Job ${freshJob.id}: using provider = ${provider}${provider === 'hybrid' ? ` (ratio: ${hybridRatio}% DummyJSON)` : ''}`);

  // Fetch categories FIRST (required before loading per-category pools)
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .in('id', freshJob.category_ids);

  if (!categories || categories.length === 0) {
    await supabaseAdmin.from('generation_jobs').update({ status: 'failed' }).eq('id', freshJob.id);
    return;
  }

  // CORE FIX: Pre-load category-specific DummyJSON pools (one pool per selected category).
  // Products are fetched from DummyJSON category-specific endpoints so product titles and
  // images STRICTLY match the user-selected category (e.g. "games" -> sports-accessories).
  if (provider === 'dummyjson' || provider === 'hybrid') {
    await Promise.all(categories.map((cat: any) => ensureCategoryPool(cat)));
    // Note: We no longer fail if all pools are empty. The loop will fallback to Unsplash.
  }

  // Fetch pricing settings
  const { data: settingsData } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', ['gen_price_cheap_min', 'gen_price_cheap_max', 'gen_price_expensive_min', 'gen_price_expensive_max', 'gen_cheap_ratio']);
  const settingsObj = (settingsData || []).reduce((acc: any, cur: any) => ({ ...acc, [cur.key]: Number(cur.value) }), {});

  const cheapMin = settingsObj['gen_price_cheap_min'] || 50;
  const cheapMax = settingsObj['gen_price_cheap_max'] || 490;
  const expMin   = settingsObj['gen_price_expensive_min'] || 500;
  const expMax   = settingsObj['gen_price_expensive_max'] || 4500;
  const cheapRatio = settingsObj['gen_cheap_ratio'] || 50;

  await supabaseAdmin.from('generation_jobs').update({ status: 'running', resume_at: null }).eq('id', freshJob.id);

  // Check shop quota
  const { data: shopData } = await supabaseAdmin.from('shops').select('product_limit').eq('id', freshJob.shop_id).single();
  const { count: currentProductCount } = await supabaseAdmin.from('products')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', freshJob.shop_id);

  const productLimit = shopData?.product_limit ?? 0;
  const usedSlots = currentProductCount ?? 0;
  const availableSlots = Math.max(0, productLimit - usedSlots);

  if (availableSlots <= 0) {
    await supabaseAdmin.from('generation_jobs').update({
      status: 'paused', pause_reason: 'quota_exceeded', resume_at: null, completed_count: freshJob.completed_count
    }).eq('id', freshJob.id);
    return;
  }

  let completed = freshJob.completed_count || 0;
  const target = freshJob.target_count;
  
  const activeBatchSize = (provider === 'dummyjson' || provider === 'hybrid') ? 200 : BATCH_SIZE;
  const batchEnd = Math.min(completed + activeBatchSize, target, completed + availableSlots);

  console.log(`Job ${freshJob.id}: processing items ${completed + 1}â€“${batchEnd} of ${target} [${provider}]`);

  // â”€â”€ Process in sub-batches of 20 â€” cancel is checked before each sub-batch â”€â”€
  const SUB_BATCH = 20;
  let insertedTotal = 0;

  for (let offset = 0; offset < (batchEnd - completed); offset += SUB_BATCH) {
    // â”€â”€ Cancel check BEFORE building each sub-batch â”€â”€
    const { data: cancelCheck } = await supabaseAdmin
      .from('generation_jobs')
      .select('status')
      .eq('id', freshJob.id)
      .single();
    if (cancelCheck?.status === 'cancelled') {
      console.log(`Job ${freshJob.id}: cancelled before sub-batch at offset ${offset}. Stopping.`);
      return;
    }

    const subEnd = Math.min(offset + SUB_BATCH, batchEnd - completed);
    const productsToInsert: any[] = [];
    const variantsMap: any[][] = [];

    for (let i = offset; i < subEnd; i++) {
      const category = randomPick(categories);
      const variantConfig = getCategoryVariantConfig(category);

      let product: any;
      let imageUrls: string[];
      let variants: any[];

      let effectiveProvider = provider;
      if (provider === 'dummyjson' || provider === 'hybrid') {
        const poolLen = _catPoolsV2.get(String(category.id))?.length ?? 0;
        if (poolLen === 0) {
          effectiveProvider = 'unsplash';
        }
      }

      if (effectiveProvider === 'dummyjson') {
        // â”€â”€ DUMMYJSON PATH â”€â”€
        const dj = nextProductForCategory(category);
        if (!dj) throw new Error(`Category pool for [${category.name}] is empty unexpectedly`);
        const built = buildProductFromDummyJson(dj, freshJob.shop_id, category.id, category, cheapMin, cheapMax, expMin, expMax, cheapRatio);
        product = built.product;
        imageUrls = built.images;
        variants = built.variants;

      } else if (effectiveProvider === 'hybrid') {
        // â”€â”€ HYBRID PATH: DummyJSON metadata always; images chosen by ratio â”€â”€
        const dj = nextProductForCategory(category);
        if (!dj) throw new Error(`Category pool for [${category.name}] is empty unexpectedly`);

        const djImages: string[] = dj.images?.length > 0
          ? dj.images
          : dj.thumbnail
            ? [dj.thumbnail]
            : [`https://placehold.co/600x600/0f172a/94a3b8.png?text=${encodeURIComponent(dj.title)}`];

        const useDummyImages = (Math.random() * 100) < hybridRatio;

        if (useDummyImages) {
          imageUrls = djImages;
        } else {
          const { urls: unsplashUrls, quotaExhausted } = await getPlaceholderImagesUnsplash(supabaseAdmin, category, 7, true);
          if (quotaExhausted || unsplashUrls.every(u => u.includes('placehold.co'))) {
            console.warn(`Job ${freshJob.id}: Unsplash quota hit in Hybrid mode. Using DummyJSON images.`);
            imageUrls = djImages;
          } else {
            imageUrls = unsplashUrls;
          }
        }

        const rawPrice = Math.round(dj.price);
        const isCheap = rawPrice < 500;
        const price = isCheap
          ? Math.min(Math.max(rawPrice, cheapMin), cheapMax)
          : Math.min(Math.max(rawPrice, expMin), expMax);
        const compareAt = Math.round(price * (1 + (dj.discountPercentage || 10) / 100));

        const variantCount = randomInt(2, 4);
        variants = Array.from({ length: variantCount }, (_, vIndex) => ({
          name: variantConfig.variantName,
          value: randomPick(variantConfig.values),
          price_override: vIndex === 0 ? 0 : randomInt(0, 200),
          stock_quantity: Math.ceil((dj.stock || 20) / variantCount),
          image_url: imageUrls[vIndex % imageUrls.length],
          sku: `hybrid-${dj.id}-${normalizeCategorySlug(category)}-${vIndex + 1}-${Date.now()}`
        }));

        product = {
          shop_id: freshJob.shop_id,
          category_id: category.id,
          name: dj.title,
          description: dj.description || `สินค้าจาก DummyJSON หมวด ${category.name}`,
          price,
          compare_at_price: compareAt,
          stock_quantity: variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),
          images: imageUrls,
          is_published: true,
          brand: dj.brand || randomBrand(),
          highlights: randomHighlights(),
        };

      } else {
        // â”€â”€ UNSPLASH PATH â”€â”€
        const { urls, quotaExhausted } = await getPlaceholderImagesUnsplash(supabaseAdmin, category, 7, true);
        if (quotaExhausted) {
          const resumeAt = await getNextResumeAt(supabaseAdmin);
          console.log(`Job ${freshJob.id}: Unsplash quota exhausted. Pausing until ${resumeAt}`);
          await supabaseAdmin.from('generation_jobs').update({
            status: 'paused', pause_reason: 'api_quota_exhausted', resume_at: resumeAt, completed_count: completed + insertedTotal
          }).eq('id', freshJob.id);
          return;
        }
        imageUrls = urls;
        const variantCount = randomInt(2, 4);
        variants = Array.from({ length: variantCount }, (_, vIndex) => ({
          name: variantConfig.variantName,
          value: randomPick(variantConfig.values),
          price_override: vIndex === 0 ? 0 : randomInt(0, 200),
          stock_quantity: randomInt(5, 30),
          image_url: imageUrls[vIndex % imageUrls.length],
          sku: `${normalizeCategorySlug(category)}-${Date.now()}-${vIndex + 1}-${Math.random().toString(36).slice(2, 8)}`
        }));
        const isCheap = (Math.random() * 100) < cheapRatio;
        const price = isCheap ? randomInt(cheapMin, cheapMax) : randomInt(expMin, expMax);
        product = {
          shop_id: freshJob.shop_id,
          category_id: category.id,
          name: randomProductTitle(category),
          description: `à¸ªà¸´à¸™à¸„à¹‰à¸²à¸£à¸¸à¹ˆà¸™à¸ªà¸¸à¹ˆà¸¡à¸ªà¸³à¸«à¸£à¸±à¸šà¸«à¸¡à¸§à¸” ${category.name}`,
          price,
          compare_at_price: price + randomInt(100, 450),
          stock_quantity: variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),
          images: imageUrls,
          is_published: true,
          brand: randomBrand(),
          highlights: randomHighlights(),
        };
      }

      productsToInsert.push(product);
      variantsMap.push(variants);
    }

    // â”€â”€ Insert this sub-batch â”€â”€
    if (productsToInsert.length > 0) {
      const { data: insertedProducts, error: pError } = await supabaseAdmin
        .from('products')
        .insert(productsToInsert)
        .select('id');

      if (pError) {
        if (pError.message?.includes('product limit') || pError.message?.includes('quota')) {
          await supabaseAdmin.from('generation_jobs').update({
            status: 'paused', pause_reason: 'quota_exceeded', resume_at: null,
            completed_count: completed + insertedTotal
          }).eq('id', freshJob.id);
          return;
        }
        console.error(`Sub-batch insert failed:`, pError);
        return;
      }

      // Insert variants for this sub-batch
      if (insertedProducts && insertedProducts.length === productsToInsert.length) {
        const allVariants: any[] = [];
        for (let i = 0; i < insertedProducts.length; i++) {
          variantsMap[i].forEach((v: any) => allVariants.push({ ...v, product_id: insertedProducts[i].id }));
        }
        if (allVariants.length > 0) {
          await supabaseAdmin.from('product_variants').insert(allVariants);
        }
      }

      insertedTotal += productsToInsert.length;
    }
  }

  // â”€â”€ Update Job Progress â€” ATOMIC: .neq('status','cancelled') prevents overwriting a cancel â”€â”€
  completed += insertedTotal;
  const isLastItem = completed >= target;

  const { data: updateResult } = await supabaseAdmin
    .from('generation_jobs')
    .update({
      completed_count: completed,
      status: isLastItem ? 'completed' : 'running',
    })
    .eq('id', freshJob.id)
    .neq('status', 'cancelled')  // â† ATOMIC GUARD: never overwrites 'cancelled'
    .select('status')
    .single();

  // If no row was updated (because status was 'cancelled'), stop here
  if (!updateResult) {
    console.log(`Job ${freshJob.id}: cancelled â€” progress update skipped.`);
    return;
  }

  if (completed < target) {
    console.log(`Job ${freshJob.id}: batch done (${completed}/${target}). Scheduling next batch...`);
    if (provider === 'dummyjson' || provider === 'hybrid') {
      // 3-second cooldown between outer batches
      await new Promise(r => setTimeout(r, 3000));
    }
    // Final cancel check after cooldown
    const { data: cooldownCheck } = await supabaseAdmin
      .from('generation_jobs')
      .select('status')
      .eq('id', freshJob.id)
      .single();
    if (cooldownCheck?.status === 'cancelled') {
      console.log(`Job ${freshJob.id}: cancelled during cooldown â€” not scheduling next batch.`);
      return;
    }
    await scheduleNextBatch(freshJob.id);
  } else {
    console.log(`Job ${freshJob.id}: ALL DONE (${completed}/${target}) [provider: ${provider}]`);
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

    if (payload.type === 'INSERT' && payload.table === 'generation_jobs' && payload.record) {
      job = payload.record;
      console.log(`Webhook triggered for new job: ${job.id}`);
    }

    if (payload.type === 'BATCH_CONTINUE' && payload.job_id) {
      job = { id: payload.job_id };
      console.log(`Batch continue triggered for job: ${job.id}`);
    }

    if (payload.type === 'RESUME_CHECK') {
      // @ts-ignore
      if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
        // @ts-ignore
        EdgeRuntime.waitUntil(resumePausedJobs());
      } else {
        resumePausedJobs().catch(console.error);
      }
    }

    // â”€â”€ Cancel Job â€” uses service-role key to reliably bypass RLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (payload.type === 'CANCEL_JOB' && payload.job_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { error: cancelErr } = await adminClient
        .from('generation_jobs')
        .update({ status: 'cancelled', resume_at: null, pause_reason: null })
        .eq('id', payload.job_id);
      if (cancelErr) console.error(`CANCEL_JOB error for ${payload.job_id}:`, cancelErr);
      else console.log(`CANCEL_JOB: job ${payload.job_id} set to cancelled via service role.`);
      return new Response(JSON.stringify({ success: !cancelErr, job_id: payload.job_id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200,
      });
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
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});
