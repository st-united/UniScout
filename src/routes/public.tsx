import PublicLayout from '@app/components/templates/PublicLayout';


const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
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
