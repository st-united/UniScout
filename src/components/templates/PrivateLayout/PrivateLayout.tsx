import { Layout, Col, Spin } from 'antd';
import { FC, Suspense, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

import './PrivateLayout.scss';

import { removeStorageData } from '@app/config';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/constants';
import { useGetProfile } from '@app/hooks';
import { logout } from '@app/redux/features/auth/authSlice';
import { RootState } from '@app/redux/store';

const { Content } = Layout;

const PrivateLayout: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state: RootState) => state.auth);

  const { isLoading, error } = useGetProfile(isAuth);

  useEffect(() => {
    if (!isLoading && error && isAuth) {
      console.error(
        'PrivateLayout: Profile fetch failed, potentially due to invalid token. Forcing logout.',
        error,
      );
      removeStorageData(ACCESS_TOKEN);
      removeStorageData(REFRESH_TOKEN);

      dispatch(logout());

      navigate('/login', { replace: true });
    }
  }, [isLoading, error, isAuth, navigate, dispatch]);

  if (!isAuth) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <Layout>
      <Content className='content'>
        <Suspense fallback={<Spin />}>
          <Col className='outlet-layout'>
            <Outlet />
          </Col>
        </Suspense>
      </Content>
    </Layout>
  );
};

export default PrivateLayout;
