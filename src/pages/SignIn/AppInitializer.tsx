import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { getStorageStringData, removeStorageData } from '@app/config/storage';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/constants';
import { logout, setAuth } from '@app/redux/features/auth/authSlice';
import router from '@app/router';
import { getMeApi, getUserProfileApi } from '@app/services/authAPI';

const AppInitializer = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStorageStringData(ACCESS_TOKEN);
    if (token) {
      getUserProfileApi()
        .then((profileRes) => {
          console.log('Profile response:', profileRes.data);
          const profile = profileRes.data.data;

          return getMeApi().then((meRes) => {
            const me = meRes.data.data;

            dispatch(
              setAuth({
                ...me, // userId, email, role
                ...profile, // name, avatar
                permissions: [],
              }),
            );
          });
        })

        .catch(() => {
          dispatch(logout());
          removeStorageData(ACCESS_TOKEN);
          removeStorageData(REFRESH_TOKEN);
          window.location.href = '/login';
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

export default AppInitializer;
