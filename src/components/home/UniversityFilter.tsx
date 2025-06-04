import { Search, SlidersHorizontal } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { University, useUniversity } from '../molecules/mockdata/UniversityContext';

const UniversityFilter = () => {
  const {
    universities: allUniversities,
    filterUniversities: contextFilterUniversities,
    loading,
    error,
  } = useUniversity();

  const [filters, setFilters] = useState({
    country: '',
    region: '',
    type: '',
    size: '',
    fields: '',
    searchQuery: '',
    sortBy: 'low-to-high',
  });

  const [filteredUniversities, setFilteredUniversities] = useState<University[]>(
    [...allUniversities].sort((a, b) => a.ranking - b.ranking),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const universitiesPerPage = 12;

  const countries = [...new Set(allUniversities.map((uni) => uni.country))];
  const regions = [...new Set(allUniversities.map((uni) => uni.region))];
  const types = [...new Set(allUniversities.map((uni) => uni.type))];
  const sizes = [...new Set(allUniversities.map((uni) => uni.size))];
  const fields = [...new Set(allUniversities.flatMap((uni) => uni.fields))];

  useEffect(() => {
    const filtered = contextFilterUniversities(filters);

    filtered.sort((a, b) => {
      if (filters.sortBy === 'high-to-low') {
        return b.ranking - a.ranking;
      } else {
        return a.ranking - b.ranking;
      }
    });

    setFilteredUniversities(filtered);
    setCurrentPage(1);
  }, [filters, allUniversities, contextFilterUniversities]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      country: '',
      region: '',
      type: '',
      size: '',
      fields: '',
      searchQuery: '',
      sortBy: 'low-to-high',
    });
  };

  const indexOfLastUniversity = currentPage * universitiesPerPage;
  const indexOfFirstUniversity = indexOfLastUniversity - universitiesPerPage;
  const currentUniversities = filteredUniversities.slice(
    indexOfFirstUniversity,
    indexOfLastUniversity,
  );
  const totalPages = Math.ceil(filteredUniversities.length / universitiesPerPage);

  if (loading) return <div>Loading universities...</div>;
  if (error) return <div>Error loading universities: {error}</div>;

  return (
    <div className='flex flex-col md:flex-row gap-4 items-start max-w-7xl mx-auto px-4 py-8'>
      <div className='w-full md:w-64 bg-white rounded-lg shadow p-4'>
        <div className='flex justify-between items-center mb-6'>
          <span className='text-orange-500 font-medium'>Filter</span>
          <button className='text-blue-600 text-sm' onClick={resetFilters}>
            Reset filter
          </button>
        </div>

        <div className='space-y-6'>
          <div>
            <h3 className='font-medium mb-2'>Country</h3>
            <div className='relative'>
              <select
                className='w-full p-2 border rounded-lg appearance-none bg-white pr-8'
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value=''>Select...</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Region</h3>
            <div className='relative'>
              <select
                className='w-full p-2 border rounded-lg appearance-none bg-white pr-8'
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value=''>Select...</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>University Type</h3>
            <div className='grid grid-cols-2 gap-2'>
              {types.map((type) => (
                <label key={type} className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='type'
                    className='text-orange-500'
                    checked={filters.type === type}
                    onChange={() => handleFilterChange('type', type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Size</h3>
            <div className='flex space-x-4'>
              {sizes.map((size) => (
                <label key={size} className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='size'
                    className='text-orange-500'
                    checked={filters.size === size}
                    onChange={() => handleFilterChange('size', size)}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Fields</h3>
            <div className='relative'>
              <select
                className='w-full p-2 border rounded-lg appearance-none bg-white pr-8'
                value={filters.fields}
                onChange={(e) => handleFilterChange('fields', e.target.value)}
              >
                <option value=''>Select...</option>
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1'>
        <div className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Search'
              className='w-full pl-10 pr-4 py-2 border rounded-lg'
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          </div>
          <div className='flex items-center gap-4'>
            <button className='p-2 bg-orange-500 rounded-lg'>
              <SlidersHorizontal className='w-5 h-5 text-white' />
            </button>
            <select
              className='p-2 border rounded-lg pr-8 appearance-none'
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value='high-to-low'>Sort by: high to low</option>
              <option value='low-to-high'>Sort by: low to high</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {currentUniversities.map((university) => (
            <UniversityCard key={university.id} university={university} />
          ))}
        </div>

        <div className='flex justify-center mt-8 gap-2'>
          <button
            className='text-orange-500'
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`w-8 h-8 rounded-full ${
                page === currentPage ? 'bg-orange-500 text-white' : 'text-gray-500'
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className='text-orange-500'
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const UniversityCard = ({ university }: { university: University }) => (
  <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow'>
    <div className='flex items-start justify-between mb-4'>
      <div>
        <h3 className='text-blue-700 font-medium mb-1'>{university.name}</h3>
        <div className='flex items-center text-orange-500'>
          <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
              clipRule='evenodd'
            />
          </svg>
          <span className='text-sm'>{university.country}</span>
        </div>
      </div>
      <img
        src={university.logo}
        alt={`${university.name} logo`}
        className='w-12 h-12 rounded-lg object-cover'
      />
    </div>
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-2'>
        <div className='w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs'>
          {university.ranking}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <svg className='w-5 h-5 text-blue-600' viewBox='0 0 20 20' fill='currentColor'>
          <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
        </svg>
        <span className='text-blue-600'>{university.type}</span>
      </div>
      <div className='flex items-center gap-2'>
        <svg className='w-5 h-5 text-blue-600' viewBox='0 0 20 20' fill='currentColor'>
          <path
            fillRule='evenodd'
            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
            clipRule='evenodd'
          />
        </svg>
        <span className='text-blue-600'>{university.size}</span>
      </div>
    </div>
  </div>
);

export default UniversityFilter;
