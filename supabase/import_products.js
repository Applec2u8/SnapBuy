import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const buildPlaceholderImages = (name = 'product', count = 4) => {
  const query = encodeURIComponent(name || 'product');
  return Array.from({ length: count }, (_, index) => `https://source.unsplash.com/600x600/?${query}&sig=${index}`);
};

function normalizeProductInput(product) {
  return {
    shop_id: product.shop_id,
    category_id: product.category_id,
    name: product.name,
    description: product.description || null,
    price: Number(product.price ?? 0),
    compare_at_price: product.compare_at_price != null ? Number(product.compare_at_price) : null,
    stock_quantity: Number(product.stock_quantity ?? 0),
    images: Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : buildPlaceholderImages(product.name || product.category_slug || 'product', 4),
    is_published: product.is_published != null ? Boolean(product.is_published) : true,
    brand: product.brand || null,
    ratings_count: Number(product.ratings_count ?? 0),
    average_rating: product.average_rating != null ? Number(product.average_rating) : null,
    highlights: Array.isArray(product.highlights) ? product.highlights : []
  };
}

function buildVariantRow(variant, productId) {
  return {
    product_id: productId,
    name: variant.name,
    value: variant.value,
    price_override: variant.price_override != null ? Number(variant.price_override) : null,
    stock_quantity: Number(variant.stock_quantity ?? 0),
    image_url: variant.image_url || null,
    sku: variant.sku || null
  };
}

async function loadFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function ensureCategories(slugs) {
  const { data, error } = await supabase
    .from('categories')
    .select('id,slug')
    .in('slug', slugs);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data.reduce((map, category) => {
    map[category.slug] = category.id;
    return map;
  }, {});
}

async function ensureShops(ids) {
  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .in('id', ids);

  if (error) {
    throw new Error(`Failed to fetch shops: ${error.message}`);
  }

  return new Set(data.map((shop) => shop.id));
}

async function runImport(inputFile) {
  const filePath = resolve(__dirname, inputFile);
  const payload = await loadFile(filePath);

  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    throw new Error('Input JSON must include a non-empty products array.');
  }

  const products = payload.products;
  const categorySlugs = [...new Set(products.map((product) => product.category_slug).filter(Boolean))];
  const shopIds = [...new Set(products.map((product) => product.shop_id).filter(Boolean))];

  if (categorySlugs.length === 0) {
    throw new Error('Each product must provide category_slug.');
  }
  if (shopIds.length === 0) {
    throw new Error('Each product must provide shop_id.');
  }

  console.log(`🔎 Validating ${categorySlugs.length} categories and ${shopIds.length} shops...`);

  const categoryMap = await ensureCategories(categorySlugs);
  const missingCategories = categorySlugs.filter((slug) => !categoryMap[slug]);
  if (missingCategories.length > 0) {
    throw new Error(`Missing categories for slugs: ${missingCategories.join(', ')}`);
  }

  const shopSet = await ensureShops(shopIds);
  const missingShops = shopIds.filter((id) => !shopSet.has(id));
  if (missingShops.length > 0) {
    throw new Error(`Missing shops for ids: ${missingShops.join(', ')}`);
  }

  let totalCreatedProducts = 0;
  let totalCreatedVariants = 0;
  const failedProducts = [];

  for (const product of products) {
    const categoryId = categoryMap[product.category_slug];
    if (!categoryId) {
      failedProducts.push({ product, reason: `Category slug not found: ${product.category_slug}` });
      continue;
    }

    if (!product.shop_id) {
      failedProducts.push({ product, reason: 'Missing shop_id' });
      continue;
    }

    const productRow = normalizeProductInput({ ...product, category_id: categoryId });

    if (!productRow.name || productRow.price == null) {
      failedProducts.push({ product, reason: 'Missing required product name or price' });
      continue;
    }

    if (!productRow.stock_quantity && Array.isArray(product.variants) && product.variants.length > 0) {
      productRow.stock_quantity = product.variants.reduce((sum, variant) => sum + Number(variant.stock_quantity ?? 0), 0);
    }

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(productRow)
      .select('id')
      .single();

    if (insertError || !insertedProduct) {
      failedProducts.push({ product, reason: insertError?.message || 'Failed to insert product' });
      continue;
    }

    totalCreatedProducts += 1;
    const productId = insertedProduct.id;

    const variantRows = Array.isArray(product.variants)
      ? product.variants.map((variant) => buildVariantRow(variant, productId))
      : [];

    if (variantRows.length > 0) {
      const { error: variantError } = await supabase.from('product_variants').insert(variantRows);
      if (variantError) {
        failedProducts.push({ product, reason: `Variant insert failed: ${variantError.message}` });
      } else {
        totalCreatedVariants += variantRows.length;
      }
    }

    console.log(`✅ Imported product: ${productRow.name} (${productId}) with ${variantRows.length} variants`);
  }

  console.log('---');
  console.log(`🎉 Finished import. Products created: ${totalCreatedProducts}`);
  console.log(`🎉 Variants created: ${totalCreatedVariants}`);

  if (failedProducts.length > 0) {
    console.log(`⚠️ ${failedProducts.length} items failed:`);
    failedProducts.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.reason} - ${failure.product.name || JSON.stringify(failure.product)}`);
    });
    process.exit(1);
  }
}

const inputFile = process.argv[2] || './example_product_import.json';

runImport(inputFile).catch((error) => {
  console.error('❌ Import failed:', error.message || error);
  process.exit(1);
});
