import {
  Search,
  ChevronLeft,
  ChevronRight,
  Funnel,
  ChevronDown,
  Edit,
  Trash,
  ArrowRightFromLine,
  EllipsisVertical,
  MapPinned,
  X,
  Check,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import { universityData } from '../../data/universityData';

const sortOptions = [
  { label: 'High to Low Rank', value: 'rank-desc' },
  { label: 'Low to High Rank', value: 'rank-asc' },
  { label: 'A-Z Name', value: 'name-asc' },
  { label: 'Z-A Name', value: 'name-desc' },
];

type FilterKey = 'country' | 'region' | 'type' | 'size' | 'department' | 'search';

const filterFieldMap: Record<'country' | 'region', keyof (typeof universityData)[0]> = {
  country: 'location',
  region: 'region',
};

const UniversityListPage = () => {
  const navigate = useNavigate();

  // State for university data
  const [currentUniversityData, setCurrentUniversityData] = useState(universityData);

  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    country: '',
    region: '',
    type: '',
    size: '',
    department: '',
    search: '',
  });

  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('rank-desc');

  // Multi-select state
  const [selectedUniversities, setSelectedUniversities] = useState(new Set<number>());
  const [selectAll, setSelectAll] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'multiple'>('single');
  const [universityToDelete, setUniversityToDelete] = useState<number | null>(null);

  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const itemsPerPage = 12;

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchInput]);

  // Auto-hide success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleResetFilters = () => {
    setFilters({
      country: '',
      region: '',
      type: '',
      size: '',
      department: '',
      search: '',
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  const handleFilterChange = (field: FilterKey, value: string) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  // Multi-select handlers
  const handleSelectUniversity = (universityId: number) => {
    const newSelected = new Set(selectedUniversities);
    if (newSelected.has(universityId)) {
      newSelected.delete(universityId);
    } else {
      newSelected.add(universityId);
    }
    setSelectedUniversities(newSelected);
    setSelectAll(
      newSelected.size === paginatedUniversities.length && paginatedUniversities.length > 0,
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUniversities(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(paginatedUniversities.map((uni) => uni.id));
      setSelectedUniversities(allIds);
      setSelectAll(true);
    }
  };

  // Delete handlers
  const handleDeleteSingle = (universityId: number) => {
    setUniversityToDelete(universityId);
    setDeleteType('single');
    setShowDeleteConfirm(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedUniversities.size === 0) return;
    setDeleteType('multiple');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    try {
      if (deleteType === 'single' && universityToDelete) {
        // Check if university exists
        const university = currentUniversityData.find((uni) => uni.id === universityToDelete);
        if (!university) {
          throw new Error('University not found');
        }

        // Mock check for existing references
        const hasReferences = Math.random() < 0.1; // 10% chance of having references
        if (hasReferences) {
          throw new Error('Cannot delete university due to existing references.');
        }

        // Delete single university
        setCurrentUniversityData((prev) => prev.filter((uni) => uni.id !== universityToDelete));
        setSuccessMessage('Successfully.');

        // Log for auditing
        console.log(`AUDIT: Deleted university ${university.name} (ID: ${universityToDelete})`);
      } else if (deleteType === 'multiple') {
        // Delete multiple universities
        const universitiesToDelete = currentUniversityData.filter((uni) =>
          selectedUniversities.has(uni.id),
        );

        // Mock check for references
        const hasReferences = Math.random() < 0.1;
        if (hasReferences) {
          throw new Error('Cannot delete university due to existing references.');
        }

        setCurrentUniversityData((prev) => prev.filter((uni) => !selectedUniversities.has(uni.id)));
        setSelectedUniversities(new Set());
        setSelectAll(false);
        setSuccessMessage('Successfully.');

        // Log for auditing
        console.log(
          `AUDIT: Deleted ${universitiesToDelete.length} universities:`,
          universitiesToDelete.map((u) => u.name),
        );
      }

      setShowSuccess(true);
    } catch (error) {
      // Show error message
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(String(error));
      }
    }

    setShowDeleteConfirm(false);
    setUniversityToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUniversityToDelete(null);
  };

  const handleEdit = (universityId: number) => {
    navigate(`/edit-university/${universityId}`);
  };

  const filteredUniversities = currentUniversityData.filter((u) => {
    return (
      (!filters.country || u.location === filters.country) &&
      (!filters.region || u.region === filters.region) &&
      (!filters.department || u.department === filters.department) &&
      (!filters.type ||
        (filters.type === 'Public' || filters.type === 'Private'
          ? u.status === filters.type
          : u.type === filters.type)) &&
      (!filters.size || u.size === filters.size) &&
      (!filters.search || u.name.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (sortBy) {
      case 'rank-asc':
        return b.rank - a.rank;
      case 'rank-desc':
        return a.rank - b.rank;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedUniversities.length / itemsPerPage);
  const paginatedUniversities = sortedUniversities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getDeleteConfirmationMessage = () => {
    if (deleteType === 'single' && universityToDelete) {
      const university = currentUniversityData.find((uni) => uni.id === universityToDelete);
      return `Are you sure delete ${university?.name}?`;
    } else if (deleteType === 'multiple') {
      return 'Are you sure delete all selected fields?';
    }
    return '';
  };

  return (
    <div className='flex bg-[#FFFDF9] min-h-screen'>
      <Sidebar
        activeTab='manage-university'
        setActiveTab={() => {
          // Intentionally left empty
        }}
      />

      {/* Main content with proper left margin to account for sidebar */}
      <main className='flex-1 lg:ml-64 p-4 sm:p-6 flex flex-col space-y-4 max-w-none'>
        {/* Success Message */}
        {showSuccess && (
          <div className='fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2'>
            <Check className='w-5 h-5 text-green-600' />
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccess(false)}
              className='ml-2 text-green-600 hover:text-green-800'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center'>
                  <span className='text-yellow-600 text-xl'>!</span>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>Confirm Delete</h3>
              </div>
              <p className='text-gray-600 mb-6'>{getDeleteConfirmationMessage()}</p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={cancelDelete}
                  className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
                >
                  No
                </button>
                <button
                  onClick={confirmDelete}
                  className='px-4 py-2 bg-blue-600 hover:bg-orange-700 text-white rounded-md transition-colors'
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className='w-full relative max-w-2xl mx-auto'>
          <Search className='absolute top-2.5 left-3 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Search for universities...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-[#FFF4E9] rounded-md border border-orange-200 focus:outline-none'
          />
        </div>

        {/* Header Controls */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full'>
          <div className='text-sm text-gray-600 whitespace-nowrap'>
            <span className='font-medium'>Result:</span> {filteredUniversities.length} Universities
            Found
          </div>

          <div className='flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 w-full'>
            {/* Filter and Sort Controls */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className='flex items-center justify-center text-white bg-orange-400 hover:bg-orange-300 rounded-md p-2 border-0'
                aria-label={showFilter ? 'Hide Filters' : 'Show Filters'}
                title={showFilter ? 'Hide Filters' : 'Show Filters'}
              >
                <Funnel className='w-5 h-5' />
              </button>
              <div className='relative w-full sm:w-[240px]'>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='appearance-none w-full pl-3 pr-8 py-2 text-sm bg-white text-black rounded-md border border-orange-300 cursor-pointer'
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className='absolute right-2 top-2.5 text-orange-600 w-4 h-4 pointer-events-none' />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
              {selectedUniversities.size > 0 && (
                <button
                  onClick={handleDeleteMultiple}
                  className='bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md shadow whitespace-nowrap flex items-center gap-2 border-0'
                >
                  <Trash className='w-4 h-4' />
                  Delete Selected ({selectedUniversities.size})
                </button>
              )}
              <button
                onClick={() => navigate('/create-university')}
                className='bg-orange-500 hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-md shadow whitespace-nowrap border-0 w-full sm:w-auto'
              >
                + Create
              </button>
              <button className='bg-orange-500 hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-md shadow whitespace-nowrap flex items-center gap-2 border-0 w-full sm:w-auto justify-center'>
                <ArrowRightFromLine className='w-4 h-4' />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className='flex flex-col lg:flex-row relative gap-6'>
          <div className='flex-1 overflow-x-auto'>
            <div className='bg-white rounded-md shadow-sm border w-full overflow-auto'>
              <table className='w-full text-sm min-w-[640px]'>
                <thead className='bg-gray-50 text-left text-gray-500 text-xs'>
                  <tr>
                    <th className='p-4 w-12'>
                      <input
                        type='checkbox'
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className='accent-orange-500 w-4 h-4'
                      />
                    </th>
                    <th className='p-4'>Name</th>
                    <th className='p-4'>Ranking</th>
                    <th className='p-4'>Country</th>
                    <th className='p-4'>Main Fields</th>
                    <th className='p-4'>Size</th>
                    <th className='p-4 text-center'>
                      <EllipsisVertical className='mx-auto w-5 h-5 text-gray-500' />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUniversities.map((uni) => (
                    <tr key={uni.id} className='hover:bg-gray-50 border-b'>
                      <td className='p-4'>
                        <input
                          type='checkbox'
                          checked={selectedUniversities.has(uni.id)}
                          onChange={() => handleSelectUniversity(uni.id)}
                          className='accent-orange-500 w-4 h-4'
                        />
                      </td>
                      <td className='p-4 text-gray-700'>{uni.name}</td>
                      <td className='p-4 font-medium text-gray-900'>{uni.rank}</td>
                      <td className='p-4 text-gray-500'>{uni.location}</td>
                      <td className='p-4 text-gray-500'>{uni.department}</td>
                      <td className='p-4 text-gray-500'>{uni.size}</td>
                      <td className='p-4'>
                        <div className='flex items-center justify-center gap-7'>
                          <button
                            onClick={() => handleEdit(uni.id)}
                            className='text-orange-500 hover:text-orange-700 transition-colors bg-transparent border-none p-1'
                          >
                            <Edit className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(uni.id)}
                            className='text-orange-500 hover:text-red-600 transition-colors bg-transparent border-none p-1'
                          >
                            <Trash className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-center gap-4 text-sm mt-4 flex-wrap'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='flex items-center space-x-1 text-orange-400 hover:text-orange-400 disabled:opacity-50 bg-transparent border-0'
              >
                <ChevronLeft className='w-4 h-4' />
                <span>Previous</span>
              </button>

              <div className='flex flex-wrap justify-center gap-1'>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded ${
                      currentPage === idx + 1
                        ? 'bg-orange-400 text-white'
                        : 'bg-white border text-gray-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className='flex items-center space-x-1 text-orange-400 hover:text-orange-400 disabled:opacity-50 bg-transparent border-0'
              >
                <span>Next</span>
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Filters (Right Sidebar) */}
          {showFilter && (
            <div className='w-full lg:max-w-sm pt-4 pb-1 px-4 bg-white rounded-xl shadow border text-sm relative space-y-4 max-h-screen overflow-y-auto'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-orange-500 font-semibold text-base'>Filter</span>
                <button
                  onClick={handleResetFilters}
                  className='text-gray-400 hover:text-gray-600 text-sm font-medium underline'
                >
                  Reset filter
                </button>
              </div>

              {(['country', 'region'] as const).map((field) => {
                const dataKey = filterFieldMap[field];
                return (
                  <div key={field} className='border border-gray-300 rounded-md p-4 bg-white'>
                    <label className='block text-base font-bold text-gray-800 mb-3'>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <div className='relative'>
                      <span className='absolute inset-y-0 left-3 flex items-center text-gray-400'>
                        <MapPinned className='w-4 h-4' />
                      </span>
                      <select
                        value={filters[field]}
                        onChange={(e) => handleFilterChange(field, e.target.value)}
                        className='w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none'
                      >
                        <option value=''>Select...</option>
                        {[...new Set(currentUniversityData.map((u) => u[dataKey]))]
                          .filter(Boolean)
                          .map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none' />
                    </div>
                  </div>
                );
              })}

              <div className='border border-gray-300 rounded-md p-4 bg-white'>
                <label
                  htmlFor='university-type-all'
                  className='block text-base font-bold text-gray-800 mb-3'
                >
                  University Type
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {['Public', 'Private', 'Academy', 'International'].map((type) => (
                    <label
                      key={type}
                      htmlFor={`university-type-${type.toLowerCase()}`}
                      className={`flex items-center gap-2 text-sm cursor-pointer ${
                        filters.type === type ? 'text-orange-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <input
                        id={`university-type-${type.toLowerCase()}`}
                        type='radio'
                        name='type'
                        value={type}
                        checked={filters.type === type}
                        onChange={() => handleFilterChange('type', type)}
                        className='accent-orange-500'
                      />
                      {type}
                    </label>
                  ))}
                  {/* Add "All" option to clear the filter */}
                  <label
                    htmlFor='university-type-all'
                    className={`flex items-center gap-2 text-sm cursor-pointer ${
                      filters.type === '' ? 'text-orange-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <input
                      id='university-type-all'
                      type='radio'
                      name='type'
                      value=''
                      checked={filters.type === ''}
                      onChange={() => handleFilterChange('type', '')}
                      className='accent-orange-500'
                    />
                    All
                  </label>
                </div>
              </div>

              <div className='border border-gray-300 rounded-md p-4 bg-white'>
                <label
                  htmlFor='size-small'
                  className='block text-base font-bold text-gray-800 mb-3'
                >
                  Size
                </label>
                <div className='grid grid-cols-4 gap-3'>
                  {[
                    { label: 'S', value: 'Small' },
                    { label: 'M', value: 'Medium' },
                    { label: 'L', value: 'Large' },
                    { label: 'XL', value: 'XL' },
                  ].map(({ label, value }, idx) => (
                    <label
                      key={value}
                      htmlFor={`size-${value.toLowerCase()}`}
                      className={`flex items-center gap-2 text-sm cursor-pointer ${
                        filters.size === value ? 'text-orange-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <input
                        id={`size-${value.toLowerCase()}`}
                        type='radio'
                        name='size'
                        value={value}
                        checked={filters.size === value}
                        onChange={() => handleFilterChange('size', value)}
                        className='accent-orange-500'
                      />
                      {label}
                    </label>
                  ))}
                  {/* Add "All" option to clear the filter */}
                  <label
                    htmlFor='size-all'
                    className={`flex items-center gap-2 text-sm cursor-pointer ${
                      filters.size === '' ? 'text-orange-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <input
                      id='size-all'
                      type='radio'
                      name='size'
                      value=''
                      checked={filters.size === ''}
                      onChange={() => handleFilterChange('size', '')}
                      className='accent-orange-500'
                    />
                    All
                  </label>
                </div>
              </div>

              <div className='border border-gray-300 rounded-md p-4 bg-white'>
                <label
                  htmlFor='department-select'
                  className='block text-base font-bold text-gray-800 mb-3'
                >
                  Fields
                </label>
                <div className='relative'>
                  <select
                    id='department-select'
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none'
                  >
                    <option value=''>Select...</option>
                    {[...new Set(currentUniversityData.map((u) => u.department))]
                      .filter(Boolean)
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none' />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UniversityListPage;
