import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const TMDB_GENRES: { [key: number]: string } = {
  28: "Acción", 12: "Aventura", 16: "Animación", 35: "Comedia", 80: "Crimen",
  99: "Documental", 18: "Drama", 10751: "Familia", 14: "Fantasía", 36: "Historia",
  27: "Terror", 10402: "Música", 9648: "Misterio", 10749: "Romance", 878: "Ciencia Ficción",
  10770: "Película de TV", 53: "Suspense", 10752: "Guerra", 37: "Western",
  10759: "Acción y Aventura", 10762: "Kids", 10763: "Noticias", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Telenovela", 10767: "Talk", 10768: "Guerra y Política"
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchTmdbDetails(apiKey: string, type: 'movie' | 'tv', tmdbId: number) {
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&language=es-ES&append_to_response=videos`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.success === false) return null;
  return data;
}

async function searchTmdb(apiKey: string, type: 'movie' | 'tv', title: string) {
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(title)}&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const sessionToken = req.headers.get('x-admin-token');
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401
      });
    }
    const { data: adminId } = await supabase.rpc('validate_admin_session', { token: sessionToken });
    if (!adminId) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401
      });
    }

    const { data: secretsData } = await supabase.from("secrets").select("tmdb_api_key").single();
    if (!secretsData?.tmdb_api_key) {
      return new Response(JSON.stringify({ error: "No TMDB API key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
      });
    }
    const apiKey = secretsData.tmdb_api_key;

    const { type = 'movie', limit = 10 } = await req.json();
    const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 30);

    const updated: any[] = [];
    const errors: any[] = [];

    if (type === 'movie') {
      const { data: movies } = await supabase
        .from("movies")
        .select("id, title, tmdb_id, overview, genres, rating, release_date")
        .or("overview.is.null,overview.eq.,genres.is.null,rating.is.null,release_date.is.null")
        .limit(safeLimit);

      if (!movies || movies.length === 0) {
        return new Response(JSON.stringify({ success: true, updated: [], errors: [], remaining: 0, message: "No hay películas para actualizar" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      for (const m of movies) {
        try {
          let details: any = null;
          if (m.tmdb_id) {
            details = await fetchTmdbDetails(apiKey, 'movie', m.tmdb_id);
          }
          if (!details && m.title) {
            const found = await searchTmdb(apiKey, 'movie', m.title);
            if (found?.id) {
              await sleep(300);
              details = await fetchTmdbDetails(apiKey, 'movie', found.id);
            }
          }
          if (!details) {
            errors.push({ id: m.id, title: m.title, error: "No encontrado en TMDB" });
            await sleep(400);
            continue;
          }

          const genreNames = details.genres?.map((g: any) => TMDB_GENRES[g.id] || g.name) || [];
          const genreIds = details.genres?.map((g: any) => g.id) || [];
          let trailerUrl = null;
          const trailer = details.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
          if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

          const update: any = {
            overview: details.overview || null,
            genres: genreNames,
            genre_ids: genreIds,
            rating: details.vote_average,
            runtime: details.runtime,
            release_date: details.release_date || null,
            original_title: details.original_title,
            tmdb_id: details.id,
            updated_at: new Date().toISOString(),
          };
          if (details.backdrop_path) update.backdrop_path = details.backdrop_path;
          if (details.poster_path) update.poster_path = details.poster_path;
          if (trailerUrl) update.trailer_url = trailerUrl;

          const { error } = await supabase.from("movies").update(update).eq("id", m.id);
          if (error) errors.push({ id: m.id, title: m.title, error: error.message });
          else updated.push({ id: m.id, title: m.title });

          await sleep(400);
        } catch (e: any) {
          errors.push({ id: m.id, title: m.title, error: e.message });
        }
      }

      const { count: remaining } = await supabase
        .from("movies").select("id", { count: 'exact', head: true })
        .or("overview.is.null,overview.eq.,genres.is.null,rating.is.null,release_date.is.null");

      return new Response(JSON.stringify({ success: true, updated, errors, remaining: remaining || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      const { data: seriesList } = await supabase
        .from("series")
        .select("id, title, tmdb_id, overview, genres, rating, first_air_date")
        .or("overview.is.null,overview.eq.,genres.is.null,rating.is.null,first_air_date.is.null")
        .limit(safeLimit);

      if (!seriesList || seriesList.length === 0) {
        return new Response(JSON.stringify({ success: true, updated: [], errors: [], remaining: 0, message: "No hay series para actualizar" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      for (const s of seriesList) {
        try {
          let details: any = null;
          if (s.tmdb_id) {
            details = await fetchTmdbDetails(apiKey, 'tv', s.tmdb_id);
          }
          if (!details && s.title) {
            const found = await searchTmdb(apiKey, 'tv', s.title);
            if (found?.id) {
              await sleep(300);
              details = await fetchTmdbDetails(apiKey, 'tv', found.id);
            }
          }
          if (!details) {
            errors.push({ id: s.id, title: s.title, error: "No encontrada en TMDB" });
            await sleep(400);
            continue;
          }

          const genreNames = details.genres?.map((g: any) => TMDB_GENRES[g.id] || g.name) || [];

          const update: any = {
            overview: details.overview || null,
            genres: genreNames,
            rating: details.vote_average,
            first_air_date: details.first_air_date || null,
            original_title: details.original_name,
            number_of_seasons: details.number_of_seasons,
            number_of_episodes: details.number_of_episodes,
            status: details.status,
            tmdb_id: details.id,
            updated_at: new Date().toISOString(),
          };
          if (details.backdrop_path) update.backdrop_path = details.backdrop_path;
          if (details.poster_path) update.poster_path = details.poster_path;

          const { error } = await supabase.from("series").update(update).eq("id", s.id);
          if (error) errors.push({ id: s.id, title: s.title, error: error.message });
          else updated.push({ id: s.id, title: s.title });

          await sleep(400);
        } catch (e: any) {
          errors.push({ id: s.id, title: s.title, error: e.message });
        }
      }

      const { count: remaining } = await supabase
        .from("series").select("id", { count: 'exact', head: true })
        .or("overview.is.null,overview.eq.,genres.is.null,rating.is.null,first_air_date.is.null");

      return new Response(JSON.stringify({ success: true, updated, errors, remaining: remaining || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (error: any) {
    console.error("Enrich error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
    });
  }
});
