import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { jobId, percentage, shopIds, shopNames } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initial job creation/update
    const { error: upsertErr } = await supabaseAdmin.from('background_jobs').upsert({
      id: jobId,
      type: 'export',
      status: 'running',
      progress: 0,
      metadata: { shopNames, percentage }
    });
    
    if (upsertErr) {
      return new Response(JSON.stringify({ error: `DB Error: ${upsertErr.message || JSON.stringify(upsertErr)}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Run export logic in the background
    (async () => {
      try {
        let allProducts: any[] = [];
        const fetchLimit = 1000;
        let totalItems = 0;
        let processedItems = 0;

        for (const shopId of shopIds) {
          const { count } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shopId);
            
          if (count) totalItems += Math.max(1, Math.floor(count * (percentage / 100)));
        }

        await supabaseAdmin.from('background_jobs').update({ total_items: totalItems }).eq('id', jobId);

        for (const shopId of shopIds) {
          const { count: shopCount } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shopId);

          if (!shopCount || shopCount === 0) continue;

          const targetShopExportCount = Math.max(1, Math.floor(shopCount * (percentage / 100)));
          let currentOffset = 0;

          while (currentOffset < targetShopExportCount) {
            const remaining = targetShopExportCount - currentOffset;
            const currentLimit = Math.min(fetchLimit, remaining);

            const { data: chunk, error: chunkError } = await supabaseAdmin
              .from('products')
              .select('*')
              .eq('shop_id', shopId)
              .order('created_at', { ascending: true })
              .range(currentOffset, currentOffset + currentLimit - 1);

            if (chunkError) throw chunkError;
            if (!chunk || chunk.length === 0) break;

            allProducts = [...allProducts, ...chunk];
            currentOffset += currentLimit;
            processedItems += chunk.length;
            
            // Update progress (Max 50% for products)
            const progress = Math.floor((processedItems / totalItems) * 50);
            await supabaseAdmin.from('background_jobs').update({ progress, processed_items: processedItems }).eq('id', jobId);

            if (chunk.length < currentLimit) break;
          }
        }

        if (allProducts.length === 0) throw new Error('No products found for selected shops.');

        const productsToExport = allProducts;
        let variants: any[] = [];
        const varChunkSize = 200;
        
        for (let i = 0; i < productsToExport.length; i += varChunkSize) {
          const chunkIds = productsToExport.map((p: any) => p.id).slice(i, i + varChunkSize);
          const { data: vData, error: vError } = await supabaseAdmin
            .from('product_variants').select('*').in('product_id', chunkIds);
          if (vError) throw vError;
          if (vData) variants = [...variants, ...vData];
          
          // Update progress (50% to 90% for variants)
          const varProgress = 50 + Math.floor((i / productsToExport.length) * 40);
          await supabaseAdmin.from('background_jobs').update({ progress: varProgress }).eq('id', jobId);
        }

        const exportData = { products: productsToExport, product_variants: variants };
        const jsonString = JSON.stringify(exportData, null, 2);
        
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
        const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const fileName = `export_${dateStr}_${timeStr}.json`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('exports')
          .upload(fileName, jsonString, { contentType: 'application/json' });

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabaseAdmin.storage.from('exports').getPublicUrl(fileName);

        await supabaseAdmin.from('data_exports').insert({
          file_name: fileName,
          file_url: fileName,
          record_count: productsToExport.length + variants.length,
          size_bytes: new Blob([jsonString]).size,
          shop_ids: shopIds,
          created_by: 'Admin'
        });

        // Done (100%)
        await supabaseAdmin.from('background_jobs').update({ 
          status: 'completed', 
          progress: 100,
          result_url: urlData.publicUrl 
        }).eq('id', jobId);

      } catch (error: any) {
        await supabaseAdmin.from('background_jobs').update({ 
          status: 'failed', 
          message: error.message 
        }).eq('id', jobId);
      }
    })();

    // Respond immediately to the client so it doesn't block
    return new Response(JSON.stringify({ success: true, message: "Export started in background", jobId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // Return 200 with error property so frontend can read the exact message
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
