import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';

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
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Update map dimensions when window resizes or image loads
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setMapDimensions({ width: rect.width, height: rect.height });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const fetchUniversityCount = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<ApiCountryData[]>('dashboard/country-distribution', {});

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
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            setError('Request timeout - API took too long to respond');
          } else if (error.response) {
            setError(`API Error: ${error.response.status} - ${error.response.statusText}`);
          } else if (error.request) {
            setError('Network error - Unable to reach API server');
          } else {
            setError(`Request error: ${error.message}`);
          }
        } else {
          setError('Failed to load data from API');
        }

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

      for (const [_, values] of Object.entries(variations)) {
        if (values.includes(countryName)) {
          data = countryData.find((item) => values.includes(item.country));
          if (data) break;
        }
      }
    }

    return data?.count || 0;
  };

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(selectedCountry === countryName ? null : countryName);
  };

  const countryPositions = {
    USA: { x: 0.38, y: 0.3 },
    India: { x: 0.97, y: 0.48 },
    Korea: { x: 1.13, y: 0.35 },
    Japan: { x: 1.17, y: 0.38 },
    Vietnam: { x: 1.08, y: 0.52 },
    Australia: { x: 1.16, y: 0.8 },
  };

  const getMarkerPosition = (country: string) => {
    const position = countryPositions[country as keyof typeof countryPositions];
    if (!position || !mapDimensions.width || !mapDimensions.height) {
      return { x: 0, y: 0 };
    }

    return {
      x: position.x * mapDimensions.width,
      y: position.y * mapDimensions.height,
    };
  };

  const getCountryDisplayName = (country: string) => {
    switch (country) {
      case 'United States':
      case 'USA':
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
          <p className='text-sm text-yellow-800'>⚠️ {error} - Using sample data</p>
        </div>
      )}

      <div
        className='relative w-full rounded-lg overflow-hidden'
        style={{
          height: '50vh',
          minHeight: '600px',
          backgroundColor: '#09388a',
          backgroundImage: 'linear-gradient(to bottom right, #09388a, #09388a)',
        }}
      >
        <div ref={mapRef} className='relative w-full h-full flex items-center justify-center'>
          <img
            ref={imageRef}
            src={mapImage}
            alt='World Map'
            className='max-w-full max-h-full object-contain'
            onLoad={() => {
              if (imageRef.current) {
                const rect = imageRef.current.getBoundingClientRect();
                setMapDimensions({ width: rect.width, height: rect.height });
              }
            }}
          />

          {mapDimensions.width > 0 && (
            <div className='absolute inset-0 pointer-events-none'>
              {Object.keys(countryPositions).map((country) => {
                const position = getMarkerPosition(country);
                const isSelected = selectedCountry === country;

                return (
                  <div key={country}>
                    <div
                      className='absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 z-10'
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
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
                          className={`w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg`}
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
                        </svg>

                        <div
                          className={`absolute inset-0 ${
                            isSelected ? 'bg-yellow-400' : 'bg-orange-400'
                          } rounded-full animate-ping opacity-20`}
                        ></div>
                      </div>
                    </div>

                    <div
                      className='absolute pointer-events-none text-white text-xs md:text-sm font-bold drop-shadow-lg z-5'
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y - 20}px`,
                        transform: 'translate(-50%, -100%)',
                      }}
                    >
                      {getCountryDisplayName(country)}
                    </div>

                    {isSelected && (
                      <div
                        className='absolute z-20 pointer-events-none'
                        style={{
                          left: `${position.x}px`,
                          top: `${position.y - 60}px`,
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
          )}

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
    </div>
  );
};

export default WorldMap;
