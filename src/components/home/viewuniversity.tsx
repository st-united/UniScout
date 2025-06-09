import { Building2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import UniversityFilter from './universityfilter';
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
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>(universities);
  const universitiesPerPage = 16;

  const handleFilterChange = (filtered: University[]) => {
    setFilteredUniversities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const indexOfLastUniversity = currentPage * universitiesPerPage;
  const indexOfFirstUniversity = indexOfLastUniversity - universitiesPerPage;
  const currentUniversities = filteredUniversities.slice(
    indexOfFirstUniversity,
    indexOfLastUniversity,
  );

  const pageNumbers = Array.from(
    { length: Math.ceil(filteredUniversities.length / universitiesPerPage) },
    (_, i) => i + 1,
  );

  return (
    <div className='min-h-screen w-full px-4 py-6'>
      <div className='mx-auto max-w-[1440px] relative'>
        {/* Sidebar - Absolutely positioned within content container */}
        <div className='hidden lg:block absolute left-0 top-0 w-80 z-10'>
          <div className='sticky top-6'>
            <UniversityFilter universities={universities} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className='lg:hidden mb-6'>
          <UniversityFilter universities={universities} onFilterChange={handleFilterChange} />
        </div>

        {/* Content area - With left margin to account for sidebar */}
        <div className='lg:ml-[336px]'>
          {filteredUniversities.length === 0 ? (
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='text-gray-400 text-6xl mb-4'>🏫</div>
                <p className='text-gray-500 text-lg'>
                  No universities match the selected criteria.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
                {currentUniversities.map((university) => (
                  <UniversityCard key={university.id} university={university} />
                ))}
              </div>

              {/* Pagination */}
              {pageNumbers.length > 1 && (
                <div className='flex justify-center mt-8 gap-2 flex-wrap'>
                  <button
                    className='text-orange-500 disabled:text-gray-300'
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
                    className='text-orange-500 disabled:text-gray-300'
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(filteredUniversities.length / universitiesPerPage),
                          prev + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(filteredUniversities.length / universitiesPerPage)
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUniversity;
