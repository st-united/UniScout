import { useQuery } from '@tanstack/react-query';

import { getUniversitiesAPI } from '../services/universitiesAPI';

export const useUniversities = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['universities', params],
    queryFn: () => getUniversitiesAPI(params),
  });
};
