import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Globe, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUniversity } from '../contexts/UniversityContext';

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const UniversityDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { universities } = useUniversity();

  const university = universities.find((u) => u.id === id);

  if (!university) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            {t('UNIVERSITY_DETAILS.NOT_FOUND')}
          </h1>
          <button
            onClick={() => navigate('/universities')}
            className='text-primary hover:text-primary-dark'
          >
            {t('UNIVERSITY_DETAILS.BACK_TO_LIST')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <button
        onClick={() => navigate('/universities')}
        className='flex items-center text-gray-600 hover:text-gray-900 mb-6'
      >
        <ArrowLeft className='w-5 h-5 mr-2' />
        {t('UNIVERSITY_DETAILS.BACK')}
      </button>

      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='aspect-w-16 aspect-h-9'>
          <img
            src={university.imageUrl}
            alt={university.name}
            className='object-cover w-full h-96'
          />
        </div>

        <div className='p-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>{university.name}</h1>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                {t('UNIVERSITY_DETAILS.ABOUT')}
              </h2>
              <p className='text-gray-600 mb-6'>{university.description}</p>

              <div className='space-y-4'>
                <div className='flex items-center text-gray-600'>
                  <MapPin className='w-5 h-5 mr-2' />
                  <span>{university.country}</span>
                </div>
                <div className='flex items-center text-gray-600'>
                  <Globe className='w-5 h-5 mr-2' />
                  <span>{university.region}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                {t('UNIVERSITY_DETAILS.FIELDS')}
              </h2>
              <div className='flex flex-wrap gap-2 mb-6'>
                {university.fields.map((field) => (
                  <span key={field} className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full'>
                    {field}
                  </span>
                ))}
              </div>

              <div className='h-64 rounded-lg overflow-hidden'>
                <MapContainer
                  center={university.location as L.LatLngExpression}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={university.location as L.LatLngExpression}>
                    <Popup>{university.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetails;
