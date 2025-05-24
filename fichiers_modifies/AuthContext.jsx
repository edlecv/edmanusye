import React, { createContext, useState, useContext, useEffect } from 'react';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Mot de passe administrateur (en production, cela devrait être stocké de manière sécurisée)
const ADMIN_PASSWORD = "Manus2025!";

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  // État pour suivre si l'utilisateur est connecté en tant qu'administrateur
  const [isAdmin, setIsAdmin] = useState(false);
  // État pour suivre si le modal de connexion est ouvert
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // État pour stocker les erreurs de connexion
  const [loginError, setLoginError] = useState('');

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Fonction pour tenter de se connecter en tant qu'administrateur
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setLoginError('');
      localStorage.setItem('isAdmin', 'true');
      setIsLoginModalOpen(false);
      return true;
    } else {
      setLoginError('Mot de passe incorrect');
      return false;
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  // Fonction pour ouvrir le modal de connexion
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setLoginError('');
  };

  // Fonction pour fermer le modal de connexion
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginError('');
  };

  // Valeurs à exposer via le contexte
  const value = {
    isAdmin,
    login,
    logout,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    loginError,
    ADMIN_PASSWORD // Exposé uniquement pour le développement, à retirer en production
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
