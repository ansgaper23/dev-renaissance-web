import { supabase } from "@/integrations/supabase/client";
import { Movie } from "./movieService";
import { Series } from "./seriesService";

export type SearchResultType = 'movie' | 'series';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  rating?: number | null;
  slug?: string | null;
  overview?: string | null;
}

export const searchAll = async (searchTerm: string = ''): Promise<SearchResult[]> => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  try {
    // Search movies
    const { data: moviesData, error: moviesError } = await supabase
      .from('movies')
      .select('id, title, poster_path, release_date, rating, slug, overview')
      .ilike('title', `%${searchTerm}%`)
      .order('rating', { ascending: false })
      .limit(10);

    if (moviesError) {
      console.error('Error fetching movies:', moviesError);
    }

    // Search series
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('id, title, poster_path, first_air_date, rating, slug, overview')
      .ilike('title', `%${searchTerm}%`)
      .order('rating', { ascending: false })
      .limit(10);

    if (seriesError) {
      console.error('Error fetching series:', seriesError);
    }

    // Combine and format results
    const movieResults: SearchResult[] = (moviesData || []).map(movie => ({
      id: movie.id,
      type: 'movie' as SearchResultType,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      rating: movie.rating,
      slug: movie.slug,
      overview: movie.overview,
    }));

    const seriesResults: SearchResult[] = (seriesData || []).map(series => ({
      id: series.id,
      type: 'series' as SearchResultType,
      title: series.title,
      poster_path: series.poster_path,
      first_air_date: series.first_air_date,
      rating: series.rating,
      slug: series.slug,
      overview: series.overview,
    }));

    // Combine and sort by rating
    const allResults = [...movieResults, ...seriesResults]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    return allResults;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
