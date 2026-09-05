import { supabase } from '../../../lib/supabase';

export const randomPick = (array: any[]) => array[Math.floor(Math.random() * array.length)];
export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const normalizeCategorySlug = (category: any) => (category.slug || category.name || '').toString().toLowerCase().replace(/\s+/g, '-');
export const getCategoryVariantConfig = (category: any) => {
  const slug = normalizeCategorySlug(category);
  if (slug.includes('shoe') || slug.includes('shoes')) return { variantName: 'Size', values: ['36', '37', '38', '39', '40', '41', '42'] };
  if (slug.includes('cloth') || slug.includes('shirt') || slug.includes('dress') || slug.includes('pants') || slug.includes('clothes')) return { variantName: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] };
  if (slug.includes('watch') || slug.includes('glass') || slug.includes('glasses')) return { variantName: 'Color', values: ['Black', 'Gold', 'Silver', 'Rose Gold', 'Brown'] };
  if (slug.includes('bag') || slug.includes('backpack') || slug.includes('tote')) return { variantName: 'Color', values: ['Black', 'Brown', 'Beige', 'Navy', 'Olive'] };
  if (slug.includes('console') || slug.includes('game') || slug.includes('controller')) return { variantName: 'Edition', values: ['Standard', 'Limited', 'Collector', 'Deluxe'] };
  return { variantName: 'Option', values: ['Standard', 'Premium', 'Deluxe', 'Limited'] };
};
export const randomBrand = () => randomPick(['UrbanEdge', 'DailyWear', 'PixelPlay', 'StudioLine', 'ClassicWorks', 'MetroPrime', 'FutureGear', 'FreshMarket']);
export const randomHighlights = () => {
  const options = ['พร้อมส่ง', 'เก็บเงินปลายทาง', 'ของแท้', 'โปรโมชั่นพิเศษ', 'ส่งฟรี', 'สินค้าร้อนแรง'];
  return Array.from({ length: 2 }, () => randomPick(options)).filter((value, index, self) => self.indexOf(value) === index);
};
export const randomProductTitle = (category: any) => {
  const suffixes = ['Pro', 'X', 'Plus', 'Deluxe', 'Prime', 'Max', 'Neo', 'Edition', 'Series'];
  return `${randomPick([category.name, `${category.name} รุ่นพิเศษ`, `${category.name} ใหม่`])} ${randomPick(suffixes)}`;
};

interface ApiKeyData {
  id: string;
  key_value: string;
  remaining_requests: number;
  last_used_at: string | null;
}

let cachedApiKeys: ApiKeyData[] | null = null;
let currentKeyIndex = 0;

async function getNextApiKey(): Promise<ApiKeyData | null> {
  if (cachedApiKeys === null) {
    try {
      const { data } = await supabase
        .from('api_keys')
        .select('id, key_value, remaining_requests, last_used_at')
        .eq('provider', 'unsplash')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      cachedApiKeys = data || [];
    } catch (e) {
      console.error('Failed to fetch api keys from DB', e);
      cachedApiKeys = [];
    }

    const envKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
    if (envKey && !cachedApiKeys.find(k => k.key_value === envKey)) {
      cachedApiKeys.push({ id: 'env', key_value: envKey, remaining_requests: 50, last_used_at: null });
    }
  }

  if (cachedApiKeys.length === 0) return null;

  // Find a valid key
  for (let i = 0; i < cachedApiKeys.length; i++) {
    const idx = (currentKeyIndex + i) % cachedApiKeys.length;
    const key = cachedApiKeys[idx];
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isReset = !key.last_used_at || new Date(key.last_used_at) < oneHourAgo;
    
    if (key.remaining_requests > 0 || isReset) {
      currentKeyIndex = idx;
      return key;
    }
  }

  return cachedApiKeys[currentKeyIndex];
}

function rotateApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % (cachedApiKeys?.length || 1);
}

export const buildPlaceholderImages = async (category: any, count = 7) => {
  const label = (category.name || category.slug || 'product').toString().trim();
  const query = encodeURIComponent(label);

  const activeKeyData = await getNextApiKey();

  if (!activeKeyData) {
    return Array.from({ length: count }, () =>
      `https://placehold.co/600x600/0f172a/94a3b8.png?text=${query}`
    );
  }

  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&count=${count}&orientation=squarish`, {
      headers: {
        Authorization: `Client-ID ${activeKeyData.key_value}`
      }
    });

    const limit = response.headers.get('X-Ratelimit-Limit');
    const remaining = response.headers.get('X-Ratelimit-Remaining');
    
    if (limit && remaining && activeKeyData.id !== 'env') {
      activeKeyData.remaining_requests = parseInt(remaining, 10);
      activeKeyData.last_used_at = new Date().toISOString();
      
      supabase.from('api_keys').update({
        remaining_requests: parseInt(remaining, 10),
        rate_limit: parseInt(limit, 10),
        last_used_at: new Date().toISOString()
      }).eq('id', activeKeyData.id).then();
    }

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        console.warn(`Unsplash API key exhausted (status ${response.status}). Rotating key...`);
        if (activeKeyData.id !== 'env') {
          activeKeyData.remaining_requests = 0;
          supabase.from('api_keys').update({ remaining_requests: 0, last_used_at: new Date().toISOString() }).eq('id', activeKeyData.id).then();
        }
        rotateApiKey();
      }
      throw new Error(`Unsplash returned ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results)) {
      throw new Error('Unexpected Unsplash response');
    }

    const urls = results
      .map((photo: any) => photo?.urls?.regular || photo?.urls?.small)
      .filter(Boolean)
      .slice(0, count);

    if (urls.length > 0) {
      // Pad if Unsplash returned fewer images
      while (urls.length < count) {
        urls.push(urls[urls.length - 1]);
      }
      return urls;
    }
  } catch (error) {
    console.warn('Unsplash API failed, using fallback images:', error);
  }

  return Array.from({ length: count }, () =>
    `https://placehold.co/600x600/0f172a/94a3b8.png?text=${query}`
  );
};
