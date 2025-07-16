import React from 'react';

import AdminNotification from './AdminNotification';
import devplusLogo from '../assets/images/devplus.png';

interface AdminHeaderProps {
  userName?: string;
  notificationCount?: number;
}

const AdminHeader: React.FC<AdminHeaderProps> = () => {
  return (
    <header className='fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between px-4 py-1 h-12'>
        {/* Left side - Logo */}
        <div className='flex items-center space-x-2'>
          <div className='flex items-center space-x-1'>
            <img src={devplusLogo} alt='DevPlus Logo' className='w-26 h-12' />
          </div>
        </div>

        {/* Right side - Notifications */}
        <div className='flex items-center space-x-2'>
          <div className='hidden md:block'>
            <AdminNotification />
          </div>
        </div>
      </div>

      {/* Mobile notifications below header */}
      <div className='md:hidden border-t border-gray-200 p-2'>
        <AdminNotification />
      </div>
    </header>
  );
};

export default AdminHeader;
