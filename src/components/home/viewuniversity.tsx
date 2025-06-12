import { Building2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import UniversityFilter from './universityfilter';
import WorldMap from './worldmap'; // Import the WorldMap component
import { University } from '../data/mockData';
import Navbar from '../layout/Navbar';

interface ViewUniversityProps {
  universities: University[];
}

interface UniversityCardProps {
  university: University;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => (
  <Link to={`/universities/${university.id}`} className='block'>
    <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer'>
      <div className='flex items-start justify-between mb-4'>
        <div>
          <h3 className='text-blue-700 font-medium mb-1 hover:text-blue-800'>{university.name}</h3>
          <div className='flex items-center text-orange-500'>
            <span className='text-sm'>{university.country}</span>
          </div>
        </div>
        <img
          src={university.logo}
          alt={`${university.name} logo`}
          className='w-12 h-12 rounded-lg object-cover'
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/48x48?text=Uni';
          }}
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

      {/* Additional info for better card preview */}
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
      <Navbar />
      {/* World Map Section */}
      <div className='mb-8'>
        <WorldMap className='w-full' />
      </div>

      <div className='mx-auto max-w-[1440px]'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Discover Universities</h1>
          <p className='text-gray-600'>
            Explore {filteredUniversities.length} universities from around the world
          </p>
        </div>

        {/* Main Content Layout */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Filter Sidebar */}
          <div className='lg:w-80 flex-shrink-0'>
            <UniversityFilter universities={universities} onFilterChange={handleFilterChange} />
          </div>

          {/* Universities Grid */}
          <div className='flex-1'>
            {filteredUniversities.length === 0 ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <div className='text-gray-400 text-6xl mb-4'>🏫</div>
                  <p className='text-gray-500 text-lg'>
                    No universities match the selected criteria.
                  </p>
                  <p className='text-gray-400 text-sm mt-2'>
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Results summary */}
                <div className='mb-6 flex items-center justify-between'>
                  <p className='text-gray-600'>
                    Showing {indexOfFirstUniversity + 1}-
                    {Math.min(indexOfLastUniversity, filteredUniversities.length)} of{' '}
                    {filteredUniversities.length} universities
                  </p>
                  <div className='text-sm text-gray-500'>
                    Page {currentPage} of {pageNumbers.length}
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
                  {currentUniversities.map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))}
                </div>

                {/* Pagination */}
                {pageNumbers.length > 1 && (
                  <div className='flex justify-center mt-8 gap-2 flex-wrap'>
                    <button
                      className='px-3 py-2 text-orange-500 disabled:text-gray-300 hover:bg-orange-50 rounded-md transition-colors'
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        className={`w-10 h-10 rounded-full transition-colors ${
                          currentPage === number
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      className='px-3 py-2 text-orange-500 disabled:text-gray-300 hover:bg-orange-50 rounded-md transition-colors'
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
    </div>
  );
};

export default ViewUniversity;
