
import { supabase } from "@/integrations/supabase/client";

export interface Settings {
  id: number;
  site_name?: string;
  site_description?: string;
  logo_url?: string;
  ads_code?: string;
  updated_at?: string;
}

export const getSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Settings;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0] as Settings;
};
