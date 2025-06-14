
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/services/settingsService';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
