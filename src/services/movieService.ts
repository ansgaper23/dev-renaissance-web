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
  admin_id: string;
  email: string;
  session_token: string;
  expires_at: number;
}

// Helper function to convert database row to Movie
const convertToMovie = (row: any): Movie => {
  return {
    ...row,
    stream_servers: Array.isArray(row.stream_servers) ? row.stream_servers : [],
  };
};

// Generate slug from movie title
export const generateSlug = (title: string, year?: string): string => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
  
  // Add year if provided
  if (year) {
    slug += `-${year}`;
  }
  
  return slug;
};

// Admin authentication functions
export const adminLogin = async (credentials: AdminCredentials): Promise<void> => {
  try {
    console.log("Admin login attempt for:", credentials.email);
    
    // Use secure authentication function
    const { data, error } = await supabase
      .rpc('authenticate_admin', {
        email_input: credentials.email,
        password_input: credentials.password
      });
    
    if (error || !data) {
      console.error("Login error:", error);
      throw new Error('Credenciales inválidas');
    }
    
    // Store secure session data
    localStorage.setItem('adminSession', JSON.stringify(data));
    console.log("Admin login successful:", (data as any).email);
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};

export const getAdminSession = (): AdminSession | null => {
  try {
    const sessionStr = localStorage.getItem('adminSession');
    if (!sessionStr) return null;

    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (Date.now() > session.expires_at * 1000) { // Convert from seconds to milliseconds
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

export const fetchMoviesByRating = async (limit: number = 20): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .not('rating', 'is', null)
    .gte('rating', 7) // Only show movies with rating >= 7
    .order('rating', { ascending: false })
    .limit(limit);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return (data || []).map(convertToMovie);
};

export const fetchMoviesByReleaseDate = async (limit: number = 20): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .not('release_date', 'is', null)
    .order('release_date', { ascending: false })
    .limit(limit);
    
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
  console.log("Searching for movie with slug:", slug);
  
  // Check if slug looks like a UUID (old movies without proper slugs)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  if (isUUID) {
    console.log("Slug appears to be a UUID, searching by ID:", slug);
    // Try to find by ID first
    const { data: movieById, error: idError } = await supabase
      .from('movies')
      .select('*')
      .eq('id', slug)
      .maybeSingle();
    
    if (!idError && movieById) {
      console.log("Found movie by ID:", movieById.title);
      return convertToMovie(movieById);
    }
  }
  
  // First try to find by exact slug match
  let { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  // If not found and slug contains a year, try without the year
  if (!data && slug.includes('-')) {
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    
    // Check if last part is a year (4 digits)
    if (/^\d{4}$/.test(lastPart)) {
      const slugWithoutYear = parts.slice(0, -1).join('-');
      console.log("Trying slug without year:", slugWithoutYear);
      
      const { data: dataWithoutYear, error: errorWithoutYear } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slugWithoutYear)
        .maybeSingle();
      
      if (!errorWithoutYear && dataWithoutYear) {
        data = dataWithoutYear;
        error = null;
      }
    }
  }
  
  // If still not found, try to find by title
  if (!data) {
    console.log("Movie not found by slug, trying by title");
    const titleFromSlug = slug.replace(/-/g, ' ').replace(/\s+\d{4}$/, '');
    
    const { data: moviesByTitle, error: titleError } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${titleFromSlug}%`)
      .limit(1);
    
    if (!titleError && moviesByTitle && moviesByTitle.length > 0) {
      data = moviesByTitle[0];
      error = null;
    }
  }
  
  if (error || !data) {
    console.error("Movie not found:", error);
    throw new Error(error?.message || 'Movie not found');
  }
  
  console.log("Found movie:", data.title);
  return convertToMovie(data);
};

export const addMovie = async (movie: MovieCreate): Promise<Movie> => {
  // Generate slug based on title and year
  const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined;
  const slug = movie.slug || generateSlug(movie.title, year);
  
  // Create a simple object with only the fields we need
  const movieData = {
    title: movie.title,
    slug: slug,
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

// Enhanced related movies function with better genre matching
export const fetchRelatedMovies = async (movieId: string, genres: string[]): Promise<Movie[]> => {
  console.log("Fetching related movies for:", movieId, "with genres:", genres);
  
  if (!genres || genres.length === 0) {
    console.log("No genres provided, fetching recent movies instead");
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .neq('id', movieId)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching recent movies:", error);
      return [];
    }

    return (data || []).map(convertToMovie);
  }

  try {
    // Use PostgreSQL array overlap operator for better performance
    const { data: exactMatches, error: exactError } = await supabase
      .from('movies')
      .select('*')
      .neq('id', movieId)
      .overlaps('genres', genres)
      .order('rating', { ascending: false })
      .limit(10);

    if (exactError) {
      console.warn("Error fetching exact genre matches:", exactError);
    }

    // If we have exact matches, prioritize them
    if (exactMatches && exactMatches.length > 0) {
      console.log(`Found ${exactMatches.length} movies with exact genre overlap`);
      
      // Sort by number of matching genres (more matches = higher priority)
      const sortedMatches = exactMatches.sort((a, b) => {
        const aMatches = a.genres ? a.genres.filter((g: string) => genres.includes(g)).length : 0;
        const bMatches = b.genres ? b.genres.filter((g: string) => genres.includes(g)).length : 0;
        return bMatches - aMatches;
      });
      
      return sortedMatches.slice(0, 6).map(convertToMovie);
    }

    // Fallback: try partial matches with individual genres
    console.log("No exact matches found, trying individual genre searches");
    const partialMatches: any[] = [];
    
    for (const genre of genres) {
      const { data: genreMovies, error: genreError } = await supabase
        .from('movies')
        .select('*')
        .neq('id', movieId)
        .contains('genres', [genre])
        .order('rating', { ascending: false })
        .limit(3);

      if (!genreError && genreMovies) {
        partialMatches.push(...genreMovies);
      }
    }

    // Remove duplicates and limit to 6
    const uniqueMatches = partialMatches.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );

    if (uniqueMatches.length > 0) {
      console.log(`Found ${uniqueMatches.length} movies with partial genre matches`);
      return uniqueMatches.slice(0, 6).map(convertToMovie);
    }

    // Final fallback: recent movies
    console.log("No genre matches found, returning recent movies as fallback");
    const { data: recentMovies, error: recentError } = await supabase
      .from('movies')
      .select('*')
      .neq('id', movieId)
      .order('created_at', { ascending: false })
      .limit(6);

    if (recentError) {
      console.error("Error fetching recent movies fallback:", recentError);
      return [];
    }

    return (recentMovies || []).map(convertToMovie);

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
    
    // Usar el endpoint de supabase functions en lugar del API directo
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Use secure TMDB search function
    const { data, error } = await supabase.functions.invoke('secure-tmdb-search', {
      body: { imdb_id: imdbId, type: 'movie' }
    });
    
    if (error) {
      console.error("Secure TMDB search error:", error);
      throw new Error('Error al buscar en TMDB: ' + error.message);
    }
    
    if (!data) {
      throw new Error('No se encontraron películas para este IMDB ID');
    }
    
    console.log("TMDB search result via secure function:", data);
    
    // Handle both find API response and direct movie response
    if (data.movie_results && data.movie_results.length > 0) {
      const movie = data.movie_results[0];
      return {
        ...movie,
        imdb_id: imdbId,
        type: 'movie'
      };
    } else if (data.id) {
      // Direct movie response
      return {
        ...data,
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

// TMDB Genre mapping - UPDATED TO MATCH SERVER
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
  
  // Map genre IDs to genre names - IMPROVED MAPPING
  const genreNames = tmdbMovie.genre_ids ? 
    tmdbMovie.genre_ids.map((id: number) => TMDB_GENRES[id] || `Género ${id}`).filter(Boolean) : [];

  console.log("Mapped genres:", {
    original_ids: tmdbMovie.genre_ids,
    mapped_names: genreNames
  });

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
