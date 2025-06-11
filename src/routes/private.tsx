import React, { lazy } from 'react';

// Lazy-loaded layout and pages
const PrivateLayout = lazy(() => import('@app/components/templates/PrivateLayout'));
const NotFound = lazy(() => import('@app/pages/NotFound/NotFound'));
const Forbidden = lazy(() => import('@app/pages/Forbidden/Forbidden'));
const App = lazy(() => import('@app/App')); // 👈 Add this line

const routes = [
  {
    element: <PrivateLayout />,
    children: [
      {
        index: true, // 👈 Added this default route under "/"
        element: <App />, //👈 Added this default route under "/"
      },
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
];

export default routes;
