import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { University } from '../contexts/UniversityContext';

interface UniversityCardProps {
  university: University;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => {
  return (
    <Link
      to={`/universities/${university.id}`}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={university.logo}
          alt={university.name}
          className="object-cover rounded-t-lg w-full h-48"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {university.name}
        </h2>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{university.country}</span>
        </div>
        {university.rating && (
          <div className="flex items-center text-yellow-500 mb-2">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span className="font-medium">{university.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {university.fields.map(field => (
            <span
              key={field}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default UniversityCard;