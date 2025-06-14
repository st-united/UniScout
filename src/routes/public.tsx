import ContactPage from '@app/components/contact/ContactPage';
import HomePage from '@app/components/home/page/homepage';
import UniversityDetail from '@app/components/home/universitydetail';
import ViewUniversity from '@app/components/home/viewuniversity';
import WorldMap from '@app/components/home/worldmap';
import PublicLayout from '@app/components/templates/PublicLayout';

const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <div className='font-bold bg-[#121212] text-white p-2'>Login Page</div>,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'universities',
        element: <ViewUniversity />,
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
