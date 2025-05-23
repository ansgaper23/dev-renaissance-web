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
