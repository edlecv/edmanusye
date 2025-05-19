import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StrategyAnalyzer from './components/StrategyAnalyzer';
import ResultsGrid from './components/ResultsGrid';
import StrategyResults from './components/StrategyResults';
import './index.css';

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
      <nav className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <ul className="flex justify-center space-x-6">
          <li>
            <Link to="/" className="text-lg font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter transition-colors">Simulator</Link>
          </li>
          <li>
            <Link to="/analyzer" className="text-lg font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter transition-colors">Strategy Analyzer Grid</Link>
          </li>
          <li>
            <Link to="/results" className="text-lg font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter transition-colors">Strategy Analysis Results</Link>
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

