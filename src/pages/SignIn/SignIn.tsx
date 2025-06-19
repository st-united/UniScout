import { Row } from 'antd';
import { FC, lazy, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '@app/redux/store';
import './SignIn.scss';

const SignInForm = lazy(() => import('./SignInForm'));
const SignInBackground = lazy(() => import('./SignInBackground'));

const SignIn: FC = () => {
  const navigate = useNavigate();

  const { isAuth } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (isAuth) navigate('/');
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
      <Row className='min-h-screen'>
        <SignInBackground />
        <SignInForm onInputChange={onInputChange} previousValue={previousValue} />
      </Row>
    </div>
  );
};

export default SignIn;
