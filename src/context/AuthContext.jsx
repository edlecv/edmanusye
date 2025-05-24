import React, { createContext, useState, useContext, useEffect } from 'react';

// Create authentication context
const AuthContext = createContext();

// Admin password (in production, this should be stored securely)
const ADMIN_PASSWORD = "wow";

// Authentication context provider
export const AuthProvider = ({ children }) => {
  // State to track if user is logged in as admin
  const [isAdmin, setIsAdmin] = useState(false);
  // State to track if login modal is open
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // State to store login errors
  const [loginError, setLoginError] = useState('');

  // Check if user is already logged in on load
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Function to attempt admin login
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setLoginError('');
      localStorage.setItem('isAdmin', 'true');
      setIsLoginModalOpen(false);
      return true;
    } else {
      setLoginError('Incorrect password');
      return false;
    }
  };

  // Function to logout
  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  // Function to open login modal
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setLoginError('');
  };

  // Function to close login modal
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginError('');
  };

  // Values to expose via context
  const value = {
    isAdmin,
    login,
    logout,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    loginError,
    ADMIN_PASSWORD // Exposed only for development, remove in production
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
