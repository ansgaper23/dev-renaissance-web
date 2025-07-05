
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
    
    // Get API key from Supabase secrets
    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    
    if (!tmdbApiKey) {
      console.error("TMDB API key not found in secrets");
      return new Response(
        JSON.stringify({ error: "TMDB API key not configured" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    const requestBody = await req.json();
    const { query, imdb_id, type = 'movie' } = requestBody;
    
    console.log("Request received:", { query, imdb_id, type });
    
    let searchUrl: string;
    
    if (imdb_id) {
      // Search by IMDB ID using the find endpoint
      searchUrl = `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${tmdbApiKey}&external_source=imdb_id&language=es-ES`;
    } else if (query) {
      // Search by query
      const searchType = type === 'tv' ? 'tv' : 'movie';
      searchUrl = `https://api.themoviedb.org/3/search/${searchType}?api_key=${tmdbApiKey}&language=es-ES&query=${encodeURIComponent(query)}&include_adult=false`;
    } else {
      return new Response(
        JSON.stringify({ error: "Query or IMDB ID parameter is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    console.log("Searching TMDB with URL:", searchUrl.replace(tmdbApiKey, '[API_KEY]'));
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("TMDB API error:", data);
      throw new Error(data.status_message || "TMDB API error");
    }

    console.log("TMDB search successful, results count:", data.results?.length || data.movie_results?.length || 0);

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
