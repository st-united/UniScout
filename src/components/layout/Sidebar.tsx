import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, LogOut, X, Users } from 'lucide-react';
import { useAuth } from '@app/contexts/AuthContext';
import Logo from '@app/components/common/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Classes to control sidebar visibility and positioning
  const sidebarVisibilityClasses = isOpen
    ? 'translate-x-0 ease-out' // Slide in
    : '-translate-x-full ease-in'; // Slide out

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Don't render the sidebar if user is not signed in
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className='fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden' onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white border-r border-border h-screen z-50 transition-transform duration-300
          ${sidebarVisibilityClasses}
          md:static md:translate-x-0 // Always visible and static on md and larger
        `}
      >
        <div className='h-full flex flex-col'>
          {/* Mobile header (with close button) */}
          <div className='p-4 flex items-center justify-between md:hidden'>
            <Logo />
            <button onClick={onClose} className='p-2 rounded-full hover:bg-gray-100'>
              <X size={20} />
            </button>
          </div>

          {/* Desktop Logo */}
          <div className='hidden md:flex md:flex-col md:items-center md:p-6'>
            <Logo />
          </div>

          {/* Navigation */}
          <nav className='flex-1 py-4 px-2 overflow-y-auto'>
            <ul className='space-y-1'>
              <li>
                <Link
                  to='/'
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <LayoutDashboard size={20} className='mr-3' />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to='/universities'
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    isActive('/universities') || location.pathname.startsWith('/universities/')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <GraduationCap size={20} className='mr-3' />
                  Universities
                </Link>
              </li>

              {/* Temporarily disabled contact page
              <li>
                <Link
                  to="/contact"
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    isActive('/contact') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <Mail size={20} className="mr-3" />
                  Contact
                </Link>
              </li>
              */}

              {user?.role === 'admin' && (
                <>
                  <li className='pt-4'>
                    <div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                      Admin
                    </div>
                  </li>
                  <li>
                    <Link
                      to='/admin/dashboard'
                      className={`flex items-center px-4 py-3 rounded-lg ${
                        isActive('/admin/dashboard')
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={onClose}
                    >
                      <LayoutDashboard size={20} className='mr-3' />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/admin/universities'
                      className={`flex items-center px-4 py-3 rounded-lg ${
                        isActive('/admin/universities')
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={onClose}
                    >
                      <GraduationCap size={20} className='mr-3' />
                      Manage Universities
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* User/Auth section */}
          <div className='border-t border-border p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className='h-full w-full object-cover' />
                  ) : (
                    <Users size={20} />
                  )}
                </div>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-900'>{user.name}</p>
                <button
                  onClick={handleLogout}
                  className='text-xs font-medium text-gray-500 hover:text-primary flex items-center mt-1'
                >
                  <LogOut size={14} className='mr-1' />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
