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
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';

import { University } from '@app/interface/university.interface';

interface FieldConfig {
  name: string;
  icon: string;
  description: string;
}

const fieldConfigs: Record<string, FieldConfig> = {
  agriculturalFoodScience: {
    name: 'Agricultural & Food Science',
    icon: '🌾',
    description: 'Agriculture & Food Science',
  },
  artsDesign: { name: 'Arts & Design', icon: '🎨', description: 'Arts & Design' },
  economicsBusinessManagement: {
    name: 'Economics, Business & Management',
    icon: '💼',
    description: 'Economics, Business & Management',
  },
  scienceEngineering: { name: 'Engineering', icon: '⚙️', description: 'Science & Engineering' },
  lawPoliticalScience: {
    name: 'Law & Political Science',
    icon: '⚖️',
    description: 'Law & Political Science',
  },
  medicinePharmacyHealthSciences: {
    name: 'Medicine, Pharmacy & Health Sciences',
    icon: '🏥',
    description: 'Medicine, Pharmacy & Health Sciences',
  },
  physicalScience: { name: 'Physical Science', icon: '🔬', description: 'Science & Engineering' },
  socialSciencesHumanities: {
    name: 'Social Sciences & Humanities',
    icon: '📚',
    description: 'Social Sciences & Humanities',
  },
  sportsPhysicalEducation: {
    name: 'Sports & Physical Education',
    icon: '🏅',
    description: 'Sports & Physical Education',
  },
  technology: { name: 'Technology', icon: '💻', description: 'Technology' },
  others: { name: 'Others', icon: '🌍', description: 'Others' },
};

const getStudentSizeInfo = (studentPopulation: number | undefined) => {
  if (!studentPopulation) {
    return { size: 'N/A', description: 'Student population not available' };
  }

  if (studentPopulation < 5000) {
    return { size: 'S', description: `Small (under 5,000 students)` };
  } else if (studentPopulation < 15000) {
    return { size: 'M', description: `Medium (5,000–15,000 students)` };
  } else if (studentPopulation < 30000) {
    return { size: 'L', description: `Large (15,000–30,000 students)` };
  } else {
    return { size: 'XL', description: `Extra Large (over 30,000 students)` };
  }
};

const UniversityDetail: React.FC = () => {
  const [university, setUniversity] = useState<University | null>(null);
  const { id } = useParams<{ id: string }>();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await axios.get<University>(`universities/${id}`);
        setUniversity(response.data);
      } catch (error) {
        console.error('Error fetching university:', error);
      }
    };
    fetchUniversity();
  }, [id]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  if (!university) {
    return (
      <div className='min-h-screen w-full px-4 py-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-gray-400 text-6xl mb-4'>🏫</div>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4'>University Not Found</h2>
          <Link
            to={`/universities${location.search}`}
            className='text-orange-500 hover:text-orange-600 flex items-center justify-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Universities
          </Link>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&q=${university.latitude},${university.longitude}&zoom=15`;
  const studentSizeInfo = getStudentSizeInfo(university.studentPopulation);

  return (
    <div className='min-h-screen w-full px-4 py-6 bg-gray-50'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='pt-4 mb-6'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-2 text-[#595858] font-[500] mb-4 relative top-1 text-lg bg-transparent border-0 hover:bg-gray-100 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
            Home
          </button>

          {/* About and Map Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-start gap-4'>
                <img
                  src={university.logo}
                  alt={`${university.university} logo`}
                  className='w-20 h-20 rounded-lg object-contain bg-white p-1'
                />
                <div className='flex-1'>
                  <h1 className='text-4xl font-bold text-blue-900 mb-2'>
                    About {university.university}
                  </h1>
                  <div className='text-base flex items-center gap-2 text-orange-500 mb-3'>
                    <MapPin className='w-4 h-4' />
                    <span>
                      {university.country}
                      {university.location ? `, ${university.location}` : ''}
                    </span>
                  </div>
                  <p className='text-gray-600 text-sm italic'>{university.description}</p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='w-full h-64 bg-gray-100 rounded-lg overflow-hidden'>
                <iframe
                  src={googleMapsUrl}
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                  title={`${university.university} Location`}
                />
              </div>
            </div>
          </div>

          {/* Stats Row */}
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
              <div className='text-3xl font-bold text-white'>{studentSizeInfo.size}</div>
              <div className='text-xs text-white mt-1'>{studentSizeInfo.description}</div>
            </div>
            <div className='bg-orange-400 rounded-lg p-6 text-center flex flex-col justify-center min-h-[120px]'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <Building2 className='w-5 h-5 text-white' />
                <span className='text-sm font-medium text-white'>Type</span>
              </div>
              <div className='text-3xl font-bold text-white'>
                {university.type?.charAt(0).toUpperCase() +
                  university.type?.slice(1).toLowerCase() || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold text-blue-900 mb-6'>Fields</h3>
          {(() => {
            const mappedFields = university.academicFields?.map((field) => {
              const config = fieldConfigs[field] || {
                name: field,
                icon: '📚',
                description: 'General Studies',
              };
              return config;
            });

            if (!mappedFields || mappedFields.length === 0) {
              return <div className='text-gray-500'>No fields listed.</div>;
            }

            return (
              <div
                className={`grid gap-4 ${
                  mappedFields.length < 4
                    ? `grid-cols-1 sm:grid-cols-${Math.min(mappedFields.length, 5)}`
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                }`}
              >
                {mappedFields.map((config, index) => (
                  <div
                    key={index}
                    className='text-center p-4 border rounded-lg hover:shadow-md transition-shadow shadow-md h-28 flex flex-col justify-center'
                  >
                    <div className='text-3xl mb-2'>{config.icon}</div>
                    <h4 className='font-medium text-blue-900 text-sm leading-tight'>
                      {config.name}
                    </h4>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Contact Section */}
        <div className='mt-12 bg-white rounded-lg shadow-sm p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
            <div className='flex items-center justify-center gap-2'>
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
      </div>
    </div>
  );
};

export default UniversityDetail;
