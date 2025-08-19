import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import EditorDashboard from '../pages/EditorDashboard';
import AuthorDashboard from '../pages/AuthorDashboard';
import ModeratorDashboard from '../pages/ModeratorDashboard';
import LoginPage from '../pages/LoginPage';

const RoleBasedRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Si l'utilisateur n'est pas connecté, afficher la page de connexion
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // Rediriger vers le dashboard approprié selon le rôle
  switch (user.role) {
    case 'admin':
      // Rediriger vers /admin pour utiliser la route protégée existante
      window.location.href = '/admin';
      return <AdminDashboard />;
    case 'editor':
      return <EditorDashboard />;
    case 'author':
      return <AuthorDashboard />;
    case 'moderator':
      return <ModeratorDashboard />;
    default:
      return <LoginPage />;
  }
};

export default RoleBasedRouter;
