import React from 'react';
import Hero from '../home/Hero';
import Statistics from '../home/Statistics';
import FeaturedUniversities from '../home/FeaturedUniversities';
// import WorldMap from '../home/WorldMap'; // Remove unused import

const HomePage = () => {
  return (
    <div>
      <Hero />
      <Statistics />
      <FeaturedUniversities />
{/*      <WorldMap /> */}
    </div>
  );
};

export default HomePage;