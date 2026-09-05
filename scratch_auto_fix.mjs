import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("NO_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, serviceKey);

const sql = `
-- Allow admins to insert products
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to update products
CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to delete products
CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to insert product variants
CREATE POLICY "Admins can insert product variants" ON public.product_variants
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to update product variants
CREATE POLICY "Admins can update product variants" ON public.product_variants
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to delete product variants
CREATE POLICY "Admins can delete product variants" ON public.product_variants
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
`;

(async () => {
  // We can execute raw SQL via a custom RPC if one exists, 
  // or we can just tell the user we can't do it via JS without an RPC.
  // Wait, Supabase JS client doesn't support raw SQL execution even with service_role key unless there's an RPC.
})();
