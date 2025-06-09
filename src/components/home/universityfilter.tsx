import { Search, RotateCcw, ArrowUpDown, Filter, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { University } from '../data/mockData';

export interface FilterOptions {
  search: string;
  country: string;
  type: string;
  size: string;
  field: string;
  sortOrder: 'asc' | 'desc';
}

interface UniversityFilterProps {
  universities: University[];
  onFilterChange: (filteredUniversities: University[]) => void;
}

const UniversityFilter: React.FC<UniversityFilterProps> = ({ universities, onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    country: '',
    type: '',
    size: '',
    field: '',
    sortOrder: 'asc',
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const countries = Array.from(new Set(universities.map((u) => u.country))).sort();
  const fields = Array.from(new Set(universities.flatMap((u) => u.fields))).sort();

  const filterUniversities = () => {
    return universities
      .filter((university) => {
        const matchesSearch =
          filters.search === '' ||
          university.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          university.country.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCountry = filters.country === '' || university.country === filters.country;
        const matchesType = filters.type === '' || university.type === filters.type;
        const matchesSize = filters.size === '' || university.size === filters.size;
        const matchesField = filters.field === '' || university.fields.includes(filters.field);
        return matchesSearch && matchesCountry && matchesType && matchesSize && matchesField;
      })
      .sort((a, b) =>
        filters.sortOrder === 'asc' ? a.ranking - b.ranking : b.ranking - a.ranking,
      );
  };

  useEffect(() => {
    onFilterChange(filterUniversities());
  }, [filters, universities]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      country: '',
      type: '',
      size: '',
      field: '',
      sortOrder: 'asc',
    });
  };

  const toggleSortOrder = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className='lg:w-80 w-full lg:sticky lg:top-6 self-start'>
      {/* Mobile Toggle */}
      <div className='lg:hidden flex justify-between items-center mb-4'>
        <button
          className='flex items-center gap-2 text-orange-500 font-semibold'
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <Filter className='w-5 h-5' />
          {isMobileOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Outer Filter Box */}
      <div
        className={`border border-gray-200 bg-white rounded-xl p-4 space-y-6 shadow-sm transition-all duration-300 ${
          isMobileOpen ? 'block' : 'hidden'
        } lg:block`}
      >
        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search'
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500'
          />
        </div>

        {/* Filter Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <span className='text-orange-500 font-semibold text-base'>Filter</span>
            <RotateCcw
              className='w-4 h-4 text-black cursor-pointer hover:text-orange-500'
              onClick={handleReset}
            />
          </div>
          <div className='flex items-center gap-1'>
            <span className='text-orange-500 font-semibold text-base'>Sort</span>
            <ArrowUpDown
              className='w-4 h-4 text-black cursor-pointer hover:text-orange-500'
              onClick={toggleSortOrder}
            />
          </div>
        </div>

        {/* Country */}
        <div className='border border-gray-200 bg-white rounded-lg p-4 shadow-sm'>
          <h3 className='text-base font-semibold mb-3'>Country</h3>
          <div className='relative'>
            <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500' />
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none'
            >
              <option value=''>Select...</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
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

        {/* University Type */}
        <div className='border border-gray-200 bg-white rounded-lg p-4 shadow-sm'>
          <h3 className='text-base font-semibold mb-3'>University Type</h3>
          <div className='grid grid-cols-2 gap-3'>
            {['Public', 'Private', 'College', 'Academy', 'International'].map((type) => (
              <label key={type} className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='universityType'
                  value={type}
                  checked={filters.type === type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className='accent-orange-500'
                />
                <span className='text-sm'>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className='border border-gray-200 bg-white rounded-lg p-4 shadow-sm'>
          <h3 className='text-base font-semibold mb-3'>Size</h3>
          <div className='grid grid-cols-4 gap-3'>
            {[
              { label: 'S', value: 'Small' },
              { label: 'M', value: 'Medium' },
              { label: 'L', value: 'Large' },
              { label: 'XL', value: 'XL' },
            ].map(({ label, value }) => (
              <label key={value} className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='universitySize'
                  value={value}
                  checked={filters.size === value}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className='accent-orange-500'
                />
                <span className='text-sm'>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className='border border-gray-200 bg-white rounded-lg p-4 shadow-sm'>
          <h3 className='text-base font-semibold mb-3'>Fields</h3>
          <select
            value={filters.field}
            onChange={(e) => handleFilterChange('field', e.target.value)}
            className='w-full px-4 py-2 border border-gray-100 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
          >
            <option value=''>Select...</option>
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default UniversityFilter;
