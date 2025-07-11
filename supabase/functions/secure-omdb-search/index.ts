import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imdb_id } = await req.json();
    
    if (!imdb_id) {
      throw new Error('IMDB ID is required');
    }
    
    // Get OMDB API key from Supabase secrets
    const omdbApiKey = Deno.env.get('OMDB_API_KEY');
    if (!omdbApiKey) {
      throw new Error('OMDB API key not configured');
    }

    const url = `https://www.omdbapi.com/?i=${imdb_id}&apikey=${omdbApiKey}&plot=full`;
    
    console.log(`OMDB API request: ${url.replace(omdbApiKey, '[API_KEY]')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OMDB API response:', data);
    
    if (data.Response === "False") {
      throw new Error(`OMDB Error: ${data.Error || 'Movie not found'}`);
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in secure-omdb-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      Response: "False"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});