import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Users,
  Building2,
  Star,
  Globe,
  Phone,
  Mail,
} from 'lucide-react';
import React from 'react';
import { useParams, Link } from 'react-router-dom';

import { University } from '../data/mockData';
import Navbar from '../layout/Navbar';

interface UniversityDetailProps {
  universities: University[];
}

interface FieldConfig {
  name: string;
  icon: string;
  description: string;
}

const fieldConfigs: Record<string, FieldConfig> = {
  'Computer Science': {
    name: 'Computer Science',
    icon: '💻',
    description: 'Science & Engineering',
  },
  Engineering: {
    name: 'Engineering',
    icon: '⚙️',
    description: 'Science & Engineering',
  },
  Business: {
    name: 'Business',
    icon: '💼',
    description: 'Economics, Business & Management',
  },
  Law: {
    name: 'Law',
    icon: '⚖️',
    description: 'Law & Political Science',
  },
  Medicine: {
    name: 'Medicine',
    icon: '🏥',
    description: 'Medicine, Pharmacy & Health Sciences',
  },
  Humanities: {
    name: 'Humanities',
    icon: '📚',
    description: 'Social Sciences & Humanities',
  },
  'Natural Sciences': {
    name: 'Natural Sciences',
    icon: '🔬',
    description: 'Science & Engineering',
  },
  'Social Sciences': {
    name: 'Social Sciences',
    icon: '👥',
    description: 'Social Sciences & Humanities',
  },
  Physics: {
    name: 'Physics',
    icon: '⚛️',
    description: 'Science & Engineering',
  },
  Chemistry: {
    name: 'Chemistry',
    icon: '🧪',
    description: 'Science & Engineering',
  },
  Astronomy: {
    name: 'Astronomy',
    icon: '🔭',
    description: 'Science & Engineering',
  },
  Science: {
    name: 'Science',
    icon: '🔬',
    description: 'Science & Engineering',
  },
  Arts: {
    name: 'Arts',
    icon: '🎨',
    description: 'Arts & Design',
  },
};

const UniversityDetail: React.FC<UniversityDetailProps> = ({ universities }) => {
  const { id } = useParams<{ id: string }>();
  const university = universities.find((u) => u.id === id);

  if (!university) {
    return (
      <div className='min-h-screen w-full px-4 py-6 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-gray-400 text-6xl mb-4'>🏫</div>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4'>University Not Found</h2>
          <Link
            to='/universities'
            className='text-orange-500 hover:text-orange-600 flex items-center justify-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Universities
          </Link>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao

&q=${university.location.lat},${university.location.lng}&zoom=15`;

  return (
    <div className='min-h-screen w-full px-4 py-6 bg-gray-50'>
      <Navbar />
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-6'>
          <Link
            to='/universities'
            className='inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Home
          </Link>

          {/* About and Map Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* About Section */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-start gap-4'>
                <img
                  src={university.logo}
                  alt={`${university.name} logo`}
                  className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
                />
                <div className='flex-1'>
                  <h1 className='text-3xl font-bold text-blue-900 mb-2'>About {university.name}</h1>
                  <div className='text-1xl flex items-center gap-2 text-orange-500 mb-3'>
                    <MapPin className='w-4 h-4' />
                    <span>{university.country}</span>
                  </div>
                  <p className='text-gray-600 text-sm italic'>{university.description}</p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='w-full h-64 bg-gray-100 rounded-lg overflow-hidden'>
                {/* Google Maps Embed */}
                <iframe
                  src={googleMapsUrl}
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                  title={`${university.name} Location`}
                />

                {/* Fallback for demo purposes */}
                <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                  <div className='text-center'>
                    <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                    <p className='text-gray-600 font-medium'>{university.name}</p>
                    <p className='text-sm text-gray-500'>{university.country}</p>
                    <p className='text-xs text-gray-400 mt-2'>
                      Coordinates: {university.location.lat}, {university.location.lng}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            <div className='bg-orange-100 rounded-lg p-6 text-center'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <Star className='w-5 h-5 text-orange-500' />
                <span className='text-sm font-medium text-gray-600'>Ranking</span>
              </div>
              <div className='text-3xl font-bold text-orange-600'>{university.ranking}</div>
            </div>

            <div className='bg-orange-100 rounded-lg p-6 text-center'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <Users className='w-5 h-5 text-orange-500' />
                <span className='text-sm font-medium text-gray-600'>Students</span>
              </div>
              <div className='text-3xl font-bold text-orange-600'>
                {university.students.toLocaleString()}
              </div>
            </div>

            <div className='bg-orange-100 rounded-lg p-6 text-center'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <Building2 className='w-5 h-5 text-orange-500' />
                <span className='text-sm font-medium text-gray-600'>Type</span>
              </div>
              <div className='text-3xl font-bold text-orange-600'>
                {university.type === 'Public' ? 'International' : 'Private'}
              </div>
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold text-blue-900 mb-6'>Fields</h3>
          <div
            className={`grid gap-4 ${
              university.fields.length <= 5
                ? `grid-cols-1 sm:grid-cols-${Math.min(university.fields.length, 5)}`
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
            }`}
          >
            {university.fields.map((field, index) => {
              const config = fieldConfigs[field] || {
                name: field,
                icon: '📚',
                description: 'General Studies',
              };

              return (
                <div
                  key={index}
                  className='text-center p-4 border rounded-lg hover:shadow-md transition-shadow'
                >
                  <div className='text-3xl mb-2'>{config.icon}</div>
                  <h4 className='font-medium text-blue-900 mb-1'>{config.name}</h4>
                  <p className='text-sm text-blue-800'>{config.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className='mt-12 bg-white rounded-lg shadow-sm p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
            <div className='flex items-center justify-center gap-2'>
              <Globe className='w-5 h-5 text-gray-600' />
              <span className='text-sm font-bold text-blue-600'>Website</span>
              <a
                href={university.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800 text-sm'
              >
                {university.website.replace('https://', '').replace('http://', '')}
              </a>
            </div>

            <div className='flex items-center justify-center gap-2'>
              <Mail className='w-5 h-5 text-gray-600' />
              <span className='text-sm font-bold text-blue-600'>Email</span>
              <span className='text-sm text-blue-500'>Contact university directly</span>
            </div>

            <div className='flex items-center justify-center gap-2'>
              <Phone className='w-5 h-5 text-gray-600' />
              <span className='text-sm font-bold text-blue-600'>Phone</span>
              <span className='text-sm text-blue-500'>See university website</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetail;
