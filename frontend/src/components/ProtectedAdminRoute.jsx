import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
  return isAdminAuthenticated ? children : <Navigate to="/admin-login" replace />;
};

export default ProtectedAdminRoute;
