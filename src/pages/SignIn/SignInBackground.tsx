import { FC } from 'react';

import loginImage from '@app/assets/images/login.png'; // login image path

const SignInBackground: FC = () => (
  <div className='bg-[#e2e3e3] flex items-center justify-center min-h-screen p-0 w-full'>
    <div className='w-[90%] max-w-2xl rounded-2xl overflow-hidden shadow-lg'>
      <img
        src={loginImage}
        alt='Login Illustration'
        className='w-full h-auto object-contain rounded-2xl'
      />
    </div>
  </div>
);

export default SignInBackground;
