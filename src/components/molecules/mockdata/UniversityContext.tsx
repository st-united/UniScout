import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { mockUniversities } from './mockData';

export interface University {
  id: string;
  name: string;
  logo: string;
  country: string;
  region: string;
  ranking: number;
  size: 'Small' | 'Medium' | 'Large';
  fields: string[];
  description: string;
  website: string;
  partnerships: number;
  students: number;
  location: {
    lat: number;
    lng: number;
  };
  type: 'Public' | 'Private' | 'International';
  rating: number;
}

interface UniversityContextType {
  universities: University[];
  featuredUniversities: University[];
  loading: boolean;
  error: string | null;
  getUniversity: (id: string) => University | undefined;
  searchUniversities: (query: string) => University[];
  filterUniversities: (filters: Record<string, any>) => University[];
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

interface UniversityProviderProps {
  children: ReactNode;
}

export const UniversityProvider = ({ children }: UniversityProviderProps) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [featuredUniversities, setFeaturedUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    try {
      setUniversities(mockUniversities);
      setFeaturedUniversities(mockUniversities.slice(0, 6));
    } catch (err) {
      setError('Failed to load university data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUniversity = (id: string) => {
    return universities.find((uni) => uni.id === id);
  };

  const searchUniversities = (query: string) => {
    if (!query) return universities;
    const lowercaseQuery = query.toLowerCase();

    return universities.filter(
      (uni) =>
        uni.name.toLowerCase().includes(lowercaseQuery) ||
        uni.country.toLowerCase().includes(lowercaseQuery) ||
        uni.fields.some((field) => field.toLowerCase().includes(lowercaseQuery)),
    );
  };

  const filterUniversities = (filters: Record<string, any>) => {
    return universities.filter((uni) => {
      let matches = true;

      if (filters.region && filters.region !== 'All') {
        matches = matches && uni.region === filters.region;
      }

      if (filters.country && filters.country !== 'All') {
        matches = matches && uni.country === filters.country;
      }

      if (filters.field && filters.field !== 'All') {
        matches = matches && uni.fields.includes(filters.field);
      }

      if (filters.size && filters.size !== 'All') {
        matches = matches && uni.size === filters.size;
      }

      if (filters.type && filters.type !== 'All') {
        matches = matches && uni.type === filters.type;
      }

      if (filters.minRanking !== undefined) {
        matches = matches && uni.ranking >= filters.minRanking;
      }

      if (filters.maxRanking !== undefined) {
        matches = matches && uni.ranking <= filters.maxRanking;
      }

      return matches;
    });
  };

  return (
    <UniversityContext.Provider
      value={{
        universities,
        featuredUniversities,
        loading,
        error,
        getUniversity,
        searchUniversities,
        filterUniversities,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
};

export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error('useUniversity must be used within a UniversityProvider');
  }
  return context;
};
