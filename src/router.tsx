import { createBrowserRouter, Outlet } from 'react-router-dom';

import { NotFound } from '@app/pages';
import privateRoutes from '@app/routes/private';
import publicRoutes from '@app/routes/public';

const hostname = window.location.hostname;
const isAdmin = hostname.includes('admin.uniscout.minthome.site');

const routes = isAdmin ? [...privateRoutes] : [...publicRoutes];

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    errorElement: <NotFound />,
    children: routes,
  },
]);

export default router;
