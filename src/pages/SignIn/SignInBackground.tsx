import { Col } from 'antd';
import { FC } from 'react';

import loginImage from '@app/assets/images/login.png'; // login image path

const SignInBackground: FC = () => (
  <Col
    xs={0}
    sm={0}
    md={12}
    lg={12}
    xl={14}
    className='bg-[#e2e3e3] items-center justify-center p-4 md:p-8 relative min-h-screen hidden md:flex'
  >
    {/* Rounded container with image */}
    <div className='w-full max-w-xl rounded-2xl shadow-lg overflow-hidden flex items-center justify-center'>
      <img src={loginImage} alt='Login Illustration' className='w-full h-auto object-contain' />
    </div>
  </Col>
);

export default SignInBackground;
