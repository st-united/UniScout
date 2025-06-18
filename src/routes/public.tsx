import PublicLayout from '@app/components/templates/PublicLayout';
import ContactPage from '@app/pages/Contact/ContactPage';
import UniversityDetail from '@app/pages/University/components/UniversityDetail';
import WorldMap from '@app/pages/University/components/Worldmap';
import University from '@app/pages/University/University';

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
    ],
  },
];

export default routes;
