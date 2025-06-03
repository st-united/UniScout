import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUniversity } from '../contexts/UniversityContext';
import { Search, Filter } from 'lucide-react';

const Universities = () => {
  const { t } = useTranslation();
  const { universities } = useUniversity();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const regions = Array.from(new Set(universities.map((u) => u.region)));

  const filteredUniversities = universities.filter((university) => {
    const matchesSearch =
      university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      university.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || university.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>{t('UNIVERSITIES.TITLE')}</h1>

      {/* Search and Filter */}
      <div className='mb-8 flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder={t('UNIVERSITIES.SEARCH_PLACEHOLDER')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
            />
          </div>
        </div>
        <div className='w-full md:w-48'>
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none'
            >
              <option value=''>{t('UNIVERSITIES.ALL_REGIONS')}</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* University List */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredUniversities.map((university) => (
          <Link
            key={university.id}
            to={`/universities/${university.id}`}
            className='bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200'
          >
            <div className='aspect-w-16 aspect-h-9'>
              <img
                src={university.imageUrl}
                alt={university.name}
                className='object-cover rounded-t-lg w-full h-48'
              />
            </div>
            <div className='p-4'>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>{university.name}</h2>
              <p className='text-gray-600 mb-2'>{university.country}</p>
              <div className='flex flex-wrap gap-2'>
                {university.fields.map((field) => (
                  <span
                    key={field}
                    className='px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full'
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredUniversities.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>{t('UNIVERSITIES.NO_RESULTS')}</p>
        </div>
      )}
    </div>
  );
};

export default Universities;
