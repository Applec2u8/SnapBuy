import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phexhwtzbahttjgmzmow.supabase.co';
const supabaseKey = 'sb_publishable_k4gSTWfoFy9E_6WllDi7xw_p1fHJPiY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  console.log('Count:', count);
  console.log('Error:', error);
}

checkCount();
