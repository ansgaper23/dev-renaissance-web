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

export interface OMDbError {
  Response: string;
  Error: string;
}

export const searchMovieByIMDBIdOMDb = async (imdbId: string): Promise<OMDbMovie> => {
  try {
    console.log("Searching OMDb for IMDB ID:", imdbId);
    
    // Get API key from Supabase secrets
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: secretsData, error: secretsError } = await supabase
      .from('secrets')
      .select('omdb_api_key')
      .eq('id', 1)
      .single();
    
    if (secretsError) {
      console.error('Error fetching secrets:', secretsError);
      throw new Error('Error al obtener la configuración de API');
    }
    
    if (!secretsData?.omdb_api_key) {
      console.error('OMDb API key not found in secrets');
      throw new Error('Clave de API de OMDb no configurada. Por favor, configúrala en los ajustes.');
    }

    const apiKey = secretsData.omdb_api_key;
    const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`;
    
    console.log("Fetching from OMDb with URL:", url.replace(apiKey, '[API_KEY]'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data: OMDbMovie | OMDbError = await response.json();
    console.log("OMDb search result:", data);
    
    if (data.Response === "False") {
      const errorData = data as OMDbError;
      throw new Error(`No se encontraron películas para este IMDB ID en OMDb: ${errorData.Error || 'Error desconocido'}`);
    }
    
    return data as OMDbMovie;
  } catch (error) {
    console.error("Error searching movie by IMDB ID in OMDb:", error);
    throw error;
  }
};

export const convertOMDbToMovie = (omdbMovie: OMDbMovie) => {
  // Convert OMDb genres string to array
  const genres = omdbMovie.Genre ? omdbMovie.Genre.split(', ') : [];
  
  // Convert runtime string to number (e.g., "142 min" -> 142)
  const runtime = omdbMovie.Runtime ? parseInt(omdbMovie.Runtime.replace(' min', '')) : null;
  
  // Convert IMDB rating to number
  const rating = omdbMovie.imdbRating && omdbMovie.imdbRating !== 'N/A' ? parseFloat(omdbMovie.imdbRating) : null;
  
  // Convert release date
  const releaseDate = omdbMovie.Released && omdbMovie.Released !== 'N/A' ? 
    new Date(omdbMovie.Released).toISOString().split('T')[0] : null;

  return {
    title: omdbMovie.Title,
    original_title: omdbMovie.Title,
    overview: omdbMovie.Plot !== 'N/A' ? omdbMovie.Plot : null,
    release_date: releaseDate,
    genres,
    rating,
    runtime,
    poster_path: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null,
    backdrop_path: null, // OMDb doesn't provide backdrop images
    imdb_id: omdbMovie.imdbID
  };
};
