import { Pagination, Input, Select, Tag, Button } from 'antd';
import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Chatbot from './Chatbot';
import UniversityCard from './UniversityCard';
import UniversityFilter, { FilterOptions } from './UniversityFilter';
import WorldMap from './Worldmap';
import { countries } from '@app/constants/university';
import { useUniversities } from '@app/hooks/useUniversities';
import { UniversityCustom, RawUniversity } from '@app/interface/university.interface';

const ViewUniversity = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState<number>(18);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    search: '',
    country: [],
    type: [],
    size: [],
    field: [],
    sortOrder: 'asc',
  });
  const [searchInput, setSearchInput] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const cardsRef = useRef<HTMLDivElement>(null);

  // Use React Query hook for universities data
  const {
    data: universitiesData,
    isLoading,
    isFetching,
  } = useUniversities({
    page: currentPage,
    limit,
    search: activeFilters.search,
    country: activeFilters.country,
    type: activeFilters.type,
    size: activeFilters.size,
    field: activeFilters.field,
    sortOrder: activeFilters.sortOrder,
  });

  const universities = universitiesData?.universities || [];
  const total = universitiesData?.totalCount || 0;

  useEffect(() => {
    axios.get('/dashboard/track-access').catch(() => {
      // intentionally ignoring tracking errors
    });
  }, []);

  useEffect(() => {
    const fetchAllFilterOptions = async () => {
      try {
        const res = await axios.get('/universities/academic-fields');

        if (res.data && Array.isArray(res.data.data)) {
          setAvailableFields(res.data.data.sort());
        } else {
          console.error('Unexpected API response shape for academic fields:', res.data);
        }
      } catch (err) {
        console.error('Failed to fetch academic fields:', err);
      }
    };

    fetchAllFilterOptions();
  }, []);

  const handleFiltersUpdate = useCallback((newFilters: FilterOptions) => {
    setActiveFilters(newFilters);

    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }, []);

  const handleMapCountryClick = (country: string) => {
    // Do nothing or just select the country visually, but do not apply filter
  };

  const handleCountryCountClick = (country: string) => {
    setActiveFilters({
      search: '',
      country: [country],
      type: [],
      size: [],
      field: [],
      sortOrder: 'asc',
    });
    setCurrentPage(1);
    setTimeout(() => {
      if (cardsRef.current) {
        cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // wait for UI update
  };

  // Helper to remove a filter chip
  const removeFilter = (key: keyof FilterOptions, value: string) => {
    setActiveFilters((prev) => {
      if (Array.isArray(prev[key])) {
        return { ...prev, [key]: (prev[key] as string[]).filter((v) => v !== value) };
      }
      return prev;
    });
    setCurrentPage(1);
  };

  // Helper to capitalize first letter
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    setSearchInput(activeFilters.search || '');
  }, [activeFilters.search]);

  // On mount, initialize state from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page') || '1', 10);
    const search = params.get('search') || '';
    const country = params.getAll('country');
    const type = params.getAll('type');
    const size = params.getAll('size');
    const field = params.getAll('field');
    const sortOrder = params.get('sortOrder') || 'asc';
    setCurrentPage(page);
    setActiveFilters((prev) => ({
      ...prev,
      search,
      country,
      type,
      size,
      field,
      sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
    }));
  }, []);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    if (activeFilters.search) params.set('search', activeFilters.search);
    activeFilters.country.forEach((c) => params.append('country', c));
    activeFilters.type.forEach((t) => params.append('type', t));
    activeFilters.size.forEach((s) => params.append('size', s));
    activeFilters.field.forEach((f) => params.append('field', f));
    if (activeFilters.sortOrder) params.set('sortOrder', activeFilters.sortOrder);
    navigate({ search: params.toString() }, { replace: true });
  }, [currentPage, activeFilters, navigate]);

  return (
    <div className='min-h-screen w-full px-4 py-6'>
      {/* Orange border for search and sort on hover/focus, no outer ring */}
      <style>{`
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          border-color: #f97316 !important;
          box-shadow: none !important;
        }
        .ant-select-selector:hover,
        .ant-select-focused .ant-select-selector {
          border-color: #f97316 !important;
          box-shadow: none !important;
        }
        /* Orange pagination styles */
        .ant-pagination .ant-pagination-item-active {
          border-color: #f97316 !important;
        }
        .ant-pagination .ant-pagination-item-active a {
          color: #f97316 !important;
        }
        .ant-pagination .ant-pagination-item:hover a {
          color: #f97316 !important;
        }
        .ant-pagination .ant-pagination-item-active {
          background: #fff7ed !important;
        }
        .ant-pagination .ant-pagination-item:hover {
          border-color: #f97316 !important;
        }
        .ant-pagination .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination .ant-pagination-next .ant-pagination-item-link {
          color: #f97316 !important;
          border-color: #f97316 !important;
        }
        .ant-pagination .ant-pagination-prev:hover .ant-pagination-item-link,
        .ant-pagination .ant-pagination-next:hover .ant-pagination-item-link {
          color: #fff !important;
          background: #f97316 !important;
          border-color: #f97316 !important;
        }
      `}</style>
      <WorldMap
        onCountryClick={handleMapCountryClick}
        onCountryCountClick={handleCountryCountClick}
      />
      <h2 className='text-center text-4xl font-bold mt-6 mb-3'>DISCOVER UNIVERSITIES</h2>
      <div className='flex justify-center mt-6'>
        <div className='w-full max-w-screen-xl flex flex-col lg:flex-row'>
          <div className='w-full lg:w-[320px] flex-none'>
            <UniversityFilter
              onFiltersUpdate={handleFiltersUpdate}
              initialFilters={activeFilters}
              availableCountries={countries}
              availableFields={availableFields}
            />
          </div>
          <div ref={cardsRef} className='flex-1 min-h-[700px] relative'>
            {/* Search, filter chips, and sort bar aligned with cards */}
            <div
              className='flex flex-col bg-[#F5F5F5] pt-4 mb-4 pl-2'
              style={{ position: 'sticky', top: '63px', zIndex: 10 }}
            >
              <div className='flex flex-row items-center gap-4 w-full mb-2'>
                {/* Search bar */}
                <Input.Search
                  allowClear
                  placeholder='Search'
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchInput(e.target.value)
                  }
                  onSearch={(value: string) => {
                    handleFiltersUpdate({ ...activeFilters, search: value });
                    setCurrentPage(1);
                  }}
                  enterButton={
                    <Button
                      type='primary'
                      style={{ background: '#EA7A1D', borderColor: '#EA7A1D' }}
                      icon={<Search className='w-4 h-4' />}
                    />
                  }
                  size='large'
                  className='w-full'
                  style={{ flex: 1 }}
                />
                {/* Sort dropdown */}
                <Select
                  value={
                    activeFilters.sortOrder === 'asc'
                      ? 'Sort by: low to high'
                      : 'Sort by: high to low'
                  }
                  onChange={(val: string) =>
                    handleFiltersUpdate({
                      ...activeFilters,
                      sortOrder: val === 'Sort by: low to high' ? 'asc' : 'desc',
                    })
                  }
                  className='min-w-[120px] min-h-[40px] '
                  options={[
                    { value: 'Sort by: high to low', label: 'Sort by: high to low' },
                    { value: 'Sort by: low to high', label: 'Sort by: low to high' },
                  ]}
                />
              </div>
              {/* Filter chips */}
              <div className='flex flex-wrap gap-2 pb-2'>
                {activeFilters.country.map((c) => (
                  <Tag
                    key={c}
                    closable
                    onClose={() => removeFilter('country', c)}
                    style={{ background: '#FEF7E6', color: '#FF923E', border: '1px solid #FF923E' }}
                    className='px-3 py-1 rounded-full text-sm'
                  >
                    {capitalize(c)}
                  </Tag>
                ))}
                {activeFilters.type.map((t) => (
                  <Tag
                    key={t}
                    closable
                    onClose={() => removeFilter('type', t)}
                    style={{ background: '#FEF7E6', color: '#FF923E', border: '1px solid #FF923E' }}
                    className='px-3 py-1 rounded-full text-sm'
                  >
                    {capitalize(t)}
                  </Tag>
                ))}
                {activeFilters.size.map((s) => (
                  <Tag
                    key={s}
                    closable
                    onClose={() => removeFilter('size', s)}
                    style={{ background: '#FEF7E6', color: '#FF923E', border: '1px solid #FF923E' }}
                    className='px-3 py-1 rounded-full text-sm'
                  >
                    {capitalize(s)}
                  </Tag>
                ))}
                {activeFilters.field.map((f) => (
                  <Tag
                    key={f}
                    closable
                    onClose={() => removeFilter('field', f)}
                    style={{ background: '#FEF7E6', color: '#FF923E', border: '1px solid #FF923E' }}
                    className='px-3 py-1 rounded-full text-sm'
                  >
                    {capitalize(f)}
                  </Tag>
                ))}
              </div>
              {/* Results for ... */}
            </div>

            {/* Show loading state only on initial load, not when fetching new data */}
            {isLoading && universities.length === 0 ? (
              <div className='flex items-center justify-center min-h-[600px]'>
                <div className='text-center'>
                  <div className='text-gray-400 text-6xl mb-4'>⏳</div>
                  <p className='text-gray-500 text-lg'>Loading universities...</p>
                </div>
              </div>
            ) : universities?.length === 0 ? (
              <div className='flex items-center justify-center min-h-[600px]'>
                <div className='text-center'>
                  <div className='text-gray-400 text-6xl mb-4'>🏫</div>
                  <p className='text-gray-500 text-lg'>
                    No universities match the selected criteria.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className='px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 w-full'>
                  {universities.map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))}
                </div>
                <div className='mt-8 flex justify-center w-full'>
                  <Pagination
                    current={currentPage}
                    pageSize={limit}
                    total={total}
                    onChange={onPageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Chatbot></Chatbot>
    </div>
  );
};

export default ViewUniversity;
