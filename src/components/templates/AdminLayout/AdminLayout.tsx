import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from '@app/components/Sidebar';

// Define a tab mapping for exact and prefix routes
const pathToTabExact: Record<string, string> = {
  '/': 'dashboard',
  '/universities': 'manage-university',
  '/manage': 'manage-request',
  '/account': 'manage-account',
};

const pathToTabPrefix: Record<string, string> = {
  '/edit-university': 'manage-university',
  '/create-university': 'manage-university',
  '/edit-request': 'manage-request',
  '/add-request': 'manage-request',
  '/edit-account': 'manage-account',
};

const AdminLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const { pathname } = location;

    // 1. Check exact matches
    if (pathToTabExact[pathname]) {
      setActiveTab(pathToTabExact[pathname]);
      return;
    }

    // 2. Check dynamic route prefix matches
    const matchedPrefix = Object.keys(pathToTabPrefix).find((prefix) =>
      pathname.startsWith(prefix),
    );

    if (matchedPrefix) {
      setActiveTab(pathToTabPrefix[matchedPrefix]);
    } else {
      setActiveTab('');
    }
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
