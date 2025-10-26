
import { supabase } from "@/integrations/supabase/client";

export interface Settings {
  id: number;
  site_name?: string;
  site_description?: string;
  logo_url?: string;
  ads_code?: string;
  telegram_url?: string;
  updated_at?: string;
}

export const getSettings = async (): Promise<Settings> => {
  try {
    // 1) Intentar vía función segura (si existe)
    const { data, error } = await supabase.rpc('get_site_settings');

    if (!error && data) {
      return data as unknown as Settings;
    }

    // 2) Fallback: leer directamente de la tabla pública (RLS permite SELECT)
    const { data: tableData, error: tableError } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (tableError) {
      console.error('Error fetching settings (table):', tableError);
      throw tableError;
    }

    return tableData as unknown as Settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Defaults
    return {
      id: 1,
      site_name: 'Cine Explorer',
      site_description: 'Explora miles de películas y series online',
      logo_url: null,
      ads_code: null,
      updated_at: new Date().toISOString()
    };
  }
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  try {
    // Use secure settings update function  
    const { data, error } = await supabase.rpc('update_site_settings', {
      site_name_input: settings.site_name || null,
      site_description_input: settings.site_description || null,
      logo_url_input: settings.logo_url || null,
      ads_code_input: settings.ads_code || null,
      telegram_url_input: settings.telegram_url || null
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
