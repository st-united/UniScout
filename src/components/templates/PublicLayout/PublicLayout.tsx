import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

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

  return <Outlet />;
};

export default PublicLayout;
