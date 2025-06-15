export interface University {
  id: string;
  university: string;
  latitude: number;
  longitude: number;
  logo: string;
  rank: number | null;
  type: 'public' | 'private' | string;
  country: string;
  location: string;
  studentPopulation: number;
  year: number;
  contact: string;
  email: string;
  website: string;
  strength: string;
  description: string;
  exchange: string | null;
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
  size: 'small' | 'medium' | 'large' | string;
  academicFields?: string[];
}

export interface RawUniversity {
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
  lawPoliticalScience: boolean;
  medicinePharmacyHealthSciences: boolean;
  scienceEngineering: boolean;
  socialSciencesHumanities: boolean;
  sportsPhysicalEducation: boolean;
  technology: boolean;
  others: boolean;
  description: string;
  website: string;
  exchange?: number;
  studentPopulation: number;
  latitude: number;
  longitude: number;
  type: string;
}

export interface UniversityCardProps {
  university: University;
}

export interface UniversityCustom {
  id: string;
  name: string;
  logo: string;
  country: string;
  region: string;
  ranking: number;
  size: string;
  type: string;
  fields: string[];
  description: string;
  website: string;
  partnerships: number;
  students: number;
  location: { lat: number; lng: number };
  rating: number;
}
