import { Button } from 'antd';
import { Building2, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import noImage from '@app/assets/images/noimage.png';
import { UniversityCustom } from '@app/interface/university.interface';

interface UniversityCardProps {
  university: UniversityCustom;
}

const UniversityCard = ({ university }: UniversityCardProps) => {
  return (
    <Link
      to={`/universities/${university.id}`}
      className='block'
      onClick={() => window.scrollTo(0, 0)}
    >
      <div
        className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col justify-between'
        style={{ height: '11rem' }}
      >
        <div className='flex items-start justify-between mb-4'>
          <div className='w-4/5'>
            {university.abbreviation && (
              <div style={{ marginBottom: 8 }}>
                <span className='inline-flex items-center gap-1 rounded-sm px-3 text-xs font-semibold text-[#FF6600] border border-solid border-[#FF6600] '>
                  {university.abbreviation}
                </span>
              </div>
            )}
            <h3 className='text-blue-700 font-bold text-sm leading-tight line-clamp-2 mb-1'>
              {university.name}
            </h3>
            <div className='flex text-[#FF6600] text-xs items-center gap-1'>
              <MapPin className='w-3 h-3' /> {university.country}
            </div>
          </div>
          <img
            src={university.logo.replace('http://localhost:3000/static/', '')}
            alt={`${university.name} logo`}
            className='w-16 h-16 object-contain rounded-lg'
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = noImage;
            }}
          />
        </div>
        <div className='flex items-center gap-4 mt-auto'>
          <div className='flex items-center gap-2'>
            <span className='text-blue-600 text-xs'>
              {university.ranking === 9999 ? '' : `#${university.ranking}`}
            </span>
            <Building2 className='w-5 h-5 text-blue-600' />
            <span className='text-blue-600 text-xs'>{university.type}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Users className='w-5 h-5 text-blue-600' />
            <span className='text-blue-600 text-xs'>{university.size}</span>
          </div>
        </div>

        <div className='mt-1 pt-1 border-t border-gray-100'>
          <div className='flex items-center justify-between text-sm text-gray-600'></div>
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
