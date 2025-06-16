import { Pagination } from 'antd';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';

import UniversityCard from './UniversityCard';
import UniversityFilter, { FilterOptions } from './UniversityFilter';
import WorldMap from './Worldmap';
import { countries } from '@app/constants/university';
import { RawUniversity, UniversityCustom } from '@app/interface/university.interface';

const ViewUniversity = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState<number>(18);
  const [universities, setUniversities] = useState<UniversityCustom[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    search: '',
    country: '',
    type: '',
    size: '',
    field: '',
    sortOrder: 'asc',
  });

  const fetchControllerRef = React.useRef(new AbortController());

  const mapRawToUniversity = useCallback((rawUniversity: RawUniversity): UniversityCustom => {
    return {
      id: rawUniversity.id.toString(),
      name: rawUniversity.university,
      logo: rawUniversity.logo,
      country: rawUniversity.country,
      region: rawUniversity.location,
      ranking: rawUniversity.rank || 9999,
      size: rawUniversity.size.charAt(0).toUpperCase() + rawUniversity.size.slice(1),
      type: rawUniversity.type.charAt(0).toUpperCase() + rawUniversity.type.slice(1),
      fields: [
        ...(rawUniversity.agriculturalFoodScience ? ['Agriculture & Food Science'] : []),
        ...(rawUniversity.artsDesign ? ['Arts & Design'] : []),
        ...(rawUniversity.economicsBusinessManagement ? ['Economics, Business & Management'] : []),
        ...(rawUniversity.lawPoliticalScience ? ['Law & Political Science'] : []),
        ...(rawUniversity.medicinePharmacyHealthSciences
          ? ['Medicine, Pharmacy & Health Sciences']
          : []),
        ...(rawUniversity.scienceEngineering ? ['Science & Engineering'] : []),
        ...(rawUniversity.socialSciencesHumanities ? ['Social Sciences'] : []),
        ...(rawUniversity.sportsPhysicalEducation ? ['Sports & Physical Education'] : []),
        ...(rawUniversity.technology ? ['Computer Science'] : []),
        ...(rawUniversity.others ? ['Others'] : []),
      ],
      description: rawUniversity.description,
      website: rawUniversity.website,
      partnerships: rawUniversity.exchange || 0,
      students: rawUniversity.studentPopulation,
      location: { lat: rawUniversity.latitude, lng: rawUniversity.longitude },
      rating: 0,
    };
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

  const fetchDisplayedUniversities = useCallback(async () => {
    setLoading(true);

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    fetchControllerRef.current = new AbortController();

    const params: Record<string, string | number> = {
      page: currentPage,

      limit: limit,
    };

    if (activeFilters.search) params.search = activeFilters.search;

    if (activeFilters.country) params.country = activeFilters.country;

    if (activeFilters.type) params.type = activeFilters.type.toLowerCase();

    if (activeFilters.size) params.size = activeFilters.size.toLowerCase();

    if (activeFilters.field) {
      params.fieldNames = activeFilters.field;
    }

    if (activeFilters.sortOrder) {
      params.sortOrder = activeFilters.sortOrder.toUpperCase();

      params.sortBy = 'rank';
    }

    try {
      const res = await axios.get('universities', {
        params,
        signal: fetchControllerRef.current.signal as any,
      });

      if (res.data && Array.isArray(res.data.data)) {
        const rawData: RawUniversity[] = res.data.data;
        setTotal(res.data.totalCount);
        setUniversities(rawData.map(mapRawToUniversity));
      } else {
        setUniversities([]);
        setTotal(0);
      }
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        setUniversities([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, activeFilters, mapRawToUniversity]);

  useEffect(() => {
    fetchDisplayedUniversities();

    return () => fetchControllerRef.current?.abort();
  }, [fetchDisplayedUniversities]);

  const handleFiltersUpdate = useCallback((newFilters: FilterOptions) => {
    setActiveFilters(newFilters);

    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className='min-h-screen w-full px-4 py-6'>
      <WorldMap />

      <div className='flex justify-center mt-6'>
        <div className='w-full max-w-screen-xl flex flex-col lg:flex-row gap-6'>
          <div className='w-full lg:w-[320px] flex-none mb-6 lg:mb-0'>
            <UniversityFilter
              onFiltersUpdate={handleFiltersUpdate}
              initialFilters={activeFilters}
              availableCountries={countries}
              availableFields={availableFields}
            />
          </div>
          <div className='flex-1 min-h-[700px] relative'>
            {loading && (
              <div className='absolute inset-0 bg-white/80 z-20 flex items-center justify-center'>
                <div className='text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200'>
                  <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4'></div>
                  <h3 className='text-lg font-medium text-gray-700'>
                    Finding Matching Universities
                  </h3>
                </div>
              </div>
            )}
            {universities?.length === 0 ? (
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
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 w-full'>
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
    </div>
  );
};

export default ViewUniversity;
