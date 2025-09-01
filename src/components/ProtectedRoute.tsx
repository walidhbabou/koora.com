import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  const { isAuthenticated, isAdmin, isEditor, isAuthor, isModerator, isAuthLoading, updateUser } = useAuth();

  const [checkingRole, setCheckingRole] = React.useState(false);

  // One-time verification of role from DB if current flags deny access
  React.useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated) return;
      // Determine if a stricter role is required but not satisfied
      const needAdmin = requireAdmin && !isAdmin;
      const needEditor = requireEditor && !isEditor;
      const needAuthor = requireAuthor && !isAuthor;
      const needModerator = requireModerator && !isModerator;
      if (!(needAdmin || needEditor || needAuthor || needModerator)) return;

      setCheckingRole(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData.user?.id;
        if (!uid) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single();
        const role = (profile?.role as 'admin'|'editor'|'author'|'moderator'|undefined);
        if (role) {
          updateUser({ role });
        }
      } finally {
        setCheckingRole(false);
      }
    };
    verify();
  }, [isAuthenticated, requireAdmin, requireEditor, requireAuthor, requireModerator, isAdmin, isEditor, isAuthor, isModerator, updateUser]);

  if (isAuthLoading || checkingRole) {
    return (
      <div className="w-full py-10 text-center text-slate-500">
        Loading...
      </div>
    );
  }

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
