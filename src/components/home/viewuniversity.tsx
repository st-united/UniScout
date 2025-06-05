import { Building2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { University } from '../data/mockData';

interface ViewUniversityProps {
  universities: University[];
}

interface UniversityCardProps {
  university: University;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => (
  <Link to={`/universities/${university.id}`} className='block'>
    <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h3 className='text-blue-700 font-medium mb-1'>{university.name}</h3>
          <div className='flex items-center text-orange-500'>
            <span className='text-sm'>{university.country}</span>
          </div>
        </div>
        <img
          src={university.logo}
          alt={`${university.name} logo`}
          className='w-12 h-12 rounded-lg object-cover'
        />
      </div>
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <div className='w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs'>
            {university.ranking}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Building2 className='w-5 h-5 text-blue-600' />
          <span className='text-blue-600'>{university.type}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Users className='w-5 h-5 text-blue-600' />
          <span className='text-blue-600'>{university.size}</span>
        </div>
      </div>
    </div>
  </Link>
);

const ViewUniversity: React.FC<ViewUniversityProps> = ({ universities }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const universitiesPerPage = 16;

  const indexOfLastUniversity = currentPage * universitiesPerPage;
  const indexOfFirstUniversity = indexOfLastUniversity - universitiesPerPage;
  const currentUniversities = universities.slice(indexOfFirstUniversity, indexOfLastUniversity);

  const pageNumbers = Array.from(
    { length: Math.ceil(universities.length / universitiesPerPage) },
    (_, i) => i + 1,
  );

  return (
    <div className='flex-1'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {currentUniversities.map((university) => (
          <UniversityCard key={university.id} university={university} />
        ))}
      </div>

      <div className='flex justify-center mt-8 gap-2'>
        <button
          className='text-orange-500'
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`w-8 h-8 rounded-full ${
              currentPage === number ? 'bg-orange-500 text-white' : 'text-gray-500'
            }`}
            onClick={() => setCurrentPage(number)}
          >
            {number}
          </button>
        ))}
        <button
          className='text-orange-500'
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(Math.ceil(universities.length / universitiesPerPage), prev + 1),
            )
          }
          disabled={currentPage === Math.ceil(universities.length / universitiesPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ViewUniversity;
