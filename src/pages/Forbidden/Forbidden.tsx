import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="text-xl text-gray-600 mt-4">Access forbidden</p>
        <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
        <Link to="/" className="mt-6 inline-block text-blue-600 hover:text-blue-800">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default Forbidden; 