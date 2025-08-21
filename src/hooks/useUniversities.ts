import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { RawUniversity, UniversityCustom } from '@app/interface/university.interface';

export interface UniversitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string[];
  type?: string[];
  size?: string[];
  field?: string[];
  sortOrder?: 'asc' | 'desc';
}

const mapRawToUniversity = (u: RawUniversity): UniversityCustom => ({
  id: u.id.toString(),
  name: u.university,
  logo: u.logo,
  country: u.country,
  region: u.location,
  ranking: u.rank || 9999,
  size: u.size ? u.size.charAt(0).toUpperCase() + u.size.slice(1) : '',
  type: u.type ? u.type.charAt(0).toUpperCase() + u.type.slice(1) : '',
  fields: [
    ...(u.agriculturalFoodScience ? ['Agriculture & Food Science'] : []),
    ...(u.artsDesign ? ['Arts & Design'] : []),
    ...(u.economicsBusinessManagement ? ['Economics, Business & Management'] : []),
    ...(u.lawPoliticalScience ? ['Law & Political Science'] : []),
    ...(u.medicinePharmacyHealthSciences ? ['Medicine, Pharmacy & Health Sciences'] : []),
    ...(u.scienceEngineering ? ['Science & Engineering'] : []),
    ...(u.socialSciencesHumanities ? ['Social Sciences'] : []),
    ...(u.sportsPhysicalEducation ? ['Sports & Physical Education'] : []),
    ...(u.technology ? ['Computer Science'] : []),
    ...(u.others ? ['Others'] : []),
  ],
  description: u.description,
  website: u.website,
  partnerships: u.exchange || 0,
  students: u.studentPopulation,
  location: { lat: u.latitude, lng: u.longitude },
  rating: 0,
  abbreviation: u.abbreviation || '',
});

const serializeParams = (params: Record<string, any>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.set(k, String(v));
  }
  return sp.toString();
};

type FetchResult = { universities: UniversityCustom[]; totalCount: number };

const fetchUniversities = async (
  params: UniversitiesParams,
  signal?: AbortSignal,
): Promise<FetchResult> => {
  const query = {
    page: Math.max(1, params.page ?? 1),
    limit: Math.max(1, params.limit ?? 18),
    search: params.search?.trim() || undefined,
    country: params.country ?? [],
    type: (params.type ?? []).map((t) => t.toLowerCase()),
    size: (params.size ?? []).map((s) => s.toLowerCase()),
    subjectNames: params.field ?? [],
    sortBy: 'rank',
    sortOrder: (params.sortOrder ?? 'asc').toUpperCase(),
  };

  const { data } = await axios.get(`/universities?${serializeParams(query)}`, { signal });

  const raw: RawUniversity[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  const total =
    typeof data?.totalCount === 'number'
      ? data.totalCount
      : typeof data?.total === 'number'
      ? data.total
      : raw.length;

  return { universities: raw.map(mapRawToUniversity), totalCount: total };
};

export const useUniversities = (params: UniversitiesParams) =>
  useQuery({
    queryKey: ['universities', params],
    queryFn: ({ signal }) => fetchUniversities(params, signal),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });
