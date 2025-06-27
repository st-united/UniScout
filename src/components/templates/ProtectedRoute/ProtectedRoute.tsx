import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { RootState } from '@app/redux/store';

// eslint-disable-next-line react/prop-types
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A component that protects routes, ensuring only authenticated users can access them.
 * If the user is not authenticated, they are redirected to the login page.
 * @param children The content to render if the user is authenticated.
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  // Select the authentication status from the Redux store
  const { isAuth } = useSelector((state: RootState) => state.auth);
  // Get the current location to redirect back to it after login
  const location = useLocation();

  // console.log('ProtectedRoute: Checking authentication for path:', location.pathname);
  // console.log('ProtectedRoute: isAuth status:', isAuth);

  // If the user is NOT authenticated, redirect them to the login page.
  // `replace` prop prevents adding the protected route to browser history.
  // `state: { from: location }` passes the original intended path to the login page,
  // which can then be used to redirect the user back after successful login.
  if (!isAuth) {
    // console.log('ProtectedRoute: User not authenticated, redirecting to /login');
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  // If the user IS authenticated, render the protected content (children).
  // console.log('ProtectedRoute: User authenticated, rendering protected content.');
  return <>{children}</>;
};

export default ProtectedRoute;
