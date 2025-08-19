import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEditor?: boolean;
  requireAuthor?: boolean;
  requireModerator?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireEditor = false,
  requireAuthor = false,
  requireModerator = false
}) => {
  const { isAuthenticated, isAdmin, isEditor, isAuthor, isModerator } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (requireEditor && !isEditor) {
    return <Navigate to="/login" replace />;
  }

  if (requireAuthor && !isAuthor) {
    return <Navigate to="/login" replace />;
  }

  if (requireModerator && !isModerator) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
