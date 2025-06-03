import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

interface ProtectedRouteProps {
  // children: React.ReactNode; // No longer needed when rendering Outlet
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to a different page, e.g., a forbidden page or dashboard
    return <Navigate to='/dashboard' replace />;
  }

  // Render the child routes using Outlet
  return <Outlet />;
};

export default ProtectedRoute;
