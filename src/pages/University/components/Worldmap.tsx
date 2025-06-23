import axios from 'axios';
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';

import mapImage from '@app/assets/images/map.png';

interface ApiCountryData {
  country: string;
  count: string;
}

interface CountryData {
  id: number;
  country: string;
  count: number;
}

interface WorldMapProps {
  className?: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ className = '' }) => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for the image wrapper div
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  // Actual pixel size of the image wrapper
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Update image size on mount and resize
  useLayoutEffect(() => {
    function updateSize() {
      if (imageWrapperRef.current) {
        const rect = imageWrapperRef.current.getBoundingClientRect();
        setImageSize({ width: rect.width, height: rect.height });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const fetchUniversityCount = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<ApiCountryData[]>('dashboard/country-distribution');

        if (response.data && Array.isArray(response.data)) {
          const transformedData: CountryData[] = response.data.map((item, index) => ({
            id: index + 1,
            country: item.country,
            count: parseInt(item.count, 10) || 0,
          }));
          setCountryData(transformedData);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        setError('Failed to load data from API. Using fallback data.');
        setCountryData([
          { id: 1, country: 'USA', count: 100 },
          { id: 2, country: 'India', count: 100 },
          { id: 3, country: 'Korea', count: 100 },
          { id: 4, country: 'Japan', count: 100 },
          { id: 5, country: 'Vietnam', count: 100 },
          { id: 6, country: 'Australia', count: 43 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityCount();
  }, []);

  const getCountryCount = (countryName: string): number => {
    let data = countryData.find((item) => item.country === countryName);
    if (!data) {
      const variations: { [key: string]: string[] } = {
        Korea: ['South Korea', 'Korea'],
        USA: ['United States', 'USA', 'US'],
        Australia: ['Australia', 'AU'],
      };
      for (const values of Object.values(variations)) {
        if (values.includes(countryName)) {
          data = countryData.find((item) => values.includes(item.country));
          if (data) break;
        }
      }
    }
    return data?.count || 0;
  };

  const handleCountryClick = (country: string) => {
    setSelectedCountry((prev) => (prev === country ? null : country));
  };

  // These are % relative to the original container.
  // We will convert them to pixels based on current image size.
  const countryPositionsPercent: Record<string, { left: number; top: number }> = {
    USA: { left: 8, top: 30 },
    India: { left: 70, top: 50 },
    Korea: { left: 86, top: 37 },
    Japan: { left: 90, top: 37 },
    Vietnam: { left: 81, top: 53 },
    Australia: { left: 89, top: 80 },
  };

  // Helper to convert % positions to pixels based on current image size
  const getMarkerPosition = (country: string) => {
    const posPercent = countryPositionsPercent[country];
    if (!posPercent) return { left: 0, top: 0 };
    return {
      left: (posPercent.left / 100) * imageSize.width,
      top: (posPercent.top / 100) * imageSize.height,
    };
  };

  const getCountryDisplayName = (country: string) => {
    switch (country) {
      case 'USA':
      case 'United States':
        return 'US';
      case 'South Korea':
      case 'Korea':
        return 'Korea';
      case 'Australia':
        return 'AU';
      default:
        return country;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {error && (
        <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <p className='text-sm text-yellow-800'>⚠️ {error}</p>
        </div>
      )}

      <div
        className='relative w-full rounded-lg overflow-hidden bg-[#09388a]'
        style={{
          backgroundImage: 'linear-gradient(to bottom right, #09388a, #09388a)',
        }}
      >
        {/* Image wrapper to size exactly to the image */}
        <div
          ref={imageWrapperRef}
          className='relative mx-auto' // centers image horizontally
          style={{
            maxWidth: '100%',
            maxHeight: '600px', // you can adjust max height here
            aspectRatio: '3 / 2', // keep ratio same as image
          }}
        >
          <img
            src={mapImage}
            alt='World Map'
            className='w-full h-full object-contain block select-none user-select-none pointer-events-none'
            draggable={false}
          />

          {/* Markers positioned absolutely relative to image wrapper */}
          <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
            {Object.entries(countryPositionsPercent).map(([country]) => {
              const pos = getMarkerPosition(country);
              const isSelected = selectedCountry === country;

              return (
                <div key={country}>
                  {/* Marker */}
                  <div
                    className='absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 z-10'
                    style={{
                      left: pos.left,
                      top: pos.top,
                    }}
                    role='button'
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => handleCountryClick(country)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCountryClick(country);
                      }
                    }}
                  >
                    <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                      <svg
                        className='w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
                      </svg>
                      <div
                        className={`absolute inset-0 ${
                          isSelected ? 'bg-yellow-400' : 'bg-orange-400'
                        } rounded-full animate-ping opacity-20`}
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <div
                    className='absolute pointer-events-none text-white text-xs md:text-sm font-bold drop-shadow-lg z-5'
                    style={{
                      left: pos.left,
                      top: pos.top - 20,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    {getCountryDisplayName(country)}
                  </div>

                  {/* Tooltip */}
                  {isSelected && (
                    <div
                      className='absolute z-20 pointer-events-none'
                      style={{
                        left: pos.left,
                        top: pos.top - 60,
                        transform: 'translate(-50%, -100%)',
                      }}
                    >
                      <div className='bg-white rounded-lg shadow-xl border-2 border-orange-400 p-3 min-w-24 animate-in fade-in duration-200'>
                        <div className='text-center'>
                          <div className='text-xs md:text-sm text-gray-700 font-semibold mb-1'>
                            {country}
                          </div>
                          <div className='text-lg md:text-xl font-bold text-blue-900'>
                            {loading ? '...' : getCountryCount(country)}
                          </div>
                          <div className='text-xs md:text-sm text-gray-600 font-medium'>
                            Universities
                          </div>
                        </div>
                        <div className='absolute left-1/2 top-full w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-orange-400 transform -translate-x-1/2'></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className='absolute inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center z-30'>
            <div className='text-white text-base md:text-lg flex items-center gap-3 bg-blue-800 px-6 py-3 rounded-lg shadow-lg'>
              <div className='animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full'></div>
              Loading university data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
