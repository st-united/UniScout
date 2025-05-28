import PublicLayout from '@app/components/templates/PublicLayout';

const routes = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: 'login',
        element: <div className='font-bold bg-[#121212] text-white p-2'>Login Page</div>,
      },
      {
        path: '',
        element: <div className='font-bold bg-[#121212] text-white p-2'>Hello guy</div>,
      },
    ],
  },
];

export default routes;
