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
      <div className='flex items-center justify-between px-4 py-1 min-h-12'>
        {/* Left side - Logo */}
        <div className='flex items-center space-x-2'>
          <img src={devplusLogo} alt='DevPlus Logo' className='h-8 w-auto md:h-10' />
        </div>

        {/* Right side - Notifications (always visible) */}
        <div className='flex items-center'>
          <AdminNotification />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
