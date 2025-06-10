import { Contact, University } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { devplus } from '@app/assets/images';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className='h-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
      <div className='flex justify-between '>
        <div className='flex items-center'>
          <button
            onClick={() => navigate('/universities')}
            className='bg-transparent border-none cursor-pointer'
          >
            <img
              className='w-40 font-bold text-orange-500 bg-no-repeat bg-cover border-none rounded-none'
              src={devplus}
              alt='devplus'
            />
          </button>
        </div>
        <div className='flex items-center'>
          <button
            onClick={() => navigate('/contact')}
            className='flex text-sm border-none items-center h-[70%] px-4 text-white transition-colors rounded-md bg-orange-500 hover:bg-orange-900 hover:text-white'
          >
            <Contact className='w-5 mr-2 text-sm' />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
