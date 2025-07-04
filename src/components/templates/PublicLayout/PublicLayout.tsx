import { Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';

import Footer from '@app/components/Layout/Footer';
import Navbar from '@app/components/Layout/Navbar';

const PublicLayout: React.FC = () => {
  return (
    <Layout>
      {/* Navbar will typically be part of PublicLayout for public pages */}
      <Navbar />
      <Layout.Content className='flex-1'>
        {/* Outlet renders the specific public page (e.g., University, ContactPage, SignIn) */}
        <Outlet />
      </Layout.Content>
      <Layout.Footer className='w-full p-0'>
        <Footer />
      </Layout.Footer>
    </Layout>
  );
};

export default PublicLayout;
