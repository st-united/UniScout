import { Search, Bell } from 'lucide-react';
import React, { useState } from 'react';

interface HeaderProps {
  title?: string;
  searchPlaceholder?: string;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard',
  searchPlaceholder = 'Search',
  notificationCount = 9,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchValue);
  };

  return (
    <div className='bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Left: Page Title */}
        <div className='flex-1'>
          <h1 className='text-lg font-semibold text-gray-800'>{title}</h1>
        </div>

        {/* Center: Search */}
        <div className='flex-1 max-w-md mx-4'>
          <form onSubmit={handleSearchSubmit} className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-orange-50 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm'
            />
          </form>
        </div>

        {/* Right: Notifications */}
        <div className='flex items-center'>
          <button
            onClick={handleNotificationClick}
            className='relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Notifications'
          >
            <Bell className='w-5 h-5' />
            {notificationCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
