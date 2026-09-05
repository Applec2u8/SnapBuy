import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phexhwtzbahttjgmzmow.supabase.co';
const supabaseKey = 'sb_publishable_k4gSTWfoFy9E_6WllDi7xw_p1fHJPiY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Conversations table columns:', Object.keys(data[0]));
    console.log('Row sample:', data[0]);
  } else {
    console.log('No conversations found or RLS restricted.');
  }
}

checkColumns();
