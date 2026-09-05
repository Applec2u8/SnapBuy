import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { jobId, expId, fileUrl, fileName, recordCount } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initial job creation
    await supabaseAdmin.from('background_jobs').upsert({
      id: jobId,
      type: 'restore',
      status: 'running',
      progress: 0,
      total_items: recordCount,
      metadata: { expId, fileName }
    });

    // Run restore in background
    (async () => {
      try {
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('exports').download(fileUrl || fileName);
          
        if (downloadError) throw downloadError;

        const text = await fileData.text();
        const jsonData = JSON.parse(text);
        const products = jsonData.products || [];
        const variants = jsonData.product_variants || [];

        const CHUNK_SIZE = 500;
        let successCount = 0;
        let failedProducts: any[] = [];
        let failedVariants: any[] = [];
        let processed = 0;
        const total = products.length + variants.length;

        const upsertWithFallback = async (table: string, items: any[], failedList: any[]) => {
          for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const chunk = items.slice(i, i + CHUNK_SIZE);
            const { error } = await supabaseAdmin.from(table).upsert(chunk);
            if (error) {
              for (const item of chunk) {
                const { error: singleError } = await supabaseAdmin.from(table).upsert(item);
                if (singleError) failedList.push(item);
                else successCount++;
              }
            } else {
              successCount += chunk.length;
            }
            
            processed += chunk.length;
            const progress = Math.floor((processed / total) * 100);
            await supabaseAdmin.from('background_jobs').update({ progress, processed_items: processed }).eq('id', jobId);
          }
        };

        if (products.length > 0) await upsertWithFallback('products', products, failedProducts);
        if (variants.length > 0) await upsertWithFallback('product_variants', variants, failedVariants);

        // Done
        await supabaseAdmin.from('background_jobs').update({ 
          status: 'completed', 
          progress: 100,
          metadata: { ...jsonData.metadata, failedProducts, failedVariants, successCount }
        }).eq('id', jobId);

      } catch (error: any) {
        await supabaseAdmin.from('background_jobs').update({ 
          status: 'failed', 
          message: error.message 
        }).eq('id', jobId);
      }
    })();

    // Respond immediately
    return new Response(JSON.stringify({ success: true, message: "Restore started in background", jobId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
