import { Input } from 'antd';
import { Search, RotateCcw, ArrowUpDown, Filter, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface FilterOptions {
  search: string;
  country: string;
  type: string;
  size: string;
  field: string;
  sortOrder: 'asc' | 'desc';
}

interface UniversityFilterProps {
  onFiltersUpdate: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
  availableCountries: string[];
  availableFields: string[];
}

const FIELD_NAME_TO_API_KEY: Record<string, string> = {
  'Agriculture & Food Science': 'agriculturalFoodScience',
  'Arts & Design': 'artsDesign',
  'Economics, Business & Management': 'economicsBusinessManagement',
  'Computer Science': 'technology',
  'Science & Engineering': 'scienceEngineering',
  'Law & Political Science': 'lawPoliticalScience',
  'Medicine, Pharmacy & Health Sciences': 'medicinePharmacyHealthSciences',
  'Social Sciences': 'socialSciencesHumanities',
  'Sports & Physical Education': 'sportsPhysicalEducation',
  Others: 'others',
};

const UniversityFilter = ({
  onFiltersUpdate,
  initialFilters,
  availableCountries,
  availableFields,
}: UniversityFilterProps) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
      setFilters(initialFilters);
    }
  }, [JSON.stringify(initialFilters)]);

  useEffect(() => {
    onFiltersUpdate(filters);
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
    <div
      className='lg:w-80 w-full lg:sticky lg:top-6 self-start'
      style={{ position: 'sticky', top: '90px', zIndex: 10 }}
    >
      <div className='lg:hidden flex justify-between items-center mb-4'>
        <button
          className='flex items-center gap-2 text-orange-500 font-semibold'
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <Filter className='w-5 h-5' />
          {isMobileOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div
        className={`border border-gray-200 bg-white rounded-xl p-4 space-y-6 shadow-sm transition-all duration-300 w-[320px] ${
          isMobileOpen ? 'block' : 'hidden'
        } lg:block`}
      >
        <Input
          prefix={<Search className='w-4 h-4 text-gray-400' />}
          allowClear
          type='text'
          placeholder='Search'
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className='w-full pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500'
        />

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
            {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
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
                  {field}
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
