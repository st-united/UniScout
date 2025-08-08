import React from 'react';
import { Link } from 'react-router-dom';

import AdminNotification from './AdminNotification';
import devplusLogo from '../assets/images/devplus.png';

interface AdminHeaderProps {
  userName?: string;
  notificationCount?: number;
}

const AdminHeader: React.FC<AdminHeaderProps> = () => {
  return (
    <header className='fixed min-h-16 items-center top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between px-4 py-1 min-h-16'>
        {/* Left side - Logo */}
        <Link
          to='/'
          className='flex items-center space-x-2 cursor-pointer focus:outline-none'
          aria-label='Go to Dashboard'
        >
          <img
            src={devplusLogo}
            alt='DevPlus Logo'
            className='h-12 w-auto md:h-14 transition-transform duration-200 ml-10 lg:ml-3'
          />
        </Link>

        {/* Right side - Notifications */}
        <div className='flex items-center'>
          <AdminNotification />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
