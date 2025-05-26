import { createBrowserRouter, Outlet } from 'react-router-dom';

import { NotFound } from '@app/pages';
import privateRoutes from '@app/routes/private';
import publicRoutes from '@app/routes/public';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    errorElement: <NotFound />,
    children: [...publicRoutes, ...privateRoutes],
  },
]);

export default router;
