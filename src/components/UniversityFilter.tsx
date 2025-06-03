import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const UniversityFilter = () => {
  return (
    <div className='flex flex-col md:flex-row gap-4 items-start max-w-7xl mx-auto px-4 py-8'>
      <div className='w-full md:w-64 bg-white rounded-lg shadow p-4'>
        <div className='flex justify-between items-center mb-6'>
          <span className='text-orange-500 font-medium'>Filter</span>
          <button className='text-blue-600 text-sm'>Reset filter</button>
        </div>

        <div className='space-y-6'>
          <div>
            <h3 className='font-medium mb-2'>Country</h3>
            <div className='relative'>
              <select className='w-full p-2 border rounded-lg appearance-none bg-white pr-8'>
                <option>Select...</option>
              </select>
              <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Region</h3>
            <div className='relative'>
              <select className='w-full p-2 border rounded-lg appearance-none bg-white pr-8'>
                <option>Select...</option>
              </select>
              <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>University Type</h3>
            <div className='grid grid-cols-2 gap-2'>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='type' className='text-orange-500' />
                <span>Public</span>
              </label>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='type' className='text-orange-500' />
                <span>Academy</span>
              </label>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='type' className='text-orange-500' />
                <span>Private</span>
              </label>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='type' className='text-orange-500' />
                <span>International</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Size</h3>
            <div className='flex space-x-4'>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='size' className='text-orange-500' />
                <span>S</span>
              </label>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='size' className='text-orange-500' />
                <span>M</span>
              </label>
              <label className='flex items-center space-x-2'>
                <input type='radio' name='size' className='text-orange-500' />
                <span>L</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2'>Fields</h3>
            <div className='relative'>
              <select className='w-full p-2 border rounded-lg appearance-none bg-white pr-8'>
                <option>Select...</option>
              </select>
              <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1'>
        <div className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Search'
              className='w-full pl-10 pr-4 py-2 border rounded-lg'
            />
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          </div>
          <div className='flex items-center gap-4'>
            <button className='p-2 bg-orange-500 rounded-lg'>
              <SlidersHorizontal className='w-5 h-5 text-white' />
            </button>
            <select className='p-2 border rounded-lg pr-8 appearance-none'>
              <option>Sort by: high to low</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <UniversityCard key={i} />
          ))}
        </div>

        <div className='flex justify-center mt-8 gap-2'>
          <button className='text-orange-500'>Previous</button>
          {[1, 2, 3, 4, 5, 6].map((page) => (
            <button
              key={page}
              className={`w-8 h-8 rounded-full ${
                page === 1 ? 'bg-orange-500 text-white' : 'text-gray-500'
              }`}
            >
              {page}
            </button>
          ))}
          <button className='text-orange-500'>Next</button>
        </div>
      </div>
    </div>
  );
};

const UniversityCard = () => (
  <div className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow'>
    <div className='flex items-start justify-between mb-4'>
      <div>
        <h3 className='text-blue-700 font-medium mb-1'>
          About Massachusetts Institute of Technology (MIT)
        </h3>
        <div className='flex items-center text-orange-500'>
          <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
              clipRule='evenodd'
            />
          </svg>
          <span className='text-sm'>Cambridge, United States</span>
        </div>
      </div>
      <img
        src='https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=50'
        alt='MIT logo'
        className='w-12 h-12 rounded-lg object-cover'
      />
    </div>
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-2'>
        <div className='w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs'>
          5
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <svg className='w-5 h-5 text-blue-600' viewBox='0 0 20 20' fill='currentColor'>
          <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
        </svg>
        <span className='text-blue-600'>Academy</span>
      </div>
      <div className='flex items-center gap-2'>
        <svg className='w-5 h-5 text-blue-600' viewBox='0 0 20 20' fill='currentColor'>
          <path
            fillRule='evenodd'
            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
            clipRule='evenodd'
          />
        </svg>
        <span className='text-blue-600'>Medium</span>
      </div>
    </div>
  </div>
);

export default UniversityFilter;
