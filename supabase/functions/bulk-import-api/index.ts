import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildPosterUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

// Normalize servers from Spanish format to internal format
function normalizeServers(servers: any[]): any[] {
  if (!Array.isArray(servers)) return [];
  return servers.map((s: any) => ({
    name: s.nombre || s.name || 'Servidor',
    url: s.url || '',
    quality: s.calidad || s.quality || 'HD',
    lang: s.idioma || s.lang || s.language || 'Latino',
  })).filter((s: any) => s.url);
}

// Search TMDB by title+year to enrich
async function searchTMDB(tmdbApiKey: string, title: string, year: string | number | null, type: 'movie' | 'tv') {
  try {
    const params = new URLSearchParams({
      api_key: tmdbApiKey,
      query: title,
      language: 'es-ES',
    });
    if (year) {
      params.set(type === 'movie' ? 'year' : 'first_air_date_year', String(year));
    }
    const res = await fetch(`https://api.themoviedb.org/3/search/${type}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

async function fetchTMDBDetails(tmdbApiKey: string, tmdbId: number, type: 'movie' | 'tv') {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${tmdbApiKey}&language=es-ES`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Validate admin
    const sessionToken = req.headers.get('x-admin-token');
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: adminId, error: authError } = await supabase.rpc('validate_admin_session', { token: sessionToken });
    if (authError || !adminId) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { type, url, limit, offset = 0, batchSize = 5 } = body as {
      type: 'movies' | 'series';
      url: string;
      limit?: number;
      offset?: number;
      batchSize?: number;
    };

    if (!type || !['movies', 'series'].includes(type)) {
      return new Response(JSON.stringify({ error: 'type must be movies or series' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!url || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: 'Debes proporcionar una URL válida (http/https)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: secretsRow } = await supabase.from('secrets').select('tmdb_api_key').eq('id', 1).maybeSingle();
    const tmdbApiKey = secretsRow?.tmdb_api_key || Deno.env.get('TMDB_API_KEY') || '';
    if (!tmdbApiKey) {
      return new Response(JSON.stringify({ error: 'TMDB API key no configurada' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let extRes: Response;
    try {
      extRes = await fetch(url, { headers: { 'Accept': 'application/json, text/plain, */*' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: `No se pudo conectar a la URL: ${e.message}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!extRes.ok) {
      const bodySnippet = (await extRes.text()).slice(0, 200);
      return new Response(JSON.stringify({ error: `No se pudo obtener la URL: HTTP ${extRes.status}. ${bodySnippet}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawText = await extRes.text();
    let raw: any;
    try {
      raw = JSON.parse(rawText);
    } catch (e: any) {
      return new Response(JSON.stringify({ error: `JSON inválido: ${e.message}. Inicio: ${rawText.slice(0, 150)}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let allItems: any[] = [];
    if (Array.isArray(raw)) allItems = raw;
    else if (Array.isArray(raw?.peliculas)) allItems = raw.peliculas;
    else if (Array.isArray(raw?.Peliculas)) allItems = raw.Peliculas;
    else if (Array.isArray(raw?.series)) allItems = raw.series;
    else if (Array.isArray(raw?.Series)) allItems = raw.Series;
    else if (Array.isArray(raw?.movies)) allItems = raw.movies;
    else if (Array.isArray(raw?.data)) allItems = raw.data;
    else if (Array.isArray(raw?.results)) allItems = raw.results;
    else {
      const keys = raw && typeof raw === 'object' ? Object.keys(raw).join(', ') : typeof raw;
      return new Response(JSON.stringify({ error: `Formato JSON no reconocido. Claves encontradas: [${keys}]. Se esperaba un array o {peliculas/series/movies/data: [...]}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (limit && limit > 0) allItems = allItems.slice(0, limit);
    const totalToProcess = allItems.length;
    const safeBatch = Math.max(1, Math.min(batchSize, 10));
    const items = allItems.slice(offset, offset + safeBatch);
    const nextOffset = offset + items.length;
    const done = nextOffset >= totalToProcess;

    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    if (type === 'movies') {
      for (const item of items) {
        try {
          const title: string = item.nombre || item.title || '';
          const year: string | number | null = item.año || item.year || item.anio || null;
          if (!title) { totalSkipped++; continue; }

          // Look up TMDB to get tmdb_id + metadata
          const tmdbMatch = await searchTMDB(tmdbApiKey, title, year, 'movie');
          await sleep(150); // pace TMDB calls

          const tmdbId = tmdbMatch?.id || item.id || null;

          // Skip duplicates
          if (tmdbId) {
            const { data: existing } = await supabase
              .from('movies')
              .select('id')
              .eq('tmdb_id', tmdbId)
              .maybeSingle();
            if (existing) { totalSkipped++; continue; }
          }

          // Fetch full TMDB details (genres, runtime, etc.)
          let details: any = null;
          if (tmdbMatch?.id) {
            details = await fetchTMDBDetails(tmdbApiKey, tmdbMatch.id, 'movie');
            await sleep(150);
          }

          const releaseDate = details?.release_date || tmdbMatch?.release_date ||
            (year ? `${year}-01-01` : null);

          const insertData: any = {
            tmdb_id: tmdbId,
            title: details?.title || tmdbMatch?.title || title,
            original_title: details?.original_title || tmdbMatch?.original_title || null,
            poster_path: details?.poster_path
              ? buildPosterUrl(details.poster_path)
              : buildPosterUrl(item.poster),
            backdrop_path: details?.backdrop_path
              ? buildPosterUrl(details.backdrop_path)
              : (item.banner || null),
            overview: details?.overview || tmdbMatch?.overview || null,
            rating: details?.vote_average ?? (item.rating ? parseFloat(item.rating) : null),
            release_date: releaseDate || null,
            runtime: details?.runtime || null,
            genres: details?.genres?.map((g: any) => g.name) || null,
            genre_ids: details?.genres?.map((g: any) => g.id) || tmdbMatch?.genre_ids || null,
            stream_servers: normalizeServers(item.servidores || item.servers || []),
            slug: generateSlug(details?.title || title),
          };

          const { error: insertErr } = await supabase.from('movies').insert(insertData);
          if (insertErr) {
            errors.push(`Movie "${title}": ${insertErr.message}`);
            totalFailed++;
          } else {
            totalImported++;
          }
        } catch (err: any) {
          errors.push(`Movie error: ${err.message}`);
          totalFailed++;
        }
      }
    } else {
      // SERIES
      for (const item of items) {
        try {
          const title: string = item.nombre || item.title || '';
          const year: string | number | null = item.año || item.year || item.anio || null;
          if (!title) { totalSkipped++; continue; }

          const tmdbMatch = await searchTMDB(tmdbApiKey, title, year, 'tv');
          await sleep(150);

          const tmdbId = tmdbMatch?.id || item.id || null;

          if (tmdbId) {
            const { data: existing } = await supabase
              .from('series')
              .select('id')
              .eq('tmdb_id', tmdbId)
              .maybeSingle();
            if (existing) { totalSkipped++; continue; }
          }

          let details: any = null;
          if (tmdbMatch?.id) {
            details = await fetchTMDBDetails(tmdbApiKey, tmdbMatch.id, 'tv');
            await sleep(150);
          }

          // Transform Spanish seasons format -> internal format
          const seasonsRaw = item.temporadas || item.seasons || [];
          const seasonsData = Array.isArray(seasonsRaw)
            ? seasonsRaw.map((s: any) => ({
                season_number: parseInt(s.numero ?? s.season_number ?? 0),
                episodes: Array.isArray(s.capitulos || s.episodes)
                  ? (s.capitulos || s.episodes).map((ep: any) => ({
                      episode_number: parseInt(ep.numero ?? ep.episode_number ?? 0),
                      name: ep.titulo || ep.name || `Episodio ${ep.numero ?? ''}`,
                      servers: normalizeServers(ep.servidores || ep.servers || []),
                    }))
                  : [],
              }))
            : [];

          const numberOfSeasons = details?.number_of_seasons || seasonsData.length;
          const numberOfEpisodes = details?.number_of_episodes ||
            seasonsData.reduce((sum, s) => sum + (s.episodes?.length || 0), 0);

          const firstAirDate = details?.first_air_date || tmdbMatch?.first_air_date ||
            (year ? `${year}-01-01` : null);

          const insertData: any = {
            tmdb_id: tmdbId,
            title: details?.name || tmdbMatch?.name || title,
            original_title: details?.original_name || tmdbMatch?.original_name || null,
            poster_path: details?.poster_path
              ? buildPosterUrl(details.poster_path)
              : buildPosterUrl(item.poster),
            backdrop_path: details?.backdrop_path
              ? buildPosterUrl(details.backdrop_path)
              : (item.banner || null),
            overview: details?.overview || tmdbMatch?.overview || null,
            rating: details?.vote_average ?? (item.rating ? parseFloat(item.rating) : null),
            first_air_date: firstAirDate || null,
            genres: details?.genres?.map((g: any) => g.name) || null,
            status: details?.status || null,
            seasons: seasonsData,
            number_of_seasons: numberOfSeasons,
            number_of_episodes: numberOfEpisodes,
            slug: generateSlug(details?.name || title),
          };

          const { error: insertErr } = await supabase.from('series').insert(insertData);
          if (insertErr) {
            errors.push(`Series "${title}": ${insertErr.message}`);
            totalFailed++;
          } else {
            totalImported++;
          }
        } catch (err: any) {
          errors.push(`Series error: ${err.message}`);
          totalFailed++;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      batchProcessed: items.length,
      imported: totalImported,
      skipped: totalSkipped,
      failed: totalFailed,
      offset,
      nextOffset,
      totalToProcess,
      done,
      errors: errors.slice(0, 30),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
