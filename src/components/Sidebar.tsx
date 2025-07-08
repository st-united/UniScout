import { message } from 'antd';
import axios from 'axios';
import { LayoutDashboard, GraduationCap, FileText, User, LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import devplusLogo from '../assets/images/devplus.png';
import { removeStorageData } from '@app/config/storage';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/constants';
import { logout } from '@app/redux/features/auth/authSlice';

interface SidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      path: 'universities',
      children: [
        {
          id: 'manage-request',
          label: 'Manage Request',
          icon: FileText,
          path: 'manage',
        },
        {
          id: 'manage-account',
          label: 'Manage Account',
          icon: User,
          path: 'account',
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: LogOut,
          action: 'logout',
        },
      ],
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
      await axios.get('/api/auth/logout', {
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
        message.error(error.response.data.message || 'Logout failed. Please try again.');
      } else {
        message.error('An unexpected error occurred during logout.');
      }

      removeStorageData(ACCESS_TOKEN);
      removeStorageData(REFRESH_TOKEN);
      dispatch(logout());
      window.location.href = '/login';
    } finally {
      setIsOpen(false);
    }
  };

  const isParentActive = (item: (typeof menuItems)[number]): boolean => {
    if (item.id === activeTab) return true;
    if (item.children) {
      return item.children.some((child) => child.id === activeTab);
    }
    return false;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className='lg:hidden fixed top-4 left-4 z-50'>
        <button
          onClick={() => setIsOpen(true)}
          className='p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-50'
        >
          <Menu className='w-6 h-6' />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-50 w-64 bg-white h-full flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <div className='lg:hidden flex justify-end p-4'>
          <button onClick={() => setIsOpen(false)} className='p-1 hover:bg-gray-100 rounded'>
            <X className='w-6 h-6 text-gray-700' />
          </button>
        </div>

        {/* User profile section */}
        <div className='p-6 pt-8'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
              <User className='w-5 h-5 text-gray-600' />
            </div>
            <span className='text-gray-700 text-base font-medium'>Ngoc Nhi</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 py-4 overflow-y-auto'>
          <ul className='space-y-2 px-4 list-none'>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActiveParent = isParentActive(item);

              return (
                <li key={item.id}>
                  {item.path ? (
                    <button
                      onClick={() => handleMenuClick(item.path!, item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-left rounded-lg transition-all duration-200 focus:outline-none ${
                        isActiveParent
                          ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-600'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      {IconComponent && <IconComponent className='w-5 h-5' />}
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <div
                      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActiveParent
                          ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-600'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      {IconComponent && <IconComponent className='w-5 h-5' />}
                      <span>{item.label}</span>
                    </div>
                  )}

                  {/* Child menu items */}
                  {item.children && (
                    <ul className='ml-6 mt-2 space-y-1 list-none'>
                      {item.children.map((child) => {
                        const isActive = activeTab === child.id;
                        const isLogout = child.action === 'logout';

                        return (
                          <li key={child.id}>
                            <button
                              onClick={() =>
                                isLogout ? handleLogout() : handleMenuClick(child.path!, child.id)
                              }
                              className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm font-normal rounded-lg transition-all duration-200 focus:outline-none ${
                                isActive
                                  ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-600'
                                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                              }`}
                              style={{ background: 'none', border: 'none' }}
                            >
                              {child.icon && <child.icon className='w-4 h-4' />}
                              <span>{child.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className='p-6 border-t border-gray-200'>
          <div className='flex items-center space-x-2'>
            <img src={devplusLogo} alt='DevPlus Logo' className='w-18 h-12' />
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
