import React from 'react';
import StrategyAnalyzer from './components/StrategyAnalyzer';
import ResultsGrid from './components/ResultsGrid';
import './index.css';

function App() {
  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center text-primary">Investment Strategy Simulator & Analysis</h1>
      </header>
      <main>
        <StrategyAnalyzer />
        <ResultsGrid />
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Strategy Analysis Tool. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
