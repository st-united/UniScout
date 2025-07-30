import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { RawUniversity, UniversityCustom } from '@app/interface/university.interface';

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

interface UniversitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string[];
  type?: string[];
  size?: string[];
  field?: string[];
  sortOrder?: string;
}

const mapRawToUniversity = (rawUniversity: RawUniversity): UniversityCustom => {
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
    abbreviation: rawUniversity.abbreviation || '',
  };
};

const fetchUniversities = async (params: UniversitiesParams) => {
  const queryParams: Record<string, string | number | string[]> = {
    page: params.page || 1,
    limit: params.limit || 18,
  };

  if (params.search) queryParams.search = params.search;
  if (params.country && params.country.length > 0) queryParams.country = params.country;
  if (params.type && params.type.length > 0) {
    queryParams.type = params.type.map((t) => t.toLowerCase());
  }
  if (params.size && params.size.length > 0) {
    queryParams.size = params.size.map((s) => s.toLowerCase());
  }
  if (params.field && params.field.length > 0) {
    queryParams.fieldNames = params.field.map((field) => FIELD_NAME_TO_API_KEY[field]);
  }
  if (params.sortOrder) {
    queryParams.sortOrder = params.sortOrder.toUpperCase();
    queryParams.sortBy = 'rank';
  }

  const response = await axios.get('universities', { params: queryParams });

  if (response.data && Array.isArray(response.data.data)) {
    const rawData: RawUniversity[] = response.data.data;
    return {
      universities: rawData.map(mapRawToUniversity),
      totalCount: response.data.totalCount,
    };
  }

  return {
    universities: [],
    totalCount: 0,
  };
};

export const useUniversities = (params: UniversitiesParams) => {
  return useQuery({
    queryKey: ['universities', params],
    queryFn: () => fetchUniversities(params),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
