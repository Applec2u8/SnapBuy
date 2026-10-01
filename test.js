const CATEGORY_TO_DUMMYJSON = [
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

function normalizeCategorySlug(category) {
  return (category.slug || category.name || '').toString().toLowerCase().replace(/\s+/g, '-');
}

function getDjCatsForCategory(category) {
  const slug = normalizeCategorySlug(category).toLowerCase();
  const name = (category.name || '').toString().toLowerCase();
  const haystack = slug + ' ' + name;
  console.log('haystack for', category.name, ':', haystack);
  for (const entry of CATEGORY_TO_DUMMYJSON) {
    if (entry.keys.some(k => haystack.includes(k))) {
      return entry.djCats;
    }
  }
  return [];
}

console.log(getDjCatsForCategory({ name: 'Games', slug: 'games' }));
console.log(getDjCatsForCategory({ name: 'Gaming & Consoles', slug: 'gaming-consoles' }));