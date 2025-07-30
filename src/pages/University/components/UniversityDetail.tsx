import { BookOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import axios from 'axios';
import { ArrowLeft, MapPin, Users, Building2, Star, Contact } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { University as UniversityBase } from '@app/interface/university.interface';

interface University extends UniversityBase {
  academicFieldsCommaSeparated?: string;
  subjectsList?: string;
}

interface FieldConfig {
  name: string;
  icon: string;
  description: string;
  apiFieldName: string;
  academicFieldId: number; // Added academicFieldId
}

interface Subject {
  id: string;
  name: string;
  field: string;
}

interface SubjectsResponse {
  message: string;
  data: Subject[] | string[];
}

// Updated fieldConfigs with academicFieldId based on API response example (assuming these IDs are static)
const fieldConfigs: Record<string, FieldConfig> = {
  agricultural_veterinary_sciences: {
    name: 'Agricultural & Veterinary Sciences',
    icon: '🌾',
    description: '',
    apiFieldName: 'agricultural_veterinary_sciences',
    academicFieldId: 1, // Placeholder: Replace with actual ID
  },
  arts_design: {
    name: 'Arts & Design',
    icon: '🎨',
    description: '',
    apiFieldName: 'arts_design',
    academicFieldId: 2, // Placeholder: Replace with actual ID
  },
  business_management_law: {
    name: 'Business, Management & Law',
    icon: '💼',
    description: '',
    apiFieldName: 'business_management_law',
    academicFieldId: 3, // As per your API response, academicFieldId for 'business_management_law' is 3
  },
  education_training: {
    name: 'Education & Training',
    icon: '🎓',
    description: '',
    apiFieldName: 'education_training',
    academicFieldId: 4, // Placeholder: Replace with actual ID
  },
  engineering_technology: {
    name: 'Engineering & Technology',
    icon: '⚙️',
    description: '',
    apiFieldName: 'engineering_technology',
    academicFieldId: 5, // Placeholder: Replace with actual ID
  },
  health_medicine: {
    name: 'Health & Medicine',
    icon: '🏥',
    description: '',
    apiFieldName: 'health_medicine',
    academicFieldId: 6, // Placeholder: Replace with actual ID
  },
  humanities_languages: {
    name: 'Humanities & Languages',
    icon: '📖',
    description: '',
    apiFieldName: 'humanities_languages',
    academicFieldId: 7, // Placeholder: Replace with actual ID
  },
  ict: {
    name: 'Information & Communication Technology',
    icon: '💻',
    description: '',
    apiFieldName: 'ict',
    academicFieldId: 8, // Placeholder: Replace with actual ID
  },
  natural_sciences: {
    name: 'Natural Sciences',
    icon: '🔬',
    description: '',
    apiFieldName: 'natural_sciences',
    academicFieldId: 9, // Placeholder: Replace with actual ID
  },
  others: {
    name: 'Others',
    icon: '📚',
    description: '',
    apiFieldName: 'others',
    academicFieldId: 10, // Placeholder: Replace with actual ID
  },
  services: {
    name: 'Services',
    icon: '🛎️',
    description: '',
    apiFieldName: 'services',
    academicFieldId: 11, // Placeholder: Replace with actual ID
  },
  social_behavioral_sciences: {
    name: 'Social & Behavioral Sciences',
    icon: '🧠',
    description: '',
    apiFieldName: 'social_behavioral_sciences',
    academicFieldId: 12, // Placeholder: Replace with actual ID
  },
  transport_safety_security_military: {
    name: 'Transport, Safety, Security & Military',
    icon: '🚁',
    description: '',
    apiFieldName: 'transport_safety_security_military',
    academicFieldId: 13, // Placeholder: Replace with actual ID
  },
};

const getStudentSizeInfo = (population: number | undefined) => {
  if (!population) return { size: 'N/A', population: 'N/A' };
  const formatted = population.toLocaleString();
  if (population < 5000) return { size: 'Small', population: formatted };
  if (population < 15000) return { size: 'Medium', population: formatted };
  if (population < 30000) return { size: 'Large', population: formatted };
  return { size: 'Extra Large', population: formatted };
};

const BroadFieldPopup: React.FC<{
  field: FieldConfig;
  isOpen: boolean;
  onClose: () => void;
  universitySubjects: string;
}> = ({ field, isOpen, onClose, universitySubjects }) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && field) fetchSubjects();
  }, [isOpen, field?.academicFieldId]); // Changed dependency to academicFieldId

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // MODIFIED: Changed 'field' query parameter to 'academicFieldId'
      const res = await axios.get<SubjectsResponse>(
        `/universities/subjects?academicFieldId=${field.academicFieldId}`,
      );
      let fetched: string[] = [];
      const raw = res.data;

      if (Array.isArray(raw)) {
        fetched = raw.map((s) => s.toString());
      } else if (Array.isArray(raw.data)) {
        fetched = raw.data.map((s: any) => (typeof s === 'string' ? s : s.name));
      }

      const allowed = universitySubjects.split(',').map((s) => s.trim().toLowerCase());
      const filtered = fetched.filter((s) => allowed.includes(s.toLowerCase()));
      setSubjects(filtered);
    } catch {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden'>
        <div className='bg-white pt-10 px-6 pb-6 relative border-b border-gray-100'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-black hover:text-orange-500 transition-colors text-2xl bg-transparent border-none p-0 focus:outline-none'
          >
            <CloseCircleOutlined />
          </button>
          <div className='text-center'>
            <h2 className='text-4xl font-extrabold text-orange-600 mb-4'>{field.name}</h2>
            <p className='text-sm text-gray-100 italic'>
              Information about the fields of study related to{' '}
              <span className='font-semibold text-gray-300'>&apos;{field.name}&apos;</span>
              <br /> is shown below
            </p>
            <div className='w-72 h-0.5 bg-orange-500 mx-auto mt-3 mb-2'></div>
          </div>
        </div>
        <div className='pt-4 px-6 pb-6 overflow-y-auto flex-1'>
          {loading && <div className='text-center py-8 text-gray-500'>Loading subjects...</div>}
          {error && <div className='text-center py-8 text-red-500'>{error}</div>}
          {!loading && !error && (
            <>
              <div className='border-b border-gray-200 pb-1 mb-1'>
                <div className='grid grid-cols-4 gap-4 text-sm font-medium text-gray-700'>
                  <div className=' flex item-center justify-center'>Number</div>
                  <div className='col-span-3'>Field of Study</div>
                </div>
              </div>
              <div className='max-h-80 overflow-y-auto'>
                {subjects.length > 0 ? (
                  subjects.map((s, i) => (
                    <div key={i} className='grid grid-cols-4 gap-4 py-3 border-b border-gray-200'>
                      <div className='text-sm text-gray-600 flex item-center justify-center'>
                        {i + 1}
                      </div>
                      <div className='col-span-3 text-sm text-gray-800'>{s}</div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    No subjects found for this field.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const UniversityDetail: React.FC = () => {
  const [university, setUniversity] = useState<University | null>(null);
  const [selectedField, setSelectedField] = useState<FieldConfig | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [fieldsWithSubjects, setFieldsWithSubjects] = useState<string[]>([]);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    axios.get(`/universities/${id}`).then((res) => setUniversity(res.data));
  }, [id]);

  // Function to check if a field has subjects
  const checkFieldHasSubjects = async (
    fieldConfig: FieldConfig,
    universitySubjects: string,
  ): Promise<boolean> => {
    try {
      // MODIFIED: Changed 'field' query parameter to 'academicFieldId'
      const res = await axios.get<SubjectsResponse>(
        `/universities/subjects?academicFieldId=${fieldConfig.academicFieldId}`,
      );
      let fetched: string[] = [];
      const raw = res.data;

      if (Array.isArray(raw)) {
        fetched = raw.map((s) => s.toString());
      } else if (Array.isArray(raw.data)) {
        fetched = raw.data.map((s: any) => (typeof s === 'string' ? s : s.name));
      }

      const allowed = universitySubjects.split(',').map((s) => s.trim().toLowerCase());
      const filtered = fetched.filter((s) => allowed.includes(s.toLowerCase()));
      return filtered.length > 0;
    } catch {
      return false;
    }
  };

  // Check which fields have subjects when university data is loaded
  useEffect(() => {
    if (university && university.subjectsList) {
      const academicFields =
        university.academicFieldsCommaSeparated?.split(',').map((f) => f.trim()) || [];
      // Ensure mappedFields also include academicFieldId
      const mappedFields = academicFields
        .map((f) => fieldConfigs[f])
        .filter((config) => config && config.academicFieldId !== undefined); // Ensure academicFieldId exists

      const checkAllFields = async () => {
        const fieldsWithSubjectsPromises = mappedFields.map(async (field) => {
          const hasSubjects = await checkFieldHasSubjects(field, university.subjectsList || '');
          return hasSubjects ? field.apiFieldName : null;
        });

        const results = await Promise.all(fieldsWithSubjectsPromises);
        const validFields = results.filter(Boolean) as string[];
        setFieldsWithSubjects(validFields);
      };

      checkAllFields();
    }
  }, [university]);

  if (!university) {
    return (
      <div className='p-8'>
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </div>
    );
  }

  const academicFields =
    university.academicFieldsCommaSeparated?.split(',').map((f) => f.trim()) || [];
  // Ensure mappedFields also include academicFieldId for rendering
  const mappedFields = academicFields
    .map((f) => fieldConfigs[f])
    .filter((config) => config && config.academicFieldId !== undefined);

  const studentSize = getStudentSizeInfo(university.studentPopulation);

  return (
    <div className='min-h-screen w-full px-4 py-6 bg-gray-50'>
      <div className='mx-auto max-w-7xl'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 text-[#595858] font-[500] hover:text-gray-600 mb-4 relative top-1 text-lg'
        >
          <ArrowLeft className='w-5 h-5' /> Home
        </Link>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-start gap-4'>
              <img
                src={university.logo}
                alt={university.university}
                className='w-20 h-20 rounded-lg object-contain bg-white p-1 border border-gray-200'
              />
              <div className='flex-1'>
                <h1 className='text-4xl font-bold text-blue-900 mb-2'>
                  About {university.university}
                </h1>
                <div className='text-base flex items-center gap-2 text-orange-500 mb-3'>
                  <MapPin className='w-4 h-4' />
                  <span>
                    {university.country && university.location
                      ? `${university.country}, ${university.location}`
                      : university.country || university.location}
                  </span>
                </div>
                <p className='text-gray-600 text-[18px] italic'>{university.description}</p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='w-full h-64 bg-gray-100 rounded-lg overflow-hidden'>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${university.latitude},${university.longitude}&zoom=15`}
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='University Location'
              />
            </div>
          </div>
        </div>

        {/* The 3 orange containers in the middle */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          {/* RANKING */}
          <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center gap-y-2 min-h-[120px]'>
            <div className='flex items-center justify-center gap-2 -mt-[22px]'>
              <Star className='w-5 h-5 text-white' />
              <span className='text-[20px] font-medium text-white'>Ranking</span>
            </div>
            <div className='text-3xl font-bold text-white'>{university.rank ?? 'N/A'}</div>
          </div>

          {/* SIZE */}
          <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center gap-y-2 min-h-[120px]'>
            <div className='flex items-center justify-center gap-2'>
              <Users className='w-5 h-5 text-white' />
              <span className='text-[20px] font-medium text-white'>Size</span>
            </div>
            <div className='text-3xl font-bold text-white'>{studentSize.size}</div>
            <div className='text-xs text-white mt-[4px]'>({studentSize.population} students)</div>
          </div>

          {/* TYPE */}
          <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center gap-y-2 min-h-[120px]'>
            <div className='flex items-center justify-center gap-2 -mt-[32px]'>
              <Building2 className='w-5 h-5 text-white' />
              <span className='text-[20px] font-medium text-white'>Type</span>
            </div>
            <div className='text-3xl font-bold text-white'>
              {university.type?.[0].toUpperCase() + university.type?.slice(1).toLowerCase() ||
                'N/A'}
            </div>
          </div>
        </div>

        {/* Broad Fields Section */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-2 mb-6'>
            <BookOutlined className='text-blue-900 text-[18px] relative bottom-[4px]' />
            <h3 className='text-lg font-semibold text-blue-900'>Broad Fields</h3>
          </div>
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            {mappedFields.map((config, index) => {
              const hasSubjects = fieldsWithSubjects.includes(config.apiFieldName);
              return (
                <div
                  key={index}
                  role={hasSubjects ? 'button' : undefined}
                  tabIndex={hasSubjects ? 0 : -1}
                  onClick={
                    hasSubjects
                      ? () => {
                          setSelectedField(config);
                          setIsPopupOpen(true);
                        }
                      : undefined
                  }
                  onKeyDown={
                    hasSubjects
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedField(config);
                            setIsPopupOpen(true);
                          }
                        }
                      : undefined
                  }
                  className={`text-center p-4 border rounded-lg transition-all shadow-md h-28 flex flex-col justify-center ${
                    hasSubjects
                      ? 'cursor-pointer hover:shadow-md hover:bg-gray-50 hover:border-orange-300 group'
                      : 'cursor-default'
                  }`}
                >
                  <div
                    className={`text-3xl mb-2 transition-transform ${
                      hasSubjects ? 'group-hover:scale-110' : ''
                    }`}
                  >
                    {config.icon}
                  </div>
                  <h4
                    className={`font-medium text-sm leading-tight transition-colors ${
                      hasSubjects ? 'text-blue-900 group-hover:text-orange-600' : 'text-blue-900'
                    }`}
                  >
                    {config.name}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Contact className='w-5 h-5 text-blue-900 mt-[-10px]' />
            <h3 className='text-lg font-semibold text-blue-900'>Contact</h3>
          </div>
          <div className='flex justify-between flex-wrap gap-6 pl-[38px]'>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <span className='text-sm font-bold text-blue-900'>Website:</span>
              <a
                href={university.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-900 hover:text-blue-300 text-sm break-all'
              >
                {university.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <span className='text-sm font-bold text-blue-900'>Email:</span>
              <a
                href={`mailto:${university.email}`}
                className='text-blue-900 hover:text-blue-300 text-sm'
              >
                {university.email}
              </a>
            </div>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <span className='text-sm font-bold text-blue-900'>Phone:</span>
              <a
                href={`tel:${university.contact}`}
                className='text-blue-900 hover:text-blue-300 text-sm'
              >
                {university.contact}
              </a>
            </div>
          </div>
        </div>
        {selectedField && (
          <BroadFieldPopup
            field={selectedField}
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            universitySubjects={university.subjectsList || ''}
          />
        )}
      </div>
    </div>
  );
};

export default UniversityDetail;
