
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key (to bypass RLS)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get API key from database
    const { data: secretsData, error: secretsError } = await supabaseClient
      .from("secrets")
      .select("tmdb_api_key")
      .single();
    
    if (secretsError || !secretsData) {
      console.error("Error fetching TMDB API key:", secretsError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve API key" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const apiKey = secretsData.tmdb_api_key;
    const { query } = await req.json();
    
    // Make request to TMDB API
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
    const response = await fetch(tmdbUrl);
    const data = await response.json();
    
    // Return TMDB response
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in TMDB search:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
