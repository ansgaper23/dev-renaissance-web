
export interface OMDbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export interface OMDbSeries {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons: string;
  Response: string;
}

export interface OMDbErrorResponse {
  Response: "False";
  Error: string;
}

// Diccionario de géneros en inglés a español
const GENRE_TRANSLATIONS: { [key: string]: string } = {
  "Action": "Acción",
  "Adventure": "Aventura", 
  "Animation": "Animación",
  "Biography": "Biografía",
  "Comedy": "Comedia",
  "Crime": "Crimen",
  "Documentary": "Documental",
  "Drama": "Drama",
  "Family": "Familia",
  "Fantasy": "Fantasía",
  "Film-Noir": "Cine Negro",
  "History": "Historia",
  "Horror": "Terror",
  "Music": "Música",
  "Musical": "Musical",
  "Mystery": "Misterio",
  "News": "Noticias",
  "Reality-TV": "Reality TV",
  "Romance": "Romance",
  "Sci-Fi": "Ciencia Ficción",
  "Sport": "Deportes",
  "Thriller": "Suspense",
  "War": "Guerra",
  "Western": "Western",
  "Short": "Cortometraje",
  "Talk-Show": "Talk Show",
  "Game-Show": "Concurso"
};

// Función para traducir géneros
const translateGenres = (genresString: string): string[] => {
  if (!genresString || genresString === 'N/A') return [];
  
  return genresString.split(', ').map(genre => {
    const trimmedGenre = genre.trim();
    return GENRE_TRANSLATIONS[trimmedGenre] || trimmedGenre;
  });
};

export const searchMovieByIMDBIdOMDb = async (imdbId: string): Promise<OMDbMovie> => {
  try {
    console.log("Searching OMDb for IMDB ID:", imdbId);
    
    // Primero intentar obtener API key desde Supabase secrets
    const { supabase } = await import('@/integrations/supabase/client');
    let apiKey = '9a66c7c6'; // Fallback API key que sabemos que funciona
    
    try {
      const { data: secretsData, error: secretsError } = await supabase
        .from('secrets')
        .select('omdb_api_key')
        .eq('id', 1)
        .maybeSingle();
      
      if (!secretsError && secretsData?.omdb_api_key) {
        apiKey = secretsData.omdb_api_key;
        console.log("Using OMDb API key from secrets");
      } else {
        console.log("Using fallback OMDb API key");
      }
    } catch (secretError) {
      console.log("Could not fetch from secrets, using fallback API key");
    }

    const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`;
    
    console.log("Fetching from OMDb with URL:", url.replace(apiKey, '[API_KEY]'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data: OMDbMovie | OMDbErrorResponse = await response.json();
    console.log("OMDb search result:", data);
    
    if (data.Response === "False") {
      const errorData = data as OMDbErrorResponse;
      throw new Error(`No se encontraron películas para este IMDB ID en OMDb: ${errorData.Error || 'Error desconocido'}`);
    }
    
    return data as OMDbMovie;
  } catch (error) {
    console.error("Error searching movie by IMDB ID in OMDb:", error);
    throw error;
  }
};

export const searchSeriesByIMDBIdOMDb = async (imdbId: string): Promise<OMDbSeries> => {
  try {
    console.log("Searching OMDb for series IMDB ID:", imdbId);
    
    // Primero intentar obtener API key desde Supabase secrets
    const { supabase } = await import('@/integrations/supabase/client');
    let apiKey = '9a66c7c6'; // Fallback API key que sabemos que funciona
    
    try {
      const { data: secretsData, error: secretsError } = await supabase
        .from('secrets')
        .select('omdb_api_key')
        .eq('id', 1)
        .maybeSingle();
      
      if (!secretsError && secretsData?.omdb_api_key) {
        apiKey = secretsData.omdb_api_key;
        console.log("Using OMDb API key from secrets");
      } else {
        console.log("Using fallback OMDb API key");
      }
    } catch (secretError) {
      console.log("Could not fetch from secrets, using fallback API key");
    }

    const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`;
    
    console.log("Fetching series from OMDb with URL:", url.replace(apiKey, '[API_KEY]'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data: OMDbSeries | OMDbErrorResponse = await response.json();
    console.log("OMDb series search result:", data);
    
    if (data.Response === "False") {
      const errorData = data as OMDbErrorResponse;
      throw new Error(`No se encontraron series para este IMDB ID en OMDb: ${errorData.Error || 'Error desconocido'}`);
    }
    
    const seriesData = data as OMDbSeries;
    
    // Verify it's actually a series/TV show
    if (seriesData.Type !== "series") {
      throw new Error(`El IMDB ID proporcionado no corresponde a una serie (Tipo: ${seriesData.Type})`);
    }
    
    return seriesData;
  } catch (error) {
    console.error("Error searching series by IMDB ID in OMDb:", error);
    throw error;
  }
};

export const convertOMDbToMovie = (omdbMovie: OMDbMovie) => {
  // Convert OMDb genres string to array and translate to Spanish
  const genres = translateGenres(omdbMovie.Genre);
  
  // Convert runtime string to number (e.g., "142 min" -> 142)
  const runtime = omdbMovie.Runtime ? parseInt(omdbMovie.Runtime.replace(' min', '')) : null;
  
  // Convert IMDB rating to number
  const rating = omdbMovie.imdbRating && omdbMovie.imdbRating !== 'N/A' ? parseFloat(omdbMovie.imdbRating) : null;
  
  // Convert release date
  const releaseDate = omdbMovie.Released && omdbMovie.Released !== 'N/A' ? 
    new Date(omdbMovie.Released).toISOString().split('T')[0] : null;

  // Use OMDb poster URL directly (it's already a full URL)
  const posterPath = omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null;

  return {
    title: omdbMovie.Title,
    original_title: omdbMovie.Title,
    overview: omdbMovie.Plot !== 'N/A' ? omdbMovie.Plot : null,
    release_date: releaseDate,
    genres,
    rating,
    runtime,
    poster_path: posterPath,
    backdrop_path: null, // OMDb doesn't provide backdrop images
    imdb_id: omdbMovie.imdbID
  };
};

export const convertOMDbToSeries = (omdbSeries: OMDbSeries) => {
  // Convert OMDb genres string to array and translate to Spanish
  const genres = translateGenres(omdbSeries.Genre);
  
  // Convert IMDB rating to number
  const rating = omdbSeries.imdbRating && omdbSeries.imdbRating !== 'N/A' ? parseFloat(omdbSeries.imdbRating) : null;
  
  // Convert first air date
  const firstAirDate = omdbSeries.Released && omdbSeries.Released !== 'N/A' ? 
    new Date(omdbSeries.Released).toISOString().split('T')[0] : null;

  // Convert total seasons to number
  const numberOfSeasons = omdbSeries.totalSeasons && omdbSeries.totalSeasons !== 'N/A' ? 
    parseInt(omdbSeries.totalSeasons) : null;

  // Use OMDb poster URL directly (it's already a full URL)
  const posterPath = omdbSeries.Poster !== 'N/A' ? omdbSeries.Poster : null;

  return {
    title: omdbSeries.Title,
    original_title: omdbSeries.Title,
    overview: omdbSeries.Plot !== 'N/A' ? omdbSeries.Plot : null,
    first_air_date: firstAirDate,
    genres,
    rating,
    number_of_seasons: numberOfSeasons,
    poster_path: posterPath,
    backdrop_path: null, // OMDb doesn't provide backdrop images
    imdb_id: omdbSeries.imdbID
  };
};
