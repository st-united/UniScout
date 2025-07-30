import { message } from 'antd';
import axios from 'axios';
import { LayoutDashboard, GraduationCap, FileText, User, LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import devplusLogo from '../assets/images/devplus.png';
import { removeStorageData } from '@app/config/storage';
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
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
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
    // 👇 Affiche "Manage Account" uniquement si user.role === 'superadmin'
    ...(user?.role === 'super'
      ? [
          {
            id: 'manage-account',
            label: 'Manage Account',
            icon: User,
            path: '/account',
          },
        ]
      : []),
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
    console.log('Logout clicked');
    try {
      await axios.get('/auth/logout', {
        headers: {
          Authorization: '',
        },
      });
      removeStorageData(ACCESS_TOKEN);
      removeStorageData(REFRESH_TOKEN);

      dispatch(logout());

      message.success('Logged out successfully!');
      console.log('Frontend logout complete. Redirecting to /login.');

      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || 'Logout failed.² Please try again.');
      } else {
        message.error('An unexpected error occurred during logout.');
      }

      removeStorageData(ACCESS_TOKEN);
      removeStorageData(REFRESH_TOKEN);
      dispatch(logout());
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className='lg:hidden fixed top-3 left-3 z-50'>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className='p-2 bg-white rounded-lg shadow text-gray-700 hover:bg-gray-50'
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
        {/* ✅ Mobile-only top bar: DevPlus logo + Close button in same row */}
        <div className='block lg:hidden px-4 pt-4 pb-2 flex items-center justify-between'>
          <img src={devplusLogo} alt='DevPlus Logo' className='h-10' />

          <button onClick={() => setIsOpen(false)} className='p-1 hover:bg-gray-100 rounded'>
            <X className='w-6 h-6 text-gray-700' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 py-4 flex flex-col '>
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
                    transition-all duration-300 ease-in-out
                    appearance-none bg-transparent border-none
                    ${
                      item.action === 'logout'
                        ? 'text-gray-500 hover:text-red-600'
                        : isActive
                        ? 'text-[#E75200] bg-[#FF842B1C] shadow-xl font-semibold '
                        : 'text-gray-800 hover:text-orange-600'
                    }
                  `}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        item.action === 'logout'
                          ? 'text-gray-500'
                          : isActive
                          ? 'text-orange-600'
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

        <div className='p-6 border-t border-gray-200 justify-start flex items-center'>
          <div className='w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center'>
            <User className='w-5 h-5 text-gray-600' />
          </div>
          <div className='flex items-center'>
            <span className='text-gray-700 text-base font-medium'>Ngoc Nhi</span>
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
