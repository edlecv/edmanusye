import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StrategyAnalyzer from './components/StrategyAnalyzer';
import ResultsGrid from './components/ResultsGrid';
import StrategyResults from './components/StrategyResults';
import ProbabilisticEdgeFormula from './components/ProbabilisticEdgeFormula';
import EnhancedStrategyCalculator from './components/EnhancedStrategyCalculator';
import PracticalImplementationGuide from './components/PracticalImplementationGuide';
import OptimizedSimulationEngine from './components/OptimizedSimulationEngine';
import PerformanceGridOptimized from './components/PerformanceGridOptimized';
import ThemeToggle from './components/ThemeToggle';
import AdminPage from './components/AdminPage';
import LoginModal from './components/LoginModal';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import './components/animations.css';

// Strategy Testing Page
const SimulatorPage = () => (
  <>
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-center text-primary dark:text-white">Strategy Testing & Simulation</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Test and compare different betting strategies with customizable parameters
      </p>
    </header>
    <StrategyAnalyzer />
  </>
);

// Performance Grid Page
const GridPage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Strategy Performance Matrix</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Comprehensive analysis of strategy performance across different win rates and risk ratios
      </p>
    </header>
    <ResultsGrid />
  </>
);

// Optimized Performance Grid Page
const OptimizedGridPage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Optimized Performance Grid</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Pre-computed simulation results for efficient strategy analysis with caching
      </p>
    </header>
    <PerformanceGridOptimized />
  </>
);

// Monte Carlo Simulation Engine Page
const MonteCarloPage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Monte Carlo Simulation Engine</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Run multiple batches of 5000+ simulations efficiently with minimal resource usage
      </p>
    </header>
    <OptimizedSimulationEngine />
  </>
);

// Analysis Report Page
const ResultsPage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Detailed Strategy Analysis</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        In-depth analysis and visualization of strategy performance metrics
      </p>
    </header>
    <StrategyResults />
  </>
);

// Profit Optimization Page
const ProbabilisticEdgePage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Advanced Profit Optimizer</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Enhance your trading profits using advanced mathematical formulas and market analysis
      </p>
    </header>
    <ProbabilisticEdgeFormula />
  </>
);

// Smart Calculator Page
const EnhancedCalculatorPage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Smart Strategy Calculator</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Calculate optimal position sizes and enhance existing strategies with real market data
      </p>
    </header>
    <EnhancedStrategyCalculator />
  </>
);

// Implementation Guide Page
const ImplementationGuidePage = () => (
  <>
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-center text-primary dark:text-white">Implementation How-To Guide</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
        Step-by-step guide with real trading examples and best practices
      </p>
    </header>
    <PracticalImplementationGuide />
  </>
);

// Navigation component with conditional admin access
const Navigation = () => {
  const { isAdmin, openLoginModal, logout } = useAuth();

  return (
    <nav className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary dark:text-gray-800">Trading Strategy Enhancement Platform</h2>
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
      <ul className="flex justify-center space-x-3">
        <li>
          <Link
            to="/"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l3 3m0 0l3-3m-3 3V10m0 0l3 3m-3-3l-3 3m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Strategy Tester</span>
          </Link>
        </li>
        <li>
          <Link
            to="/analyzer"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-100 dark:border-green-900/50 hover:border-green-300 dark:hover:border-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs">Performance Grid</span>
          </Link>
        </li>
        <li>
          <Link
            to="/optimized-grid"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs">Optimized Grid</span>
          </Link>
        </li>
        <li>
          <Link
            to="/monte-carlo"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-teal-100 dark:border-teal-900/50 hover:border-teal-300 dark:hover:border-teal-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Monte Carlo</span>
          </Link>
        </li>
        <li>
          <Link
            to="/results"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-purple-100 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Analysis Report</span>
          </Link>
        </li>
        <li>
          <Link
            to="/probabilistic-edge"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-cyan-100 dark:border-cyan-900/50 hover:border-cyan-300 dark:hover:border-cyan-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs">Profit Optimizer</span>
          </Link>
        </li>
        <li>
          <Link
            to="/enhanced-calculator"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Smart Calculator</span>
          </Link>
        </li>
        <li>
          <Link
            to="/implementation-guide"
            className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-100 dark:border-yellow-900/50 hover:border-yellow-300 dark:hover:border-yellow-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">How-To Guide</span>
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link
              to="/admin"
              className="nav-button flex flex-col items-center px-3 py-2 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-300 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-amber-100 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Admin Panel</span>
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
            <Route path="/optimized-grid" element={<OptimizedGridPage />} />
            <Route path="/monte-carlo" element={<MonteCarloPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/probabilistic-edge" element={<ProbabilisticEdgePage />} />
            <Route path="/enhanced-calculator" element={<EnhancedCalculatorPage />} />
            <Route path="/implementation-guide" element={<ImplementationGuidePage />} />
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
          <p>&copy; {new Date().getFullYear()} Trading Strategy Enhancement Platform. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;
