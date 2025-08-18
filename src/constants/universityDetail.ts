export interface FieldConfig {
  name: string;
  icon: string;
  apiFieldName: string;
  academicFieldId: number;
}

type FieldTuple = [apiFieldName: string, name: string, emoji: string, academicFieldId: number];

const FIELD_LIST: FieldTuple[] = [
  ['agricultural_veterinary_sciences', 'Agricultural & Veterinary Sciences', '🌾', 1],
  ['arts_design', 'Arts & Design', '🎨', 2],
  ['business_management_law', 'Business, Management & Law', '💼', 3],
  ['education_training', 'Education & Training', '🎓', 4],
  ['engineering_technology', 'Engineering & Technology', '⚙️', 5],
  ['health_medicine', 'Health & Medicine', '🏥', 6],
  ['humanities_languages', 'Humanities & Languages', '📖', 7],
  ['ict', 'Information & Communication Technology', '💻', 8],
  ['natural_sciences', 'Natural Sciences', '🔬', 9],
  ['others', 'Others', '📚', 10],
  ['services', 'Services', '🛎️', 11],
  ['social_behavioral_sciences', 'Social & Behavioral Sciences', '🧠', 12],
  ['transport_safety_security_military', 'Transport, Safety, Security & Military', '🚁', 13],
];

export const fieldConfigs: Record<string, FieldConfig> = FIELD_LIST.reduce(
  (acc, [apiFieldName, name, icon, academicFieldId]) => {
    acc[apiFieldName] = { name, icon, apiFieldName, academicFieldId };
    return acc;
  },
  {} as Record<string, FieldConfig>,
);
