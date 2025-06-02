import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { publicRoutes } from './routes/public';
import { privateRoutes } from './routes/private';
import NotFound from './components/pages/NotFoundPage';
import Layout from './components/layout/Layout';

// Separate public routes that should not have the layout
const publicRoutesWithoutLayout = publicRoutes.filter(route =>
  route.path === '/login' || route.path === '/register' || route.path === '/404' // Assuming /404 should also be without layout
);

// Public routes that *should* have the layout (the rest)
const publicRoutesWithLayout = publicRoutes.filter(route =>
  route.path !== '/login' && route.path !== '/register' && route.path !== '/404'
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      // Public routes without the layout (e.g., Login, Register)
      ...publicRoutesWithoutLayout,

      // Routes that use the main layout
      {
        element: <Layout />,
        children: [
          // Public routes that should have the layout (e.g., Home, Universities List/Detail)
          ...publicRoutesWithLayout,

          // Private routes (all of them should have the layout)
          ...privateRoutes
        ]
      },

      // Catch-all for unmatched routes (can be a custom 404 page within the layout if preferred)
      // For now, keep the main NotFound as the errorElement, but you could add a path: '*' here
    ]
  }
]);

export default router;
