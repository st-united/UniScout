import { ArrowLeft, Globe, MapPin, Users, Building2, Star, ExternalLink } from 'lucide-react';
import React from 'react';

// Mock University interface (would import from your actual data file)
interface University {
  id: string;
  name: string;
  logo: string;
  country: string;
  region: string;
  ranking: number;
  size: string;
  fields: string[];
  description: string;
  website: string;
  partnerships: number;
  students: number;
  location: { lat: number; lng: number };
  type: string;
  rating: number;
}

interface UniversityDetailProps {
  university?: University;
  onBack?: () => void;
}

// Field mapping for display
const fieldCategories = {
  'Computer Science': { icon: '💻', category: 'Science & Engineering' },
  Engineering: { icon: '⚙️', category: 'Science & Engineering' },
  Business: { icon: '💼', category: 'Economics, Business & Management' },
  Law: { icon: '⚖️', category: 'Law & Political Science' },
  Medicine: { icon: '🏥', category: 'Medicine, Pharmacy & Health Sciences' },
  Humanities: { icon: '📚', category: 'Social Sciences & Humanities' },
  'Social Sciences': { icon: '👥', category: 'Social Sciences & Humanities' },
  'Natural Sciences': { icon: '🧪', category: 'Science & Engineering' },
  Physics: { icon: '⚛️', category: 'Science & Engineering' },
  Chemistry: { icon: '🧪', category: 'Science & Engineering' },
  Astronomy: { icon: '🔭', category: 'Science & Engineering' },
  Arts: { icon: '🎨', category: 'Arts & Design' },
};

// Sample MIT data for demonstration
const sampleUniversity: University = {
  id: '1',
  name: 'Massachusetts Institute of Technology',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png',
  country: 'United States',
  region: 'North America',
  ranking: 1,
  size: 'Large',
  fields: ['Computer Science', 'Engineering', 'Business'],
  description:
    'MIT is a prestigious private research university located in Cambridge, Massachusetts. It is known for its rigorous academic programs in engineering, computer science, and the physical sciences.',
  website: 'https://www.mit.edu',
  partnerships: 120,
  students: 11000,
  location: { lat: 42.3601, lng: -71.0942 },
  type: 'Private',
  rating: 4.9,
};

const UniversityDetail: React.FC<UniversityDetailProps> = ({
  university = sampleUniversity,
  onBack,
}) => {
  if (!university) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>University Not Found</h2>
          <button onClick={onBack} className='text-orange-500 hover:text-orange-600'>
            ← Back to Universities
          </button>
        </div>
      </div>
    );
  }

  // Group fields by category
  const groupedFields = university.fields.reduce((acc, field) => {
    const fieldInfo = fieldCategories[field as keyof typeof fieldCategories];
    if (fieldInfo) {
      const category = fieldInfo.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ name: field, icon: fieldInfo.icon });
    }
    return acc;
  }, {} as Record<string, Array<{ name: string; icon: string }>>);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <button
            onClick={onBack}
            className='inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Home
          </button>

          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-blue-700 mb-2'>About {university.name}</h1>
              <div className='flex items-center text-orange-500 mb-4'>
                <MapPin className='w-4 h-4 mr-1' />
                <span>{university.country}</span>
              </div>
              <p className='text-gray-600 max-w-2xl leading-relaxed'>{university.description}</p>
            </div>

            {/* Interactive Map */}
            <div className='w-80 h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg ml-8 relative overflow-hidden border-2 border-gray-200 shadow-sm'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='relative'>
                    <div className='w-16 h-16 bg-red-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg animate-pulse'>
                      <MapPin className='w-8 h-8 text-white' />
                    </div>
                    <div className='absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full animate-ping'></div>
                  </div>
                  <p className='text-sm font-medium text-gray-700 mb-1'>{university.name}</p>
                  <p className='text-xs text-gray-500'>
                    {university.location.lat.toFixed(4)}, {university.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Map grid pattern */}
              <div className='absolute inset-0 opacity-10'>
                <div className='grid grid-cols-8 grid-rows-6 h-full'>
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className='border border-gray-300'></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold'>{university.ranking}</div>
                <div className='text-orange-100'>Ranking</div>
              </div>
              <Star className='w-8 h-8 text-orange-200' />
            </div>
          </div>

          <div className='bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold'>{university.students.toLocaleString()}</div>
                <div className='text-orange-100'>Students</div>
              </div>
              <Users className='w-8 h-8 text-orange-200' />
            </div>
          </div>

          <div className='bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold'>{university.type}</div>
                <div className='text-orange-100'>Type</div>
              </div>
              <Building2 className='w-8 h-8 text-orange-200' />
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-blue-700 mb-6'>Fields</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Object.entries(groupedFields).map(([category, fields]) => (
              <div
                key={category}
                className='bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100'
              >
                <h3 className='font-semibold text-blue-600 mb-4 text-lg border-b border-gray-100 pb-2'>
                  {category}
                </h3>
                <div className='space-y-3'>
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className='flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors'
                    >
                      <span className='text-2xl mr-3'>{field.icon}</span>
                      <span className='text-gray-700 font-medium'>{field.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-100'>
            <h3 className='text-lg font-semibold text-blue-700 mb-4 flex items-center'>
              <Building2 className='w-5 h-5 mr-2' />
              University Details
            </h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Size:</span>
                <span className='font-medium text-gray-800'>{university.size}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Region:</span>
                <span className='font-medium text-gray-800'>{university.region}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Partnerships:</span>
                <span className='font-medium text-gray-800'>{university.partnerships}</span>
              </div>
              <div className='flex justify-between items-center py-2'>
                <span className='text-gray-600'>Rating:</span>
                <div className='flex items-center'>
                  <Star className='w-4 h-4 text-yellow-400 fill-current mr-1' />
                  <span className='font-medium text-gray-800'>{university.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-100'>
            <h3 className='text-lg font-semibold text-blue-700 mb-4 flex items-center'>
              <Globe className='w-5 h-5 mr-2' />
              Contact Information
            </h3>
            <div className='space-y-4'>
              <div className='p-4 bg-blue-50 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <Globe className='w-4 h-4 text-blue-600 mr-2' />
                  <span className='text-gray-700 font-medium'>Website</span>
                </div>
                <a
                  href={university.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium'
                >
                  {university.website.replace('https://', '')}
                  <ExternalLink className='w-4 h-4 ml-1' />
                </a>
              </div>

              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <span className='text-gray-700 font-medium'>📧 Email</span>
                </div>
                <span className='text-gray-600'>
                  admissions@{university.website.split('//')[1]}
                </span>
              </div>

              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <span className='text-gray-700 font-medium'>📞 Phone</span>
                </div>
                <span className='text-gray-600'>Available on official website</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 py-8 mt-12'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <div className='flex items-center mb-4'>
                <Globe className='w-5 h-5 text-orange-500 mr-2' />
                <span className='font-semibold text-gray-800'>Website</span>
              </div>
              <a
                href={university.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800 transition-colors'
              >
                {university.website}
              </a>
            </div>

            <div>
              <div className='flex items-center mb-4'>
                <span className='font-semibold text-gray-800'>📧 Email</span>
              </div>
              <span className='text-gray-600'>admissions@{university.website.split('//')[1]}</span>
            </div>

            <div>
              <div className='flex items-center mb-4'>
                <span className='font-semibold text-gray-800'>📞 Phone</span>
              </div>
              <span className='text-gray-600'>Contact through official website</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UniversityDetail;
