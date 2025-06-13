import { Layout } from 'antd';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

// import Footer from '@app/components/Layout/Footer';
// import Navbar from '@app/components/Layout/Navbar1';
import { getStorageData } from '@app/config';
import { ACCESS_TOKEN } from '@app/constants';
import { RootState } from '@app/redux/store';

const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const token = getStorageData(ACCESS_TOKEN); // Cache token

  useEffect(() => {
    if (token && isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate, token]); // Include all stable dependencies

  return (
    <Layout>
      {/* <Navbar /> */}
      <Layout.Content className='flex-1'>
        <Outlet />
      </Layout.Content>
      {/* <Layout.Footer className='w-full p-0'>
        <Footer />
      </Layout.Footer> */}
    </Layout>
  );
};

export default PublicLayout;
