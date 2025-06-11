import PublicLayout from '@app/components/templates/PublicLayout';
import CreateUniversity from '@app/pages/admin/CreateUniversity';
import DashboardPage from '@app/pages/admin/DashboardPage';
import EditUniversity from '@app/pages/admin/EditUniversity';
import ManagePage from '@app/pages/admin/ManagePage';
import UniversityListPage from '@app/pages/admin/UniversityListPage';

const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: 'login',
        element: <div className='font-bold bg-[#121212] text-white p-2'>Login Page</div>,
      },
      {
        path: '/universities',
        element: <UniversityListPage />,
      },
      {
        path: '/create-university',
        element: <CreateUniversity />,
      },
      {
        path: '/edit-university',
        element: <EditUniversity />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/manage',
        element: <ManagePage />,
      },
    ],
  },
];

export default routes;
