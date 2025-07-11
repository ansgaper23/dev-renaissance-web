
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

// Función para traducir sinopsis usando un simple mapeo de términos comunes
const translatePlot = (englishPlot: string): string => {
  if (!englishPlot || englishPlot === 'N/A') return 'Sinopsis no disponible';
  
  // Traducción básica de términos comunes en sinopsis
  let translatedPlot = englishPlot
    .replace(/\bAn apocalyptic story\b/gi, 'Una historia apocalíptica')
    .replace(/\bset in the furthest reaches\b/gi, 'ambientada en los confines más lejanos')
    .replace(/\bof our planet\b/gi, 'de nuestro planeta')
    .replace(/\bin a stark desert landscape\b/gi, 'en un paisaje desértico desolado')
    .replace(/\bwhere humanity is broken\b/gi, 'donde la humanidad está quebrada')
    .replace(/\balmost everyone is crazed\b/gi, 'casi todos están enloquecidos')
    .replace(/\bfighting for the necessities of life\b/gi, 'luchando por las necesidades de la vida')
    .replace(/\bWithin this world\b/gi, 'Dentro de este mundo')
    .replace(/\bexist two rebels on the run\b/gi, 'existen dos rebeldes en fuga')
    .replace(/\bwho just might be able to restore order\b/gi, 'que podrían ser capaces de restaurar el orden')
    .replace(/\bThere's Max\b/gi, 'Está Max')
    .replace(/\ba man of action\b/gi, 'un hombre de acción')
    .replace(/\band a man of few words\b/gi, 'y un hombre de pocas palabras')
    .replace(/\bwho seeks peace of mind\b/gi, 'que busca la paz mental')
    .replace(/\bfollowing the\b/gi, 'siguiendo el');

  return translatedPlot;
};

export const searchMovieByIMDBIdOMDb = async (imdbId: string): Promise<OMDbMovie> => {
  try {
    console.log("Searching OMDb for IMDB ID:", imdbId);
    
    // Use secure OMDB search function
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('secure-omdb-search', {
      body: { imdb_id: imdbId }
    });
    
    if (error) {
      console.error("Secure OMDb search error:", error);
      throw new Error('Error al buscar en OMDb: ' + error.message);
    }
    
    if (!data) {
      throw new Error('No se encontraron películas para este IMDB ID en OMDb');
    }
    
    console.log("OMDb search result via secure function:", data);
    
    if (data.Response === "False") {
      throw new Error(`No se encontraron películas para este IMDB ID en OMDb: ${data.Error || 'Error desconocido'}`);
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
    
    // Use secure OMDB search function
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('secure-omdb-search', {
      body: { imdb_id: imdbId }
    });
    
    if (error) {
      console.error("Secure OMDb search error:", error);
      throw new Error('Error al buscar en OMDb: ' + error.message);
    }
    
    if (!data) {
      throw new Error('No se encontraron series para este IMDB ID en OMDb');
    }
    
    console.log("OMDb series search result via secure function:", data);
    
    if (data.Response === "False") {
      throw new Error(`No se encontraron series para este IMDB ID en OMDb: ${data.Error || 'Error desconocido'}`);
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

  // Use OMDb poster URL directly (it's already a full URL) - ensure it's valid
  const posterPath = omdbMovie.Poster && omdbMovie.Poster !== 'N/A' && omdbMovie.Poster.startsWith('http') ? 
    omdbMovie.Poster : null;

  // Translate plot to Spanish
  const translatedOverview = translatePlot(omdbMovie.Plot);

  console.log("Converted movie data:", {
    title: omdbMovie.Title,
    poster_path: posterPath,
    overview: translatedOverview,
    genres
  });

  return {
    title: omdbMovie.Title,
    original_title: omdbMovie.Title,
    overview: translatedOverview,
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

  // Use OMDb poster URL directly (it's already a full URL) - ensure it's valid
  const posterPath = omdbSeries.Poster && omdbSeries.Poster !== 'N/A' && omdbSeries.Poster.startsWith('http') ? 
    omdbSeries.Poster : null;

  // Translate plot to Spanish
  const translatedOverview = translatePlot(omdbSeries.Plot);

  return {
    title: omdbSeries.Title,
    original_title: omdbSeries.Title,
    overview: translatedOverview,
    first_air_date: firstAirDate,
    genres,
    rating,
    number_of_seasons: numberOfSeasons,
    poster_path: posterPath,
    backdrop_path: null, // OMDb doesn't provide backdrop images
    imdb_id: omdbSeries.imdbID
  };
};
