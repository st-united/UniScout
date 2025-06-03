import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUniversity } from '../contexts/UniversityContext';

const FeaturedUniversities = () => {
  const { t } = useTranslation();
  const { featuredUniversities, loading } = useUniversity();
  console.log(
    'FeaturedUniversities component received featuredUniversities length:',
    featuredUniversities.length,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='text-3xl font-bold mb-8'>{t('DISCOVER UNIVERSITIES')}</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {featuredUniversities.map((university, index) => {
            console.log(`Rendering university ${index + 1}: ${university.name}`);
            return (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden'
              >
                <div className='aspect-w-16 aspect-h-9'>
                  <img
                    src={university.imageUrl}
                    alt={university.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='p-6'>
                  <h3 className='text-xl font-semibold mb-2'>{university.name}</h3>
                  <p className='text-gray-600 mb-4'>{university.country}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>{university.fields.join(', ')}</span>
                    {university.rating && (
                      <span className='text-primary font-semibold'>
                        {university.rating.toFixed(1)} ★
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedUniversities;
