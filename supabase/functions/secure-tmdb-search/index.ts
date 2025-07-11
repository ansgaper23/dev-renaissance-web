import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    const { query, type = 'movie', page = 1, imdb_id } = await req.json();
    
    // Get TMDB API key from Supabase secrets
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY');
    if (!tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    let url: string;
    
    if (imdb_id) {
      // Search by IMDB ID using external_source
      url = `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${tmdbApiKey}&external_source=imdb_id&language=es-ES`;
    } else if (query) {
      // Search by query
      const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
      url = `https://api.themoviedb.org/3/${endpoint}?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=es-ES&page=${page}`;
    } else {
      throw new Error('Either query or imdb_id is required');
    }

    console.log(`TMDB API request: ${url.replace(tmdbApiKey, '[API_KEY]')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('TMDB API response:', data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in secure-tmdb-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});