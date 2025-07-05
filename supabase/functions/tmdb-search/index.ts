
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
    // Create Supabase client with service role key
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
    const { query, type = 'movie' } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Determine the search endpoint based on type
    const searchType = type === 'tv' ? 'tv' : 'movie';
    const searchUrl = `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(query)}&include_adult=false`;
    
    console.log("Searching TMDB with URL:", searchUrl);
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.status_message || "TMDB API error");
    }

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
