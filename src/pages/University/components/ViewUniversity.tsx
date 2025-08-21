import { ConfigProvider, Pagination, Input, Select, Tag, Button } from 'antd';
import axios from 'axios';
import { Search as SearchIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Chatbot from './Chatbot';
import UniversityCard from './UniversityCard';
import UniversityFilter, { FilterOptions } from './UniversityFilter';
import WorldMap from './Worldmap';
import { countries } from '@app/constants/university';
import { useUniversities } from '@app/hooks/useUniversities';

const LIMIT = 18;
const DEFAULT_FILTERS: FilterOptions = {
  search: '',
  country: [],
  type: [],
  size: [],
  field: [],
  sortOrder: 'asc',
};
const FILTER_KEYS: Array<keyof Pick<FilterOptions, 'country' | 'type' | 'size' | 'field'>> = [
  'country',
  'type',
  'size',
  'field',
];

const ViewUniversity: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [params, setParams] = useSearchParams();
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useUniversities({
    page: currentPage,
    limit: LIMIT,
    search: activeFilters.search,
    country: activeFilters.country,
    type: activeFilters.type,
    size: activeFilters.size,
    field: activeFilters.field,
    sortOrder: activeFilters.sortOrder,
  });
  const universities = data?.universities || [];
  const total = data?.totalCount || 0;

  const ignore = () => void 0;

  useEffect(() => {
    axios.get('/dashboard/track-access').catch(ignore);
  }, []);

  useEffect(() => {
    axios
      .get('/universities/academic-fields')
      .then((res) =>
        setAvailableFields((Array.isArray(res.data?.data) ? res.data.data : []).sort()),
      )
      .catch(ignore);
  }, []);

  useEffect(() => {
    const pick = (k: string) => params.getAll(k);
    setCurrentPage(parseInt(params.get('page') || '1', 10));
    setActiveFilters((f) => ({
      ...f,
      search: params.get('search') || '',
      country: pick('country'),
      type: pick('type'),
      size: pick('size'),
      field: pick('field'),
      sortOrder: params.get('sortOrder') === 'desc' ? 'desc' : 'asc',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('page', String(currentPage));
    if (activeFilters.search) p.set('search', activeFilters.search);
    FILTER_KEYS.forEach((k) => (activeFilters[k] as string[]).forEach((v) => p.append(k, v)));
    p.set('sortOrder', activeFilters.sortOrder);
    setParams(p, { replace: true });
  }, [currentPage, activeFilters, setParams]);

  useEffect(() => setSearchInput(activeFilters.search || ''), [activeFilters.search]);

  const handleFiltersUpdate = useCallback((nf: FilterOptions) => {
    setActiveFilters(nf);
    setCurrentPage(1);
  }, []);
  const onPageChange = useCallback((p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }, []);

  const handleCountryClick = useCallback((country: string) => {
    setActiveFilters({ ...DEFAULT_FILTERS, country: [country] });
    setCurrentPage(1);
    setTimeout(() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, []);

  const handleCountryCountClick = useCallback((country: string) => {
    setActiveFilters({ ...DEFAULT_FILTERS, country: [country] });
    setCurrentPage(1);
    setTimeout(() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, []);

  const removeFilter = useCallback(
    (key: keyof Pick<FilterOptions, 'country' | 'type' | 'size' | 'field'>, value: string) =>
      setActiveFilters(
        (f) => ({ ...f, [key]: (f[key] as string[]).filter((v) => v !== value) } as FilterOptions),
      ),
    [],
  );

  const busy = isLoading || isFetching;

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#FF7012', colorPrimaryHover: '#FF8A3D', borderRadius: 8 },
        components: {
          Pagination: { itemActiveBg: '#fff7ed', colorPrimary: '#FF7012' },
          Select: { optionSelectedBg: '#fff7ed' },
          Input: { activeBorderColor: '#FF7012', hoverBorderColor: '#FF7012' },
        },
      }}
    >
      <div className='min-h-screen w-full px-4 py-6'>
        <WorldMap
          onCountryClick={handleCountryClick}
          onCountryCountClick={handleCountryCountClick}
        />

        <h2 className='mt-6 mb-3 text-center text-4xl font-bold'>DISCOVER UNIVERSITIES</h2>

        <div className='mt-6 flex justify-center'>
          <div className='w-full max-w-screen-xl flex flex-col lg:flex-row'>
            <div className='w-full lg:w-[320px] flex-none'>
              <UniversityFilter
                onFiltersUpdate={handleFiltersUpdate}
                initialFilters={activeFilters}
                availableCountries={countries}
                availableFields={availableFields}
              />
            </div>

            <div ref={cardsRef} className='relative w-full'>
              {/* Sticky Controls */}
              <div className='sticky top-[63px] z-20 bg-[#F5F5F5] pt-4 pb-3 px-1'>
                <div className='pl-0 lg:pl-4 grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 w-full'>
                  {/* Search */}
                  <div className='col-span-1 md:col-span-2 2xl:col-span-2 min-w-0'>
                    <Input.Search
                      allowClear
                      placeholder='Search'
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onSearch={(val) => handleFiltersUpdate({ ...activeFilters, search: val })}
                      enterButton={
                        <Button
                          type='primary'
                          style={{ background: '#FF7012', borderColor: '#FF7012' }}
                          icon={<SearchIcon className='w-4 h-4' />}
                        />
                      }
                      size='large'
                      className='w-full'
                    />
                  </div>

                  {/* Sort */}
                  <div className='col-span-1 min-w-0'>
                    <Select
                      value={activeFilters.sortOrder}
                      onChange={(val: 'asc' | 'desc') =>
                        handleFiltersUpdate({ ...activeFilters, sortOrder: val })
                      }
                      size='large'
                      className='w-full'
                      options={[
                        { value: 'desc', label: 'Sort by: high to low' },
                        { value: 'asc', label: 'Sort by: low to high' },
                      ]}
                    />
                  </div>

                  {/* Active filter chips */}
                  <div className='col-span-2 md:col-span-full -mt-2'>
                    <div className='flex flex-wrap gap-2'>
                      {FILTER_KEYS.flatMap((k) =>
                        (activeFilters[k] as string[]).map((v) => (
                          <Tag
                            key={`${k}-${v}`}
                            closable
                            onClose={() => removeFilter(k, v)}
                            style={{
                              background: '#FEF7E6',
                              color: '#FF923E',
                              border: '1px solid #FF923E',
                            }}
                            className='px-3 py-1 rounded-full text-sm capitalize'
                          >
                            {v}
                          </Tag>
                        )),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results grid */}
              {busy && universities.length === 0 ? (
                <div className='lg:pl-4 col-span-full flex items-center justify-center min-h-[600px]'>
                  <div className='text-center text-gray-500'>
                    <div className='text-gray-400 text-6xl mb-4'>⏳</div>
                    <p className='text-lg'>Loading universities...</p>
                  </div>
                </div>
              ) : universities.length === 0 ? (
                <div className='lg:pl-4 col-span-full flex items-center justify-center min-h-[600px]'>
                  <div className='text-center text-gray-500'>
                    <div className='text-gray-400 text-6xl mb-4'>🏫</div>
                    <p className='text-lg'>No universities match the selected criteria.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className='px-2 lg:pl-6 pr-2 mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 w-full max-w-7xl'>
                    {universities.map((u) => (
                      <div key={u.id} className='col-span-1'>
                        <UniversityCard university={u} />
                      </div>
                    ))}
                  </div>

                  <div className='mt-8 flex justify-center w-full'>
                    <Pagination
                      current={currentPage}
                      pageSize={LIMIT}
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
        <Chatbot />
      </div>
    </ConfigProvider>
  );
};

export default ViewUniversity;
