import React from 'react';

import { universityData } from '../data/universityData';

interface FilterPanelProps {
  filters: {
    country: string;
    region?: string;
    type: string;
    size?: string;
    department: string;
    search: string;
  };
  setFilters: (filters: any) => void;
  resetFilters: () => void;
}

const UniversityFilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  resetFilters,
}) => {
  const uniqueCountries = [...new Set(universityData.map((u) => u.location))];
  const uniqueDepartments = [...new Set(universityData.map((u) => u.department))];
  const uniqueTypes = [...new Set(universityData.map((u) => u.status))];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='w-64 bg-white border rounded-lg shadow-sm p-4 h-full overflow-y-auto'>
      <h4 className='text-md font-semibold mb-4'>Filter Options</h4>

      <div className='mb-4'>
        <label
          id='country-label'
          htmlFor='country'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Country
        </label>
        <select
          id='country'
          name='country'
          value={filters.country}
          onChange={handleChange}
          className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm'
          aria-labelledby='country-label'
        >
          <option value=''>All</option>
          {uniqueCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className='mb-4'>
        <label
          id='department-label'
          htmlFor='department'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Department
        </label>
        <select
          id='department'
          name='department'
          value={filters.department}
          onChange={handleChange}
          className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm'
          aria-labelledby='department-label'
        >
          <option value=''>All</option>
          {uniqueDepartments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className='mb-4'>
        <label
          id='type-label'
          htmlFor='type'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Type
        </label>
        <select
          id='type'
          name='type'
          value={filters.type}
          onChange={handleChange}
          className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm'
          aria-labelledby='type-label'
        >
          <option value=''>All</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={resetFilters}
        className='w-full bg-gray-100 hover:bg-gray-200 text-sm font-medium py-2 rounded-lg mt-6'
      >
        Reset Filters
      </button>
    </div>
  );
};

export default UniversityFilterPanel;
