import React from 'react';
// import Statistics from '../home/Statistics'; // Removed
import FeaturedUniversities from '../home/FeaturedUniversities';
import WorldMap from '../home/WorldMap';
import ConnectWithUs from '../home/ConnectWithUs';
import UniversityFilter from '../UniversityFilter';

const HomePage = () => {
  return (
    <div>
      {/* Add negative margin to pull the map up visually */}
      <div className='relative z-10 w-2/3 mx-auto'>
        <WorldMap />
      </div>
      <UniversityFilter />
      <FeaturedUniversities />
      <ConnectWithUs />
    </div>
  );
};

export default HomePage;
