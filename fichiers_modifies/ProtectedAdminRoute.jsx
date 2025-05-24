import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Composant de protection des routes administrateur
const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();

  // Si l'utilisateur n'est pas administrateur, rediriger vers la page d'accueil
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Sinon, afficher le contenu protégé
  return children;
};

export default ProtectedAdminRoute;
