import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { getStorageStringData } from '@app/config/storage';
import { RootState } from '@app/redux/store';

// eslint-disable-next-line react/prop-types
interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

/**
 * A component that protects routes, ensuring only authenticated users can access them.
 * If the user is not authenticated, they are redirected to the login page.
 * @param children The content to render if the user is authenticated.
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requireSuperAdmin }) => {
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const role = getStorageStringData('role');
  if (!isAuth) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  if (requireSuperAdmin && role !== 'super') {
    return <Navigate to='/403' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
