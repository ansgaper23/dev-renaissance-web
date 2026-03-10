import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Validate admin session
    const sessionToken = req.headers.get('x-admin-token');
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No session token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: adminId, error: authError } = await supabase.rpc('validate_admin_session', {
      token: sessionToken,
    });

    if (authError || !adminId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, table, data, id, filters } = body;

    // Whitelist allowed tables
    const allowedTables = ['movies', 'series', 'featured_items', 'featured_movies', 'domain_ads'];
    if (!allowedTables.includes(table)) {
      return new Response(JSON.stringify({ error: `Table '${table}' is not allowed` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;

    switch (action) {
      case 'insert': {
        result = await supabase.from(table).insert(data).select();
        break;
      }
      case 'update': {
        if (!id) {
          return new Response(JSON.stringify({ error: 'ID is required for update' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        result = await supabase.from(table).update(data).eq('id', id).select();
        break;
      }
      case 'delete': {
        if (!id) {
          return new Response(JSON.stringify({ error: 'ID is required for delete' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        result = await supabase.from(table).delete().eq('id', id);
        break;
      }
      case 'upsert': {
        const upsertOptions = filters?.onConflict ? { onConflict: filters.onConflict } : undefined;
        result = await supabase.from(table).upsert(data, upsertOptions).select();
        break;
      }
      default:
        return new Response(JSON.stringify({ error: `Invalid action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (result.error) {
      console.error(`Admin API error [${action} ${table}]:`, result.error);
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data: result.data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
