// src/components/universityfilter.tsx

import { Search, RotateCcw, ArrowUpDown, Filter, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Keep these interfaces as they are
export interface University {
  id: string;
  name: string;
  logo: string;
  country: string;
  region: string;
  ranking: number;
  size: string;
  type: string;
  fields: string[];
  description: string;
  website: string;
  partnerships: number;
  students: number;
  location: { lat: number; lng: number };
  rating: number;
}

export interface FilterOptions {
  search: string;
  country: string;
  type: string;
  size: string;
  field: string;
  sortOrder: 'asc' | 'desc';
}

// UPDATED PROPS: Receives filter options directly from parent.
interface UniversityFilterProps {
  onFiltersUpdate: (filters: FilterOptions) => void;
  initialFilters: FilterOptions; // To sync initial state from parent
  availableCountries: string[];
  availableFields: string[];
  // Assuming 'types' and 'sizes' are fixed/hardcoded as per your current code.
  // If they become dynamic, pass them similarly.
}

const FIELD_NAME_TO_API_KEY: Record<string, string> = {
  'Agricultural Science': 'agriculturalFoodScience',
  Arts: 'artsDesign',
  Business: 'economicsBusinessManagement',
  Engineering: 'engineering',
  Law: 'lawPoliticalScience',
  Medicine: 'medicinePharmacyHealthSciences',
  'Social Sciences': 'socialSciencesHumanities',
  Sports: 'sportsPhysicalEducation',
  'Computer Science': 'technology',
  Theology: 'theology',
};

const UniversityFilter: React.FC<UniversityFilterProps> = ({
  onFiltersUpdate,
  initialFilters,
  availableCountries,
  availableFields,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // **IMPORTANT**: No API calls here. The useEffect for availableCountries/Fields
  // has been removed as they are now passed as props.

  // Effect to sync internal filters state with parent's initialFilters prop
  // This ensures that when the parent resets filters, the child also updates.
  useEffect(() => {
    // Only update if the incoming initialFilters are actually different from current internal filters
    if (JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
      setFilters(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)]);

  // Effect to inform parent about local filter changes
  useEffect(() => {
    onFiltersUpdate(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const resetValues: FilterOptions = {
      search: '',
      country: '',
      type: '',
      size: '',
      field: '',
      sortOrder: 'asc',
    };
    setFilters(resetValues);
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
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
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
            <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none'
            >
              <option value=''>All Countries</option>
              {/* Use availableCountries from props */}
              {availableCountries.map((country) => (
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
            {['Public', 'Private'].map((type) => (
              <label key={type} className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='universityType'
                  value={type.toLowerCase()}
                  checked={filters.type === type.toLowerCase()}
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
          <div className='grid grid-cols-2 gap-3'>
            {['Small', 'Medium', 'Large', 'Mega Large'].map((size) => (
              <label key={size} className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='universitySize'
                  value={size.toLowerCase()}
                  checked={filters.size === size.toLowerCase()}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className='accent-orange-500'
                />
                <span className='text-sm'>{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className='border border-gray-200 bg-white rounded-lg p-4 shadow-sm'>
          <h3 className='text-base font-semibold mb-3'>Field of Study</h3>
          <div className='relative'>
            <select
              value={filters.field}
              onChange={(e) => handleFilterChange('field', e.target.value)}
              className='w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none'
            >
              <option value=''>Select...</option>
              {/* Use availableFields from props */}
              {availableFields.map((field) => (
                <option key={field} value={field}>
                  {field === 'Medicine'
                    ? 'Medicine, Pharmacy & Health Sciences'
                    : field === 'Engineering'
                    ? 'Science & Engineering'
                    : field === 'Business'
                    ? 'Economics, Business & Management'
                    : field === 'Arts'
                    ? 'Arts & Design'
                    : field === 'Law'
                    ? 'Law & Political Science'
                    : field === 'Agricultural Science'
                    ? 'Agriculture & Food Science'
                    : field === 'Sports'
                    ? 'Sports & Physical Education'
                    : field}
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
      </div>
    </div>
  );
};

export default UniversityFilter;
