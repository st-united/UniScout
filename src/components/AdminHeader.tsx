import { Menu } from 'lucide-react';
import React from 'react';

import AdminNotification from './AdminNotification';
import devplusLogo from '../assets/images/devplus.png';

interface AdminHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  userName?: string;
  notificationCount?: number;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, showMenuButton = true }) => {
  return (
    <header className='fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between px-4 py-1 h-12'>
        {/* Left side - Mobile menu button and logo/title */}
        <div className='flex items-center space-x-2'>
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className='lg:hidden p-1 rounded hover:bg-gray-50 text-gray-700'
            >
              <Menu className='w-5 h-5' />
            </button>
          )}

          <div className='flex items-cter space-x-1'>
            <img src={devplusLogo} alt='DevPlus Logo' className='w-26 h-12' />
          </div>
        </div>

        {/* Right side - Search filter */}
        <div className='flex items-center space-x-2'>
          <div className='hidden md:block'>
            <AdminNotification />
          </div>
        </div>
      </div>

      {/* Mobile search filter - shown below header on mobile */}
      <div className='md:hidden border-t border-gray-200 p-2'>
        <AdminNotification />
      </div>
    </header>
  );
};

export default AdminHeader;
