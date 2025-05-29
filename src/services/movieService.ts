
import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  release_date?: string | null;
  genre_ids?: number[] | null;
  genres?: string[] | null;
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
  email: string;
  authenticated: boolean;
}

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
  
  return data as Movie[];
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
  
  return data as Movie;
};

export const addMovie = async (movie: MovieCreate): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .insert(movie)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0] as Movie;
};

export const updateMovie = async (id: string, updates: Partial<Movie>): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0] as Movie;
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

// Admin authentication functions
export const adminLogin = async (credentials: AdminCredentials): Promise<AdminSession> => {
  console.log("Attempting login with:", credentials.email);
  
  // Fixed credentials for development
  const hardcodedAdmin = {
    email: "jorge968122@gmail.com",
    password: "123456"
  };
  
  // Validate against fixed credentials
  if (credentials.email === hardcodedAdmin.email && credentials.password === hardcodedAdmin.password) {
    const adminSession = { email: credentials.email, authenticated: true };
    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    return adminSession;
  }
  
  // Try supabase auth as fallback (for production)
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email, password')
      .eq('email', credentials.email)
      .single();
      
    if (error) {
      console.error("Supabase auth error:", error);
      throw new Error('Credenciales inválidas');
    }
    
    // Compare password (in a real app you'd use bcrypt or similar)
    if (data && data.password === credentials.password) {
      // Store admin session in localStorage
      const adminSession = { email: data.email, authenticated: true };
      localStorage.setItem('adminSession', JSON.stringify(adminSession));
      return adminSession;
    } else {
      throw new Error('Credenciales inválidas');
    }
  } catch (error) {
    console.error("Login error:", error);
    throw new Error('Credenciales inválidas');
  }
};

export const adminLogout = (): void => {
  localStorage.removeItem('adminSession');
};

export const getAdminSession = (): AdminSession | null => {
  const session = localStorage.getItem('adminSession');
  return session ? JSON.parse(session) : null;
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

// TMDB Genre mapping with additional genres
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
  27: "Horror",
  10402: "Música",
  9648: "Misterio",
  10749: "Romance",
  878: "Ciencia Ficción",
  10770: "Película de TV",
  53: "Suspenso",
  10752: "Bélica",
  37: "Western",
  10759: "Acción y Aventura",
  10762: "Infantil",
  10763: "Noticias",
  10764: "Reality",
  10765: "Ciencia Ficción y Fantasía",
  10766: "Telenovela",
  10767: "Talk Show",
  10768: "Bélica y Política"
};

// Función para buscar por IMDB ID
export const searchByIMDBId = async (imdbId: string): Promise<any> => {
  try {
    console.log("Searching for IMDB ID:", imdbId);
    
    // Buscar en TMDB usando el IMDB ID
    const tmdbApiKey = '4a29f0dd1dfdbd0a8b506c7b9e35c506';
    const tmdbResponse = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbApiKey}&external_source=imdb_id&language=es-ES`);
    
    if (!tmdbResponse.ok) {
      throw new Error('Error al buscar en TMDB');
    }
    
    const tmdbData = await tmdbResponse.json();
    console.log("TMDB search result:", tmdbData);
    
    // Verificar si encontramos resultados
    if (tmdbData.movie_results && tmdbData.movie_results.length > 0) {
      const movie = tmdbData.movie_results[0];
      
      // Obtener detalles completos de la película
      const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&append_to_response=videos,external_ids&language=es-ES`);
      const movieDetails = await detailsResponse.json();
      
      return {
        ...movieDetails,
        imdb_id: imdbId,
        type: 'movie'
      };
    }
    
    if (tmdbData.tv_results && tmdbData.tv_results.length > 0) {
      const series = tmdbData.tv_results[0];
      
      // Obtener detalles completos de la serie
      const detailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${series.id}?api_key=${tmdbApiKey}&append_to_response=videos,external_ids&language=es-ES`);
      const seriesDetails = await detailsResponse.json();
      
      return {
        ...seriesDetails,
        imdb_id: imdbId,
        type: 'tv'
      };
    }
    
    throw new Error('No se encontraron resultados para este IMDB ID');
  } catch (error) {
    console.error("Error searching by IMDB ID:", error);
    throw error;
  }
};

// Fetch detailed movie data from TMDB with enhanced metadata
const fetchTMDBMovieDetails = async (movieId: number): Promise<any> => {
  try {
    const apiKey = '4a29f0dd1dfdbd0a8b506c7b9e35c506';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos,credits,external_ids,keywords&language=es-ES`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie details from TMDB');
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Could not fetch detailed movie data from TMDB:", error);
    return null;
  }
};

// Enhanced IMDB data fetching with OMDb API
const fetchIMDBData = async (imdbId: string): Promise<any> => {
  try {
    // Using OMDb API (you can get a free API key from http://www.omdbapi.com/)
    const omdbApiKey = 'b6003d8a'; // Public demo key, replace with your own
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${omdbApiKey}&plot=full`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch IMDB data from OMDb');
    }
    
    const data = await response.json();
    
    if (data.Response === 'True') {
      console.log("IMDB data successfully fetched:", data);
      return {
        imdb_id: imdbId,
        imdb_rating: data.imdbRating ? parseFloat(data.imdbRating) : null,
        box_office: data.BoxOffice || null,
        awards: data.Awards || null,
        metascore: data.Metascore ? parseInt(data.Metascore) : null,
        imdb_votes: data.imdbVotes ? data.imdbVotes.replace(/,/g, '') : null,
        plot_full: data.Plot || null,
        director: data.Director || null,
        writer: data.Writer || null,
        actors: data.Actors ? data.Actors.split(', ') : null,
        country: data.Country || null,
        language: data.Language || null,
        rated: data.Rated || null
      };
    } else {
      console.warn("OMDb API error:", data.Error);
      return { imdb_id: imdbId };
    }
  } catch (error) {
    console.warn("Could not fetch IMDB data from OMDb:", error);
    return { imdb_id: imdbId };
  }
};

export const importMovieFromTMDB = async (tmdbMovie: any, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Movie> => {
  console.log("Importing movie from TMDB with enhanced IMDB integration:", tmdbMovie);
  console.log("Stream servers:", streamServers);
  
  // Map genre IDs to genre names
  const genreNames = tmdbMovie.genre_ids ? 
    tmdbMovie.genre_ids.map((id: number) => TMDB_GENRES[id]).filter(Boolean) : [];

  // Fetch detailed movie data to get runtime, trailer, cast, and IMDB ID
  let runtime = tmdbMovie.runtime || null;
  let trailerUrl = null;
  let imdbId = null;
  let cast = [];
  let director = null;
  let keywords = [];
  let imdbData = null;
  
  if (tmdbMovie.id) {
    const detailedMovie = await fetchTMDBMovieDetails(tmdbMovie.id);
    
    if (detailedMovie) {
      // Get runtime from detailed response
      runtime = detailedMovie.runtime || runtime;
      console.log("Enhanced runtime from TMDB details:", runtime);
      
      // Get trailer from detailed response
      if (detailedMovie.videos && detailedMovie.videos.results) {
        const trailer = detailedMovie.videos.results.find((video: any) => 
          video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) {
          trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
      }

      // Get IMDB ID from external IDs
      if (detailedMovie.external_ids && detailedMovie.external_ids.imdb_id) {
        imdbId = detailedMovie.external_ids.imdb_id;
        console.log("IMDB ID found:", imdbId);
        
        // Fetch additional IMDB metadata from OMDb
        imdbData = await fetchIMDBData(imdbId);
        console.log("Enhanced IMDB metadata:", imdbData);
      }

      // Get cast information
      if (detailedMovie.credits && detailedMovie.credits.cast) {
        cast = detailedMovie.credits.cast.slice(0, 10).map((actor: any) => ({
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path
        }));
      }

      // Get director information (prioritize IMDB data if available)
      if (imdbData && imdbData.director) {
        director = imdbData.director;
      } else if (detailedMovie.credits && detailedMovie.credits.crew) {
        const directorInfo = detailedMovie.credits.crew.find((person: any) => person.job === 'Director');
        if (directorInfo) {
          director = directorInfo.name;
        }
      }

      // Get keywords for SEO
      if (detailedMovie.keywords && detailedMovie.keywords.keywords) {
        keywords = detailedMovie.keywords.keywords.map((keyword: any) => keyword.name);
      }
    }
  }

  // Handle trailer from tmdbMovie if available and not found in details
  if (!trailerUrl && tmdbMovie.videos && tmdbMovie.videos.results) {
    const trailer = tmdbMovie.videos.results.find((video: any) => 
      video.type === 'Trailer' && video.site === 'YouTube'
    );
    if (trailer) {
      trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
    }
  }

  // Enhanced movie data with IMDB integration
  const movieData: MovieCreate = {
    title: tmdbMovie.title,
    original_title: tmdbMovie.original_title,
    tmdb_id: tmdbMovie.id,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    overview: imdbData?.plot_full || tmdbMovie.overview, // Use IMDB plot if available
    release_date: tmdbMovie.release_date,
    rating: imdbData?.imdb_rating || tmdbMovie.vote_average, // Prefer IMDB rating
    runtime: runtime,
    genre_ids: tmdbMovie.genre_ids || [],
    genres: genreNames,
    trailer_url: trailerUrl,
    stream_servers: streamServers.filter(server => server.url.trim() !== ''),
  };

  console.log("Final enhanced movie data with IMDB integration:", movieData);
  console.log("Additional IMDB metadata - Cast:", imdbData?.actors);
  console.log("Additional IMDB metadata - Director:", director);
  console.log("Additional IMDB metadata - Awards:", imdbData?.awards);
  console.log("Additional IMDB metadata - Box Office:", imdbData?.box_office);
  console.log("Additional IMDB metadata - Keywords:", keywords);
  
  return addMovie(movieData);
};

// Import from IMDB ID
export const importMovieFromIMDB = async (imdbId: string, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Movie> => {
  console.log("Importing movie from IMDB ID:", imdbId);
  
  // Buscar datos en TMDB usando IMDB ID
  const tmdbData = await searchByIMDBId(imdbId);
  
  if (!tmdbData || tmdbData.type !== 'movie') {
    throw new Error('No se encontró la película en TMDB con este IMDB ID');
  }
  
  // Usar la función existente para importar desde TMDB
  return importMovieFromTMDB(tmdbData, streamServers);
};
