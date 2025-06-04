import React from 'react';

import ConnectWithUs from './ConnectWithUs';
import Footer from './Footer';
import UniversityFilter from './UniversityFilter';
import Navbar from '../Base/Navbar';

const HomePage = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main>
        <UniversityFilter />
      </main>
      <ConnectWithUs />
      <Footer />
    </div>
  );
};

export default HomePage;
