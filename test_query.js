import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

let envPath = '.env';
if (fs.existsSync('.env.local')) {
  envPath = '.env.local';
}
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id, quantity, price, created_at,
      orders ( id, user_id, shipping_address_id, profiles (full_name), user_addresses!orders_shipping_address_id_fkey (full_name, phone, address_line, district, city, province, postal_code) )
    `)
    .limit(3)
    .order('created_at', { ascending: false });

  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

main();
