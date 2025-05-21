import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StrategyAnalyzer from './components/StrategyAnalyzer';
import ResultsGrid from './components/ResultsGrid';
import StrategyResults from './components/StrategyResults';
import './index.css';
import './components/animations.css';

// Placeholder for Simulator Page
const SimulatorPage = () => (
  <>
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-center text-primary">Interactive Strategy Simulator</h1>
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

function App() {
  return (
    <div className="container mx-auto p-4 bg-background text-foreground min-h-screen flex flex-col">
      <nav className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl shadow-lg">
        <ul className="flex justify-center space-x-8">
          <li>
            <Link 
              to="/" 
              className="nav-button flex flex-col items-center px-6 py-3 bg-white hover:bg-blue-50 text-blue-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-blue-100 hover:border-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Simulator
            </Link>
          </li>
          <li>
            <Link 
              to="/analyzer" 
              className="nav-button flex flex-col items-center px-6 py-3 bg-white hover:bg-green-50 text-green-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-100 hover:border-green-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Strategy Analyzer Grid
            </Link>
          </li>
          <li>
            <Link 
              to="/results" 
              className="nav-button flex flex-col items-center px-6 py-3 bg-white hover:bg-purple-50 text-purple-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-purple-100 hover:border-purple-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Strategy Analysis Results
            </Link>
          </li>
        </ul>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<SimulatorPage />} />
          <Route path="/analyzer" element={<GridPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>

      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t border-gray-200 dark:border-gray-700">
        <p>&copy; {new Date().getFullYear()} Dynamic Sizing Strategy Enhancer Simulator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
