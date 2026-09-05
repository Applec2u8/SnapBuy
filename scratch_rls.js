require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const { data, error } = await supabase.rpc('query', {
    query_text: "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('products', 'product_variants');"
  });
  if (error) {
    console.error("Error via RPC:", error.message);
  } else {
    console.log(data);
  }
})();
