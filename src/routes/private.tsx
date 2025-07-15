import { lazy } from 'react';

const PrivateLayout = lazy(() => import('@app/components/templates/PrivateLayout'));
const NotFound = lazy(() => import('@app/pages/NotFound/NotFound'));
const Forbidden = lazy(() => import('@app/pages/Forbidden/Forbidden'));
import AdminLayout from '@app/components/templates/AdminLayout/AdminLayout';
import ProtectedRoute from '@app/components/templates/ProtectedRoute';
import CreateUniversity from '@app/pages/admin/CreateUniversity';
import DashboardPage from '@app/pages/admin/DashboardPage';
import EditUniversity from '@app/pages/admin/EditUniversity';
import ManageAccount from '@app/pages/admin/ManageAccount';
import ManagePage from '@app/pages/admin/ManagePage';
import UniversityListPage from '@app/pages/admin/UniversityListPage';
import SignIn from '@app/pages/SignIn/SignIn';

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
        element: <DashboardPage />,
      },
      {
        path: 'universities',
        element: <UniversityListPage />,
      },
      {
        index: true,
        element: <div>Home</div>,
      },
      {
        path: 'create-university',
        element: <CreateUniversity />,
      },
      {
        path: 'edit-university/:id',
        element: <EditUniversity />,
      },
      {
        path: 'manage',
        element: <ManagePage />,
      },
      {
        path: 'account',
        element: <ManageAccount />,
      },
    ],
  },
];

export default routes;
