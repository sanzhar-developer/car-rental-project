import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const STAFF_ROLES = ['ADMIN', 'MANAGER'];

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Staff should use the admin panel, not user-facing pages
  if (STAFF_ROLES.includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
