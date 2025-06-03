import React from 'react';
// import { Contact } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className='bg-white shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <div className='text-2xl font-bold text-orange-500'>DEV PLUS</div>
          </div>
          {/* Temporarily disabled contact button
          <div className="flex items-center">
            <button className="inline-flex items-center px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-500 hover:text-white transition-colors">
              <Contact className="w-5 h-5 mr-2" />
              Contact
            </button>
          </div>
          */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Bell, Menu, User, LogOut } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import Logo from '../common/Logo';

// interface NavbarProps {
//   onMenuToggle: () => void;
// }

// const Navbar = ({ onMenuToggle }: NavbarProps) => {
//   const { user, logout } = useAuth();
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   return (
//     // <nav className="bg-white border-b border-border sticky top-0 z-50">
//     //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//     //     <div className="flex justify-between h-16">
//     //       <div className="flex items-center">
//     //         <button
//     //           className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
//     //           onClick={onMenuToggle}
//     //           aria-label="Menu"
//     //         >
//     //           <Menu size={24} />
//     //         </button>
//     //         <Link to="/" className="flex-shrink-0 flex items-center">
//     //           <Logo />
//     //         </Link>
//     //       </div>

//     //       <div className="flex items-center space-x-4">
//     //         <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
//     //           <Bell size={20} />
//     //         </button>

//     //         {user ? (
//     //           <div className="relative">
//     //             <button
//     //               className="flex items-center space-x-2"
//     //               onClick={() => setDropdownOpen(!dropdownOpen)}
//     //             >
//     //               <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
//     //                 {user.avatar ? (
//     //                   <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
//     //                 ) : (
//     //                   <User size={20} />
//     //                 )}
//     //               </div>
//     //               <span className="hidden md:block font-medium">{user.name}</span>
//     //             </button>

//     //             {dropdownOpen && (
//     //               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
//     //                 <Link
//     //                   to="/profile"
//     //                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//     //                   onClick={() => setDropdownOpen(false)}
//     //                 >
//     //                   Your Profile
//     //                 </Link>
//     //                 {user.role === 'admin' && (
//     //                   <Link
//     //                     to="/admin"
//     //                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//     //                     onClick={() => setDropdownOpen(false)}
//     //                   >
//     //                     Admin Dashboard
//     //                   </Link>
//     //                 )}
//     //                 <button
//     //                   onClick={() => {
//     //                     logout();
//     //                     setDropdownOpen(false);
//     //                   }}
//     //                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//     //                 >
//     //                   <div className="flex items-center">
//     //                     <LogOut size={16} className="mr-2" />
//     //                     Sign Out
//     //                   </div>
//     //                 </button>
//     //               </div>
//     //             )}
//     //           </div>
//     //         ) : (
//     //           <Link
//     //             to="/login"
//     //             className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
//     //           >
//     //             Sign In
//     //           </Link>
//     //         )}
//     //       </div>
//     //     </div>
//     //   </div>
//     // </nav>
//   );
// };

// export default Navbar;
