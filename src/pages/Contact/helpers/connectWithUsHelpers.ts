// Small, dependency-free helpers & constants used across the Contact page.

export const ORANGE = '#FF7012';
export const PLACEHOLDER = '#9CA3AF';

export const MAX_FRONTEND_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FRONTEND_FILES = 5;

export type TabKey = 'new' | 'update';

export type NewUniState = {
  universityName: string;
  abbreviation: string;
  location: string;
  website: string;
  type: string;
  studentPopulation: string;
  description: string;
  country: string;
  email: string;
  phone: string;
  subjectsFile: File | null;
};

export type UpdateState = {
  representativeName: string;
  universityName: string;
  email: string;
  phone: string;
  message: string;
  attachment: File[];
};

export type ErrorBag = Record<string, string | undefined>;

export const UNIVERSITY_TYPES = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Academy', value: 'academy' },
  { label: 'College', value: 'college' },
  { label: 'International', value: 'international' },
] as const;

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const mapCountryForApi = (c: string) => (c === 'Viet Nam' ? 'Vietnam' : c);

export function validateNewUni(v: NewUniState): ErrorBag {
  const e: ErrorBag = {};
  if (!v.universityName) e.universityName = 'Required.';
  if (!v.country) e.country = 'Required.';
  if (!v.location) e.location = 'Required.';
  if (!v.email) e.email = 'Required.';
  else if (!EMAIL_REGEX.test(v.email)) e.email = 'Invalid email.';
  if (!v.phone) e.phone = 'Required.';
  else if (!/^\+?\d+$/.test(v.phone)) e.phone = 'Only numbers and +.';
  if (!v.website) e.website = 'Required.';
  if (!v.type) e.type = 'Required.';

  if (v.studentPopulation) {
    const n = parseInt(v.studentPopulation, 10);
    if (Number.isNaN(n)) e.studentPopulation = 'Must be a valid number.';
    else if (n < 0) e.studentPopulation = 'Cannot be negative.';
    else if (!Number.isInteger(n)) e.studentPopulation = 'Must be an integer.';
  }
  return e;
}

export function validateUpdate(v: UpdateState): ErrorBag {
  const e: ErrorBag = {};
  if (!v.representativeName) e.representativeName = 'Required.';
  if (!v.universityName) e.universityName = 'Required.';
  if (!v.email) e.email = 'Required.';
  else if (!EMAIL_REGEX.test(v.email)) e.email = 'Invalid email.';
  if (!v.phone) e.phone = 'Required.';
  else if (!/^\+?\d+$/.test(v.phone)) e.phone = 'Only numbers and +.';
  if (!v.message) e.message = 'Required.';
  return e;
}
