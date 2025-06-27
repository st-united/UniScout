import { lazy } from 'react';

const PrivateLayout = lazy(() => import('@app/components/templates/PrivateLayout'));
const NotFound = lazy(() => import('@app/pages/NotFound/NotFound'));
const Forbidden = lazy(() => import('@app/pages/Forbidden/Forbidden'));
import AdminLayout from '@app/components/templates/AdminLayout/AdminLayout';
import ProtectedRoute from '@app/components/templates/ProtectedRoute';
import CreateUniversity from '@app/pages/admin/CreateUniversity';
import DashboardPage from '@app/pages/admin/DashboardPage';
import EditUniversity from '@app/pages/admin/EditUniversity';
import ManagePage from '@app/pages/admin/ManagePage';
import UniversityListPage from '@app/pages/admin/UniversityListPage';

const routes = [
  {
    element: <PrivateLayout />,
    children: [
      {
        path: '404',
        element: <NotFound />,
      },
      {
        path: '403',
        element: <Forbidden />,
      },
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'universities',
        element: <UniversityListPage />,
      },
      {
        path: 'create-university',
        element: <CreateUniversity />,
      },
      {
        path: 'edit-university',
        element: <EditUniversity />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'manage',
        element: <ManagePage />,
      },
    ],
  },
];

export default routes;
