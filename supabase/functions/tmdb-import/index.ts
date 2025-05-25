
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
    const { movieIds } = await req.json();
    
    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No movie IDs provided" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Process each movie ID one by one to get details
    const importedMovies = [];
    const errors = [];

    for (const tmdbId of movieIds) {
      try {
        // Get detailed movie info including runtime and release_date
        const detailsUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=es-ES&append_to_response=videos,credits`;
        const detailsResponse = await fetch(detailsUrl);
        const movieDetails = await detailsResponse.json();
        
        if (movieDetails.success === false) {
          errors.push({ id: tmdbId, error: movieDetails.status_message });
          continue;
        }
        
        // Find trailer if available
        let trailerUrl = null;
        if (movieDetails.videos && movieDetails.videos.results) {
          const trailer = movieDetails.videos.results.find(
            (video) => video.type === "Trailer" && video.site === "YouTube"
          );
          if (trailer) {
            trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
          }
        }

        // Extract genre names for display
        const genreNames = movieDetails.genres ? movieDetails.genres.map(g => g.name) : [];
        const genreIds = movieDetails.genres ? movieDetails.genres.map(g => g.id) : [];
        
        // Create movie object for database with all required fields
        const movie = {
          tmdb_id: tmdbId,
          title: movieDetails.title,
          original_title: movieDetails.original_title,
          poster_path: movieDetails.poster_path,
          backdrop_path: movieDetails.backdrop_path,
          overview: movieDetails.overview,
          release_date: movieDetails.release_date, // This should now be imported
          genres: genreNames,
          genre_ids: genreIds,
          rating: movieDetails.vote_average,
          runtime: movieDetails.runtime, // This should now be imported
          trailer_url: trailerUrl,
        };

        console.log("Importing movie with data:", movie);

        // Insert into database
        const { data, error } = await supabaseClient
          .from("movies")
          .upsert(movie, { onConflict: "tmdb_id" })
          .select();

        if (error) {
          console.error("Database error for movie", tmdbId, ":", error);
          errors.push({ id: tmdbId, error: error.message });
        } else {
          importedMovies.push(data[0]);
        }
      } catch (error) {
        console.error("Error processing movie", tmdbId, ":", error);
        errors.push({ id: tmdbId, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imported: importedMovies,
        errors: errors,
        total: {
          success: importedMovies.length,
          failed: errors.length
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in TMDB import:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
