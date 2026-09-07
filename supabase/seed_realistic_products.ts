import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// High-quality static images from Unsplash
const categoryImages: Record<string, string[]> = {
  'mens-clothes': [
    'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800&q=80',
    'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'
  ],
  'womens-clothes': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80',
    'https://images.unsplash.com/photo-1434389678240-6f01103f7e53?w=800&q=80',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
    'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80'
  ],
  'watches-glasses': [
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    'https://images.unsplash.com/photo-1508656961811-0967dbab7cd8?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'
  ],
  'bags': [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80'
  ],
  'mens-shoes': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'
  ],
  'womens-shoes': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    'https://images.unsplash.com/photo-1534653299134-96a171b61581?w=800&q=80',
    'https://images.unsplash.com/photo-1515347619362-67347141d11b?w=800&q=80'
  ],
  'gaming-consoles': [
    'https://images.unsplash.com/photo-1606144042733-dc132b495205?w=800&q=80',
    'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80',
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&q=80',
    'https://images.unsplash.com/photo-1627856013091-fed6e4e047ce?w=800&q=80'
  ]
};

const asianStyles = ['Korean Style', 'Japanese Minimalist', 'Tokyo Trend', 'Seoul Fashion', 'Asian Vintage', 'Harajuku', 'Modern Asian'];
const conditions = ['[Brand New]', '[New in Box]', '[Like New]', '[Used - Good Condition]', '[Second Hand]'];
const colors = ['Black', 'White', 'Navy Blue', 'Olive Green', 'Beige', 'Crimson Red', 'Silver', 'Gold', 'Rose Gold'];

function generatePrice(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProductName(category: string, index: number) {
  const isUsed = Math.random() > 0.6;
  const condition = isUsed ? conditions[Math.floor(Math.random() * 2 + 2)] : conditions[Math.floor(Math.random() * 2)];
  const style = asianStyles[Math.floor(Math.random() * asianStyles.length)];
  
  const baseNames: Record<string, string[]> = {
    'mens-clothes': ['Oversized T-Shirt', 'Streetwear Jacket', 'Loose Fit Jeans', 'Minimalist Hoodie', 'Linen Shirt', 'Cargo Pants'],
    'womens-clothes': ['Pleated Skirt', 'Crop Top', 'Cardigan Set', 'Vintage Dress', 'Wide Leg Pants', 'Silk Blouse'],
    'watches-glasses': ['Minimalist Watch', 'Classic Chronograph', 'Vintage Leather Watch', 'Retro Sunglasses', 'Metal Frame Glasses'],
    'bags': ['Canvas Tote Bag', 'Crossbody Mini Bag', 'Vintage Leather Backpack', 'Streetwear Messenger Bag', 'Minimalist Handbag'],
    'mens-shoes': ['Chunky Sneakers', 'Minimalist White Shoes', 'Leather Loafers', 'Canvas Skate Shoes', 'Vintage Boots'],
    'womens-shoes': ['Platform Sneakers', 'Mary Jane Shoes', 'Strappy Sandals', 'Ankle Boots', 'Ballet Flats'],
    'gaming-consoles': ['PlayStation 5 Console', 'Nintendo Switch OLED', 'Xbox Series X', 'Retro Handheld Console', 'Custom Gamepad']
  };

  const pool = baseNames[category] || ['Premium Item'];
  const base = pool[index % pool.length];
  
  if (category === 'gaming-consoles') {
    return `${condition} ${base} - Imported`;
  }
  
  return `${style} ${base}`;
}

async function runSeed() {
  console.log('🚀 Starting highly curated realistic product seed (with shops & variants)...');

  // 1. Fetch all profiles
  console.log('👥 Fetching profiles...');
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, full_name, email');
  
  if (!profileError && profiles && profiles.length > 0) {
    console.log(`✅ Found ${profiles.length} profiles.`);
    
    console.log('🏪 Ensuring every user has a shop...');
    const { data: existingShops } = await supabase.from('shops').select('id, owner_id');
    const existingShopOwners = new Set(existingShops?.map(s => s.owner_id) || []);
    
    const newShops = [];
    for (const profile of profiles) {
      if (!existingShopOwners.has(profile.id)) {
        const shopName = `${profile.full_name || profile.email?.split('@')[0] || 'User'}'s Premium Shop`;
        newShops.push({
          owner_id: profile.id,
          name: shopName,
          description: `Welcome to ${shopName}! The best place for Asian fashion and premium electronics.`,
          is_verified: Math.random() > 0.5
        });
      }
    }

    if (newShops.length > 0) {
      const { error: createShopsError } = await supabase.from('shops').insert(newShops);
      if (createShopsError) {
        console.error('❌ Failed to create shops for users:', createShopsError);
      } else {
        console.log(`✅ Created ${newShops.length} new shops.`);
      }
    } else {
      console.log('✅ All users already have shops.');
    }
  } else {
    console.log('⚠️ No profiles found or error fetching profiles. Relying solely on existing shops.');
  }

  // 3. Delete existing products
  console.log('🗑️ Deleting all existing products...');
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Failed to delete products:', deleteError);
    return;
  }
  console.log('✅ All existing products deleted.');

  // Fetch all shops now (including newly created)
  const { data: shops } = await supabase.from('shops').select('id, owner_id');
  if (!shops || shops.length === 0) {
    console.error('❌ No shops exist.');
    return;
  }

  const targetSlugs = ['mens-clothes', 'womens-clothes', 'watches-glasses', 'bags', 'mens-shoes', 'womens-shoes', 'gaming-consoles'];
  const { data: categories } = await supabase.from('categories').select('id, name, slug').in('slug', targetSlugs);
  
  if (!categories || categories.length === 0) {
    console.error('❌ Failed to fetch targeted categories.');
    return;
  }

  let totalProducts = 0;
  let totalVariants = 0;

  for (const shop of shops) {
    console.log(`\n🏪 Generating targeted products for shop: ${shop.id}`);
    
    for (const cat of categories) {
      const imgList = categoryImages[cat.slug] || ['https://placehold.co/800x800?text=Product+Image'];
      
      // 5 products per category per shop (to keep total execution time reasonable)
      for (let i = 0; i < 5; i++) {
        const price = generatePrice(299, 15000);
        const name = generateProductName(cat.slug, i);
        // Add a random seed to unsplash to potentially bypass cache if needed, 
        // though static URLs will remain identical visually.
        const imageUrl = imgList[Math.floor(Math.random() * imgList.length)];
        
        const { data: insertedProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            shop_id: shop.id,
            category_id: cat.id,
            name: name,
            description: `Excellent condition ${name}. Highly popular in Asia. Perfect for your lifestyle. High durability and stunning aesthetics. Verified authentic.`,
            price: price,
            compare_at_price: price + generatePrice(100, 1000),
            stock_quantity: generatePrice(10, 100),
            images: [imageUrl],
            is_published: true,
            brand: cat.slug === 'gaming-consoles' ? 'GamingBrand' : 'AsianBoutique',
            ratings_count: generatePrice(5, 500),
            average_rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            highlights: ['Imported', 'Highly Rated', 'Authentic']
          })
          .select('id')
          .single();

        if (insertError || !insertedProduct) {
          console.error(`❌ Failed to insert product:`, insertError);
          continue;
        }

        totalProducts++;

        // Generate Variants for the inserted product
        const numVariants = Math.floor(Math.random() * 3) + 3; // 3 to 5 variants
        const variantType = (cat.slug.includes('clothes') || cat.slug.includes('shoes')) ? 'Size' : 'Color';
        const variantsToInsert = [];

        // Shuffle colors
        const shuffledColors = [...colors].sort(() => 0.5 - Math.random());
        const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
        const shoesSizes = ['39', '40', '41', '42', '43', '44'];

        for (let v = 0; v < numVariants; v++) {
          let value = shuffledColors[v];
          if (variantType === 'Size') {
            if (cat.slug.includes('shoes')) {
              value = shoesSizes[v % shoesSizes.length];
            } else {
              value = sizes[v % sizes.length];
            }
          }

          variantsToInsert.push({
            product_id: insertedProduct.id,
            name: variantType,
            value: value,
            price_override: Math.random() > 0.7 ? price + generatePrice(100, 500) : null,
            stock_quantity: generatePrice(0, 30),
            sku: `SKU-${insertedProduct.id.substring(0,6)}-${v}`,
            image_url: imageUrl
          });
        }

        const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert);
        if (variantError) {
          console.error(`❌ Failed to insert variants:`, variantError);
        } else {
          totalVariants += variantsToInsert.length;
        }
      }
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`✅ Created ${totalProducts} Products.`);
  console.log(`✅ Created ${totalVariants} Product Variants.`);
}

runSeed().catch(console.error);
