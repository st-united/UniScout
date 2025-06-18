import { Input } from 'antd';
import { Search, RotateCcw, ArrowUp, ArrowDown, Filter, MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export interface FilterOptions {
  search: string;
  country: string[];
  type: string[];
  size: string[];
  field: string[];
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
  'Law & Political Science': 'lawPoliticalScience',
  'Medicine, Pharmacy & Health Sciences': 'medicinePharmacyHealthSciences',
  'Science & Engineering': 'scienceEngineering',
  'Social Sciences & Humanities': 'socialSciencesHumanities',
  'Sports & Physical Education': 'sportsPhysicalEducation',
  'Emerging Technologies & Interdisciplinary Studies': 'technology',
  Other: 'others',
};

const FIELD_DISPLAY_NAMES = [
  'Agriculture & Food Science',
  'Arts & Design',
  'Economics, Business & Management',
  'Law & Political Science',
  'Medicine, Pharmacy & Health Sciences',
  'Science & Engineering',
  'Social Sciences & Humanities',
  'Sports & Physical Education',
  'Emerging Technologies & Interdisciplinary Studies',
  'Other',
];

const UniversityFilter = ({
  onFiltersUpdate,
  initialFilters,
  availableCountries,
  availableFields,
}: UniversityFilterProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    ...initialFilters,
    country: Array.isArray(initialFilters.country) ? initialFilters.country : [],
    field: Array.isArray(initialFilters.field) ? initialFilters.field : [],
    type: Array.isArray(initialFilters.type) ? initialFilters.type : [],
    size: Array.isArray(initialFilters.size) ? initialFilters.size : [],
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const fieldDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure filters.country and filters.field are always arrays
    const newInitialFilters = {
      ...initialFilters,
      country: Array.isArray(initialFilters.country) ? initialFilters.country : [],
      field: Array.isArray(initialFilters.field) ? initialFilters.field : [],
    };
    if (JSON.stringify(filters) !== JSON.stringify(newInitialFilters)) {
      setFilters(newInitialFilters);
    }
  }, [JSON.stringify(initialFilters)]);

  useEffect(() => {
    onFiltersUpdate(filters);
  }, [filters]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (fieldDropdownRef.current && !fieldDropdownRef.current.contains(event.target as Node)) {
        setIsFieldDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCountryChange = (countryName: string) => {
    setFilters((prev) => {
      const currentCountries = prev.country || [];
      if (currentCountries.includes(countryName)) {
        return {
          ...prev,
          country: currentCountries.filter((c) => c !== countryName),
        };
      } else {
        return {
          ...prev,
          country: [...currentCountries, countryName],
        };
      }
    });
  };

  const handleFieldChange = (fieldName: string) => {
    setFilters((prev) => {
      const currentFields = prev.field || [];
      if (currentFields.includes(fieldName)) {
        return {
          ...prev,
          field: currentFields.filter((f) => f !== fieldName),
        };
      } else {
        return {
          ...prev,
          field: [...currentFields, fieldName],
        };
      }
    });
  };

  const handleReset = () => {
    const resetValues: FilterOptions = {
      search: '',
      country: [],
      type: [],
      size: [],
      field: [],
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
          className='w-full pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 bg-transparent'
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
            {filters.sortOrder === 'asc' ? (
              <ArrowUp
                className='w-4 h-4 text-black cursor-pointer hover:text-orange-500'
                onClick={toggleSortOrder}
              />
            ) : (
              <ArrowDown
                className='w-4 h-4 text-black cursor-pointer hover:text-orange-500'
                onClick={toggleSortOrder}
              />
            )}
          </div>
        </div>

        {/* Country Multi-select */}
        <div className='rounded-lg p-4 shadow-sm' ref={countryDropdownRef}>
          <h3 className='text-base font-semibold mb-3'>Country</h3>
          <button
            type='button'
            className='relative w-full rounded-lg bg-white text-sm focus:outline-none cursor-pointer p-2 flex items-center justify-between'
            onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
          >
            <div className='flex items-center'>
              <MapPin className='w-4 h-4 text-gray-500 mr-2' />
              <span>
                {filters.country.length === 0
                  ? 'All Countries'
                  : filters.country.length === 1
                  ? filters.country[0]
                  : `${filters.country.length} selected`}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                isCountryDropdownOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          {isCountryDropdownOpen && (
            <div className='absolute bg-white rounded-lg mt-2 py-2 w-full max-h-60 overflow-y-auto z-10 shadow-lg left-0'>
              <label className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.country.length === availableCountries.length}
                  onChange={() => {
                    if (filters.country.length === availableCountries.length) {
                      handleFilterChange('country', []);
                    } else {
                      handleFilterChange('country', availableCountries);
                    }
                  }}
                  className='accent-orange-500'
                />
                <span className='text-sm font-semibold'>Select All</span>
              </label>
              {availableCountries.map((countryName) => (
                <label
                  key={countryName}
                  className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    value={countryName}
                    checked={filters.country.includes(countryName)}
                    onChange={() => handleCountryChange(countryName)}
                    className='accent-orange-500'
                  />
                  <span className='text-sm'>{countryName}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* University Type */}
        <div className='border border-gray-200 bg-white rounded-lg p-4 shadow-sm'>
          <h3 className='text-base font-semibold mb-3'>University Type</h3>
          <div className='grid grid-cols-2 gap-3'>
            {['Public', 'Private', 'Academic', 'College', 'International'].map((type) => (
              <label key={type} className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  value={type.toLowerCase()}
                  checked={filters.type.includes(type.toLowerCase())}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.type, type.toLowerCase()]
                      : filters.type.filter((t) => t !== type.toLowerCase());
                    handleFilterChange('type', newTypes);
                  }}
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
                  type='checkbox'
                  value={size.toLowerCase()}
                  checked={filters.size.includes(size.toLowerCase())}
                  onChange={(e) => {
                    const newSizes = e.target.checked
                      ? [...filters.size, size.toLowerCase()]
                      : filters.size.filter((s) => s !== size.toLowerCase());
                    handleFilterChange('size', newSizes);
                  }}
                  className='accent-orange-500'
                />
                <span className='text-sm'>{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fields Multi-select */}
        <div className='rounded-lg p-4 shadow-sm' ref={fieldDropdownRef}>
          <h3 className='text-base font-semibold mb-3'>Field of Study</h3>
          <button
            type='button'
            className='relative w-full rounded-lg bg-white text-sm focus:outline-none cursor-pointer p-2 flex items-center justify-between'
            onClick={() => setIsFieldDropdownOpen((prev) => !prev)}
          >
            <div className='flex items-center'>
              <MapPin className='w-4 h-4 text-gray-500 mr-2' />
              <span>
                {filters.field.length === 0
                  ? 'All Fields'
                  : filters.field.length === 1
                  ? filters.field[0]
                  : `${filters.field.length} selected`}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transform transition-transform ${
                isFieldDropdownOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          {isFieldDropdownOpen && (
            <div className='absolute bg-white rounded-lg mt-2 py-2 w-full max-h-60 overflow-y-auto z-10 shadow-lg left-0'>
              <label className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={filters.field.length === FIELD_DISPLAY_NAMES.length}
                  onChange={() => {
                    if (filters.field.length === FIELD_DISPLAY_NAMES.length) {
                      handleFilterChange('field', []);
                    } else {
                      handleFilterChange('field', FIELD_DISPLAY_NAMES);
                    }
                  }}
                  className='accent-orange-500'
                />
                <span className='text-sm font-semibold'>Select All</span>
              </label>
              {FIELD_DISPLAY_NAMES.map((fieldName) => (
                <label
                  key={fieldName}
                  className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    value={fieldName}
                    checked={filters.field.includes(fieldName)}
                    onChange={() => handleFieldChange(fieldName)}
                    className='accent-orange-500'
                  />
                  <span className='text-sm'>{fieldName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityFilter;
