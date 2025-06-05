import React from 'react';

import ConnectWithUs from './ConnectWithUs';
import Footer from '@app/components/Layout/Footer';
import Navbar from '@app/components/Layout/Navbar';

const ContactPage: React.FC = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1'>
        <ConnectWithUs />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
