import { supabase } from "@/integrations/supabase/client";

export interface DomainAd {
  id: string;
  domain: string;
  ad_name: string;
  ad_code: string;
  scope: 'global' | 'playback';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const fetchDomainAds = async (): Promise<DomainAd[]> => {
  const { data, error } = await supabase
    .from('domain_ads')
    .select('*')
    .order('domain')
    .order('display_order');
  if (error) throw error;
  return (data || []) as unknown as DomainAd[];
};

export const fetchAdsForCurrentDomain = async (scope?: 'global' | 'playback'): Promise<DomainAd[]> => {
  const currentDomain = window.location.hostname;
  let query = supabase
    .from('domain_ads')
    .select('*')
    .eq('domain', currentDomain)
    .eq('is_active', true)
    .order('display_order');

  if (scope) {
    query = query.eq('scope', scope);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as DomainAd[];
};

export const createDomainAd = async (ad: Partial<DomainAd>): Promise<DomainAd> => {
  const { data, error } = await supabase
    .from('domain_ads')
    .insert([ad as any])
    .select()
    .single();
  if (error) throw error;
  return data as unknown as DomainAd;
};

export const updateDomainAd = async (id: string, updates: Partial<DomainAd>): Promise<DomainAd> => {
  const { data, error } = await supabase
    .from('domain_ads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as DomainAd;
};

export const deleteDomainAd = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('domain_ads')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
