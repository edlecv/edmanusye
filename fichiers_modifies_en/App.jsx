import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StrategyAnalyzer from './components/StrategyAnalyzer';
import ResultsGrid from './components/ResultsGrid';
import StrategyResults from './components/StrategyResults';
import ThemeToggle from './components/ThemeToggle';
import AdminPage from './components/AdminPage';
import LoginModal from './components/LoginModal';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import './components/animations.css';

// Placeholder for Simulator Page
const SimulatorPage = () => (
  <>
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-center text-primary dark:text-white">Interactive Strategy Simulator</h1>
    </header>
    <StrategyAnalyzer />
  </>
);

// Placeholder for Grid Page
const GridPage = () => (
  <>
    {/* The ResultsGrid component already has its own CardHeader with the title "Strategic Bet Sizing Analyzer" */}
    <ResultsGrid />
  </>
);

// Results Analysis Page
const ResultsPage = () => (
  <>
    <StrategyResults />
  </>
);

// Navigation component with conditional admin access
const Navigation = () => {
  const { isAdmin, openLoginModal, logout } = useAuth();

  return (
    <nav className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary dark:text-gray-800">Strategy Simulator</h2>
        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <button
              onClick={logout}
              className="text-sm px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
            >
              Admin Logout
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Admin
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
      <ul className="flex justify-center space-x-8">
        <li>
          <Link 
            to="/" 
            className="nav-button flex flex-col items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l3 3m0 0l3-3m-3 3V10m0 0l3 3m-3-3l-3 3m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simulator
          </Link>
        </li>
        <li>
          <Link 
            to="/analyzer" 
            className="nav-button flex flex-col items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-100 dark:border-green-900/50 hover:border-green-300 dark:hover:border-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Strategy Analyzer Grid
          </Link>
        </li>
        <li>
          <Link 
            to="/results" 
            className="nav-button flex flex-col items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-purple-100 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Strategy Analysis Results
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link 
              to="/admin" 
              className="nav-button flex flex-col items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-amber-100 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Administration
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

// Main application component
const App = () => {
  // Initialize theme on application load
  useEffect(() => {
    // Check if a theme is already registered in localStorage
    const savedTheme = localStorage.getItem('theme');
    // If the theme is 'light', apply light theme, otherwise use dark theme by default
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save dark theme as default
    }
  }, []);

  return (
    <AuthProvider>
      <div className="container mx-auto p-4 bg-background text-foreground min-h-screen flex flex-col">
        <Navigation />
        <LoginModal />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SimulatorPage />} />
            <Route path="/analyzer" element={<GridPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t border-gray-200 dark:border-gray-700">
          <p>&copy; {new Date().getFullYear()} Dynamic Sizing Strategy Enhancer Simulator. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;
