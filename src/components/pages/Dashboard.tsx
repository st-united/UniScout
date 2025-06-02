import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, User, Building2 } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const quickActions = [
    {
      title: t('DASHBOARD.BROWSE_UNIVERSITIES'),
      icon: <Building2 className="w-6 h-6" />,
      link: '/universities'
    },
    {
      title: t('DASHBOARD.UPDATE_PROFILE'),
      icon: <User className="w-6 h-6" />,
      link: '/profile'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('DASHBOARD.WELCOME', { name: user?.name })}
      </h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-primary mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('DASHBOARD.SAVED_UNIVERSITIES')}
              </h3>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-primary mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('DASHBOARD.APPLICATIONS')}
              </h3>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('DASHBOARD.QUICK_ACTIONS')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors"
            >
              {action.icon}
              <span className="ml-3 text-gray-900">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('DASHBOARD.RECENT_ACTIVITY')}
        </h2>
        <p className="text-gray-500">{t('DASHBOARD.NO_ACTIVITY')}</p>
      </div>
    </div>
  );
};

export default Dashboard; 