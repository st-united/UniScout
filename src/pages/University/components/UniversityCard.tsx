import { Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { UniversityCustom } from '@app/interface/university.interface';

interface UniversityCardProps {
  university: UniversityCustom;
}

const UniversityCard = ({ university }: UniversityCardProps) => {
  return (
    <Link to={`/universities/${university.id}`} className='block'>
      <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow h-35 flex flex-col justify-between'>
        <div className='flex items-start justify-between mb-4'>
          <div className='w-4/5'>
            <h3 className='text-blue-700 font-medium text-sm leading-tight line-clamp-2'>
              {university.name}
            </h3>
            <div className='text-orange-500 text-xs'>{university.country}</div>
          </div>
          <img
            src={university.logo}
            alt={`${university.name} logo`}
            className='w-12 h-12 object-contain rounded-lg'
          />
        </div>
        <div className='flex items-center gap-4 mt-auto'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs'>
              {university.ranking}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Building2 className='w-5 h-5 text-blue-600' />
            <span className='text-blue-600 text-xs'>{university.type}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Users className='w-5 h-5 text-blue-600' />
            <span className='text-blue-600 text-xs'>{university.size}</span>
          </div>
        </div>

        <div className='mt-3 pt-3 border-t border-gray-100'>
          <div className='flex items-center justify-between text-sm text-gray-600'>
            <span>{university.students.toLocaleString()} students</span>
            <span className='text-yellow-500'>★ {university.rating}</span>
          </div>
          <div className='mt-2'>
            <div className='flex flex-wrap gap-1'>
              {university.fields.slice(0, 3).map((field, index) => (
                <span
                  key={index}
                  className='inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full'
                >
                  {field}
                </span>
              ))}
              {university.fields.length > 3 && (
                <span className='inline-block text-gray-500 text-xs px-2 py-1'>
                  +{university.fields.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UniversityCard;
