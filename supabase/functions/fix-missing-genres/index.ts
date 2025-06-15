
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TMDB Genre mapping to Spanish
const TMDB_GENRES: { [key: number]: string } = {
  28: "Acción",
  12: "Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  14: "Fantasía",
  36: "Historia",
  27: "Terror",
  10402: "Música",
  9648: "Misterio",
  10749: "Romance",
  878: "Ciencia Ficción",
  10770: "Película de TV",
  53: "Suspense",
  10752: "Guerra",
  37: "Western"
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

    // Find movies that have tmdb_id but missing or empty genres
    const { data: moviesWithoutGenres, error: moviesError } = await supabaseClient
      .from("movies")
      .select("id, tmdb_id, title")
      .not("tmdb_id", "is", null)
      .or("genres.is.null,genres.eq.{}");

    if (moviesError) {
      console.error("Error fetching movies:", moviesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch movies" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    console.log(`Found ${moviesWithoutGenres?.length || 0} movies without genres`);

    const updatedMovies = [];
    const errors = [];

    if (moviesWithoutGenres && moviesWithoutGenres.length > 0) {
      for (const movie of moviesWithoutGenres) {
        try {
          console.log(`Updating genres for movie: ${movie.title} (TMDB ID: ${movie.tmdb_id})`);
          
          // Get movie details from TMDB
          const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${apiKey}&language=es-ES`;
          const detailsResponse = await fetch(detailsUrl);
          const movieDetails = await detailsResponse.json();
          
          if (movieDetails.success === false) {
            errors.push({ id: movie.id, title: movie.title, error: movieDetails.status_message });
            continue;
          }

          // Map genre IDs to Spanish genre names
          const genreNames = movieDetails.genres ? 
            movieDetails.genres.map((g: any) => TMDB_GENRES[g.id] || g.name) : [];
          const genreIds = movieDetails.genres ? movieDetails.genres.map((g: any) => g.id) : [];
          
          console.log(`Movie ${movie.title} genres:`, {
            original: movieDetails.genres,
            mapped: genreNames,
            ids: genreIds
          });

          // Update the movie with genres
          const { error: updateError } = await supabaseClient
            .from("movies")
            .update({
              genres: genreNames,
              genre_ids: genreIds,
              updated_at: new Date().toISOString()
            })
            .eq("id", movie.id);

          if (updateError) {
            console.error(`Error updating movie ${movie.title}:`, updateError);
            errors.push({ id: movie.id, title: movie.title, error: updateError.message });
          } else {
            updatedMovies.push({ id: movie.id, title: movie.title, genres: genreNames });
            console.log(`Successfully updated genres for: ${movie.title}`);
          }
        } catch (error) {
          console.error(`Error processing movie ${movie.title}:`, error);
          errors.push({ id: movie.id, title: movie.title, error: error.message });
        }
      }
    }

    // Also check series
    const { data: seriesWithoutGenres, error: seriesError } = await supabaseClient
      .from("series")
      .select("id, tmdb_id, title")
      .not("tmdb_id", "is", null)
      .or("genres.is.null,genres.eq.{}");

    const updatedSeries = [];

    if (seriesWithoutGenres && seriesWithoutGenres.length > 0) {
      for (const serie of seriesWithoutGenres) {
        try {
          console.log(`Updating genres for series: ${serie.title} (TMDB ID: ${serie.tmdb_id})`);
          
          // Get series details from TMDB
          const detailsUrl = `https://api.themoviedb.org/3/tv/${serie.tmdb_id}?api_key=${apiKey}&language=es-ES`;
          const detailsResponse = await fetch(detailsUrl);
          const seriesDetails = await detailsResponse.json();
          
          if (seriesDetails.success === false) {
            errors.push({ id: serie.id, title: serie.title, error: seriesDetails.status_message });
            continue;
          }

          // Map genre IDs to Spanish genre names
          const genreNames = seriesDetails.genres ? 
            seriesDetails.genres.map((g: any) => TMDB_GENRES[g.id] || g.name) : [];
          
          console.log(`Series ${serie.title} genres:`, {
            original: seriesDetails.genres,
            mapped: genreNames
          });

          // Update the series with genres
          const { error: updateError } = await supabaseClient
            .from("series")
            .update({
              genres: genreNames,
              updated_at: new Date().toISOString()
            })
            .eq("id", serie.id);

          if (updateError) {
            console.error(`Error updating series ${serie.title}:`, updateError);
            errors.push({ id: serie.id, title: serie.title, error: updateError.message });
          } else {
            updatedSeries.push({ id: serie.id, title: serie.title, genres: genreNames });
            console.log(`Successfully updated genres for: ${serie.title}`);
          }
        } catch (error) {
          console.error(`Error processing series ${serie.title}:`, error);
          errors.push({ id: serie.id, title: serie.title, error: error.message });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        movies: {
          updated: updatedMovies,
          count: updatedMovies.length
        },
        series: {
          updated: updatedSeries,
          count: updatedSeries.length
        },
        errors: errors,
        total: {
          updated: updatedMovies.length + updatedSeries.length,
          failed: errors.length
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in fix-missing-genres:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
