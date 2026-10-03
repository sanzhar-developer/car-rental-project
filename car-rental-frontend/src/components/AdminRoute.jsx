import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { USER_ROLE } from '../constants/statuses';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== USER_ROLE.ADMIN && user?.role !== USER_ROLE.MANAGER) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
