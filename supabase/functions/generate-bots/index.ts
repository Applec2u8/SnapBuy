import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { faker as fakerEN } from 'https://esm.sh/@faker-js/faker@8.4.1/locale/en';
import { faker as fakerTH } from 'https://esm.sh/@faker-js/faker@8.4.1/locale/th';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateRandomName(): string {
  const isThai = Math.random() > 0.5;
  if (isThai) {
    return `${fakerTH.person.firstName()} ${fakerTH.person.lastName()}`;
  } else {
    return `${fakerEN.person.firstName()} ${fakerEN.person.lastName()}`;
  }
}

function generateBotEmail(): string {
  // Use faker to generate a realistic-looking email (no "bot" in it)
  const username = fakerEN.internet.userName().toLowerCase().replace(/[^a-z0-9._]/g, '');
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'proton.me', 'live.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

function generateBotPassword(): string {
  // Format: AB1234 (2 uppercase letters + 4 digits)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit number
  return `${letter1}${letter2}${digits}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin — use service_role client to bypass RLS when reading profile
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Auth header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error('Forbidden: Only admins can generate bots');


    const { botCount } = await req.json();
    if (!botCount || botCount < 1 || botCount > 100) {
      throw new Error('botCount must be between 1 and 100');
    }

    let createdCount = 0;
    const errors = [];

    for (let i = 0; i < botCount; i++) {
      const botName = generateRandomName();
      const botEmail = generateBotEmail();
      const password = generateBotPassword();
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(botName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;

      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: botEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: botName,
          avatar_url: avatarUrl,
        }
      });

      if (createError) {
        errors.push(createError.message);
        continue;
      }

      // Wait a moment for trigger to create profile
      await new Promise(r => setTimeout(r, 300));

      // Update profile to mark as bot and assign name/avatar manually just in case
      await supabaseClient.from('profiles').update({
        is_bot: true,
        full_name: botName,
        avatar_url: avatarUrl,
        role: 'customer'
      }).eq('id', newUser.user.id);
      
      // Generate random address using faker
      const addressLine = fakerEN.location.streetAddress();
      const city = fakerEN.location.city();
      const state = fakerEN.location.state();
      const zip = fakerEN.location.zipCode();
      const country = fakerEN.location.country();
      
      await supabaseClient.from('user_addresses').insert({
        user_id: newUser.user.id,
        full_name: botName,
        phone: fakerEN.phone.number({ style: 'international' }),
        province: state,
        city: city,
        district: city,
        postal_code: zip,
        address_line: `${addressLine}, ${country}`,
        is_default: true
      });

      createdCount++;
    }

    return new Response(
      JSON.stringify({ success: true, createdCount, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
