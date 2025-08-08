import { message, Spin } from 'antd';
import axios from 'axios';
import { LayoutDashboard, GraduationCap, FileText, User, LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import devplusLogo from '../assets/images/devplus.png';
import { getStorageStringData, removeStorageData } from '@app/config/storage';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/constants';
import { logout } from '@app/redux/features/auth/authSlice';
import { RootState } from '@app/redux/store';

interface SidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { user } = useSelector((state: RootState) => state.auth);
  const user = getStorageStringData('name');
  const role = getStorageStringData('role');

  const menuItems =
    role === 'super'
      ? [
          {
            id: 'manage-account',
            label: 'Manage Account',
            icon: User,
            path: '/account',
          },
          {
            id: 'logout',
            label: 'Logout',
            icon: LogOut,
            action: 'logout',
          },
        ]
      : [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/',
          },
          {
            id: 'manage-university',
            label: 'Manage University',
            icon: GraduationCap,
            path: '/universities',
          },
          {
            id: 'manage-request',
            label: 'Manage Request',
            icon: FileText,
            path: '/manage',
          },
          {
            id: 'logout',
            label: 'Logout',
            icon: LogOut,
            action: 'logout',
          },
        ];

  const handleMenuClick = (path: string, tabId: string) => {
    setActiveTab(tabId);
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get('/auth/logout');

      dispatch(logout());
      message.success('Logged out successfully!');
      window.location.href = '/login';
    } catch (error) {
      message.error('Logout failed. Please try again.');
      dispatch(logout());
    } finally {
      removeStorageData(ACCESS_TOKEN);
      removeStorageData(REFRESH_TOKEN);
      removeStorageData('name');
      removeStorageData('role');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className='fixed lg:hidden  top-4 left-4 z-50'>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className='p-2 bg-white border-none rounded-lg  text-[#FF6600] hover:bg-gray-50'
          >
            <Menu className='w-6 h-6' />
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`w-64 bg-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-lg
        fixed top-0 left-0 h-full
        ${isOpen ? 'z-50 translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:top-[64px] lg:h-[calc(100vh-48px)] lg:z-30
      `}
      >
        {/* Mobile-only top bar */}
        <div className='lg:hidden px-4 pt-4 pb-2 flex items-center justify-between '>
          <img src={devplusLogo} alt='DevPlus Logo' className='h-10' />
          <button
            onClick={() => setIsOpen(false)}
            className='p-1 bg-white border-none hover:bg-gray rounded-1/2'
          >
            <X className='w-6 h-6 text-[#666]' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 py-4 flex flex-col'>
          <ul className='space-y-1 list-none mx-6'>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <button
                    onClick={() =>
                      item.action === 'logout'
                        ? handleLogout()
                        : handleMenuClick(item.path || '/', item.id)
                    }
                    style={
                      isActive
                        ? {
                            backgroundColor: '#fff4ed',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                          }
                        : {}
                    }
                    className={`
                    w-full flex items-center space-x-3 px-4 py-3 text-sm rounded-xl
                    transition-all duration-30 ease-in-out
                    appearance-none bg-transparent border-none
                    ${
                      item.action === 'logout'
                        ? 'text-gray-500 hover:text-red-600'
                        : isActive
                        ? 'text-[#FF6600] bg-[#FF842B1C] shadow-xl font-semibold '
                        : 'text-gray-800 hover:text-[#FF6600]'
                    }
                  `}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        item.action === 'logout'
                          ? 'text-gray-500'
                          : isActive
                          ? 'text-[#FF6600]'
                          : 'text-gray-800'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className='px-6 py-2 mb-8 border-t border-gray-200 justify-start gap-3 flex items-center cursor-pointer hover:bg-gray rounded-full'>
          <div className='w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center'>
            <User className='w-6 h-6 text-[#bbb] bg-[#eee] p-2 rounded-full' />
          </div>
          <div className='w-3/4 relative text-xs'>
            <span className='text-sm font-semibold truncate text-[#333] '>{user || 'User'}</span>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          role='button'
          tabIndex={0}
          aria-label='Close sidebar overlay'
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(false);
            }
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
