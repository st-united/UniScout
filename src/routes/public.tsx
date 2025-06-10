import { mockUniversities } from '@app/components/data/mockData';
import HomePage from '@app/components/home/homepage';
import UniversityDetail from '@app/components/home/universitydetail';
import ViewUniversity from '@app/components/home/viewuniversity';
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
        path: 'universities',
        element: <ViewUniversity />,
      },
    ],
  },
];

export default routes;
