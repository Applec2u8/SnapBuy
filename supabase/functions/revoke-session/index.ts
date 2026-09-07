// Supabase Edge Function: revoke-session
// Purpose: Revoke a specific user session using Service Role Key (admin API)
// Called from frontend when user wants to kick a single device

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Parse request body
    const { session_db_id } = await req.json();
    if (!session_db_id) {
      return new Response(JSON.stringify({ error: 'session_db_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create user-scoped client (from caller's JWT) to verify ownership
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 3. Get the calling user's identity
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Admin client for privileged operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 5. Fetch the session row and verify ownership
    const { data: sessionRow, error: fetchError } = await adminClient
      .from('user_sessions')
      .select('id, user_id, session_id, is_revoked')
      .eq('id', session_db_id)
      .single();

    if (fetchError || !sessionRow) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the session belongs to the calling user
    if (sessionRow.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (sessionRow.is_revoked) {
      return new Response(JSON.stringify({ success: true, message: 'Already revoked' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Revoke Supabase auth session if we have the session_id
    if (sessionRow.session_id) {
      try {
        // Use admin signOut for specific session
        await adminClient.auth.admin.signOut(sessionRow.session_id);
      } catch (e) {
        // If session already expired, that's fine — still mark as revoked in DB
        console.warn('[revoke-session] Admin signOut failed (session may be expired):', e);
      }
    }

    // 7. Mark as revoked in our user_sessions table
    const { error: updateError } = await adminClient
      .from('user_sessions')
      .update({
        is_revoked: true,
        logged_out_at: new Date().toISOString(),
      })
      .eq('id', session_db_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update session record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[revoke-session] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
