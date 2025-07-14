import { Col } from 'antd';
import { FC } from 'react';

import loginImage from '@app/assets/images/login.png'; // login image path

const SignInBackground: FC = () => (
  <Col
    xs={24}
    sm={24}
    md={12}
    lg={12}
    xl={12}
    className='bg-[#e2e3e3] flex items-center justify-center min-h-screen p-0 order-2 md:order-1'
  >
    <div className='w-[90%] max-w-2xl rounded-2xl overflow-hidden shadow-lg'>
      <img
        src={loginImage}
        alt='Login Illustration'
        className='w-full h-auto object-contain rounded-2xl'
      />
    </div>
  </Col>
);

export default SignInBackground;
