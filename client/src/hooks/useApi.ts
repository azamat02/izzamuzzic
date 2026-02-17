import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function usePublicData<T>(key: string, url: string) {
  return useQuery<T>({
    queryKey: [key],
    queryFn: () => api.get<T>(url),
    staleTime: 60 * 1000,
  });
}
