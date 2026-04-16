import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const EXTERNAL_API_BASE = "https://rmfgwrmmmmjpiebzfrri.supabase.co/functions/v1/content-api";

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
    const { type, startPage = 1, endPage = 1 } = body;

    if (!type || !['movies', 'series'].includes(type)) {
      return new Response(JSON.stringify({ error: 'type must be movies or series' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    for (let page = startPage; page <= endPage; page++) {
      const url = `${EXTERNAL_API_BASE}?path=${type}&page=${page}&limit=20`;
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`Page ${page}: HTTP ${res.status}`);
        totalFailed++;
        continue;
      }

      const data = await res.json();
      if (!data.success) {
        errors.push(`Page ${page}: API returned success=false`);
        continue;
      }

      const items = type === 'movies' ? (data.movies || []) : (data.series || []);

      if (type === 'movies') {
        for (const movie of items) {
          if (!movie.tmdb_id) { totalSkipped++; continue; }

          // Check if exists
          const { data: existing } = await supabase
            .from('movies')
            .select('id')
            .eq('tmdb_id', movie.tmdb_id)
            .maybeSingle();

          if (existing) { totalSkipped++; continue; }

          const slug = generateSlug(movie.title);
          const { error: insertErr } = await supabase.from('movies').insert({
            tmdb_id: movie.tmdb_id,
            title: movie.title,
            poster_path: buildPosterUrl(movie.poster),
            backdrop_path: movie.banner || null,
            overview: movie.description || null,
            rating: movie.rating || null,
            stream_servers: movie.servers || [],
            slug,
          });

          if (insertErr) {
            errors.push(`Movie ${movie.title}: ${insertErr.message}`);
            totalFailed++;
          } else {
            totalImported++;
          }
        }
      } else {
        // Series
        for (const serie of items) {
          if (!serie.tmdb_id) { totalSkipped++; continue; }

          const { data: existing } = await supabase
            .from('series')
            .select('id')
            .eq('tmdb_id', serie.tmdb_id)
            .maybeSingle();

          if (existing) { totalSkipped++; continue; }

          const slug = generateSlug(serie.title);

          // Transform seasons from { "1": [...], "2": [...] } to array format
          let seasonsData: any[] = [];
          if (serie.seasons && typeof serie.seasons === 'object') {
            seasonsData = Object.entries(serie.seasons).map(([seasonNum, episodes]: [string, any]) => ({
              season_number: parseInt(seasonNum),
              episodes: Array.isArray(episodes) ? episodes.map((ep: any) => ({
                episode_number: ep.episode_num || 0,
                name: ep.title || `Episodio ${ep.episode_num}`,
                servers: (ep.servers || []).map((s: any) => ({
                  name: s.name,
                  quality: s.quality,
                  lang: s.lang,
                  url: s.url,
                })),
              })) : [],
            }));
          }

          const numberOfSeasons = seasonsData.length;
          const numberOfEpisodes = seasonsData.reduce((sum, s) => sum + (s.episodes?.length || 0), 0);

          const { error: insertErr } = await supabase.from('series').insert({
            tmdb_id: serie.tmdb_id,
            title: serie.title,
            poster_path: buildPosterUrl(serie.poster),
            backdrop_path: serie.banner || null,
            overview: serie.description || null,
            rating: serie.rating || null,
            seasons: seasonsData,
            number_of_seasons: numberOfSeasons,
            number_of_episodes: numberOfEpisodes,
            slug,
          });

          if (insertErr) {
            errors.push(`Series ${serie.title}: ${insertErr.message}`);
            totalFailed++;
          } else {
            totalImported++;
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      imported: totalImported,
      skipped: totalSkipped,
      failed: totalFailed,
      errors: errors.slice(0, 20),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
