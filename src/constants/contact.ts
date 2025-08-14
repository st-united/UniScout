// Centralized constants & types for the Contact feature (no UI/state here).

export const ORANGE = '#FF7012';
export const PLACEHOLDER = '#9CA3AF';

export const MAX_FRONTEND_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FRONTEND_FILES = 5;

export type TabKey = 'new' | 'update';

// NOTE: Subjects are handled in the form layer as `subjects?: File[]`.
// Keep only data that is sent to the API here.
export type NewUniState = {
  universityName: string;
  abbreviation?: string;
  location: string;
  website: string;
  type: string;
  studentPopulation: string;
  description?: string;
  country: string;
  email: string;
  phone: string;
};

export type UpdateState = {
  representativeName: string;
  universityName: string;
  email: string;
  phone: string;
  message: string;
  attachment: File[];
};

export const UNIVERSITY_TYPES = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Academy', value: 'academy' },
  { label: 'College', value: 'college' },
  { label: 'International', value: 'international' },
] as const;

export type UniversityTypeValue = (typeof UNIVERSITY_TYPES)[number]['value'];

// Normalize country name for the API
export const mapCountryForApi = (c: string) => (c === 'Viet Nam' ? 'Vietnam' : c);
