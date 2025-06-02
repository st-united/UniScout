export interface University {
  id: number;
  name: string;
  country: string;
  fields: string[];
  imageUrl: string;
  logo: string;
  ranking: number;
  rating?: number;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  website?: string;
  founded?: number;
  students?: number;
  faculty?: number;
  acceptanceRate?: number;
  tuition?: {
    domestic?: number;
    international?: number;
  };
  requirements?: {
    gpa?: number;
    sat?: number;
    act?: number;
    toefl?: number;
    ielts?: number;
  };
} 