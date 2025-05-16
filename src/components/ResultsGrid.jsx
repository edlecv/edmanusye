import React from 'react';
import gridData from '../data/all_strategies_grid.json'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

const ResultsGrid = () => {
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

  return (
    <Card className="mt-6 w-full max-w-7xl mx-auto shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Strategic Bet Sizing Analyzer</CardTitle>
        <CardDescription className="text-md text-gray-600 dark:text-gray-300 pt-2">
          Explore all strategy variants for each Win Rate (WR) and Risk Ratio (RR) combination. Rows represent different Win Rates, and columns represent different Risk Ratios. This grid details the Calmar Ratio (P/EMDD), Probability of Ruin, and Expected Profit for each, helping you make informed decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

