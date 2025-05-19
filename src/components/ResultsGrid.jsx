import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

const ResultsGrid = () => {
  const [gridData, setGridData] = useState({ win_rates: [], risk_ratios: [], grid: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGridLogic, setShowGridLogic] = useState(false);
  
  useEffect(() => {
    fetch('/data/all_strategies_grid.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGridData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading grid data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);
  
  const { win_rates, risk_ratios, grid } = gridData;

  const formatStrategyName = (name) => {
    if (!name) return '-';
    name = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    if (name.includes('Anti ')) {
      name = name.replace('Anti ', 'Anti-');
    }
    return name.trim();
  };
  
  const getStrategyClass = (note) => {
    if (!note) return "border-gray-300 dark:border-gray-600";
    if (note.includes("Optimal (Ruin Prob <= 1%)") || note.includes("Optimal (Ruin ≤ 1%)")) return "border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400";
    if (note.includes("Good Compromise (Ruin Prob <= 5%)") || note.includes("Good Compromise (Ruin ≤ 5%)")) return "border-yellow-500 dark:border-yellow-400";
    if (note.includes("Notable Risk")) return "border-orange-500 dark:border-orange-400";
    if (note.includes("Very High Risk")) return "border-red-500 dark:border-red-400";
    return "border-gray-300 dark:border-gray-600";
  };

  const strategyDescriptions = {
    "raw": "Raw Strategy: Bet size remains constant regardless of wins or losses.",
    "martingale": "Martingale: Double bet size after each loss, reset to base bet after a win. Aims to recover losses quickly but can lead to rapid increases in bet size.",
    "anti_martingale": "Anti-Martingale (Paroli): Double bet size after each win (up to a limit, often 3 wins), reset to base bet after a loss or reaching the win streak limit. Aims to capitalize on winning streaks.",
    "linear": "Linear Progression: Increase bet size by a fixed amount (base bet) after a loss, decrease by a fixed amount after a win (or reset to base). Gentler than Martingale.",
    "anti_linear": "Anti-Linear Progression: Increase bet size by a fixed amount after a win, decrease by a fixed amount after a loss (or reset to base). Aims to press wins more gradually.",
    "smart_double": "Smart Double (D'Alembert variant): Increase bet size by one unit after a loss, decrease by one unit after a win. Bet size cannot go below one unit.",
    "anti_smart_double": "Anti-Smart Double (Reverse D'Alembert): Decrease bet size by one unit after a loss (to a minimum of one unit), increase by one unit after a win."
  };

  if (loading) {
    return (
      <Card className="mt-6 w-full max-w-7xl mx-auto shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Strategic Bet Sizing Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading grid data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 w-full max-w-7xl mx-auto shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Strategic Bet Sizing Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-300">Error loading grid data: {error}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Please try refreshing the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 w-full max-w-7xl mx-auto shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Strategic Bet Sizing Analyzer</CardTitle>
        <CardDescription className="text-md text-gray-600 dark:text-gray-300 pt-2">
          Explore all strategy variants for each Win Rate (WR) and Risk Ratio (RR) combination. Rows represent different Win Rates, and columns represent different Risk Ratios. This grid details the Calmar Ratio (P/EMDD), Probability of Ruin, and Expected Profit for each, helping you make informed decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Interactive Grid Logic Info Box */}
        <div className="mb-6">
          <button 
            onClick={() => setShowGridLogic(!showGridLogic)}
            className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors duration-200"
          >
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300">How the Grid Analysis Works</h3>
            </div>
            <span className="text-blue-600 dark:text-blue-400">
              {showGridLogic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </span>
          </button>
          
          {showGridLogic && (
            <div className="mt-2 p-5 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 shadow-lg animate-fadeIn">
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Simulation Methodology:</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Each cell in this grid represents the results of extensive Monte Carlo simulations. 
                  For every Win Rate and Risk Ratio combination, each strategy variant is evaluated through 
                  5,000 independent simulations of 1,000 potential trades each.
                </p>
                
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-5 mb-3">Independent Evaluation:</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Each strategy (Raw, Martingale, Anti-Martingale, etc.) is tested on its own set of random 
                  simulations rather than the same exact sequence of wins/losses. This approach ensures 
                  statistical robustness and prevents bias from specific sequences that might artificially 
                  favor certain strategies.
                </p>
                
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-5 mb-3">Performance Metrics:</h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Expected Profit:</strong> Average final balance minus initial balance</li>
                  <li><strong>Expected Maximum Drawdown (EMDD):</strong> Average of the worst drawdowns across all simulations</li>
                  <li><strong>Calmar Ratio (P/EMDD):</strong> Expected Profit divided by EMDD - higher is better</li>
                  <li><strong>Probability of Ruin:</strong> Percentage of simulations where the balance reached zero</li>
                </ul>
                
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-5 mb-3">Strategy Ranking:</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Strategies are ranked first by minimizing ruin probability (1% then 5%), then by maximizing 
                  the Calmar Ratio. This prioritizes capital preservation while seeking the best risk-adjusted returns.
                </p>
                
                <div className="mt-5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 italic text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> This approach of using independent simulations for each strategy is standard in financial 
                  analysis and ensures that the results represent the true expected performance of each strategy 
                  over a large number of trades.
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 rounded-xl shadow-lg">
          <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300">Understanding the Grid: Key Points</h3>
          <ul className="list-none space-y-3 text-gray-700 dark:text-gray-300">
            <li><strong className="text-indigo-600 dark:text-indigo-400">Rows (Y-Axis) - Win Rate (WR):</strong> This is your chance of winning each bet. For example, a WR of 0.5 means a 50% probability of winning. Higher rows mean higher chances of winning.</li>
            <li><strong className="text-indigo-600 dark:text-indigo-400">Columns (X-Axis) - Risk Ratio (RR):</strong> This defines your payout if you win. An RR of 1.0 means you win your stake (1x profit); an RR of 2.0 means you win double your stake (2x profit). You always lose 1x your stake on a loss. Higher columns mean higher potential reward per win.</li>
            <li><strong className="text-indigo-600 dark:text-indigo-400">Grid Cells:</strong> Each cell lists all simulated strategies for that specific WR/RR combination, with their performance metrics.</li>
            <li><strong className="text-indigo-600 dark:text-indigo-400">Calmar Ratio (P/EMDD):</strong> Profit / Expected Maximum Drawdown. Measures profit relative to the largest expected capital dip. Higher is generally better. "Infinity" means high profit with no drawdown in simulations.</li>
            <li><strong className="text-indigo-600 dark:text-indigo-400">Probability of Ruin:</strong> The chance of losing your entire initial balance. Lower is crucial.</li>
            <li><strong className="text-indigo-600 dark:text-indigo-400">Strategy Notes & Colors:</strong> Strategies are highlighted based on risk:
                <ul className="list-none pl-6 mt-1 space-y-1 text-sm">
                    <li><span className="inline-flex items-center"><span className="w-3 h-3 mr-2 rounded-full bg-green-500"></span><span className="font-semibold text-green-700 dark:text-green-300">Green Border/Ring:</span> Optimal (Ruin ≤ 1%) - Safest and often high performing.</span></li>
                    <li><span className="inline-flex items-center"><span className="w-3 h-3 mr-2 rounded-full bg-yellow-500"></span><span className="font-semibold text-yellow-700 dark:text-yellow-300">Yellow Border:</span> Good Compromise (Ruin ≤ 5%) - Good performance, slightly more risk.</span></li>
                    <li><span className="inline-flex items-center"><span className="w-3 h-3 mr-2 rounded-full bg-orange-500"></span><span className="font-semibold text-orange-700 dark:text-orange-300">Orange Border:</span> Notable Risk (Ruin > 5%, Positive Profit) - Use with caution.</span></li>
                    <li><span className="inline-flex items-center"><span className="w-3 h-3 mr-2 rounded-full bg-red-500"></span><span className="font-semibold text-red-700 dark:text-red-300">Red Border:</span> Very Risky (High Ruin or Negative Profit) - Generally avoid.</span></li>
                </ul>
            </li>
            <li><strong className="text-indigo-600 dark:text-indigo-400">⚙️ Simulation Parameters:</strong> Results based on: Initial Balance = 1000, Rounds = 1000, Base Bet = 10, Max Bet = 100% of balance (up to 1000), L_cd/W_cd = 1.</li>
          </ul>

          <h4 className="font-semibold text-lg mt-6 mb-2 text-indigo-700 dark:text-indigo-300">Strategy Descriptions:</h4>
          <ul className="list-none space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {Object.entries(strategyDescriptions).map(([key, value]) => (
              <li key={key}><strong className="font-medium text-gray-700 dark:text-gray-300">{formatStrategyName(key)}:</strong> {value}</li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600 whitespace-nowrap">WIN RATE (WR) <span className="font-normal text-gray-500 dark:text-gray-400">(↓ Rows)</span> <br/> RISK RATIO (RR) <span className="font-normal text-gray-500 dark:text-gray-400">(→ Columns)</span></th>
                {risk_ratios && risk_ratios.map(rr => (
                  <th key={rr} className="px-2 py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600">{rr.toFixed(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {win_rates && win_rates.map(wr => (
                <tr key={wr} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out">
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-800 sticky left-0 z-5">{wr.toFixed(1)}</td>
                  {risk_ratios && risk_ratios.map(rr => {
                    const wrKey = wr.toFixed(1);
                    const rrKey = rr.toFixed(1);
                    const cellStrategies = grid[wrKey]?.[rrKey] || [];
                    return (
                      <td key={`${wrKey}-${rrKey}`} className={`px-1 py-1 whitespace-normal text-xs border-r dark:border-gray-600 align-top`}>
                        {cellStrategies.length > 0 ? (
                          <div className="space-y-1">
                            {cellStrategies.map((strategy, index) => (
                              <div key={index} className={`p-1.5 rounded border ${getStrategyClass(strategy.note)} bg-white dark:bg-gray-800 shadow-sm`}>
                                <strong className="block font-bold text-xs sm:text-sm mb-0.5 text-gray-900 dark:text-gray-50">{formatStrategyName(strategy.strategy_type)}</strong>
                                <span className="block text-xxs sm:text-xs text-gray-700 dark:text-gray-300">Calmar (P/EMDD): {strategy.calmar_ratio_pemdd}</span>
                                <span className="block text-xxs sm:text-xs text-gray-700 dark:text-gray-300">Ruin: {(strategy.probability_of_ruin * 100).toFixed(2)}%</span>
                                <span className="block text-xxs sm:text-xs text-gray-700 dark:text-gray-300">Profit: {strategy.expected_profit}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 p-2 block text-center">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg shadow">
            <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-200">Strategy Highlighting Legend:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400">
                    <span className="w-4 h-4 mr-2 rounded-full flex-shrink-0 bg-green-500"></span>
                    <span className="text-gray-800 dark:text-gray-200">Optimal (Ruin ≤1%)</span>
                </div>
                <div className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-yellow-500 dark:border-yellow-400">
                    <span className="w-4 h-4 mr-2 rounded-full flex-shrink-0 bg-yellow-500"></span>
                    <span className="text-gray-800 dark:text-gray-200">Good Compromise (Ruin ≤5%)</span>
                </div>
                <div className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-orange-500 dark:border-orange-400">
                    <span className="w-4 h-4 mr-2 rounded-full flex-shrink-0 bg-orange-500"></span>
                    <span className="text-gray-800 dark:text-gray-200">Notable Risk</span>
                </div>
                <div className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-red-500 dark:border-red-400">
                    <span className="w-4 h-4 mr-2 rounded-full flex-shrink-0 bg-red-500"></span>
                    <span className="text-gray-800 dark:text-gray-200">Very Risky</span>
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ResultsGrid;

