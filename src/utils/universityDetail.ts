import axios from 'axios';

export type SubjectsPayload = { message?: string; data?: (string | { name: string })[] } | string[];

export const extractSubjects = (payload: SubjectsPayload): string[] => {
  if (Array.isArray(payload)) return payload.map(String);
  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data.map((s) => (typeof s === 'string' ? s : s.name));
  }
  return [];
};

export const filterAllowed = (subjects: string[], allowedCsv: string) => {
  if (!allowedCsv) return subjects;
  const allowed = allowedCsv
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return subjects.filter((s) => allowed.includes(s.toLowerCase()));
};

export const fetchFieldSubjects = async (academicFieldId: number, allowedCsv: string) => {
  const res = await axios.get(`/universities/subjects?academicFieldId=${academicFieldId}`);
  return filterAllowed(extractSubjects(res.data as SubjectsPayload), allowedCsv);
};

export const toStudentSize = (population?: number) => {
  if (!population) return { size: 'N/A', population: 'N/A' };
  const p = population.toLocaleString();
  if (population < 5000) return { size: 'Small', population: p };
  if (population < 15000) return { size: 'Medium', population: p };
  if (population < 30000) return { size: 'Large', population: p };
  return { size: 'Extra Large', population: p };
};
