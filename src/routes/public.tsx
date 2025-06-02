import React from 'react';
// import { Navigate, Route, Routes } from 'react-router-dom'; // These imports are no longer needed
// import { useAuth } from '../contexts/AuthContext'; // This import is no longer needed
import Loading from '../components/common/Loading';
import HomePage from '../components/pages/HomePage';
import LoginPage from '../components/pages/LoginPage';
import RegisterPage from '../components/pages/RegisterPage';
import NotFoundPage from '../components/pages/NotFoundPage';
import ContactPage from '../components/pages/ContactPage';

// Remove unused lazy imports as the components are directly imported below
// const HomePageComponent = React.lazy(() => import('../components/pages/HomePage'));
// const LoginPageComponent = React.lazy(() => import('../components/pages/LoginPage'));
// const RegisterPageComponent = React.lazy(() => import('../components/pages/RegisterPage'));
// const NotFoundPageComponent = React.lazy(() => import('../components/pages/NotFoundPage'));

// Remove the unused PublicRoutes component
// const PublicRoutes = () => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <Loading fullScreen />;
//   }

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return (
//     <React.Suspense fallback={<Loading fullScreen />}>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/contact" element={<ContactPage />} />
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </React.Suspense>
//   );
// };

// export default PublicRoutes; // Remove default export of unused component

export const publicRoutes = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/contact',
    element: <ContactPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
