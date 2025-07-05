
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
    // Get API key from environment variables (Supabase secrets)
    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    
    console.log("TMDB API Key exists:", !!tmdbApiKey);
    
    if (!tmdbApiKey) {
      console.error("TMDB API key not found in environment variables");
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
      return new Response(
        JSON.stringify({ error: data.status_message || "TMDB API error" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status 
        }
      );
    }

    console.log("TMDB search successful, results count:", data.results?.length || data.movie_results?.length || 0);

    // For search by IMDB ID, we need to get additional details for each result
    if (imdb_id && data.movie_results && data.movie_results.length > 0) {
      const movies = data.movie_results;
      
      // Get detailed info for each movie including runtime and IMDB ID
      const detailedMovies = await Promise.all(
        movies.map(async (movie: any) => {
          try {
            const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&language=es-ES&append_to_response=external_ids`;
            const detailResponse = await fetch(detailUrl);
            const detailData = await detailResponse.json();
            
            return {
              ...movie,
              runtime: detailData.runtime,
              imdb_id: detailData.external_ids?.imdb_id || imdb_id
            };
          } catch (error) {
            console.error("Error getting movie details:", error);
            return { ...movie, imdb_id: imdb_id };
          }
        })
      );
      
      return new Response(
        JSON.stringify({ movie_results: detailedMovies }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // For regular search, try to get IMDB IDs for the results
    if (query && data.results && data.results.length > 0) {
      const moviesWithIMDB = await Promise.all(
        data.results.slice(0, 10).map(async (movie: any) => {
          try {
            const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&language=es-ES&append_to_response=external_ids`;
            const detailResponse = await fetch(detailUrl);
            
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return {
                ...movie,
                runtime: detailData.runtime,
                imdb_id: detailData.external_ids?.imdb_id
              };
            }
            
            return movie;
          } catch (error) {
            console.error("Error getting movie details for ID:", movie.id, error);
            return movie;
          }
        })
      );
      
      return new Response(
        JSON.stringify({ results: moviesWithIMDB }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
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
