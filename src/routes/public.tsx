import ContactPage from '@app/components/contact/ContactPage';
import PublicLayout from '@app/components/templates/PublicLayout';

const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
      },
      {
        path: 'login',
        element: <div className='font-bold bg-[#121212] text-white p-2'>Login Page</div>,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
    ],
  },
];

export default routes;
