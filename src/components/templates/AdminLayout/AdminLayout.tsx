import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from '@app/components/Sidebar';

const pathToTab: Record<string, string> = {
  '/': 'dashboard',
  '/universities': 'manage-university',
  '/manage': 'manage-request',
  '/account': 'manage-account',
};

const AdminLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(pathToTab[location.pathname] || '');

  useEffect(() => {
    setActiveTab(pathToTab[location.pathname] || '');
  }, [location.pathname]);

  return (
    <div className='flex flex-row h-screen w-full'>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className='flex-1 p-6 overflow-y-auto w-full'>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
