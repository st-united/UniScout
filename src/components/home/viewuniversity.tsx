// src/components/ViewUniversity.tsx

import { Pagination } from 'antd';
import axios from 'axios';
import { Building2, Users } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Import FilterOptions and University interface from universityfilter
import UniversityFilter, { University, FilterOptions } from './universityfilter';

// Keep UniversityCard and RawUniversity interfaces as they are
interface RawUniversity {
  id: number;
  university: string;
  logo: string;
  country: string;
  location: string;
  rank?: number;
  size: string;
  agriculturalFoodScience: boolean;
  artsDesign: boolean;
  economicsBusinessManagement: boolean;
  engineering: boolean;
  lawPoliticalScience: boolean;
  medicinePharmacyHealthSciences: boolean;
  physicalScience: boolean;
  socialSciencesHumanities: boolean;
  sportsPhysicalEducation: boolean;
  technology: boolean;
  theology: boolean;
  description: string;
  website: string;
  exchange?: number;
  studentPopulation: number;
  latitude: number;
  longitude: number;
  type: string;
}

interface UniversityCardProps {
  university: University;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => (
  <Link to={`/universities/${university.id}`} className='block'>
    <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h3 className='text-blue-700 font-medium mb-1'>{university.name}</h3>
          <div className='flex items-center text-orange-500'>
            <span className='text-sm'>{university.country}</span>
          </div>
        </div>
        <img
          src={university.logo}
          alt={`${university.name} logo`}
          className='w-12 h-12 rounded-lg object-cover'
        />
      </div>
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <div className='w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs'>
            {university.ranking}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Building2 className='w-5 h-5 text-blue-600' />
          <span className='text-blue-600'>{university.type}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Users className='w-5 h-5 text-blue-600' />
          <span className='text-blue-600'>{university.size}</span>
        </div>
      </div>
    </div>
  </Link>
);

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
const countries = ['Vietnam', 'Australia', 'Japan', 'Korea', 'USA', 'India'];
const ViewUniversity = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState<number>(16);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [availableFields, setAvailableFields] = useState<string[]>([]);

  // State for currently active filters
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    search: '',
    country: '',
    type: '',
    size: '',
    field: '',
    sortOrder: 'asc',
  });

  // Ref to abort ongoing Axios requests (prevents state updates on unmounted components)
  const fetchControllerRef = React.useRef(new AbortController());

  // Helper function to map raw API data to your `University` interface
  const mapRawToUniversity = useCallback((rawUniversity: RawUniversity): University => {
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
        ...(rawUniversity.agriculturalFoodScience ? ['Agricultural Science'] : []),
        ...(rawUniversity.artsDesign ? ['Arts'] : []),
        ...(rawUniversity.economicsBusinessManagement ? ['Business'] : []),
        ...(rawUniversity.engineering ? ['Engineering'] : []),
        ...(rawUniversity.lawPoliticalScience ? ['Law'] : []),
        ...(rawUniversity.medicinePharmacyHealthSciences ? ['Medicine'] : []),
        ...(rawUniversity.physicalScience ? ['Natural Sciences'] : []),
        ...(rawUniversity.socialSciencesHumanities ? ['Social Sciences'] : []),
        ...(rawUniversity.sportsPhysicalEducation ? ['Sports'] : []),
        ...(rawUniversity.technology ? ['Computer Science'] : []),
        ...(rawUniversity.theology ? ['Theology'] : []),
      ],
      description: rawUniversity.description,
      website: rawUniversity.website,
      partnerships: rawUniversity.exchange || 0,
      students: rawUniversity.studentPopulation,
      location: { lat: rawUniversity.latitude, lng: rawUniversity.longitude },
      rating: 4.5, // Placeholder
    };
  }, []); // useCallback with empty dependency array since it doesn't depend on props/state

  // -----------------------------------------------------------
  // Effect 1: Fetch ALL universities to populate filter options (runs once on mount)
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchAllFilterOptions = async () => {
      try {
        // Fetch ALL universities (no pagination/filters) to get all possible options
        const res = await axios.get('http://34.172.65.225:6002/api/universities');

        // Ensure res.data and res.data.data exist before proceeding
        if (res.data && Array.isArray(res.data.data)) {
          const allUniversitiesData: RawUniversity[] = res.data.data;

          const fields = Array.from(
            new Set(
              allUniversitiesData.flatMap((u) => {
                const tempFields: string[] = [];
                if (u.agriculturalFoodScience) tempFields.push('Agricultural Science');
                if (u.artsDesign) tempFields.push('Arts');
                if (u.economicsBusinessManagement) tempFields.push('Business');
                if (u.engineering) tempFields.push('Engineering');
                if (u.lawPoliticalScience) tempFields.push('Law');
                if (u.medicinePharmacyHealthSciences) tempFields.push('Medicine');
                if (u.physicalScience) tempFields.push('Natural Sciences');
                if (u.socialSciencesHumanities) tempFields.push('Social Sciences');
                if (u.sportsPhysicalEducation) tempFields.push('Sports');
                if (u.technology) tempFields.push('Computer Science');
                if (u.theology) tempFields.push('Theology');
                return tempFields;
              }),
            ),
          ).sort();
          setAvailableFields(fields);
        } else {
          console.error(
            'Unexpected API response shape for all universities (filter options):',
            res.data,
          );
        }
      } catch (err) {
        console.error('Failed to fetch all universities for filter options:', err);
        // You might want to display a message to the user here
      }
    };

    fetchAllFilterOptions();
  }, []); // Empty dependency array: runs only once on mount

  // -----------------------------------------------------------
  // Effect 2: Fetch displayed universities (filtered and paginated)
  // -----------------------------------------------------------
  const fetchDisplayedUniversities = useCallback(async () => {
    setLoading(true);
    // Abort any previous pending requests before making a new one
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    fetchControllerRef.current = new AbortController();

    // Build params from activeFilters and pagination
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: limit,
    };

    // Add filter params only if they have a non-empty value
    if (activeFilters.search) params.search = activeFilters.search;
    if (activeFilters.country) params.country = activeFilters.country;
    if (activeFilters.type) params.type = activeFilters.type.toLowerCase(); // Ensure lowercase for API
    if (activeFilters.size) params.size = activeFilters.size.toLowerCase(); // Ensure lowercase for API
    if (activeFilters.field) {
      const apiFieldKey = FIELD_NAME_TO_API_KEY[activeFilters.field];
      if (apiFieldKey) params[apiFieldKey] = 'true';
    }
    if (activeFilters.sortOrder) params.sort = activeFilters.sortOrder; // Always include sort

    console.log('API Request Parameters:', params);

    try {
      const res = await axios.get('http://34.172.65.225:6002/api/universities', {
        params,
        signal: fetchControllerRef.current.signal as any,
      });

      console.log('API Response:', res.data);

      // Ensure res.data and res.data.data exist to prevent "cannot read 'data' of undefined"
      if (res.data && Array.isArray(res.data.data)) {
        const rawData: RawUniversity[] = res.data.data;
        setTotal(res.data.totalCount);
        setUniversities(rawData.map(mapRawToUniversity));
      } else {
        console.error('Unexpected API response shape for paginated universities:', res.data);
        setUniversities([]); // Clear data on unexpected response
        setTotal(0);
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log('API fetch aborted (paginated):', err.message);
        return; // Exit if request was cancelled
      }
      // Log detailed error information
      if (err.response) {
        console.error('API Error (paginated): Server Response', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      } else if (err.request) {
        console.error('API Error (paginated): No Response Received', err.request);
      } else {
        console.error('API Error (paginated): Request Setup', err.message);
      }
      setUniversities([]); // Clear universities on error
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, activeFilters, mapRawToUniversity]); // mapRawToUniversity is a stable callback

  // Trigger fetchDisplayedUniversities whenever currentPage or activeFilters change
  useEffect(() => {
    fetchDisplayedUniversities();
    // Cleanup function for aborting request on component unmount
    return () => fetchControllerRef.current?.abort();
  }, [fetchDisplayedUniversities]);

  // Callback to receive updated filters from UniversityFilter
  const handleFiltersUpdate = useCallback(
    (newFilters: FilterOptions) => {
      // Check if filters have actually changed to avoid unnecessary re-renders and API calls
      if (JSON.stringify(newFilters) !== JSON.stringify(activeFilters)) {
        setActiveFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
      }
    },
    [activeFilters],
  ); // Depend on activeFilters to compare

  // Handler for Ant Design Pagination component
  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className='min-h-screen w-full px-4 py-6'>
      <div className='mx-auto max-w-[1440px] relative'>
        {/* Sidebar */}
        <div className='hidden lg:block absolute left-0 top-0 w-80 z-10'>
          <div className='sticky top-6'>
            <UniversityFilter
              onFiltersUpdate={handleFiltersUpdate}
              initialFilters={activeFilters}
              availableCountries={countries}
              availableFields={availableFields}
            />
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className='lg:hidden mb-6'>
          <UniversityFilter
            onFiltersUpdate={handleFiltersUpdate}
            initialFilters={activeFilters}
            availableCountries={countries}
            availableFields={availableFields}
          />
        </div>

        {/* Content area */}
        <div className='lg:ml-[336px]'>
          {loading ? (
            <div className='flex items-center justify-center h-64 text-gray-500 text-lg'>
              Loading universities...
            </div>
          ) : universities?.length === 0 ? (
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='text-gray-400 text-6xl mb-4'>🏫</div>
                <p className='text-gray-500 text-lg'>
                  No universities match the selected criteria.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
                {universities?.map((university) => (
                  <UniversityCard key={university.id} university={university} />
                ))}
              </div>

              {/* Pagination */}
              <div className='mt-8 flex justify-center'>
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
  );
};

export default ViewUniversity;
