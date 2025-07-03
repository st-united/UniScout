// ✅ Fully Restored UniversityDetail.tsx with Filtering
// Includes About, Map, Stats, Contact, and proper filtering for academicFieldsCommaSeparated & subjectsList

import { BookOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  Users,
  Building2,
  Star,
  Globe,
  MailIcon,
  PhoneIcon,
  Contact,
} from 'lucide-react';
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

const fieldConfigs: Record<string, FieldConfig> = {
  agricultural_veterinary_sciences: {
    name: 'Agricultural & Veterinary Sciences',
    icon: '🌾',
    description: '',
    apiFieldName: 'agricultural_veterinary_sciences',
  },
  arts_design: {
    name: 'Arts & Design',
    icon: '🎨',
    description: '',
    apiFieldName: 'arts_design',
  },
  business_management_law: {
    name: 'Business, Management & Law',
    icon: '💼',
    description: '',
    apiFieldName: 'business_management_law',
  },
  education_training: {
    name: 'Education & Training',
    icon: '🎓',
    description: '',
    apiFieldName: 'education_training',
  },
  engineering_technology: {
    name: 'Engineering & Technology',
    icon: '⚙️',
    description: '',
    apiFieldName: 'engineering_technology',
  },
  health_medicine: {
    name: 'Health & Medicine',
    icon: '🏥',
    description: '',
    apiFieldName: 'health_medicine',
  },
  humanities_languages: {
    name: 'Humanities & Languages',
    icon: '📖',
    description: '',
    apiFieldName: 'humanities_languages',
  },
  ict: {
    name: 'Information & Communication Technology',
    icon: '💻',
    description: '',
    apiFieldName: 'ict',
  },
  natural_sciences: {
    name: 'Natural Sciences',
    icon: '🔬',
    description: '',
    apiFieldName: 'natural_sciences',
  },
  others: {
    name: 'Others',
    icon: '📚',
    description: '',
    apiFieldName: 'others',
  },
  services: {
    name: 'Services',
    icon: '🛎️',
    description: '',
    apiFieldName: 'services',
  },
  social_behavioral_sciences: {
    name: 'Social & Behavioral Sciences',
    icon: '🧠',
    description: '',
    apiFieldName: 'social_behavioral_sciences',
  },
  transport_safety_security_military: {
    name: 'Transport, Safety, Security & Military',
    icon: '🚁',
    description: '',
    apiFieldName: 'transport_safety_security_military',
  },
};

const getStudentSizeInfo = (population: number | undefined) => {
  if (!population) return { size: 'N/A', population: 'N/A' };
  const formatted = population.toLocaleString();
  if (population < 5000) return { size: 'S', population: formatted };
  if (population < 15000) return { size: 'M', population: formatted };
  if (population < 30000) return { size: 'L', population: formatted };
  return { size: 'XL', population: formatted };
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
  }, [isOpen, field?.apiFieldName]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<SubjectsResponse>(
        `/universities/subjects?field=${field.apiFieldName}`,
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
      <div className='bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden'>
        <div className='bg-white p-6 relative border-b border-gray-100'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-black hover:text-orange-500 transition-colors text-2xl bg-transparent border-none p-0 focus:outline-none'
          >
            <CloseCircleOutlined />
          </button>
          <div className='text-center'>
            <h2 className='text-4xl font-extrabold text-orange-600 mb-2'>{field.name}</h2>
            <p className='text-sm text-gray-100'>
              Information about the fields of study related to{' '}
              <span className='font-semibold text-gray-300'>&apos;{field.name}&apos;</span> is shown
              below
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
                  <div>Number</div>
                  <div className='col-span-3'>Field of Study</div>
                </div>
              </div>
              <div className='max-h-80 overflow-y-auto'>
                {subjects.length > 0 ? (
                  subjects.map((s, i) => (
                    <div key={i} className='grid grid-cols-4 gap-4 py-3 border-b border-gray-200'>
                      <div className='text-sm text-gray-600'>{i + 1}</div>
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
        <div className='p-4 pr-10 border-t border-gray-100 flex justify-end'>
          <button
            onClick={onClose}
            className='bg-orange-400 text-white px-8 py-2 rounded-md hover:bg-orange-500 transition-colors font-medium'
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const UniversityDetail: React.FC = () => {
  const [university, setUniversity] = useState<University | null>(null);
  const [selectedField, setSelectedField] = useState<FieldConfig | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    axios.get(`/universities/${id}`).then((res) => setUniversity(res.data));
  }, [id]);

  if (!university) return <div className='p-8 text-center'>Loading...</div>;

  const academicFields =
    university.academicFieldsCommaSeparated?.split(',').map((f) => f.trim()) || [];
  const mappedFields = academicFields.map((f) => fieldConfigs[f]).filter(Boolean);
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
                className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
              />
              <div className='flex-1'>
                <h1 className='text-4xl font-bold text-blue-900 mb-2'>
                  About {university.university}
                </h1>
                <div className='text-base flex items-center gap-2 text-orange-500 mb-3'>
                  <MapPin className='w-4 h-4' />
                  <span>{university.country}</span>
                </div>
                <p className='text-gray-600 text-sm italic'>{university.description}</p>
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

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center min-h-[120px]'>
            <div className='flex items-center justify-center gap-2 mb-2'>
              <Star className='w-5 h-5 text-white' />
              <span className='text-sm font-medium text-white'>Ranking</span>
            </div>
            <div className='text-3xl font-bold text-white'>{university.rank ?? 'N/A'}</div>
          </div>
          <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center min-h-[120px]'>
            <div className='flex items-center justify-center gap-2 mb-2'>
              <Users className='w-5 h-5 text-white' />
              <span className='text-sm font-medium text-white'>Size</span>
            </div>
            <div className='text-3xl font-bold text-white'>{studentSize.size}</div>
            <div className='text-xs text-white mt-1'>{studentSize.population} students</div>
          </div>
          <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center min-h-[120px]'>
            <div className='flex items-center justify-center gap-2 mb-2'>
              <Building2 className='w-5 h-5 text-white' />
              <span className='text-sm font-medium text-white'>Type</span>
            </div>
            <div className='text-3xl font-bold text-white'>
              {university.type?.[0].toUpperCase() + university.type?.slice(1).toLowerCase() ||
                'N/A'}
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-2 mb-6'>
            <BookOutlined className='text-blue-900 text-[18px] relative bottom-[4px]' />
            <h3 className='text-lg font-semibold text-blue-900'>Broad Fields</h3>
          </div>
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            {mappedFields.map((config, index) => (
              <div
                key={index}
                role='button'
                tabIndex={0}
                onClick={() => {
                  setSelectedField(config);
                  setIsPopupOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedField(config);
                    setIsPopupOpen(true);
                  }
                }}
                className='text-center p-4 border rounded-lg hover:shadow-md transition-all shadow-md h-28 flex flex-col justify-center cursor-pointer hover:bg-gray-50 hover:border-orange-300 group'
              >
                <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                  {config.icon}
                </div>
                <h4 className='font-medium text-blue-900 text-sm leading-tight group-hover:text-orange-600 transition-colors'>
                  {config.name}
                </h4>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Contact className='w-5 h-5 text-blue-900 mt-[-10px]' />
            <h3 className='text-lg font-semibold text-blue-900'>Contact</h3>
          </div>
          <div className='flex justify-between flex-wrap gap-6 pl-[38px]'>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <Globe className='w-5 h-5 text-gray-600' />
              <span className='text-sm font-bold text-blue-600'>Website:</span>
              <a
                href={university.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800 text-sm break-all'
              >
                {university.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <MailIcon className='w-5 h-5 text-gray-600' />
              <span className='text-sm font-bold text-blue-600'>Email:</span>
              <a
                href={`mailto:${university.email}`}
                className='text-blue-600 hover:text-blue-800 text-sm'
              >
                {university.email}
              </a>
            </div>
            <div className='flex items-center gap-2 min-w-[280px]'>
              <PhoneIcon className='w-5 h-5 text-gray-600' />
              <span className='text-sm font-bold text-blue-600'>Phone:</span>
              <a
                href={`tel:${university.contact}`}
                className='text-blue-600 hover:text-blue-800 text-sm'
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
