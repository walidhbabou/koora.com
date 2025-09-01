import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import { Navigate } from 'react-router-dom';

const RoleBasedRouter: React.FC = () => {
  const { user, isAuthenticated, isAuthLoading, roleLoaded } = useAuth();

  // Attendre la fin de l'initialisation d'auth
  if (isAuthLoading || !roleLoaded) {
    return (
      <div className="w-full py-10 text-center text-slate-500">Loading...</div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger vers le dashboard approprié selon le rôle (mise à jour de l'URL)
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'editor':
      return <Navigate to="/editor" replace />;
    case 'author':
      return <Navigate to="/author" replace />;
    case 'moderator':
      return <Navigate to="/moderator" replace />;
    case 'user':
      // Les utilisateurs "user" n'ont pas de dashboard : rediriger vers le site public
      return <Navigate to="/news" replace />;
    default:
      // Rôle inconnu mais authentifié : renvoyer vers la page d'accueil
      return <Navigate to="/" replace />;
  }
};

export default RoleBasedRouter;
