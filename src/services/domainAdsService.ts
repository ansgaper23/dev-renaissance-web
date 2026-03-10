import { supabase } from "@/integrations/supabase/client";
import { adminApi } from "./adminApi";

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
  const result = await adminApi({ action: 'insert', table: 'domain_ads', data: [ad] });
  return result?.[0] as unknown as DomainAd;
};

export const updateDomainAd = async (id: string, updates: Partial<DomainAd>): Promise<DomainAd> => {
  const result = await adminApi({
    action: 'update',
    table: 'domain_ads',
    id,
    data: { ...updates, updated_at: new Date().toISOString() },
  });
  return result?.[0] as unknown as DomainAd;
};

export const deleteDomainAd = async (id: string): Promise<void> => {
  await adminApi({ action: 'delete', table: 'domain_ads', id });
};
