import { LayoutDashboard, GraduationCap, FileText, User, LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'manage-university',
      label: 'Manage University',
      icon: GraduationCap,
      path: '/universities',
      children: [
        {
          id: 'manage-request',
          label: 'Manage Request',
          icon: FileText,
          path: '/manage',
        },
        {
          id: 'manage-account',
          label: 'Manage Account',
          icon: User,
          path: '/',
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

  const handleLogout = () => {
    console.log('Logout clicked');
    // navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className='lg:hidden p-4'>
        <button onClick={() => setIsOpen(true)} className='text-gray-700'>
          <Menu className='w-6 h-6' />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white h-full transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        {/* Close Button on Mobile */}
        <div className='lg:hidden flex justify-end p-4'>
          <button onClick={() => setIsOpen(false)}>
            <X className='w-6 h-6 text-gray-700' />
          </button>
        </div>

        {/* Logo */}
        <div className='p-6'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>D</span>
            </div>
            <span className='text-orange-500 font-bold text-lg'>DevPlus</span>
          </div>
        </div>

        {/* User Profile */}
        <div className='p-4'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
              <User className='w-4 h-4 text-gray-600' />
            </div>
            <span className='text-gray-700 text-sm font-medium'>Ngoc Nhi</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className='flex-1 py-4 overflow-y-auto'>
          <ul className='space-y-1 px-4 list-none'>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActiveParent = activeTab === item.id;

              return (
                <li key={item.id}>
                  {item.path ? (
                    <button
                      onClick={() => handleMenuClick(item.path!, item.id)}
                      className={`w-full flex items-center space-x-3 px-2 py-2 text-sm font-medium text-left focus:outline-none ${
                        isActiveParent ? 'text-orange-600' : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {IconComponent && <IconComponent className='w-5 h-5' />}
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <div className='flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 font-medium'>
                      {IconComponent && <IconComponent className='w-5 h-5' />}
                      <span>{item.label}</span>
                    </div>
                  )}

                  {item.children && (
                    <ul className='ml-3 mt-1 space-y-1 list-none'>
                      {item.children.map((child) => {
                        const isActive = activeTab === child.id;
                        const isLogout = child.action === 'logout';

                        return (
                          <li key={child.id}>
                            <button
                              onClick={() =>
                                isLogout ? handleLogout() : handleMenuClick(child.path!, child.id)
                              }
                              className={`w-full flex items-center space-x-2 px-2 py-1 text-left text-sm font-normal focus:outline-none ${
                                isActive ? 'text-orange-600' : 'text-gray-600 hover:text-gray-900'
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
      </div>
    </>
  );
};

export default Sidebar;
