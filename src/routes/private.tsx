import { lazy } from 'react';

import AdminLayout from '@app/components/templates/AdminLayout/AdminLayout';
import ProtectedRoute from '@app/components/templates/ProtectedRoute';
import CreateUniversity from '@app/pages/admin/CreateUniversity';
import DashboardPage from '@app/pages/admin/DashboardPage';
import EditRequest from '@app/pages/admin/EditRequest';
import EditUniversity from '@app/pages/admin/EditUniversity';
import ManageAccount from '@app/pages/admin/ManageAccount';
import ManageRequest from '@app/pages/admin/ManageRequest';
import RequestDetail from '@app/pages/admin/RequestDetail';
import UniversityListPage from '@app/pages/admin/UniversityListPage';
import SignIn from '@app/pages/SignIn/SignIn';

const PrivateLayout = lazy(() => import('@app/components/templates/PrivateLayout'));
const NotFound = lazy(() => import('@app/pages/NotFound/NotFound'));
const Forbidden = lazy(() => import('@app/pages/Forbidden/Forbidden'));

const routes = [
  {
    path: 'login',
    element: <SignIn />,
  },
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
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute forbidSuperAdmin>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'universities',
        element: (
          <ProtectedRoute forbidSuperAdmin>
            <UniversityListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-university',
        element: (
          <ProtectedRoute forbidSuperAdmin>
            <CreateUniversity />
          </ProtectedRoute>
        ),
      },
      {
        path: 'edit-university/:id',
        element: (
          <ProtectedRoute forbidSuperAdmin>
            <EditUniversity />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manage',
        element: (
          <ProtectedRoute forbidSuperAdmin>
            <ManageRequest />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manage/:requestId',
        element: <ManageRequest />,
      },
      {
        path: 'account',
        element: (
          <ProtectedRoute requireSuperAdmin>
            <ManageAccount />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

export default routes;
