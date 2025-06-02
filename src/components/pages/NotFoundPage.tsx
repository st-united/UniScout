import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          {t('NOT_FOUND.TITLE')}
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          {t('NOT_FOUND.DESCRIPTION')}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Home className="w-5 h-5 mr-2" />
            {t('NOT_FOUND.GO_HOME')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;