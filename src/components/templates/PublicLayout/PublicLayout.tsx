import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

import { getStorageData } from '@app/config';
import { ACCESS_TOKEN } from '@app/constants';
import { RootState } from '@app/redux/store';

const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (getStorageData(ACCESS_TOKEN) && isAuth) {
      navigate('/');
    }
  }, [isAuth, getStorageData(ACCESS_TOKEN)]);

  return <Outlet />;
};

export default PublicLayout;
