import PublicLayout from '@app/components/templates/PublicLayout';
import ContactPage from '@app/pages/Contact/ContactPage';
import SignIn from '@app/pages/SignIn/SignIn'; // ✅ Import the SignIn page
import UniversityDetail from '@app/pages/University/components/UniversityDetail';
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
        path: 'login',
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
