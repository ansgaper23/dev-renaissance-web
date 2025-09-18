-- Drop the existing views that may have SECURITY DEFINER
DROP VIEW IF EXISTS public.most_viewed_movies;
DROP VIEW IF EXISTS public.most_viewed_series;

-- Create proper functions instead of SECURITY DEFINER views
-- Function to get most viewed movies (last 30 days)
CREATE OR REPLACE FUNCTION public.get_most_viewed_movies(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    tmdb_id INTEGER,
    title TEXT,
    original_title TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    release_date DATE,
    genre_ids INTEGER[],
    genres TEXT[],
    rating NUMERIC,
    runtime INTEGER,
    trailer_url TEXT,
    stream_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    stream_servers JSONB,
    view_count BIGINT,
    slug TEXT
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT 
        m.id,
        m.tmdb_id,
        m.title,
        m.original_title,
        m.poster_path,
        m.backdrop_path,
        m.overview,
        m.release_date,
        m.genre_ids,
        m.genres,
        m.rating,
        m.runtime,
        m.trailer_url,
        m.stream_url,
        m.created_at,
        m.updated_at,
        m.stream_servers,
        COALESCE(view_counts.view_count, 0::bigint) AS view_count,
        m.slug
    FROM movies m
    LEFT JOIN (
        SELECT 
            movie_views.movie_id,
            count(*) AS view_count
        FROM movie_views
        WHERE movie_views.viewed_at > (now() - interval '30 days')
        GROUP BY movie_views.movie_id
    ) view_counts ON m.id = view_counts.movie_id
    ORDER BY COALESCE(view_counts.view_count, 0::bigint) DESC, m.created_at DESC
    LIMIT limit_count;
$$;

-- Function to get most viewed series (last 30 days)
CREATE OR REPLACE FUNCTION public.get_most_viewed_series(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title TEXT,
    original_title TEXT,
    tmdb_id INTEGER,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    first_air_date DATE,
    rating NUMERIC,
    genres TEXT[],
    number_of_seasons INTEGER,
    number_of_episodes INTEGER,
    status TEXT,
    stream_servers JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    seasons JSONB,
    view_count BIGINT,
    slug TEXT
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT 
        s.id,
        s.title,
        s.original_title,
        s.tmdb_id,
        s.poster_path,
        s.backdrop_path,
        s.overview,
        s.first_air_date,
        s.rating,
        s.genres,
        s.number_of_seasons,
        s.number_of_episodes,
        s.status,
        s.stream_servers,
        s.created_at,
        s.updated_at,
        s.seasons,
        COALESCE(view_counts.view_count, 0::bigint) AS view_count,
        s.slug
    FROM series s
    LEFT JOIN (
        SELECT 
            series_views.series_id,
            count(*) AS view_count
        FROM series_views
        WHERE series_views.viewed_at > (now() - interval '30 days')
        GROUP BY series_views.series_id
    ) view_counts ON s.id = view_counts.series_id
    ORDER BY COALESCE(view_counts.view_count, 0::bigint) DESC, s.created_at DESC
    LIMIT limit_count;
$$;