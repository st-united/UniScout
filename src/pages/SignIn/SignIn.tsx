import { Col, Row } from 'antd';
import { FC, lazy, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '@app/redux/store';
import './SignIn.scss';

const SignInForm = lazy(() => import('./SignInForm'));

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
    <Row className='container-box-login'>
      <Col xs={24} sm={24} md={12} lg={9} className='login-box'>
        <SignInForm onInputChange={onInputChange} previousValue={previousValue} />
      </Col>
    </Row>
  );
};

export default SignIn;
