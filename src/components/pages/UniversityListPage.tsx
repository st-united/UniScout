import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUniversity, University } from '../contexts/UniversityContext';
import SearchBar from '../../components/universities/SearchBar';
import FilterPanel from '../../components/universities/FilterPanel';
import UniversityCard from '../../components/universities/UniversityCard';
import Loading from '../../components/common/Loading';

interface FilterOptions {
  region?: string;
  fields?: string[];
  rating?: number;
  ranking?: number;
}

const UniversityListPage = () => {
  const location = useLocation();
  const { universities, loading, searchUniversities, filterUniversities } = useUniversity();
  
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('ranking');
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const results = searchUniversities(query);
    setFilteredUniversities(results);
  }, [searchUniversities]);
  
  // Get search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    setSearchQuery(query);
    
    if (query) {
      handleSearch(query);
    } else {
      setFilteredUniversities(universities);
    }
  }, [location.search, universities, handleSearch]);
  
  const handleApplyFilters = (filters: FilterOptions) => {
    // First apply search if there's a query
    // const searchResults = searchQuery ? searchUniversities(searchQuery) : universities;
    // Then apply filters
    const results = filterUniversities(filters);
    setFilteredUniversities(results);
  };
  
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value;
    setSortOption(option);
    
    const sorted = [...filteredUniversities].sort((a, b) => {
      if (option === 'ranking') {
        return a.ranking - b.ranking;
      } else if (option === 'ranking-desc') {
        return b.ranking - a.ranking;
      } else if (option === 'name') {
        return a.name.localeCompare(b.name);
      } else if (option === 'name-desc') {
        return b.name.localeCompare(a.name);
      } else if (option === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
    
    setFilteredUniversities(sorted);
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-secondary mb-6">Universities</h1>
        
        <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between">
          <FilterPanel onApplyFilters={handleApplyFilters} />
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={handleSort}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="ranking">Rank (Low to High)</option>
                <option value="ranking-desc">Rank (High to Low)</option>
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rating">Rating (High to Low)</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-600 mb-4">
            <strong>Result:</strong> {filteredUniversities.length} {filteredUniversities.length === 1 ? 'University' : 'Universities'} Found
          </p>
          
          {filteredUniversities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map((university) => (
                <UniversityCard 
                  key={university.id} 
                  university={university}
                  // index={index} // Remove unused prop
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl font-medium text-gray-600">No universities found matching your criteria</p>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilteredUniversities(universities);
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UniversityListPage;