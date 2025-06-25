import { LayoutDashboard, GraduationCap, FileText, User, LogOut, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: 'dashboard',
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

  const handleLogout = () => {
    console.log('Logout clicked');
    // navigate('/login');
  };

  return (
    <>
      <div className='lg:hidden p-4'>
        <button onClick={() => setIsOpen(true)} className='text-gray-700'>
          <Menu className='w-6 h-6' />
        </button>
      </div>

      <div
        className={`z-50 w-64 bg-white h-full flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-lg ${
          isOpen ? 'inset-y-0 left-0 translate-x-0' : 'inset-y-0 left-0 -translate-x-full'
        } lg:inset-y-0 lg:left-0 lg:translate-x-0`}
      >
        <div className='lg:hidden flex justify-end p-4'>
          <button onClick={() => setIsOpen(false)}>
            <X className='w-6 h-6 text-gray-700' />
          </button>
        </div>

        <div className='p-6 pt-8'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
              <User className='w-5 h-5 text-gray-600' />
            </div>
            <span className='text-gray-700 text-base font-medium'>Ngoc Nhi</span>
          </div>
        </div>

        <nav className='flex-1 py-4 overflow-y-auto'>
          <ul className='space-y-2 px-4 list-none'>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActiveParent = activeTab === item.id;

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

        {/* Logo at Bottom */}
        <div className='p-6 border-t border-gray-200'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>D</span>
            </div>
            <span className='text-orange-500 font-bold text-lg'>DevPlus</span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
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
