import { DownOutlined } from '@ant-design/icons';
import { Input, Tooltip, TreeSelect, ConfigProvider, Empty } from 'antd';
import axios from 'axios';
import { Filter, MapPin, ChevronDown, BookOpenText, Search } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

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
  'Natural Sciences': 'natural_sciences',
  'Engineering & Technology': 'engineering_technology',
  'Information & Communication Technologies': 'ict',
  'Business Managment & Law': 'business_management_law',
  'Social & Behavioral Sciences': 'medicinePharmacyHealthSciences',
  'Humanities & Languages': 'humanities_languages',
  'Education & Training': 'education_training',
  'Arts & Design': 'arts_design',
  'Health & Medicine': 'health_medicine',
  'Agriculture & Veterinary Sciences': 'agricultural_veterinary_sciences',
  Services: 'services',
  'Transport, Safety & Security, Military': 'transport_safety_security_military',
};

const FIELD_DISPLAY_NAMES = [
  { title: 'Natural Sciences', value: 'natural_sciences', id: '9' },
  { title: 'Engineering & Technology', value: 'engineering_technology', id: '5' },
  { title: 'Information & Communication Technologies', value: 'ict', id: '8' },
  { title: 'Business Managment & Law', value: 'business_management_law', id: '3' },
  { title: 'Social & Behavioral Sciences', value: 'social_behavioral_sciences', id: '10' },
  { title: 'Humanities & Languages', value: 'humanities_languages', id: '7' },
  { title: 'Education & Training', value: 'education_training', id: '4' },
  { title: 'Arts & Design', value: 'arts_design', id: '2' },
  { title: 'Health & Medicine', value: 'health_medicine', id: '6' },
  {
    title: 'Agriculture & Veterinary Sciences',
    value: 'agricultural_veterinary_sciences',
    id: '1',
  },
  { title: 'Services', value: 'services', id: '11' },
  {
    title: 'Transport, Safety & Security, Military',
    value: 'transport_safety_security_military',
    id: '12',
  },
];

// Extend the type for treeData items to include optional children
interface TreeNode {
  title: string;
  value: string;
  key: string;
  isLeaf: boolean;
  children?: TreeNode[];
}

// Remove initialTreeData, will fetch subjects from API

//const MAX_COUNT = 1000;

// Add a utility function to highlight text progressively
const highlightTextProgressively = (text: string, searchTerm: string) => {
  if (!searchTerm || !text) return text;

  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();

  // Find all positions where the search term appears
  const positions: number[] = [];
  let pos = 0;
  while ((pos = lowerText.indexOf(lowerSearchTerm, pos)) !== -1) {
    positions.push(pos);
    pos += 1;
  }

  if (positions.length === 0) return text;

  // Create highlighted text
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  positions.forEach((startPos, index) => {
    // Add text before the match
    if (startPos > lastIndex) {
      result.push(text.slice(lastIndex, startPos));
    }

    // Add the highlighted match (only the exact search term length)
    result.push(
      <span key={index} className='text-orange-500 font-semibold'>
        {text.slice(startPos, startPos + searchTerm.length)}
      </span>,
    );

    lastIndex = startPos + searchTerm.length;
  });

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
};

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
  const [subjectsSearchTerm, setSubjectsSearchTerm] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const fieldDropdownRef = useRef<HTMLDivElement>(null);
  // Remove initialTreeData, will fetch subjects from API
  const [subjectOptions, setSubjectOptions] = useState<
    { title: string; value: string; key: string }[]
  >([]);

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

  // Fetch all subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/universities/subjects');
        if (Array.isArray(res.data.data)) {
          setSubjectOptions(
            res.data.data.map((subject: any) => ({
              title: subject.name,
              value: subject.name,
              key: subject.id?.toString() || subject.name,
            })),
          );
        }
      } catch (err) {
        setSubjectOptions([]);
      }
    };
    fetchSubjects();
  }, []);

  // Flat subject selection
  const handleSubjectChange = (val: string[]) => {
    handleFilterChange('field', val);
  };

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
    setFilters((prev) => ({
      ...prev,
      country: [],
      type: [],
      size: [],
      field: [],
      sortOrder: 'asc',
    }));
  };

  // Create tree data with highlighted titles
  const treeDataWithHighlighting = subjectOptions.map((subject) => ({
    title: (
      <span className='text-sm'>
        {highlightTextProgressively(subject.title, subjectsSearchTerm)}
      </span>
    ),
    value: subject.value,
    key: subject.key,
    isLeaf: true,
    originalTitle: subject.title, // Store original title for filtering
  }));

  const filteredSubjects = subjectOptions.filter((subject) => {
    if (!subjectsSearchTerm) return true;

    const lowerTitle = subject.title.toLowerCase();
    const lowerSearchTerm = subjectsSearchTerm.toLowerCase();

    // Progressive search: check if the search term appears in sequence
    let searchIndex = 0;
    for (let i = 0; i < lowerTitle.length && searchIndex < lowerSearchTerm.length; i++) {
      if (lowerTitle[i] === lowerSearchTerm[searchIndex]) {
        searchIndex++;
      }
    }

    return searchIndex === lowerSearchTerm.length;
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f97316', // Tailwind orange-500
        },
      }}
    >
      <div
        className='lg:w-80 w-full lg:sticky lg:top-6 self-start'
        style={{ position: 'sticky', top: '90px', zIndex: 10 }}
      >
        <div className='lg:hidden flex justify-between items-center'>
          <button
            className='flex items-center gap-2 text-orange-500 font-semibold bg-transparent border-none shadow-none p-0 hover:bg-transparent focus:bg-transparent'
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
          <div className='flex items-center justify-between'>
            <span className='text-orange-500 font-semibold text-base'>Filter</span>
            <button
              onClick={handleReset}
              className='bg-transparent border-0 text-orange-500 font-semibold text-base cursor-pointer hover:text-orange-700'
            >
              Reset Filter
            </button>
          </div>

          {/* Country Multi-select */}
          <div className='rounded-lg p-4 shadow-sm relative' ref={countryDropdownRef}>
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
              <div className='absolute bg-white rounded-lg mt-2 py-2 w-full max-h-60 overflow-y-auto z-10 shadow-lg'>
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
          <div className='border border-gray-200 bg-white rounded-lg p-4'>
            <h3 className='text-base font-semibold mb-3'>Size</h3>
            <div className='grid grid-cols-2 gap-3'>
              {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => {
                let tooltip = '';
                switch (size) {
                  case 'Small':
                    tooltip = '<20,000';
                    break;
                  case 'Medium':
                    tooltip = '<40,000';
                    break;
                  case 'Large':
                    tooltip = '<100,000';
                    break;
                  case 'Extra Large':
                    tooltip = '>=100,000';
                    break;
                  default:
                    tooltip = '';
                }
                return (
                  <Tooltip
                    key={size}
                    title={tooltip}
                    placement='top'
                    color='#F1F1F1'
                    overlayInnerStyle={{ color: 'black' }}
                  >
                    <label className='flex items-center gap-2'>
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
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Subjects Multi-select */}
          <div className='rounded-lg p-4 shadow-sm'>
            <style>{`
              .subjects-search-input:hover,
              .subjects-search-input:focus {
                border-color: #f97316 !important;
                box-shadow: none !important;
                outline: none !important;
              }
            `}</style>
            <h3 className='text-base font-semibold mb-3'>Subjects</h3>
            <div className='relative'>
              <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search subjects...'
                value={subjectsSearchTerm}
                onChange={(e) => setSubjectsSearchTerm(e.target.value)}
                className='subjects-search-input w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm'
              />
            </div>

            {/* Search results */}
            {subjectsSearchTerm && (
              <div className='mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md'>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <label
                      key={subject.key}
                      className='flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0'
                    >
                      <input
                        type='checkbox'
                        value={subject.value}
                        checked={filters.field.includes(subject.value)}
                        onChange={(e) => {
                          const newFields = e.target.checked
                            ? [...filters.field, subject.value]
                            : filters.field.filter((f) => f !== subject.value);
                          handleFilterChange('field', newFields);
                        }}
                        className='accent-orange-500'
                      />
                      <span className='text-sm'>
                        {highlightTextProgressively(subject.title, subjectsSearchTerm)}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className='px-3 py-2 text-sm text-gray-500'>No matching subjects found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default UniversityFilter;
