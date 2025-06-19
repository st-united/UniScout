import AdminLayout from '@app/components/templates/AdminLayout/AdminLayout';
import PublicLayout from '@app/components/templates/PublicLayout';
import CreateUniversity from '@app/pages/admin/CreateUniversity';
import DashboardPage from '@app/pages/admin/DashboardPage';
import EditUniversity from '@app/pages/admin/EditUniversity';
import ManagePage from '@app/pages/admin/ManagePage';
import UniversityListPage from '@app/pages/admin/UniversityListPage';
import ContactPage from '@app/pages/Contact/ContactPage';
import UniversityDetail from '@app/pages/University/components/UniversityDetail';
import WorldMap from '@app/pages/University/components/Worldmap';
import University from '@app/pages/University/University';

const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <University />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'universities/:id',
        element: <UniversityDetail />,
      },
      {
        path: 'worldmap',
        element: <WorldMap />,
      },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
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
