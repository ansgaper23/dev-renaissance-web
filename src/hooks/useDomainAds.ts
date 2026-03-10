import { useQuery } from '@tanstack/react-query';
import { fetchAdsForCurrentDomain, DomainAd } from '@/services/domainAdsService';

export const useDomainAds = (scope?: 'global' | 'playback') => {
  return useQuery({
    queryKey: ['domainAds', 'current', scope],
    queryFn: () => fetchAdsForCurrentDomain(scope),
    staleTime: 5 * 60 * 1000,
  });
};
