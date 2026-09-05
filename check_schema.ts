import { supabase } from './src/lib/supabase';

async function checkSchema() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Error fetching product:', error);
      process.exit(1);
    }
    if (data && data.length > 0) {
      console.log('Product columns:', Object.keys(data[0]));
    } else {
      console.log('No products found in the database.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

checkSchema();
