import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = Cookies.get('token');
  const userStr = Cookies.get('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  
  if (adminOnly && user.role !== 'admin') {
     return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
