import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const categoryOptions = [
  {
    slug: 'mens-clothes',
    names: ['Oversized Jacket', 'Streetwear Hoodie', 'Utility Shirt', 'Denim Jacket', 'Cargo Pants', 'Minimal Tee'],
    variantName: 'Size',
    variantValues: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    slug: 'womens-clothes',
    names: ['Silk Blouse', 'Pleated Skirt', 'Floral Dress', 'Wrap Top', 'Wide Leg Pants', 'Linen Blazer'],
    variantName: 'Size',
    variantValues: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    slug: 'watches-glasses',
    names: ['Minimalist Watch', 'Retro Sunglasses', 'Chronograph Watch', 'Aviator Glasses', 'Sport Watch', 'Square Frame Glasses'],
    variantName: 'Color',
    variantValues: ['Black', 'Gold', 'Silver', 'Rose Gold']
  },
  {
    slug: 'bags',
    names: ['Crossbody Bag', 'Canvas Tote', 'Mini Backpack', 'Leather Messenger', 'Bucket Bag', 'Laptop Sleeve'],
    variantName: 'Color',
    variantValues: ['Black', 'Beige', 'Brown', 'Navy']
  },
  {
    slug: 'mens-shoes',
    names: ['Chunky Sneakers', 'Leather Loafers', 'Canvas High-Tops', 'Suede Chelsea Boots', 'Casual Slip-Ons', 'Street Sneakers'],
    variantName: 'Size',
    variantValues: ['39', '40', '41', '42', '43', '44']
  },
  {
    slug: 'womens-shoes',
    names: ['Platform Sneakers', 'Strappy Sandals', 'Ankle Boots', 'Pointed Flats', 'Mules', 'Wedge Heels'],
    variantName: 'Size',
    variantValues: ['36', '37', '38', '39', '40', '41']
  },
  {
    slug: 'gaming-consoles',
    names: ['Retro Console', 'Handheld Gamepad', 'Portable Console', 'Limited Edition Console', 'Arcade Stick', 'Wireless Controller'],
    variantName: 'Edition',
    variantValues: ['Standard', 'Limited', 'Collector']
  }
];

const brands = ['UrbanEdge', 'DailyWear', 'PixelPlay', 'StudioLine', 'ClassicWorks', 'MetroPrime', 'FutureGear'];
const highlights = ['พร้อมส่ง', 'เก็บเงินปลายทาง', 'ของแท้', 'โปรโมชั่นพิเศษ', 'ส่งฟรี', 'สินค้าร้อนแรง'];
const imageTemplates = {
  'mens-clothes': 'https://placehold.co/600x600/111827/ffffff?text=Mens+Clothes',
  'womens-clothes': 'https://placehold.co/600x600/7c3aed/ffffff?text=Womens+Clothes',
  'watches-glasses': 'https://placehold.co/600x600/0f766e/ffffff?text=Watch+%26+Glasses',
  'bags': 'https://placehold.co/600x600/1d4ed8/ffffff?text=Bags',
  'mens-shoes': 'https://placehold.co/600x600/047857/ffffff?text=Mens+Shoes',
  'womens-shoes': 'https://placehold.co/600x600/db2777/ffffff?text=Womens+Shoes',
  'gaming-consoles': 'https://placehold.co/600x600/f59e0b/ffffff?text=Gaming'
};

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createProduct(index) {
  const category = pick(categoryOptions);
  const name = `${pick(category.names)} ${['Neo', 'Pro', 'X', 'Deluxe', 'Series', 'Edition'][index % 6]}`;
  const price = randomInt(490, 4990);
  const compareAtPrice = price + randomInt(100, 600);
  const categoryImage = imageTemplates[category.slug];
  const variantCount = Math.floor(Math.random() * 2) + 2;
  const imageUrl = `${categoryImage}&v=${index}`;
  const variants = Array.from({ length: variantCount }, (_, variantIndex) => {
    const value = pick(category.variantValues);
    return {
      name: category.variantName,
      value,
      price_override: variantIndex === 0 ? 0 : randomInt(0, 150),
      stock_quantity: randomInt(5, 35),
      sku: `${category.slug.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${index + 1}-${variantIndex + 1}`,
      image_url: imageUrl
    };
  });

  return {
    category_slug: category.slug,
    name,
    description: `สินค้ารุ่น ${name} สำหรับ ${category.slug.replace('-', ' ')} ดีไซน์ทันสมัยและใช้งานได้จริง`,
    price,
    compare_at_price: compareAtPrice,
    stock_quantity: variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
    images: [imageUrl],
    brand: pick(brands),
    highlights: [pick(highlights), pick(highlights)],
    variants
  };
}

async function createRandomProducts() {
  const products = Array.from({ length: 50 }, (_, index) => createProduct(index));
  const output = { products };
  await fs.writeFile(resolve(__dirname, 'random_products_50.json'), JSON.stringify(output, null, 2));
  console.log('✅ Generated supabase/random_products_50.json with 50 random products.');
}

createRandomProducts().catch((error) => {
  console.error(error);
  process.exit(1);
});
