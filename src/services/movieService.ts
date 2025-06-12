import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;
  slug?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  release_date?: string | null;
  genres?: string[] | null;
  genre_ids?: number[] | null;
  rating?: number | null;
  runtime?: number | null;
  trailer_url?: string | null;
  stream_url?: string | null;
  stream_servers?: Array<{
    name: string;
    url: string;
    quality?: string;
    language?: string;
  }> | null;
  created_at?: string | null;
  updated_at?: string | null;
  imdb_id?: string | null;
}

// For creating a new movie, title is required
export interface MovieCreate extends Omit<Partial<Movie>, 'title'> {
  title: string; // Title is required
}

// Admin authentication interfaces
export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminSession {
  authenticated: boolean;
  email: string;
  expiresAt: number;
}

// Helper function to convert database row to Movie
const convertToMovie = (row: any): Movie => {
  return {
    ...row,
    stream_servers: Array.isArray(row.stream_servers) ? row.stream_servers : [],
  };
};

// Simplified helper function to convert Movie to database format
const convertToDbFormat = (movie: any) => {
  // Simple object spread without complex type operations
  return {
    id: movie.id,
    tmdb_id: movie.tmdb_id,
    title: movie.title,
    original_title: movie.original_title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    genres: movie.genres,
    genre_ids: movie.genre_ids,
    rating: movie.rating,
    runtime: movie.runtime,
    trailer_url: movie.trailer_url,
    stream_url: movie.stream_url,
    stream_servers: movie.stream_servers,
    created_at: movie.created_at,
    updated_at: movie.updated_at
  };
};

// Generate slug from movie title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Admin authentication functions
export const adminLogin = async (credentials: AdminCredentials): Promise<void> => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', credentials.email)
    .eq('password', credentials.password)
    .single();

  if (error || !data) {
    throw new Error('Invalid credentials');
  }

  // Store session in localStorage
  const session: AdminSession = {
    authenticated: true,
    email: data.email,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  localStorage.setItem('adminSession', JSON.stringify(session));
};

export const getAdminSession = (): AdminSession | null => {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) return null;

    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('adminSession');
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export const adminLogout = (): void => {
  localStorage.removeItem('adminSession');
};

export const fetchMovies = async (searchTerm: string = ''): Promise<Movie[]> => {
  let query = supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return (data || []).map(convertToMovie);
};

export const fetchMostViewedMovies = async (): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from('most_viewed_movies')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(20);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return (data || []).map(convertToMovie);
};

export const fetchMovieById = async (id: string): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToMovie(data);
};

export const fetchMovieBySlug = async (slug: string): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
    
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('Movie not found');
  }
  
  return convertToMovie(data);
};

export const addMovie = async (movie: MovieCreate): Promise<Movie> => {
  // Create a simple object with only the fields we need
  const movieData = {
    title: movie.title,
    tmdb_id: movie.tmdb_id || null,
    original_title: movie.original_title || null,
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    overview: movie.overview || null,
    release_date: movie.release_date || null,
    genres: movie.genres || null,
    genre_ids: movie.genre_ids || null,
    rating: movie.rating || null,
    runtime: movie.runtime || null,
    trailer_url: movie.trailer_url || null,
    stream_url: movie.stream_url || null,
    stream_servers: movie.stream_servers || []
  };
  
  const { data, error } = await supabase
    .from('movies')
    .insert(movieData)
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToMovie(data);
};

export const updateMovie = async (id: string, updates: Partial<Movie>): Promise<Movie> => {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('movies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToMovie(data);
};

export const deleteMovie = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};

export const getTotalMoviesCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('movies')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    throw new Error(error.message);
  }
  
  return count || 0;
};

export const recordMovieView = async (movieId: string): Promise<void> => {
  // Insert a new view record instead of using RPC function
  const { error } = await supabase
    .from('movie_views')
    .insert({
      movie_id: movieId,
      ip_address: '127.0.0.1', // Default IP for now
      viewed_at: new Date().toISOString()
    });
    
  if (error) {
    console.error("Error recording movie view:", error);
  }
};

// Simplified related movies function without RPC calls
export const fetchRelatedMovies = async (movieId: string, genres: string[]): Promise<Movie[]> => {
  if (!genres || genres.length === 0) {
    return [];
  }

  try {
    // Simple query without RPC
    const { data, error } = await supabase
      .from('movies')
      .select('id, title, poster_path, genres, rating, release_date')
      .neq('id', movieId)
      .limit(10);

    if (error || !data) {
      console.error("Error fetching related movies:", error);
      return [];
    }

    // Filter movies that share at least one genre
    const relatedMovies: Movie[] = [];
    
    for (const row of data) {
      if (row.genres && Array.isArray(row.genres)) {
        const hasSharedGenre = row.genres.some(genre => genres.includes(genre));
        if (hasSharedGenre) {
          relatedMovies.push({
            id: row.id,
            title: row.title,
            poster_path: row.poster_path || null,
            genres: row.genres || null,
            rating: row.rating || null,
            release_date: row.release_date || null,
            original_title: null,
            slug: null,
            backdrop_path: null,
            overview: null,
            genre_ids: null,
            runtime: null,
            trailer_url: null,
            stream_url: null,
            stream_servers: null,
            created_at: null,
            updated_at: null,
            imdb_id: null,
            tmdb_id: null
          });
        }
      }
    }

    return relatedMovies;
  } catch (error) {
    console.error("Error in fetchRelatedMovies:", error);
    return [];
  }
};

// TMDB interfaces and functions
interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  runtime?: number;
}

interface TMDBSearchResponse {
  movie_results: TMDBMovieResult[];
}

// TMDB search function
export const searchMovieByIMDBId = async (imdbId: string): Promise<TMDBMovieResult & { imdb_id: string; type: string }> => {
  try {
    console.log("Searching for IMDB ID:", imdbId);
    
    const tmdbApiKey = '4a29f0dd1dfdbd0a8b506c7b9e35c506';
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbApiKey}&external_source=imdb_id&language=es-ES`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al buscar en TMDB');
    }
    
    const data: TMDBSearchResponse = await response.json();
    console.log("TMDB search result:", data);
    
    if (data.movie_results && data.movie_results.length > 0) {
      const movie = data.movie_results[0];
      
      const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&append_to_response=videos,external_ids&language=es-ES`;
      const detailsResponse = await fetch(detailsUrl);
      const movieDetails: TMDBMovieResult = await detailsResponse.json();
      
      return {
        ...movieDetails,
        imdb_id: imdbId,
        type: 'movie'
      };
    }
    
    throw new Error('No se encontraron películas para este IMDB ID');
  } catch (error) {
    console.error("Error searching movie by IMDB ID:", error);
    throw error;
  }
};

// TMDB Genre mapping
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

export const importMovieFromTMDB = async (tmdbMovie: TMDBMovieResult & { imdb_id?: string; type?: string }, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Movie> => {
  console.log("Importing movie from TMDB:", tmdbMovie);
  console.log("Stream servers:", streamServers);
  
  // Map genre IDs to genre names
  const genreNames = tmdbMovie.genre_ids ? 
    tmdbMovie.genre_ids.map((id: number) => TMDB_GENRES[id]).filter(Boolean) : [];

  const movieData: MovieCreate = {
    title: tmdbMovie.title,
    original_title: tmdbMovie.original_title,
    tmdb_id: tmdbMovie.id,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    overview: tmdbMovie.overview,
    release_date: tmdbMovie.release_date,
    genres: genreNames,
    genre_ids: tmdbMovie.genre_ids,
    rating: tmdbMovie.vote_average,
    runtime: tmdbMovie.runtime,
    stream_servers: streamServers.filter(server => server.url.trim() !== '')
  };
  
  return addMovie(movieData);
};

// Import from IMDB ID using TMDB
export const importMovieFromIMDB = async (imdbId: string, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Movie> => {
  console.log("Importing movie from IMDB ID:", imdbId);
  
  // Buscar datos en TMDB usando IMDB ID
  const tmdbData = await searchMovieByIMDBId(imdbId);
  
  if (!tmdbData || tmdbData.type !== 'movie') {
    throw new Error('No se encontró la película en TMDB con este IMDB ID');
  }
  
  // Usar la función existente para importar desde TMDB
  return importMovieFromTMDB(tmdbData, streamServers);
};

// Import from IMDB ID using OMDb
export const importMovieFromIMDBWithOMDb = async (imdbId: string, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Movie> => {
  console.log("Importing movie from IMDB ID using OMDb:", imdbId);
  
  const { searchMovieByIMDBIdOMDb, convertOMDbToMovie } = await import('./omdbService');
  
  // Buscar datos en OMDb usando IMDB ID
  const omdbData = await searchMovieByIMDBIdOMDb(imdbId);
  
  if (!omdbData || omdbData.Response === "False") {
    throw new Error('No se encontró la película en OMDb con este IMDB ID');
  }
  
  // Convertir datos de OMDb al formato de Movie
  const movieData: MovieCreate = {
    ...convertOMDbToMovie(omdbData),
    stream_servers: streamServers.filter(server => server.url.trim() !== '')
  };
  
  return addMovie(movieData);
};
