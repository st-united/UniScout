import { Row } from 'antd';
import { FC, lazy, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getStorageStringData } from '@app/config/storage';
import { RootState } from '@app/redux/store';
import './SignIn.scss';

const SignInForm = lazy(() => import('./SignInForm'));
const SignInBackground = lazy(() => import('./SignInBackground'));

const SignIn: FC = () => {
  const navigate = useNavigate();

  const { isAuth } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    console.log('SignIn useEffect: isAuth changed to', isAuth);
    if (isAuth) {
      const role = getStorageStringData('role')?.toLowerCase();
      if (role === 'super') {
        navigate('/account');
      } else {
        navigate('/');
      }
    }
  }, [isAuth, navigate]);

  const [previousValue, setPreviousValue] = useState({
    email: '',
    password: '',
  });

  const onInputChange = useCallback((name: string, value: string) => {
    setPreviousValue((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='flex min-h-screen'>
        {/* Background Image - Hidden on mobile, visible on desktop */}
        <div className='hidden md:flex md:w-1/2'>
          <SignInBackground />
        </div>

        {/* Sign In Form - Full width on mobile, half width on desktop */}
        <div className='w-full md:w-1/2'>
          <SignInForm onInputChange={onInputChange} previousValue={previousValue} />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
